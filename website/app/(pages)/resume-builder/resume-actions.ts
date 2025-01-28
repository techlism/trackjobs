'use server';

import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import db from "@/lib/database/client";
import { validateRequest } from "@/lib/lucia";
import { manualResumeTable, generatedResumeTable } from "@/lib/database/schema";
import { type ResumeData, type ApiResponse, ResumeSchema } from "@/lib/types";

// Save Manual Resume Data
export async function saveManualResumeData(
    resumeData: ResumeData
): Promise<ApiResponse<{ id: string }>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };

        // Validate the resume data
        const validatedData = ResumeSchema.parse(resumeData);

        // Insert into the manual resume table
        const [resume] = await db.insert(manualResumeTable)
            .values({
                userId: session.userId,
                resumeTitle: validatedData.resumeTitle,
                resumeContent: validatedData,
            })
            .returning({ id: manualResumeTable.id });

        revalidatePath('/resume-builder');
        return { data: { id: resume.id } };
    } catch (error) {
        console.error("Error saving manual resume:", error);
        return { error: "Failed to save manual resume" };
    }
}

// Update Resume Data (Applicable to both Manual and Generated Resumes)
export async function updateResumeData(
    resumeId: string,
    data: ResumeData,
    resumeType: 'manual' | 'generated'
): Promise<ApiResponse<{ id: string }>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };
        if (!resumeId) return { error: "Resume ID required" };

        // Validate the resume data
        const validatedData = ResumeSchema.parse(data);
        const updateData = {
            resumeTitle: validatedData.resumeTitle,
            resumeContent: validatedData,
            updatedAt: Date.now(),
        };

        if (resumeType === 'manual') {
            // Update manual resume
            const [resume] = await db.update(manualResumeTable)
                .set(updateData)
                .where(eq(manualResumeTable.id, resumeId))
                .returning({ id: manualResumeTable.id });

            revalidatePath('/resume-builder');
            return { data: { id: resume.id } };
        }
        // Update generated resume
        const [resume] = await db.update(generatedResumeTable)
            .set(updateData)
            .where(eq(generatedResumeTable.id, resumeId))
            .returning({ id: generatedResumeTable.id });

        revalidatePath('/resume-builder');
        return { data: { id: resume.id } };
    } catch (error) {
        console.error("Error updating resume:", error);
        return { error: "Failed to update resume" };
    }
}

// Delete Resume Data (Applicable to both Manual and Generated Resumes)
export async function deleteResumeData(
    resumeId: string,
    resumeType: 'manual' | 'generated'
): Promise<ApiResponse<{ message: string }>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };

        if (resumeType === 'manual') {
            // Delete manual resume
            await db.delete(manualResumeTable)
                .where(eq(manualResumeTable.id, resumeId));
        } else {
            // Delete generated resume
            await db.delete(generatedResumeTable)
                .where(eq(generatedResumeTable.id, resumeId));
        }

        revalidatePath('/resume-builder');
        return { data: { message: "Resume deleted successfully" } };
    } catch (error) {
        console.error("Error deleting resume:", error);
        return { error: "Failed to delete resume" };
    }
}

// Fetch Resume Data (Applicable to both Manual and Generated Resumes)
export async function fetchResumeData(
    resumeId: string,
    resumeType: 'manual' | 'generated'
): Promise<ApiResponse<ResumeData>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };
        if (!resumeId) return { error: "Resume ID not provided" };

        let resume: Awaited<ReturnType<typeof db.query.manualResumeTable.findFirst>> |
            Awaited<ReturnType<typeof db.query.generatedResumeTable.findFirst>> | null;
        if (resumeType === 'manual') {
            resume = await db.query.manualResumeTable.findFirst({
                where: eq(manualResumeTable.id, resumeId),
            });
        } else {
            resume = await db.query.generatedResumeTable.findFirst({
                where: eq(generatedResumeTable.id, resumeId),
            });
        }

        if (!resume) return { error: "Resume not found" };
        if (resume.userId !== session.userId) return { error: "Unauthorized" };

        // Validate and return the resume content
        const validatedData = ResumeSchema.parse(resume.resumeContent);
        return { data: validatedData };
    } catch (error) {
        console.error("Error fetching resume:", error);
        return { error: "Failed to fetch resume" };
    }
}

export async function fetchAllManualResumes(): Promise<ApiResponse<{
    id: string;
    resumeTitle: string;
    createdAt: number;
    updatedAt: number;
}[]>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };

        const resumes = await db.query.manualResumeTable.findMany({
            where: eq(manualResumeTable.userId, session.userId),
            columns: {
                id: true,
                resumeTitle: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: (resumes) => [desc(resumes.updatedAt)],
        });
        return { data: resumes };
    } catch (error) {
        console.error("Error fetching resumes:", error);
        return { error: "Failed to fetch resumes" };
    }
}

export async function fetchAllGeneratedResumes():Promise<ApiResponse<{
    id: string;
    resumeTitle: string;
    createdAt: number;
    resumeId : string;
    jobId : string;
}[]>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };
        const generatedResumes = await db.query.generatedResumeTable.findMany({
            where: (table) => eq(table.userId, session.userId),
            columns: {
                id:true,
                resumeId : true,
                createdAt : true,
                resumeTitle : true,
                jobId : true,
            }
        });
        if(!generatedResumes) return {error : "No generated resumes found"};
        return { data : generatedResumes };
    } catch (error) {
        if(error instanceof Error) return {error : error.message};
        return {error : "Error in fetching generated resumes"};
    }
}