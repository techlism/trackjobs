"use client";

import { Download, FileEdit, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { deleteResumeData } from "@/app/(pages)/resume-builder/resume-actions";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ResumeManagerProps {
	initialResumes: {
		id: string;
		resumeTitle: string;
		createdAt: number;
		updatedAt: number;
	}[];
	generatedResumes: {
		id: string;
		jobId: string;
		resumeTitle: string;
		createdAt: number;
	}[];
}

export default function ResumeManager({
	initialResumes,
	generatedResumes,
}: ResumeManagerProps) {
	const [manualResumes, setManualResumes] = useState(initialResumes);
	const [genResumes, setGenResumes] = useState(generatedResumes);
	const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(
		null,
	);
	const router = useRouter();

	const handleEdit = (id: string, type : 'manual' | 'generated') => {
		router.push(`/resume-builder?resume_id=${id}&resume_type=${type}`);
	};

	const handleDelete = async (id: string, type: 'manual' | 'generated') => {
		try {
			const result = await deleteResumeData(id, type);
			if (result.error) throw new Error(result.error);
			
			// Update correct state based on type
			if (type === 'manual') {
				setManualResumes(prev => prev.filter(resume => resume.id !== id));
			} else {
				setGenResumes(prev => prev.filter(resume => resume.id !== id));
			}
			
			toast.success("Resume deleted successfully");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Deletion failed");
		}
	};


	const handleDownload = async (
		generatedResumeId: string,
		type: "generated_resume_id" | "manual_resume_id",
	) => {
		try {
			setDownloadingResumeId(generatedResumeId);
			const response = await fetch(
				`/api/download-resume?${type}=${generatedResumeId}`,
				{ method: "GET" },
			);

			if (!response.ok) throw new Error("Download failed");
			const contentDisposition = response.headers.get("Content-Disposition");
			let fileName = `Resume ${generatedResumeId}.pdf`;
			if (contentDisposition) {
				const matches = /filename=([^;]+)/g.exec(contentDisposition);
				if (matches?.[1]) {
					fileName = matches[1].replace(/["']/g, "");
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
			console.error("Download error:", error);
			toast.error("Failed to download resume");
		} finally {
			setDownloadingResumeId(null);
		}
	};

	const ResumeCard = ({
		title,
		date,
		children,
	}: {
		title: string;
		date: string;
		children: React.ReactNode;
	}) => (
		<div className="flex justify-between w-full p-3 rounded-lg border border-border/70 hover:border-border transition-colors bg-card">
			<div className="grid grid-cols-1 gap-1">
				<p className="text-sm font-medium truncate">{title}</p>
				<p className="text-xs text-muted-foreground">{date}</p>
			</div>
			<div className="flex items-center gap-2">{children}</div>
		</div>
	);

	return (
		<Card className="shadow-sm">
			<CardHeader className="p-4">
				<CardTitle className="text-xl font-semibold">Resume Manager</CardTitle>
				<CardDescription>
					Create, edit, and manage your resumes here. While you can create
					multiple resumes, a single, comprehensive one is sufficient, AI will
					tailor it to the job you&apos;re applying for.
				</CardDescription>
			</CardHeader>
			<Separator />
			<CardContent className="p-4">
				{/* Manual Resumes Section */}
				<div className="grid grid-cols-1 gap-4">
					<h3 className="font-semibold text-base">Manual Resumes</h3>
					<Button
						onClick={() => router.push("/resume-builder")}
						className="h-9 max-w-fit"
					>
						<Plus className="h-4 w-4 mr-2" />
						Create a New Resume
					</Button>
					<ScrollArea className="h-[250px] pr-1">
						<div className="space-y-3">
							{manualResumes.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg">
									<p className="text-sm text-muted-foreground">
										No resumes found. Create your first resume!
									</p>
								</div>
							) : (
								manualResumes.map((resume) => (
									<ResumeCard
										key={resume.id}
										title={resume.resumeTitle}
										date={new Date(resume.updatedAt).toLocaleDateString()}
									>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 hover:bg-primary/5 text-pretty hover:text-primary"
											onClick={() =>
												handleDownload(resume.id, "manual_resume_id")
											}
											disabled={downloadingResumeId !== null}
										>
											{downloadingResumeId === resume.id ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Download className="h-4 w-4" />
											)}
										</Button>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 hover:bg-primary/5 text-pretty hover:text-primary"
											onClick={() => handleEdit(resume.id, 'manual')}
										>
											<FileEdit className="h-4 w-4" />
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													className="h-8 w-8 hover:bg-destructive/5"
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Resume</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to delete this resume? This
														action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDelete(resume.id, 'manual')}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</ResumeCard>
								))
							)}
						</div>
					</ScrollArea>
				</div>
				<Separator />
				{/* Generated Resumes Section */}
				<div className="grid grid-cols-1 mt-4 gap-4">
					<h3 className="font-semibold text-base">Generated Resumes</h3>
					<ScrollArea className="h-[250px] pr-1">
						<div className="space-y-3">
							{genResumes.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg">
									<p className="text-sm text-muted-foreground">
										No generated resumes yet.
									</p>
								</div>
							) : (
								genResumes.map((resume) => (
									<ResumeCard
										key={resume.id}
										title={resume.resumeTitle}
										date={new Date(resume.createdAt).toLocaleDateString()}
									>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 hover:bg-primary/5 text-pretty hover:text-primary"
											onClick={() =>
												handleDownload(resume.id, "generated_resume_id")
											}
											disabled={downloadingResumeId !== null}
										>
											{downloadingResumeId === resume.id ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Download className="h-4 w-4" />
											)}
										</Button>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 hover:bg-primary/5 text-pretty hover:text-primary"
											onClick={() => handleEdit(resume.id, 'generated')}
										>
											<FileEdit className="h-4 w-4" />
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													className="h-8 w-8 hover:bg-destructive/5"
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Resume</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to delete this resume? This
														action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDelete(resume.id, 'generated')}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</ResumeCard>
								))
							)}
						</div>
					</ScrollArea>
				</div>
			</CardContent>
		</Card>
	);
}
