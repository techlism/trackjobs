import { type NextRequest, NextResponse } from 'next/server';
import db from "@/lib/database/client";
import { jobTable } from "@/lib/database/schema";
import { OpenAI } from "openai";
import { validateRequest } from '@/lib/lucia';
import { eq } from 'drizzle-orm';
import { TidyURL } from 'tidy-url';
import { JobSchema, type JobStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { encrypt } from '@/lib/encryption/encryptor';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const JobExtractionSchema = z.object({
  isJobPosting: z.boolean(),
  role: z.string().optional(),
  company: z.string().optional(),
  summary: z.string().optional(),
  message: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const { content, url, jobStatus }: { content: string, url: string, jobStatus: JobStatus } = await req.json();
    if (!content || !url || !jobStatus) {
      // console.log("Invalid request", { content, url, jobStatus });
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { session } = await validateRequest();
    const cleanedUrl = TidyURL.clean(url).url;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = session.id;
    const sessionDetails = await db.query.sessionTable.findFirst({
      where: (table) => eq(table.id, sessionId)
    });
    if (!sessionDetails) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionDetails.userId;

    // Extract job details using OpenAI
    const prompt = `Analyze the following content and determine if it's a job posting. If it is, extract the following information (stick strictly to the format and do not add any extra information and do not miss any key information such as years of experience required, visa sponsorship(if mentioned), salary(if mentioned), any last date to apply(if mentioned), etc.):
    1. Job Role
    2. Company Name
    3. Job Description Summary (max 200-300 words)

    If it's a job posting, return the following format:

    Format the response as JSON:
    {
      "isJobPosting": true,
      "role": "...",
      "company": "...",
      "summary": "...",      
    }

    If it's not a job posting, use this format:
    {
      "isJobPosting": false,
      "message": "A Relevant Error Message"
    }

    Content to analyze:
    ${content}`;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing job postings and extracting key information."
        },
        { role: "user", content: prompt }
      ],
      response_format: zodResponseFormat(JobExtractionSchema, "job_extraction")
    });

    // console.log("OpenAI response:", completion.choices[0].message.parsed);

    // const rawContent = completion.choices[0].message.content || '';
    //   console.log("Raw OpenAI response:", rawContent);

    // Remove backticks and "json" identifier if present
    // const jsonString = rawContent.replace(/^```json\n|\n```$/g, '').trim();

    // let extractedData: { isJobPosting: true, role?: string, company?: string, summary?: string } | { isJobPosting: false, message: string };
    const response = completion.choices[0].message.parsed;
    if(!response) {
      return NextResponse.json({ error: "Failed to extract job data" }, { status: 500 });
    }
    const extractedData = JobExtractionSchema.safeParse(response);
    if(extractedData.error) {
      return NextResponse.json({error : "Error in parsing job description parsing"}, {status : 500});
    }
    if(!extractedData.data.isJobPosting) {
      return NextResponse.json({error : extractedData.data.message}, {status : 400});
    }
    // try {
    //   extractedData = JSON.parse(jsonString);
    //   if (!extractedData.isJobPosting) {
    //     return NextResponse.json({ error: extractedData.message }, { status: 400 });
    //   }
    // } catch (error) {
    //   console.error("Error parsing OpenAI response:", error);
    //   return NextResponse.json({ error: "Failed to parse job data" }, { status: 500 });
    // }

    // Validate extracted data
    if (!extractedData.success || !extractedData.data.role || !extractedData.data.company || !extractedData.data.summary) {
      console.error("Invalid extracted data:", extractedData);
      return NextResponse.json({ error: "Failed to extract job data" }, { status: 500 });
    }

    const parsedJobDetails = JobSchema.parse({
      userId: userId,
      role: encrypt(extractedData.data.role),
      companyName: encrypt(extractedData.data.company),
      jobDescriptionSummary: encrypt(extractedData.data.summary),
      appliedOn: Date.now(),
      currentStatus: jobStatus,
      link: cleanedUrl
    })
    // link to the job cannot be encrypted in the current implementation because it is a key in the database.
    const newJob = await db.insert(jobTable).values({
      ...parsedJobDetails,
      appliedOn: parsedJobDetails.appliedOn,
    }).returning({ role: jobTable.role });
    revalidatePath('/dashboard');

    return NextResponse.json({ message: "Job data saved successfully", newJob });
  } catch (error) {
    console.error("Error saving job data:", error);
    return NextResponse.json({ error: "Failed to save job data" }, { status: 500 });
  }
}