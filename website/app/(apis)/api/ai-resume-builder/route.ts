import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/lucia";
import { ResumeSchema, type ApiResponse, type Job, type ResumeData } from "@/lib/types";
import db from "@/lib/database/client";
import { generatedResumeCountTable, manualResumeTable } from "@/lib/database/schema";
import { decrypt } from "@/lib/encryption/decryptor";
import { and, eq } from "drizzle-orm";
import OpenAI from "openai";
import { generatedResumeTable } from '../../../../lib/database/schema';
import generatePromptString from "./prompt-string";
import { revalidatePath } from "next/cache";
import { zodResponseFormat } from "openai/helpers/zod";
import { redirect } from "next/navigation";


export const maxDuration = 60;

type JobResponse =
    | { success: true; data: Job }
    | { success: false; error: string };

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const gemini = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function fetchResumeData(
    resumeId: string
): Promise<ApiResponse<ResumeData>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };
        if (!resumeId) return { error: "Resume ID not provided" };

        const resume = await db.query.manualResumeTable.findFirst({
            where: eq(manualResumeTable.id, resumeId),
        });

        if (!resume) return { error: "Resume not found" };
        if (resume.userId !== session.userId) return { error: "Unauthorized" };

        const validatedData = ResumeSchema.parse(resume.resumeContent);
        return { data: validatedData };
    } catch (error) {
        console.error("Error fetching resume:", error);
        return { error: "Failed to fetch resume" };
    }
}

async function fetchJobData(jobId: string): Promise<JobResponse> {
    try {
        const job = await db.query.jobTable.findFirst({
            where: (table) => eq(table.id, jobId)
        });

        if (!job) {
            return { success: false, error: "Job not found" };
        }

        const decryptedJob: Job = {
            ...job,
            role: decrypt(job.role),
            companyName: decrypt(job.companyName),
            jobDescriptionSummary: decrypt(job.jobDescriptionSummary),
            notes: job.notes ? decrypt(job.notes) : undefined,
        };

        return { success: true, data: decryptedJob };
    } catch (error) {
        console.error("Error fetching job data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error in fetching job data"
        };
    }
}

const MAX_GENERATIONS_PER_JOB = 5;

export async function POST(request: NextRequest) {
    try {
        const { session } = await validateRequest();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { resumeID, jobID }: { resumeID: string, jobID: string } = await request.json();

        if (!resumeID || !jobID) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const existingCount = await db.query.generatedResumeCountTable.findFirst({
            where: and(
                eq(generatedResumeCountTable.user_id, session.userId),
                eq(generatedResumeCountTable.job_id, jobID)
            ),
        });

        if (existingCount && existingCount.count >= MAX_GENERATIONS_PER_JOB) {
            console.error('Max limit reached');
            return NextResponse.json(
                { error: `Maximum generations (${MAX_GENERATIONS_PER_JOB}) reached for this job` },
                { status: 429 }
            );
        }
        const resumeResponse = await fetchResumeData(resumeID);

        if (resumeResponse.error || !resumeResponse.data || !resumeResponse.data.resumeTitle) {
            return NextResponse.json(
                { error: resumeResponse.error },
                { status: resumeResponse.error === "Unauthorized" ? 401 : 404 }
            );
        }

        const jobData = await fetchJobData(jobID);
        if (!jobData.success) {
            return NextResponse.json(
                { error: jobData.error },
                { status: 404 }
            );
        }

        const prompt = generatePromptString(JSON.stringify(resumeResponse.data), JSON.stringify(jobData.data.jobDescriptionSummary), jobData.data.role);

        // const completion = await openai.chat.completions.create({
        //     model: 'gpt-4o-mini',
        //     messages: [
        //         {
        //             role: 'system',
        //             content: prompt
        //         }
        //     ]
        // })

        const response = await gemini.beta.chat.completions.parse({
            model: "gemini-1.5-flash",
            messages: [
                { role: "system", content: "You are an expert and professional RESUME maker. You're aim is to make resumes that are ATS friendly and brings high selection." },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: zodResponseFormat(ResumeSchema, "resume_schema"),
        });
        const parsedResponse = response.choices[0].message.parsed;
        if (!parsedResponse) {
            return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
        }        
        // const jsonString = rawResponse.replace(/^```json\n|\n```$/g, '').trim();
        // const jsonData = JSON.parse(jsonString);
        // if (!jsonData) {
        //     console.log('Resume Parsing Failed at jsonData');
        //     return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
        // }
        const parsedResume = ResumeSchema.safeParse(parsedResponse); // This is bit redundant as we are already validating the response in the API but AI responses can be unpredictable sometimes
        if (parsedResume.success && resumeResponse.data && resumeResponse.data.resumeTitle !== undefined) {
            const resTitle = `Resume ${jobData.data.companyName} ${jobData.data.role} v${existingCount ? existingCount.count + 1 : 1}`;
            const finalResumeContent = parsedResume.data;
            finalResumeContent.resumeTitle = resTitle;
            await db.transaction(async (tx) => {
                // Insert generated resume with all required fields
                await tx.insert(generatedResumeTable).values({
                    // id: crypto.randomUUID(),
                    resumeId: resumeID,
                    userId: session.userId,
                    jobId: jobID,
                    resumeTitle: resTitle,
                    resumeContent: finalResumeContent,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });


                if (existingCount) {
                    await tx
                        .update(generatedResumeCountTable)
                        .set({ count: existingCount.count + 1 })
                        .where(and(
                            eq(generatedResumeCountTable.user_id, session.userId),
                            eq(generatedResumeCountTable.job_id, jobID)
                        ));
                } else {
                    await tx.insert(generatedResumeCountTable).values({
                        user_id: session.userId,
                        job_id: jobID,
                        count: 1
                    });
                }
            });
            revalidatePath('/dashboard', 'page');            
            return NextResponse.json({ success: 'Resume generated Successfully.' }, { status: 200 });
        }
        return NextResponse.json({ error: "Failed to parse resume correctly" }, { status: 500 });

    } catch (error) {
        console.trace('Error in generating resume:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

