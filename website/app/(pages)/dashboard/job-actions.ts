"use server"

import { revalidatePath } from "next/cache";
import db from "@/lib/database/client";
import { eq } from "drizzle-orm";
import { validateRequest } from "@/lib/lucia";
import { jobTable } from "@/lib/database/schema";
import type { Job } from "@/lib/types";
import { decrypt } from '@/lib/encryption/decryptor';
import { encrypt } from '@/lib/encryption/encryptor';

// implement logger
const logger = {
    error: (message: string, error: Error | unknown) => {
        console.error(message, error);
    }
}

// Helper function to validate session and get userId
async function getUserIdFromSession() {
    const { session } = await validateRequest();
    if (!session) return null;
    
    const sessionDetails = await db.query.sessionTable.findFirst({
        where: (table) => eq(table.id, session.id)
    });
    if (!sessionDetails) return null;
    
    return sessionDetails.userId;
}

export async function fetchAllJobs() : Promise<string> {
    try {
        const userId = await getUserIdFromSession();
        if (!userId) return JSON.stringify({error : "User not found"});
        const jobs = await db.query.jobTable.findMany({
            where: (table) => eq(table.userId, userId)
        });
        
        const decryptedJobs: Job[] = [];
        for(const job of jobs) {
            decryptedJobs.push({
                ...job,
                role: decrypt(job.role),
                companyName: decrypt(job.companyName),
                jobDescriptionSummary: decrypt(job.jobDescriptionSummary),
                notes: job.notes ? decrypt(job.notes) : undefined,

            });
        }

        return JSON.stringify(decryptedJobs);
    } catch (error) {
        logger.error("Error fetching jobs:", error);
        return JSON.stringify({error : "Error in fetching jobs"});
    }
}

export async function deleteJob(jobId: string): Promise<string> {
    try {
        const userId = await getUserIdFromSession();
        const result = await db.transaction(async (tx) => {
            const job = await tx.query.jobTable.findFirst({
                where: (table) => eq(table.id, jobId)
            });
            if (!job || job.userId !== userId) throw new Error("Job not found or unauthorized");
            return await tx.delete(jobTable).where(eq(jobTable.id, jobId));
        });
        revalidatePath("/dashboard");
        return JSON.stringify(result);
    } catch (error) {
        logger.error("Error deleting job:", error);
        return JSON.stringify({error : "Error in deleting job"});
    }
}

export async function updateJob(jobId: string, jobData: Partial<typeof jobTable.$inferInsert>): Promise<string> {
    const encryptedJobData : Partial<typeof jobTable.$inferInsert> = {...jobData};
    if(jobData.role) encryptedJobData.role = encrypt(jobData.role);
    if(jobData.companyName) encryptedJobData.companyName = encrypt(jobData.companyName);
    if(jobData.jobDescriptionSummary) encryptedJobData.jobDescriptionSummary = encrypt(jobData.jobDescriptionSummary);
    if(jobData.notes) encryptedJobData.notes = encrypt(jobData.notes);
    
    try {
        const userId = await getUserIdFromSession();
        const result = await db.transaction(async (tx) => {
            const job = await tx.query.jobTable.findFirst({
                where: (table) => eq(table.id, jobId)
            });
            if (!job || job.userId !== userId) throw new Error("Job not found or unauthorized");
            return await tx.update(jobTable).set(encryptedJobData).where(eq(jobTable.id, jobId));
        });
        revalidatePath("/dashboard");
        return JSON.stringify(result);
    } catch (error) {
        logger.error("Error updating job:", error);
        return JSON.stringify({error : "Error in updating job"});
    }
}

export async function addJob(jobData: Omit<typeof jobTable.$inferInsert, 'id' | 'userId'>): Promise<string> {
    try {
        const userId = await getUserIdFromSession();
        if(!userId) return JSON.stringify({error : "User not found"});
        const encryptedJobData = {
            ...jobData,
            role: encrypt(jobData.role) ,
            companyName: encrypt(jobData.companyName) ,
            jobDescriptionSummary: encrypt(jobData.jobDescriptionSummary),
            notes: jobData.notes ? encrypt(jobData.notes) : undefined,
            userId,
            appliedOn: Date.now()
        };
        const result = await db.insert(jobTable).values(encryptedJobData).returning();
        revalidatePath("/dashboard");
        return JSON.stringify(result[0]);
    } catch (error) {
        logger.error("Error adding job:", error);
        return JSON.stringify({error : "Error in adding job"});
    }
}

export async function fetchJobData(jobId: string): Promise<string> {
    try {
        const userId = await getUserIdFromSession();
        if (!userId) return JSON.stringify({error : "User not found"});
        const job = await db.query.jobTable.findFirst({
            where: (table) => eq(table.id, jobId)
        });
        if (!job) return JSON.stringify({error : "Job not found"});
        const decryptedJob: Job = {
            ...job,
            role: decrypt(job.role),
            companyName: decrypt(job.companyName),
            jobDescriptionSummary: decrypt(job.jobDescriptionSummary),
            notes: job.notes ? decrypt(job.notes) : undefined,
        }
        return JSON.stringify(decryptedJob);
    } catch (error) {
        logger.error("Error fetching job data:", error);
        return JSON.stringify({error : "Error in fetching job data"});
    }
}
