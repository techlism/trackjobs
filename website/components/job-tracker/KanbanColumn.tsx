"use client";
import type React from "react";
import type { Job, JobStatus as JobStatusType } from "@/lib/types";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { JobStatusValues } from "@/lib/types";
import Link from "next/link";
import { DownloadIcon, Expand, Loader2, Wand2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { useResumes } from "./ResumeContext";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type KanbanColumnProps = {
	status: JobStatusType;
	jobs: Job[];
	onMoveJob: (jobId: string, newStatus: JobStatusType) => void;
	onEditJob: (job: Job) => void;
	onDeleteJob: (jobId: string) => void;
};

const colorBasedOnStatus = (
	status: JobStatusType,
	type:
		| "background"
		| "text"
		| "border"
		| "hover"
		| "separator"
		| "card"
		| "scrollBar" = "background",
) => {
	const colors: Record<
		JobStatusType,
		Record<
			| "background"
			| "text"
			| "border"
			| "hover"
			| "separator"
			| "card"
			| "scrollBar",
			string
		>
	> = {
		Saved: {
			background: "bg-teal-100 dark:bg-teal-800",
			text: "text-teal-800 dark:text-teal-100",
			border: "border-teal-300 dark:border-teal-600",
			hover: "hover:bg-teal-200 dark:hover:bg-teal-700",
			separator: "bg-teal-400 dark:bg-teal-500",
			card: "bg-teal-50 dark:bg-teal-900",
			scrollBar: "bg-teal-300 dark:bg-teal-400",
		},
		Applied: {
			background: "bg-blue-100 dark:bg-blue-800",
			text: "text-blue-800 dark:text-blue-100",
			border: "border-blue-300 dark:border-blue-600",
			hover: "hover:bg-blue-200 dark:hover:bg-blue-700",
			separator: "bg-blue-400 dark:bg-blue-500",
			card: "bg-blue-50 dark:bg-blue-900",
			scrollBar: "bg-blue-300 dark:bg-blue-400",
		},
		"OA/Assignment": {
			background: "bg-purple-100 dark:bg-purple-800",
			text: "text-purple-800 dark:text-purple-100",
			border: "border-purple-300 dark:border-purple-600",
			hover: "hover:bg-purple-200 dark:hover:bg-purple-700",
			separator: "bg-purple-400 dark:bg-purple-500",
			card: "bg-purple-50 dark:bg-purple-900",
			scrollBar: "bg-purple-300 dark:bg-purple-400",
		},
		Interview: {
			background: "bg-green-100 dark:bg-green-800",
			text: "text-green-800 dark:text-green-100",
			border: "border-green-300 dark:border-green-600",
			hover: "hover:bg-green-200 dark:hover:bg-green-700",
			separator: "bg-green-400 dark:bg-green-500",
			card: "bg-green-50 dark:bg-green-900",
			scrollBar: "bg-green-300 dark:bg-green-400",
		},
		Offer: {
			background: "bg-lime-100 dark:bg-lime-800",
			text: "text-lime-800 dark:text-lime-100",
			border: "border-lime-300 dark:border-lime-600",
			hover: "hover:bg-lime-200 dark:hover:bg-lime-700",
			separator: "bg-lime-400 dark:bg-lime-500",
			card: "bg-lime-50 dark:bg-lime-900",
			scrollBar: "bg-lime-300 dark:bg-lime-400",
		},
		Rejected: {
			background: "bg-red-100 dark:bg-red-800",
			text: "text-red-800 dark:text-red-100",
			border: "border-red-300 dark:border-red-600",
			hover: "hover:bg-red-200 dark:hover:bg-red-700",
			separator: "bg-red-400 dark:bg-red-500",
			card: "bg-red-50 dark:bg-red-900",
			scrollBar: "bg-red-300 dark:bg-red-300",
		},
		Withdrawn: {
			background: "bg-orange-100 dark:bg-orange-800",
			text: "text-orange-800 dark:text-orange-100",
			border: "border-orange-300 dark:border-orange-600",
			hover: "hover:bg-orange-200 dark:hover:bg-orange-700",
			separator: "bg-orange-400 dark:bg-orange-500",
			card: "bg-orange-50 dark:bg-orange-900",
			scrollBar: "bg-orange-300 dark:bg-orange-400",
		},
		Other: {
			background: "bg-sky-100 dark:bg-sky-800",
			text: "text-sky-800 dark:text-sky-100",
			border: "border-sky-300 dark:border-sky-600",
			hover: "hover:bg-sky-200 dark:hover:bg-sky-700",
			separator: "bg-sky-400 dark:bg-sky-500",
			card: "bg-sky-50 dark:bg-sky-900",
			scrollBar: "bg-sky-300 dark:bg-sky-400",
		},
	};

	return colors[status][type];
};
export const KanbanColumn: React.FC<KanbanColumnProps> = ({
	status,
	jobs,
	onMoveJob,
	onEditJob,
	onDeleteJob,
}) => {
	const { resumes } = useResumes();
	const { generatedResumes } = useResumes();
	const [isGenerating, setIsGenerating] = useState(false);
	const router = useRouter();

	async function generateResume(
		event: React.FormEvent<HTMLFormElement>,
		jobId: string,
	) {
		event.preventDefault();
		if (isGenerating) return;
		setIsGenerating(true);
		const form = event.currentTarget;
		const formData = new FormData(form);
		const resumeId = formData.get("resumeId") as string;
		if (!resumeId || !jobId || jobId === "" || resumeId === "") {
			setIsGenerating(false);
			toast.error("Error", {
				description: "Please select a Resume.",
				action: {
					label: "Dismiss",
					onClick: () => toast.dismiss,
				},
			});
			return;
		}
		try {
			const response = await fetch("/api/ai-resume-builder", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					jobID: jobId,
					resumeID: resumeId,
				}),
			});
			if (!response.ok) {
				throw new Error("Failed to generate optimized resume");
			}
			const data = await response.json();
			if (data.error) throw new Error(data.error);
			toast.success("Success", {
				description: data.success || "Resume Generated Successfully",
				action: {
					label: "Dismiss",
					onClick: () => toast.dismiss,
				},
			});
			if (data.success) {
				router.refresh();
			}
		} catch (error) {
			// console.error("Error generating optimized resume", error);
			toast.error("Error", {
				description: "Failed to generate optimized resume.",
			});
		} finally {
			setIsGenerating(false);
		}
	}

	// Add loading state
	const [isDownloading, setIsDownloading] = useState(false);

	async function downloadResume(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isDownloading) return;
		setIsDownloading(true);

		const form = event.currentTarget;
		const formData = new FormData(form);
		const generatedResumeId = formData.get("generatedResumeId") as string;

		if (!generatedResumeId) {
			toast.error("Error", {
				description: "Please select a Resume to download.",
				action: {
					label: "Dismiss",
					onClick: () => toast.dismiss,
				},
			});
			setIsDownloading(false);
			return;
		}

		try {
			const response = await fetch(
                `/api/download-resume?generated_resume_id=${generatedResumeId}`,
                { method: "GET" },
            );

            if (!response.ok) throw new Error("Download failed");
            const contentDisposition = response.headers.get("Content-Disposition");
            let fileName = `Resume ${generatedResumeId}.pdf`;
            if (contentDisposition) {
                const matches = /filename=([^;]+)/g.exec(contentDisposition);
                if (matches?.[1]) {
                    fileName = matches[1].replace(/["']/g, '');
                    fileName = decodeURIComponent(fileName);
                }
            }            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);			
			toast.success("Resume downloaded successfully");
		} catch (error) {
			console.error("Error downloading resume:", error);
			toast.error("Error", {
				description: "Failed to download resume",
			});
		} finally {
			setIsDownloading(false);
		}
	}

	return (
		<div
			className={`rounded-md shadow-sm ${
				colorBasedOnStatus(status, "background")
			}`}
		>
			<div className="flex items-center justify-between p-2">
				<h3
					className={`text-xl font-bold ${
						colorBasedOnStatus(status, "text")
					}`}
				>
					{status}
				</h3>
				<div
					className={`text-lg font-medium font-mono ${
						colorBasedOnStatus(status, "text")
					}`}
				>
					{jobs.length}
				</div>
			</div>
			<Separator
				className={`${colorBasedOnStatus(status, "separator")} my-2 `}
			/>
			<ScrollArea className="h-[270px] p-1.5">
				<ScrollBar
					className={`${colorBasedOnStatus(status, "scrollBar")}`}
				/>
				{jobs.map((job) => (
					<div
						key={job.id}
						className={"mb-2 mx-1.5 max-w-[99.7%] hover:scale-[1.03] transition-all duration-150 hover:rounded-md hover:shadow-sm border-border hover:border-border"}
					>
						<div
							className={`flex justify-between items-center rounded-md p-2 ${
								colorBasedOnStatus(status, "card")
							} `}
						>
							<div className="font-medium max-w-[95%] grid grid-cols-1 text-wrap truncate text-base">
								<h4
									className={`${
										colorBasedOnStatus(status, "text")
									} text-base`}
								>
									{job.role}
								</h4>
								<p
									className={`${
										colorBasedOnStatus(status, "text")
									} text-sm opacity-65`}
								>
									{job.companyName}
								</p>
							</div>
							{/* Job Details and Resume Generator Dialog */}
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										className={`${
											colorBasedOnStatus(status, "hover")
										}`}
									>
										<Expand className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent className="lg:w-[550px] md:w-[450px] sm:w-[450px] w-[350px] py-3">
									<DialogHeader className="mt-1">
										<DialogTitle className="text-xl font-bold">
											{job.role}
										</DialogTitle>
										<DialogDescription className="leading-7 [&:not(:first-child)]:mt-6 text-xs md:text-sm lg:text-sm">
											{job.companyName} |{" "}
											{new Date(job.appliedOn)
												.toLocaleDateString()}{" "}
											{new Date(job.appliedOn)
												.toLocaleTimeString()}
										</DialogDescription>
									</DialogHeader>
									<Separator className="m-0 p-0" />
									<div className="grid gap-2 grid-cols-1">
										<div className="space-y-1">
											<p className="font-semibold text-lg">
												Job Description
											</p>
											<ScrollArea className="lg:h-[95px] md:h-[80px] h-[70px]">
												<ScrollBar className="bg-border" />
												<p className="font-medium text-justify text-sm max-w-[97%]">
													{job.jobDescriptionSummary}
												</p>
											</ScrollArea>
										</div>
										<div className="space-y-1">
											<p className="font-semibold text-lg">
												Job Link
											</p>
											<Link
												href={job.link}
												target="_blank"
												className="truncate block max-w-full hover:underline font-medium text-sm hover:text-blue-500"
											>
												{job.link}
											</Link>
										</div>
										<div className="space-y-1">
											<p className="font-semibold text-lg">
												Job Status
											</p>
											<Select
												onValueChange={(newStatus) =>
													onMoveJob(
														job.id || "",
														newStatus as JobStatusType,
													)}
											>
												<SelectTrigger
													id="job-status"
													className="focus:ring-0 font-medium"
												>
													<SelectValue
														placeholder={job
															.currentStatus}
														className="font-medium"
													/>
												</SelectTrigger>
												<SelectContent className="font-medium">
													{JobStatusValues.filter((
														newStatus,
													) => status !== newStatus)
														.map((newStatus) => (
															<SelectItem
																key={newStatus}
																value={newStatus}
															>
																{newStatus}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
										</div>
										{job.notes && job.notes.length > 0 && (
											<div className="space-y-1">
												<p className="font-semibold text-lg">
													Notes
												</p>
												<ScrollArea className="lg:h-[80px] md:h-[65px] h-[60px]">
													<ScrollBar className="bg-border" />
													<p className="font-medium text-justify text-sm max-w-[97%]">
														{job.notes}
													</p>
												</ScrollArea>
											</div>
										)}
									</div>
									{generatedResumes.length > 0 &&
										generatedResumes.some((resume) =>
											resume.jobId === job.id
										) &&
										(
											<form
												onSubmit={downloadResume}
												className="border border-border/80 p-2 rounded-lg grid grid-cols-1 gap-2"
											>
												<Select name="generatedResumeId">
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Choose a resume to download" />
													</SelectTrigger>
													<SelectContent>
														{generatedResumes.map(
															(resume) => (
																resume.jobId ===
																	job.id &&
																(
																	<SelectItem
																		key={resume
																			.id}
																		value={resume
																			.id}
																	>
																		{resume
																			.resumeTitle}
																	</SelectItem>
																)
															),
														)}
													</SelectContent>
												</Select>
												<Button
													type="submit"
													size={"sm"}
													disabled={isDownloading}
												>
													{isDownloading
														? (
															<>
																<Loader2 className="h-4 w-4 mr-2 animate-spin" />
																Downloading...
															</>
														)
														: (
															<>
																<DownloadIcon className="h-4 w-4 mr-2" />
																Download
																Generated Resume
															</>
														)}
												</Button>
											</form>
										)}
									<form
										onSubmit={(event) =>
											generateResume(event, job.id || "")}
										className="border border-border/80 p-2 rounded-lg"
									>
										<div className="space-y-1">
											<h4 className="font-medium text-sm">
												AI Resume Optimization
											</h4>
											<p className="text-xs text-muted-foreground leading-relaxed">
												Choose one of your resumes to
												create an AI-optimized version.
											</p>
										</div>

										<div className="space-y-2">
											<Select name="resumeId">
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Choose a resume to optimize" />
												</SelectTrigger>
												<SelectContent>
													{resumes.map((resume) => (
														<SelectItem
															key={resume.id}
															value={resume.id}
														>
															{resume.resumeTitle}
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<Button
												type="submit"
												className="w-full"
												disabled={isGenerating}
												size={"sm"}
											>
												{isGenerating
													? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Optimizing...
														</>
													)
													: (
														<>
															<Wand2 className="mr-2 h-4 w-4" />
															Create Optimized Version
														</>
													)}
											</Button>
										</div>
									</form>
									<DialogFooter className="grid grid-cols-1 m-0 p-0">
										<div className="flex gap-2 justify-end">
											<Button
												type="button"
												variant="destructive"
												onClick={() =>
													onDeleteJob(job.id || "")}
												size={"sm"}
											>
												Delete Job
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={() => onEditJob(job)}
												size={"sm"}
											>
												Edit Job
											</Button>
										</div>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				))}
			</ScrollArea>
		</div>
	);
};
