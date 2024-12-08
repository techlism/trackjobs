import type { ResumeData, SectionData, SectionItemData } from "./types";

export interface HTMLNode {
    tag: string;
    attributes?: Record<string, string>;
    children?: (HTMLNode | string)[];
}


export function convertResumeToHTMLNodes(resumeData: ResumeData): HTMLNode[] {
    const nodes: HTMLNode[] = [];
    // Personal Info Header
    const contactNodes: HTMLNode[] = [
        {
            tag: 'a',
            attributes: {
                href: `mailto:${resumeData.email}`,
            },
            children: [resumeData.email]
        }
    ];

    if (resumeData.phone) {
        contactNodes.push({
            tag: 'span',
            children: [resumeData.phone]
        });
    }

    if (resumeData.location) {
        contactNodes.push({
            tag: 'span',
            children: [resumeData.location]
        });
    }

    const socialLinks = [
        { key: 'github', label: 'GitHub' },
        { key: 'linkedin', label: 'LinkedIn' },
        { key: 'portfolio', label: 'Portfolio' }
    ];

    for (const {key, label} of socialLinks) {
        const value = resumeData[key as keyof typeof resumeData];
        if (value && typeof value === 'string') {
            contactNodes.push({
                tag: 'a',
                attributes: {
                    href: value,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
                children: [label]
            });
        }
    }

    nodes.push({
        tag: 'header',
        children: [
            {
                tag: 'h1',
                children: [resumeData.fullName]
            },
            {
                tag: 'nav',
                children: contactNodes
            }
        ]
    });

    if (resumeData.summary) {
        nodes.push({
            tag: 'section',
            children: [
                {
                    tag: 'h2',
                    children: ['Professional Summary']
                },
                {
                    tag: 'p',
                    children: [resumeData.summary]
                }
            ]
        });
    }

    if (resumeData.sections) {
        const sortedSections = [...resumeData.sections].sort((a, b) => a.displayOrder - b.displayOrder);
        
        for (const section of sortedSections) {
            const sectionNode: HTMLNode = {
                tag: 'section',
                children: [
                    {
                        tag: 'h2',
                        children: [section.title]
                    }
                ]
            };

            if (section.items?.length) {
                const sortedItems = [...section.items].sort((a, b) => a.displayOrder - b.displayOrder);
                const itemsContainer: HTMLNode = {
                    tag: 'div',
                    children: []
                };

                for (const item of sortedItems) {
                    itemsContainer.children?.push(convertSectionItemToHTML(item, section));
                }

                sectionNode.children?.push(itemsContainer);
            }

            nodes.push(sectionNode);
        }
    }

    return nodes;
}

function convertSectionItemToHTML(item: SectionItemData, section: SectionData): HTMLNode {
    const itemNode: HTMLNode = {
        tag: 'div',
        children: []
    };

    if (!item.fieldValues?.length || !section.fields?.length) return itemNode;

    const fieldValuesMap = new Map(
        item.fieldValues.map(fv => [fv.fieldId, fv.value])
    );

    const sortedFields = [...section.fields].sort((a, b) => a.displayOrder - b.displayOrder);

    for (const field of sortedFields) {
        if (!field.id) continue;
        const value = fieldValuesMap.get(field.id);
        if (!value) continue;

        switch (field.type) {
            case 'text':
                itemNode.children?.push({
                    tag: 'p',
                    children: [value]
                });
                break;
            case 'textarea': {
                const paragraphs = value.split('\n').map(line => ({
                    tag: 'p',
                    children: [line]
                }));
                itemNode.children?.push({
                    tag: 'div',
                    children: paragraphs
                });
                break;
            }
            case 'date':
                itemNode.children?.push({
                    tag: 'span',
                    children: [value]
                });
                break;
            case 'link':
                itemNode.children?.push({
                    tag: 'a',
                    attributes: {
                        href: value,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                    children: [field.label]
                });
                break;
        }
    }

    return itemNode;
}