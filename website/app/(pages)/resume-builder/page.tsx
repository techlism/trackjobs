// page.tsx
import { validateRequest } from "@/lib/lucia";
import { fetchResumeData } from "./action";
import { redirect } from "next/navigation";
import ResumeForm from "@/components/resume-builder/ResumeForm";
import type { ResumeData } from "@/lib/types";

export default async function ResumePage({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) {
	const { session } = await validateRequest();
	if (!session) {
		redirect("/sign-in");
	}
	const resumeID = searchParams.resume_id;
	let initialData: ResumeData | undefined = undefined;
	if (resumeID) {
		const response = await fetchResumeData(resumeID);
		// console.log(response);
		if (!response.error) {
			initialData = response.data;
		}
		else redirect("/resume-builder");
	}

	return (
		<div className="flex justify-center items-center max-w-5xl md:mx-auto sm:mx-auto lg:mx-auto mx-4 my-6">
			<ResumeForm initialData={initialData} resumeID={initialData === undefined ? undefined : resumeID} />
		</div>
	);
}
