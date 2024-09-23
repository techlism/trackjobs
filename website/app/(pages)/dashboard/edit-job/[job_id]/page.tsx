import { EditJobForm } from "@/components/EditJobForm";
import { fetchJobData } from "../../action";
import { redirect } from "next/navigation";
import { Job } from "@/lib/types";

export default async function Page({ params }: { params: { job_id: string } }) {
	const { job_id } = params;

	if (!job_id) {
		return <div>Job not found</div>;
	}

	const initialData = job_id === "add-new" ? undefined : await fetchJobData(job_id);
    const parsedData = initialData ? JSON.parse(initialData) : undefined;   
    if(parsedData && parsedData.error) {
        return redirect("/dashboard");
    }
    const job = parsedData as Partial<Job>;
	return <EditJobForm jobId={job_id} initialData={job} />;
}

