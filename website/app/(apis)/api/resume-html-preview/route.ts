import db from "@/lib/database/client";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import type { ResumeData } from "@/lib/types";

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
        return NextResponse.json({resumeContent}, {status : 200});

    }
    catch(error : unknown){
        return NextResponse.json({ error: (error as Error).message || "Resume not found" }, { status: 500 });
    }
}