import type { ResumeData, SectionData, SectionItemData, SectionFieldType } from './types';

interface HTMLNode {
    tag: string;
    attributes?: Record<string, string>;
    children?: (HTMLNode | string)[];
}

export function convertResumeToHTMLNodes(resumeData: ResumeData): HTMLNode[] {
    // Convert personal section
    const convertPersonalSection = (personal: ResumeData['personal']): HTMLNode => {
        return {
            tag: 'section',
            children: [
                {
                    tag: 'h1',
                    children: [personal.fullName]
                },
                {
                    tag: 'nav',
                    children: [
                        {
                            tag: 'a',
                            attributes: { href: `mailto:${personal.email}` },
                            children: [personal.email]
                        },
                        ...(personal.linkedin ? [{
                            tag: 'a',
                            attributes: { href: personal.linkedin },
                            children: ['LinkedIn']
                        }] : []),
                        ...(personal.github ? [{
                            tag: 'a',
                            attributes: { href: personal.github },
                            children: ['GitHub']
                        }] : []),
                        ...(personal.portfolio ? [{
                            tag: 'a',
                            attributes: { href: personal.portfolio },
                            children: ['Portfolio']
                        }] : [])
                    ]
                }
            ]
        };
    };

    // Convert a section item based on its field type
    const convertFieldToHTML = (value: string | string[], type: SectionFieldType): HTMLNode | string => {
        if (!value) return '';

        switch (type) {
            case 'link':
                return {
                    tag: 'a',
                    attributes: { href: value as string },
                    children: [value as string]
                };

            case 'textarea':
                return {
                    tag: 'p',
                    children: [value as string]
                };

            // case 'text':
            default:
                if (Array.isArray(value)) {
                    return {
                        tag: 'ul',
                        children: value.map(item => ({
                            tag: 'li',
                            children: [item]
                        }))
                    };
                }
                return {
                    tag: 'p',
                    children: [value]
                };
        }
    };

    // Convert each section
    const convertSection = (section: SectionData): HTMLNode => {
        const convertSectionItem = (item: SectionItemData): HTMLNode => {
            const children: (HTMLNode | string)[] = [];

            switch (section.id) {
                case 'education':
                    children.push(
                        {
                            tag: 'article',
                            children: [
                                {
                                    tag: 'h3',
                                    children: [item.fields.institution as string]
                                },
                                {
                                    tag: 'p',
                                    children: [item.fields.degree as string]
                                },
                                {
                                    tag: 'time',
                                    children: [`${item.fields.startDate} - ${item.fields.endDate}`]
                                },
                                ...(item.fields.score ? [{
                                    tag: 'p',
                                    children: [item.fields.score as string]
                                }] : [])
                            ]
                        }
                    );
                    break;

                case 'experience':
                    children.push({
                        tag: 'article',
                        children: [
                            {
                                tag: 'h3',
                                children: [item.fields.position as string]
                            },
                            {
                                tag: 'p',
                                children: [item.fields.company as string]
                            },
                            {
                                tag: 'time',
                                children: [`${item.fields.startDate} - ${item.fields.endDate}`]
                            },
                            {
                                tag: 'ul',
                                children: (item.fields.responsibilities as string)
                                    .split('\n')
                                    .map(resp => ({
                                        tag: 'li',
                                        children: [resp.trim()]
                                    }))
                            }
                        ]
                    });
                    break;

                case 'projects':
                    children.push({
                        tag: 'article',
                        children: [
                            {
                                tag: 'h3',
                                children: [item.fields.project as string]
                            },
                            {
                                tag: 'p',
                                children: [item.fields.description as string]
                            },
                            {
                                tag: 'nav',
                                children: [
                                    ...(item.fields.link ? [{
                                        tag: 'a',
                                        attributes: { href: item.fields.link as string },
                                        children: ['Live Demo']
                                    }] : []),
                                    ...(item.fields.repository ? [{
                                        tag: 'a',
                                        attributes: { href: item.fields.repository as string },
                                        children: ['Repository']
                                    }] : [])
                                ]
                            }
                        ]
                    });
                    break;

                case 'skills':
                    children.push({
                        tag: 'article',
                        children: Object.entries(item.fields).map(([category, skills]) => ({
                            tag: 'p',
                            children: [`${category}: ${skills}`]
                        }))
                    });
                    break;

                default:
                    children.push({
                        tag: 'article',
                        children: Object.entries(item.fields).map(([_, value]) =>
                            convertFieldToHTML(value as string, 'text')
                        )
                    });
            }

            return {
                tag: 'div',
                children
            };
        };

        return {
            tag: 'section',
            children: [
                {
                    tag: 'h2',
                    children: [section.title]
                },
                ...section.items.map(convertSectionItem)
            ]
        };
    };

    return [
        convertPersonalSection(resumeData.personal),
        ...resumeData.sections.map(convertSection)
    ];
}