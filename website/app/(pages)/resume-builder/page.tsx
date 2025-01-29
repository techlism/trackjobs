import ResumeForm from "@/components/resume-builder/ResumeForm";
import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";
import { fetchResumeData } from "./resume-actions";

export default async function ResumeBuilderPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const { session } = await validateRequest();
    if (!session) redirect("/sign-in");
    const resumeID = (await searchParams).resume_id;
    const resumeType = (await searchParams).resume_type;

    if (resumeID) {
        // Validate both params exist
        if (!resumeType) redirect("/resume-builder");
        
        // Validate resumeType format
        if (!['generated', 'manual'].includes(resumeType)) {
            redirect("/resume-builder");
        }

        try {
            const response = await fetchResumeData(
                resumeID, 
                resumeType as 'generated' | 'manual' // Necessary type assertion
            );

            // Handle fetch errors
            if (response.error || !response.data) {
                console.error('Resume fetch failed:', response.error);
                redirect("/resume-builder");
            }

            return (
                <div className="flex justify-center items-center max-w-5xl md:mx-auto sm:mx-auto lg:mx-auto mx-4 my-6">
                    <ResumeForm
                        initialData={response.data}
                        resumeId={resumeID}
                        resumeType={resumeType as 'generated' | 'manual'}
                    />
                </div>
            );
        } catch (error) {
            console.error("Resume loading failed:", error);
            redirect("/resume-builder");
        }
    }

    // New manual resume creation
    return (
        <div className="flex justify-center items-center max-w-5xl md:mx-auto sm:mx-auto lg:mx-auto mx-4 my-6">
            <ResumeForm resumeType='manual' />
        </div>
    );
}