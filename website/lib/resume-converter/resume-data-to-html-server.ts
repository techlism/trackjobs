import { ServerHTMLJSONConverter } from "html-json-converter/server";
import type { ResumeData, SectionData, SectionItemData } from "../types";
import DOMPurify from "isomorphic-dompurify";

export interface HTMLNode {
    tag: string;
    attributes?: Record<string, string>;
    children?: (HTMLNode | string)[];
}

const defaultStyle: HTMLNode = {
    tag: 'style',
    children: [`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Source Serif 4', serif;
            line-height: 1.1;
            text-rendering: geometricPrecision;
        }
        body {                
            margin: 0.5rem auto;
            color: black;
            padding: 0 0.5rem;
        }
        h1 {
            font-size: 1.2rem;
            margin-bottom: 0.55rem;
            text-align: center;
            font-weight: 600;
        }
        h2 {
            font-size: 1rem;
            margin-bottom: 0.25rem;
            border-bottom: 1px solid #e5e7eb;
            text-transform: uppercase;
            font-weight: 500;
            padding-bottom: 0.15rem;
        }
        nav {
            text-align: center;
            margin-bottom: 0.55rem;
            font-size: 0.7rem;
        }
        a {
            color: #2563eb;
            text-decoration: none;
        }
        section {
            margin-bottom: 0.55rem;
        }
        .section-item {
            margin-bottom: 0.25rem;
            position: relative;            
        }
        .section-item > p.title:first-of-type + p.title + .description,
        .section-item > p.title:first-of-type + .description {
            & ~ p.title:first-of-type {
                font-size: 0.85rem;
                font-weight: 500;
                margin-bottom: 0.35rem;
            }
        }

        .section-item > p.title:not(:first-of-type) {
            font-size: 0.8rem;
            margin-bottom: 0.25rem;    
        }

        .section-item > p.title:only-child {
            font-size: 0.8rem;
            margin-bottom: 0.25rem;
        }

        .section-item .description {
            margin-left: 0.2rem;
        }

        .section-item .description p {
            font-size: 0.82rem;
            margin-bottom: 0.25rem;            
        }

        .section-item .description ul {
            font-size: 0.82rem;
            margin-bottom: 0.25rem;
            list-style: none;
            padding-left: 0;
        }

        .section-item .description ul li {
            margin-bottom: 0.25rem;
            position: relative;
            padding-left: 1rem;
        }

        .section-item .description ul li::before {
            content: "•";
            position: absolute;
            left: 0;
        }

        .date-container {
            position: absolute;
            right: 0;
            top: 0;
            font-size: 0.75rem;
            color: #666666;
            font-style: italic;
            text-align: right;
            width: 11rem;
            overflow: hidden;
            white-space: nowrap;
        }
            
        nav > * {
            margin: 0 0.25rem;
        }
        nav > * + *::before {
            content: "•";
            margin: 0 0.25rem;
        }
        .project-links {
            margin-top: 0.15rem;
            font-size: 0.75rem;
            font-style: italic;
        }
        .project-links a {
            margin-right: 0.4rem;
        }
    `]
};

export function generateFullHTMLServerSide(resumeData: ResumeData, styles?: HTMLNode): string {
    const headerContent = generateHeader(resumeData);
    const mainContent = generateMainContent(resumeData);
    const headContent = generateHead(resumeData.resumeTitle, styles || defaultStyle);
    const converter = new ServerHTMLJSONConverter();
    const cleanedHeaderContent = DOMPurify.sanitize(converter.toHTML(headerContent));
    const cleanedMainContent = DOMPurify.sanitize(converter.toHTML(mainContent));
    const finalHTML = `<!DOCTYPE html>\n${converter.toHTML(headContent)}${cleanedHeaderContent}${cleanedMainContent}`;
    return finalHTML;
}

function generateHead(resumeTitle: string, styles: HTMLNode): HTMLNode {
    return {
        tag: 'head',
        children: [
            { tag: 'title', children: [resumeTitle] },
            { tag: 'meta', attributes: { charset: 'UTF-8' } },
            { tag: 'meta', attributes: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
            { tag: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
            { tag: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
            {
                tag: 'link', attributes: {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap'
                }
            },
            styles
        ]
    };
}

function generateHeader(resumeData: ResumeData): HTMLNode {
    const contactNodes = generateContactNodes(resumeData);

    return {
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
    };
}

function generateContactNodes(resumeData: ResumeData): HTMLNode[] {
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

    for (const { key, label } of socialLinks) {
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

    return contactNodes;
}

function generateMainContent(resumeData: ResumeData): HTMLNode {
    const mainNodes: HTMLNode[] = [];

    if (resumeData.summary) {
        mainNodes.push(generateSummarySection(resumeData.summary));
    }

    if (resumeData.sections) {
        const sortedSections = [...resumeData.sections].sort((a, b) => a.displayOrder - b.displayOrder);
        mainNodes.push(...sortedSections.map(generateSection));
    }

    return {
        tag: 'main',
        children: mainNodes
    };
}

function generateSummarySection(summary: string): HTMLNode {
    return {
        tag: 'section',
        children: [
            {
                tag: 'h2',
                children: ['Professional Summary']
            },
            {
                tag: 'p',
                children: [summary]
            }
        ]
    };
}

function generateSection(section: SectionData): HTMLNode {
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
            children: sortedItems.map(item => convertSectionItemToHTML(item, section))
        };
        sectionNode.children?.push(itemsContainer);
    }

    return sectionNode;
}

function convertSectionItemToHTML(item: SectionItemData, section: SectionData): HTMLNode {
    const itemNode: HTMLNode = {
        tag: 'div',
        attributes: {
            class: 'section-item'
        },
        children: []
    };

    if (!item.fieldValues?.length || !section.fields?.length) return itemNode;

    const fieldValuesMap = new Map(
        item.fieldValues.map(fv => [fv.fieldId, fv.value])
    );

    const sortedFields = [...section.fields].sort((a, b) => a.displayOrder - b.displayOrder);

    const dateFields: string[] = [];
    const titleFields: HTMLNode[] = [];
    const descriptionFields: HTMLNode[] = [];
    const linkFields: HTMLNode[] = [];

    for (const field of sortedFields) {
        if (!field.id) continue;
        const value = fieldValuesMap.get(field.id);
        if (!value) continue;

        switch (field.type) {
            case 'date':
                dateFields.push(value);
                break;
            case 'text':
                titleFields.push({
                    tag: 'p',
                    attributes: { class: 'title' },
                    children: [value]
                });
                break;
            case 'textarea': {
                const lines = value.split('\n').filter(Boolean).map(line => line.trim());
                
                // If there's only one line, use a paragraph
                if (lines.length === 1) {
                    descriptionFields.push({
                        tag: 'div',
                        attributes: { class: 'description' },
                        children: [{
                            tag: 'p',
                            children: [lines[0].match(/^[-•●∙◦]/) ? lines[0] : `• ${lines[0]}`]
                        }]
                    });
                } else {
                    // If there are multiple lines, use a list
                    descriptionFields.push({
                        tag: 'div',
                        attributes: { class: 'description' },
                        children: [{
                            tag: 'ul',
                            attributes : { style : 'margin-left: 0.1rem' },
                            children: lines.map(line => ({
                                tag: 'li',
                                children: [line.replace(/^[-•●∙◦]\s*/, '')] // Remove existing bullets
                            }))
                        }]
                    });
                }
                break;
            }
            case 'link':
                linkFields.push({
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

    if (dateFields.length > 0) {
        itemNode.children?.push({
            tag: 'div',
            attributes: { class: 'date-container' },
            children: [dateFields.join(' - ')]
        });
    }

    itemNode.children?.push(...titleFields, ...descriptionFields);

    if (linkFields.length > 0) {
        itemNode.children?.push({
            tag: 'div',
            attributes: { class: 'project-links' },
            children: linkFields
        });
    }

    return itemNode;
}