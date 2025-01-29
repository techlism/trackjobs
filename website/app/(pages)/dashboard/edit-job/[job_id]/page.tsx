import { fetchJobData } from "../../job-actions";
import { redirect } from "next/navigation";
import type { Job } from "@/lib/types";
import { EditJobForm } from '@/components/job-tracker/EditJobForm';

export default async function Page({ params }: { params: Promise<{ job_id: string }> }) {
  const { job_id } = await params;

  if (!job_id) {
    return <div>Job not found</div>;
  }

  const initialData = job_id === "add-new" ? undefined : await fetchJobData(job_id);

  const parsedData = initialData ? JSON.parse(initialData) : undefined;   
  if(parsedData?.error) {
    return redirect("/dashboard");
  }
  const job = parsedData as Partial<Job>;
  return (
    <div className="flex justify-center align-middle items-center my-auto">
      <EditJobForm jobId={job_id} initialData={job} />
    </div>
  );
}