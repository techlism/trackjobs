import db from "@/lib/database/client";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import type { ResumeData } from "@/lib/types";
import puppeteer, { type Browser } from 'puppeteer';
import { generateFullHTML } from "@/lib/resume-converter/resume-data-to-html";
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const generatedResumeID = searchParams.get("generated_resume_id");
        const manualResumeID = searchParams.get("manual_resume_id");
        if (!generatedResumeID && !manualResumeID) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        let fetchedResume  : { resumeContent : ResumeData , resumeTitle : string } | undefined;
        if(generatedResumeID && !manualResumeID){
            fetchedResume = await db.query.generatedResumeTable.findFirst({
                where: (table) => eq(table.id, generatedResumeID),
                columns: {
                    resumeContent: true,
                    resumeTitle: true,
                }
            });
        }
        if(manualResumeID && !generatedResumeID){
            fetchedResume = await db.query.manualResumeTable.findFirst({
                where: (table) => eq(table.id, manualResumeID),
                columns: {
                    resumeContent: true,
                    resumeTitle: true,
                }
            });
        }  

        if (!fetchedResume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        // console.log(fetchedResume);
        const resumeTitle = fetchedResume.resumeTitle;
        const resumeContent = fetchedResume.resumeContent;

        // const parsedResumeContent: ResumeData = JSON.parse(resumeContent);
        // parsedResumeContent.resumeTitle = resumeTitle;
        const finalHTML = generateFullHTML(resumeContent);
        let browser: Browser | BrowserCore;
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
            // console.trace('Using Puppeteer Core for production');
            const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
            browser = await puppeteerCore.launch({
                executablePath,
                args: chromium.args,
                headless: chromium.headless,
                defaultViewport: chromium.defaultViewport
            })
        } else {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
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


