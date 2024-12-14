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
import { deleteResumeData } from "@/app/(pages)/resume-builder/action";
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
        resumeId: string;
        jobId: string;
        resumeTitle: string;
        createdAt: number;
    }[];
}

export default function ResumeManager({
    initialResumes,
    generatedResumes,
}: ResumeManagerProps) {
    const [resumes, setResumes] = useState(initialResumes);
    const [isDownloading, setIsDownloading] = useState(false);
    const router = useRouter();

    const handleEdit = (id: string) => {
        router.push(`/resume-builder?resume_id=${id}`);
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteResumeData(id);
            if (result.error) {
                throw new Error(result.error);
            }
            setResumes((prev) => prev.filter((resume) => resume.id !== id));
            toast.success("Resume deleted successfully");
        } catch (error) {
            toast.error("Failed to delete resume");
        }
    };

    const handleDownload = async (generatedResumeId: string) => {
        try {
            setIsDownloading(true);
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
            console.error("Download error:", error);
            toast.error("Failed to download resume");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className="col-span-3">
            <CardHeader className="px-2">
                <CardTitle className="text-lg">Your Resumes</CardTitle>
                <CardDescription>
                    Create, edit, and manage your resumes here. While you can
                    create multiple resumes, a single, comprehensive one is
                    sufficient—AI will tailor it to the job you&apos;re applying
                    for.
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="px-2">
                {/* Manual Resumes Section */}
                <div className="space-y-4">
                    <div className="flex flex-col">
                        <h3 className="font-medium text-sm mt-2">
                            Manual Resumes
                        </h3>
                        <Button
                            onClick={() => router.push("/resume-builder")}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New
                        </Button>
                    </div>
                    <ScrollArea className="h-[250px]">
                        <div className="space-y-2">
                            {resumes.length === 0
                                ? (
                                    <p className="text-center text-muted-foreground text-sm">
                                        No resumes found. Create your first
                                        resume!
                                    </p>
                                )
                                : (
                                    resumes.map((resume) => (
                                        <div
                                            key={resume.id}
                                            className="flex justify-between w-full p-2 rounded-lg border transition-colors"
                                        >
                                            <div className="grid grid-cols-1 gap-2">
                                                <p className="text-xs font-medium truncate">
                                                    {resume.resumeTitle}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(resume.updatedAt)
                                                        .toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hover:bg-transparent hover:border hover:border-primary hover:text-primary"
                                                    onClick={() =>
                                                        handleEdit(resume.id)}
                                                >
                                                    <FileEdit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className=" hover:bg-transparent hover:border hover:border-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Delete Resume
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you
                                                                want to delete
                                                                this resume?
                                                                This action
                                                                cannot be
                                                                undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        resume
                                                                            .id,
                                                                    )}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))
                                )}
                        </div>
                    </ScrollArea>
                </div>
                <Separator className="w-full px-0 mx-0" />
                {/* Generated Resumes Section */}
                <div className="space-y-2">
                    <h3 className="font-medium text-sm mt-3">
                        Generated Resumes
                    </h3>
                    <ScrollArea className="h-[260px] w-full">
                        <div className="space-y-2">
                            {generatedResumes.length === 0
                                ? (
                                    <p className="text-center text-muted-foreground py-4 text-sm">
                                        No generated resumes yet.
                                    </p>
                                )
                                : (
                                    generatedResumes.map((resume) => (
                                        <div
                                            key={resume.id}
                                            className="flex justify-between w-full p-2 rounded-lg border transition-colors"
                                        >
                                            <div className="grid grid-cols-1 gap-2">
                                                <p className="text-xs font-medium truncate">
                                                    {resume.resumeTitle}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(resume.createdAt)
                                                        .toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hover:bg-transparent hover:border hover:border-primary hover:text-primary"
                                                    onClick={() =>
                                                        handleDownload(
                                                            resume.id,
                                                        )}
                                                    disabled={isDownloading}
                                                >
                                                    {isDownloading
                                                        ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        )
                                                        : (
                                                            <Download className="h-4 w-4" />
                                                        )}
                                                </Button>
                                                <Button
                                                    className="hover:bg-transparent hover:border hover:border-destructive hover:text-destructive"
                                                    variant="outline"
                                                    size={"icon"}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
