import db from "@/lib/database/client";
import { eq } from "drizzle-orm";
import DOMPurify from 'isomorphic-dompurify';
import { ServerHTMLJSONConverter } from 'html-json-converter/server';
import { NextResponse, type NextRequest } from "next/server";
import type { ResumeData } from "@/lib/types";
import type { HTMLNode } from "@/lib/resume-data-to-json";
import puppeteer, {type Browser} from 'puppeteer';
import { convertResumeToHTMLNodes } from "@/lib/resume-data-to-json";
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const dynamic = 'force-dynamic';

export interface ResumeStyle {
    fontFamily: string;
    fontSize: {
        h1: string;
        h2: string;
        h3: string;
        body: string;
        small: string;
    };
    spacing: {
        section: string;
        item: string;
        line: string;
    };
    colors: {
        primary: string;
        text: string;
        link: string;
        border: string;
    };
    margins: {
        page: string;
        section: string;
        item: string;
    };
}

const defaultStyle: ResumeStyle = {
    fontFamily: "'Source Serif 4', serif",
    fontSize: {
        h1: "1.2rem",
        h2: "1rem",
        h3: "0.9rem",
        body: "0.85rem",
        small: "0.75rem"
    },
    spacing: {
        section: "1rem",
        item: "0.5rem",
        line: "1.2"
    },
    colors: {
        primary: "#2c3e50",
        text: "#333333",
        link: "#2563eb",
        border: "#e5e7eb"
    },
    margins: {
        page: "1.5rem",
        section: "0.75rem",
        item: "0.5rem"
    }
};

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const generatedResumeID = searchParams.get("generated_resume_id");
        if (!generatedResumeID) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        const generatedResume = await db.query.generatedResumeTable.findFirst({
            where: (table) => eq(table.id, generatedResumeID),
            columns: {
                resumeContent: true,
                resumeTitle: true,
            }
        });
        if (!generatedResume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        const resumeTitle = generatedResume.resumeTitle as string;
        const resumeContent = generatedResume.resumeContent as string;

        const parsedResumeContent: ResumeData = JSON.parse(resumeContent);
        const htmlNodes = convertResumeToHTMLNodes(parsedResumeContent);
        const converter = new ServerHTMLJSONConverter();
        const style: Partial<ResumeStyle> = {}; // will be added later
        const mergedStyle = { ...defaultStyle, ...style };
        const htmlNodeWithMain = { tag: 'main', children: htmlNodes };
        const htmlWithMain = converter.toHTML(htmlNodeWithMain);
        const cleanedHTMLString = DOMPurify.sanitize(htmlWithMain);
        const cleanedHTMLNodeWithMain = converter.toJSON(cleanedHTMLString);
        const styleNode: HTMLNode = {
            tag: 'style',
            children: [`
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: ${mergedStyle.fontFamily};
                line-height: ${mergedStyle.spacing.line};
            }
            body {
                max-width: 8.5in;
                margin: ${mergedStyle.margins.page} auto;
                color: ${mergedStyle.colors.text};
                padding: 0 ${mergedStyle.margins.page};
            }
            h1 {
                font-size: ${mergedStyle.fontSize.h1};
                color: ${mergedStyle.colors.primary};
                margin-bottom: ${mergedStyle.spacing.section};
                text-align: center;
            }
            h2 {
                font-size: ${mergedStyle.fontSize.h2};
                color: ${mergedStyle.colors.primary};
                margin-bottom: ${mergedStyle.spacing.item};
                border-bottom: 1px solid ${mergedStyle.colors.border};
                text-transform: uppercase;
            }
            nav {
                text-align: center;
                margin-bottom: ${mergedStyle.spacing.section};
                font-size: ${mergedStyle.fontSize.small};
            }
            a {
                color: ${mergedStyle.colors.link};
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            section {
                margin-bottom: ${mergedStyle.spacing.section};
            }
            p {
                font-size: ${mergedStyle.fontSize.body};
                margin-bottom: ${mergedStyle.spacing.item};
            }
            .section-item {
                margin-bottom: ${mergedStyle.spacing.item};
            }
            .date {
                font-size: ${mergedStyle.fontSize.small};
                color: ${mergedStyle.colors.text};
            }
            nav > * + *::before {
                content: "•";
                margin: 0 0.5rem;
                color: ${mergedStyle.colors.text};
            }
        `]
        };
        const finalHTML = converter.toHTML(
            {
                tag: 'html', children: [
                    {
                        tag: 'head', children: [
                            { tag: 'title', children: [resumeTitle] },
                            { tag: 'meta', attributes: { charset: 'UTF-8' } },
                            { tag: 'meta', attributes: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
                            { tag: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
                            { tag: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
                            { tag: 'link', attributes: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap' } },
                            styleNode
                        ]
                    },
                    { tag: 'body', children: [cleanedHTMLNodeWithMain] }
                ]
            }
        );
        let browser: Browser | BrowserCore;
        if(process.env.VERCEL_ENV === 'production') {
            const executablePath = await chromium.executablePath();
            browser = await puppeteerCore.launch({
                executablePath,
                args: [
                    ...chromium.args,
                    '--font-render-hinting=none',
                ],
                headless: chromium.headless,
            });
        }
        else {
            browser = await puppeteer.launch({
                headless: true,
            });
        }
        const page = await browser.newPage();

        await page.setContent(finalHTML, {
            waitUntil: 'networkidle0'
        });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10px',
                right: '10px',
                bottom: '10px',
                left: '10px'
            }
        });

        await browser.close();

        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=${resumeTitle}.pdf`,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { message: 'Error generating PDF' },
            { status: 500 }
        );
    }


}


