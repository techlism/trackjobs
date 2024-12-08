import { validateRequest } from "@/lib/lucia";
import SignOutButton from "@/components/SignOut";
import { KanbanBoard } from "@/components/job-tracker/KanbanBoard";
import { fetchAllJobs, fetchGeneratedResumes } from "./action";
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
import { fetchAllResumes } from "../resume-builder/action";
export default async function Dashboard() {
  const { user } = await validateRequest();
  if (!user) {
    return (
      <div className="grid grid-cols-1 items-center p-4 border rounded-md gap-4 mx-auto max-w-96 ">
        <h1>Please sign in to access the dashboard</h1>
        <a href="/sign-in" className="p-4 border rounded-md">
          Sign-in
        </a>
      </div>
    );
  }
  const result = await fetchAllJobs();
  const resumes = await fetchAllResumes();
  let initialJobs = JSON.parse(result);

  if (initialJobs.error || resumes.error || !resumes.data) {
    return (
      <div className="p-4 border rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
        <p>
          Unable to fetch data. Please try again later.
        </p>
        <p>{initialJobs.error}</p>
        <p>{resumes.error}</p>
      </div>
    );
  }
  initialJobs = initialJobs as Job[];
  const validResumes = resumes.data?.filter((resume) => {
    return typeof resume.id === "string" &&
      typeof resume.resumeTitle === "string" &&
      !Number.isNaN(resume.createdAt) &&
      !Number.isNaN(resume.updatedAt);
  }) ?? [];

  const fetchedGeneratedResumes = await fetchGeneratedResumes();
  const generatedResumes = (fetchedGeneratedResumes.data && !fetchedGeneratedResumes.error) ? fetchedGeneratedResumes.data : [];

  return (
    <main className="mx-auto flex justify-center items-center h-full w-full">
      <Card className="my-6 mx-1">
        <CardHeader className="py-4">
          <CardTitle className="text-xl md:text-2xl lg:text-2xl xl:text-2xl">
            Your Dashboard
          </CardTitle>
          <CardDescription>
            Track your Job Applications and manage all Resumes right from here.
          </CardDescription>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent className="grid lg:grid-cols-12 grid-cols-1 gap-2 px-2">
          <KanbanBoard initialJobs={initialJobs} resumes={validResumes} generatedResumes={generatedResumes} className="lg:col-span-9" />
          <ResumeManager initialResumes={validResumes} generatedResumes={generatedResumes} />
        </CardContent>
      </Card>
    </main>
  );
}
