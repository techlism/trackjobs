'use server'

import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import db from "@/lib/database/client";
import { validateRequest } from "@/lib/lucia";
import { manualResumeTable } from "@/lib/database/schema";
import { type ResumeData, type ApiResponse, ResumeSchema } from "@/lib/types";

export async function saveResumeData(
    resumeData: ResumeData
): Promise<ApiResponse<{ id: string }>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };

        const validatedData = ResumeSchema.parse(resumeData);

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
        console.error("Error saving resume:", error);
        return { error: "Failed to save resume" };
    }
}

export async function fetchResumeData(
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

export async function updateResumeData(
    resumeId: string,
    data: ResumeData
): Promise<ApiResponse<{ id: string }>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };
        if (!resumeId) return { error: "Resume ID required" };

        const validatedData = ResumeSchema.parse(data);

        const [resume] = await db.update(manualResumeTable)
            .set({
                resumeTitle: validatedData.resumeTitle,
                resumeContent: validatedData,
                updatedAt: Date.now(),
            })
            .where(eq(manualResumeTable.id, resumeId))
            .returning({ id: manualResumeTable.id });

        revalidatePath('/resume-builder');
        return { data: { id: resume.id } };
    } catch (error) {
        console.error("Error updating resume:", error);
        return { error: "Failed to update resume" };
    }
}

export async function deleteResumeData(
    resumeId: string
): Promise<ApiResponse<{ message: string }>> {
    try {
        const { session } = await validateRequest();
        if (!session) return { error: "Unauthorized" };

        await db.delete(manualResumeTable)
            .where(eq(manualResumeTable.id, resumeId));

        revalidatePath('/resume-builder');
        return { data: { message: "Resume deleted successfully" } };
    } catch (error) {
        console.error("Error deleting resume:", error);
        return { error: "Failed to delete resume" };
    }
}

export async function fetchAllResumes(): Promise<ApiResponse<{
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