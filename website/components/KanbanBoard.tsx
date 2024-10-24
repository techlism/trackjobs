"use client";

import type React from "react";
import { useMemo, useState } from "react";
import type { Job, JobStatus } from "@/lib/types";
import { JobStatusValues } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { KanbanColumn } from "./KanbanColumn";
import { useJobs } from "@/hooks/useJobs";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
  } from "@/components/ui/tabs"

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
import Link from "next/link";
import { Edit } from "lucide-react";
    
export const KanbanBoard: React.FC<{ initialJobs: Job[] }> = ({
	initialJobs,
}) => {
	const { jobs, moveJob, editJob, removeJob } = useJobs(initialJobs);
	const { toast } = useToast();
	const router = useRouter();
	const handleAction = async (		
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		action: () => Promise<any>,
		successMessage: string,
		errorMessage: string,
	) => {
		try {
			const result = await action();
			const parsedResult = JSON.parse(result);
			if (typeof parsedResult === "object" && "error" in parsedResult) {
				toast({
					title: "Error",
					description: parsedResult.error,
					variant: "destructive",
				});
				return null;
			}
			toast({ title: "Success", description: successMessage });
			return parsedResult;
		} catch (error) {
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
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
			"Job details have been updated successfully.",
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
		<Card className="my-6 mx-4">
			<CardHeader>
				<CardTitle className="text-xl md:text-2xl lg:text-3xl xl:text-3xl font-bold">Your Dashboard</CardTitle>
				<CardDescription>Manage your all job applications right from here..</CardDescription>				
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="Focused" >
					<TabsList>
						<TabsTrigger value="Focused">Focused</TabsTrigger>
						<TabsTrigger value="At a Glance">At a Glance</TabsTrigger>
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
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-center">
							{memoizedColumns}
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
			<CardFooter>
				<Link href={'dashboard/edit-job/add-new'} className="hover:text-primary/80 p-2 rounded-lg border flex justify-between items-center gap-2 font-medium hover:shadow-sm hover:scale-105 transition-all ease-in-out">
					<Edit className="h-6 w-6" />
					Add New Job
				</Link>
			</CardFooter>
		</Card>
	);
};