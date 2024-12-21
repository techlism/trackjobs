"use client";

import type React from "react";
import { useMemo } from "react";
import type { Job, JobStatus } from "@/lib/types";
import { JobStatusValues } from "@/lib/types";
import { KanbanColumn } from "./KanbanColumn";
import { useJobs } from "@/hooks/useJobs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SingleColumnView } from "./SingleColumnView";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ResumeContext } from "./ResumeContext";
import { Button } from "../ui/button";

interface KanbanBoardProps {
	initialJobs: Job[];
	className?: HTMLDivElement["className"];
	resumes: {
		id: string;
		resumeTitle: string;
		createdAt: number;
		updatedAt: number;
	}[];
	generatedResumes : {
		id : string;
		resumeId : string;
		createdAt : number;
		resumeTitle : string;
		jobId : string;
	}[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
	initialJobs,
	className,
	resumes,
	generatedResumes
}) => {
	const { jobs, moveJob, editJob, removeJob } = useJobs(initialJobs);
	const router = useRouter();
	const handleAction = async (
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		action: () => Promise<any>,
		successMessage: string,
		errorMessage: string,
	) => {
		try {
			const result = await action();

			// Check if result is already an object
			const parsedResult = typeof result === "string"
				? JSON.parse(result)
				: result;

			if (typeof parsedResult === "object" && "error" in parsedResult) {
				toast.error(parsedResult.error, {
					action: {
						label: "Dismiss",
						onClick: () => toast.dismiss,
					},
				});
				return null;
			}

			toast.success("Success", {
				description: successMessage,

				action: {
					label: "Dismiss",
					onClick: () => toast.dismiss,
				},
			});
			return parsedResult;
		} catch (error) {
			console.error("Action error:", error);
			toast.error("Error", { description: errorMessage });
			return null;
		}
	};

	const handleMoveJob = (jobId: string, newStatus: JobStatus) =>
		handleAction(
			() => moveJob(jobId, newStatus),
			"Job status has been updated successfully.",
			"Failed to update job status.",
		);

	const handleEditJob = (job: Job) =>
		handleAction(
			async () => {
				return router.push(`/dashboard/edit-job/${job.id}`);
			},
			"You are being redirected to edit the job.",
			"Failed to update job details.",
		);

	const handleDeleteJob = (jobId: string) =>
		handleAction(
			() => removeJob(jobId),
			"Job has been deleted successfully.",
			"Failed to delete job.",
		);

	const memoizedColumns = useMemo(
		() =>
			JobStatusValues.map((status: JobStatus) => (
				<KanbanColumn
					key={status}
					status={status}
					jobs={jobs.filter((job) => job.currentStatus === status)}
					onMoveJob={handleMoveJob}
					onEditJob={handleEditJob}
					onDeleteJob={handleDeleteJob}
				/>
			)),
		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		[jobs, handleMoveJob, handleEditJob, handleDeleteJob],
	);

	return (
		<ResumeContext.Provider value={{ resumes, generatedResumes }}>
			<Card className={className}>
				<CardHeader className="p-4">
					<CardTitle className="text-xl font-semibold">
						Your Applications
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4">
					<Tabs defaultValue="At a Glance">
						<TabsList>
							<TabsTrigger value="Focused">Focused</TabsTrigger>
							<TabsTrigger value="At a Glance">
								At a Glance
							</TabsTrigger>
						</TabsList>
						<TabsContent value="Focused" className="w-full">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-center">
								<SingleColumnView
									jobs={jobs}
									onMoveJob={handleMoveJob}
									onEditJob={handleEditJob}
									onDeleteJob={handleDeleteJob}
								/>
							</div>
						</TabsContent>
						<TabsContent value="At a Glance">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 items-center">
								{memoizedColumns} 
								{/* This is nothing but memoized version of KanbanColumn */}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter className="p-4 pt-0">
					<Button
                        onClick={() => router.push("dashboard/edit-job/add-new")}
                        className="h-9 max-w-fit"
                    >
						<Plus className="h-4 w-4 mr-2" />
						Add a New Job
					</Button>
				</CardFooter>
			</Card>
		</ResumeContext.Provider>
	);
};
