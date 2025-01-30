
import { validateRequest } from "@/lib/lucia";
import { KanbanBoard } from "@/components/job-tracker/KanbanBoard";
import { fetchAllJobs } from "./job-actions";
import type { Job } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ResumeManager from "@/components/resume-builder/ManageAllResumeCard";
import { Separator } from "@/components/ui/separator";
import { fetchAllGeneratedResumes, fetchAllManualResumes } from "@/app/(pages)/resume-builder/resume-actions";

export default async function Dashboard() {
  const { user } = await validateRequest();
  
  if (!user) {
    return (
      <div className="grid grid-cols-1 items-center p-4 border rounded-md gap-4 mx-auto max-w-96">
        <h1>Please sign in to access the dashboard</h1>
        <a href="/sign-in" className="p-4 border rounded-md">
          Sign-in
        </a>
      </div>
    );
  }

  // Fetch all data in parallel
  const [jobsResult, manualResumesResult, generatedResumesResult] = await Promise.all([
    fetchAllJobs(),
    fetchAllManualResumes(),
    fetchAllGeneratedResumes()
  ]);

  // Parse jobs data
  let initialJobs: Job[] = [];
  try {
    initialJobs = JSON.parse(jobsResult);
  } catch (error) {
    console.error('Failed to parse jobs data:', error);
  }

  // Handle error cases
  if (
    !Array.isArray(initialJobs) || 
    manualResumesResult.error || 
    generatedResumesResult.error
    || !manualResumesResult.data || !generatedResumesResult.data
  ) {
    return (
      <div className="p-4 border rounded-md">
        <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
        <p>Unable to fetch data. Please try again later.</p>
        {!Array.isArray(initialJobs) && <p>Error loading jobs</p>}
        {manualResumesResult.error && <p>{manualResumesResult.error}</p>}
        {generatedResumesResult.error && <p>{generatedResumesResult.error}</p>}
      </div>
    );
  }

  return (
    <main className="mx-auto flex justify-center items-center h-full w-full">     
      <Card className="my-6">
        <CardHeader className="p-4">
          <CardTitle className="text-xl md:text-2xl lg:text-2xl xl:text-2xl">
            Your Dashboard
          </CardTitle>
          <CardDescription>
            Track your Job Applications and manage all Resumes right from here.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid grid-cols-1 gap-4 p-4">
          <KanbanBoard 
            initialJobs={initialJobs}
            resumes={manualResumesResult.data}
            generatedResumes={generatedResumesResult.data}
          />
          <ResumeManager 
            initialResumes={manualResumesResult.data}
            generatedResumes={generatedResumesResult.data}
          />
        </CardContent>
      </Card>
    </main>
  );
}