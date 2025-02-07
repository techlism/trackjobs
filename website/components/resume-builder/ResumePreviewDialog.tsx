import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import type { ResumeData } from "@/lib/types";
import { generateFullHTMLClientSide } from "@/lib/resume-converter/resume-data-to-html-client";
import { ScrollArea } from "../ui/scroll-area";

interface ResumePreviewDialogProps {
	resumeId: string;
	type: "manual_resume_id" | "generated_resume_id";
}

export function ResumePreviewDialog({
	resumeId,
	type,
}: ResumePreviewDialogProps) {
	const [html, setHtml] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [resumeTitle, setResumeTitle] = useState<string>("");

	const fetchAndGenerateHTML = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/resume-html-preview?${type}=${resumeId}`,
				{ method: "GET" },
			);
			const { resumeContent }: { resumeContent: ResumeData } =
				await response.json();
			const generatedHTML = generateFullHTMLClientSide(resumeContent);
			setHtml(generatedHTML);
			console.log(resumeContent);
			setResumeTitle(resumeContent.resumeTitle);
		} catch (error) {
			console.error("Preview error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild aria-describedby="resume-preview">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8 hover:bg-primary/5 text-pretty hover:text-primary"
					onClick={fetchAndGenerateHTML}
				>
					<Eye className="h-4 w-4" />
                    <span className="sr-only">
                        Resume Preview
                    </span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[300px] md:max-w-2xl lg:max-w-3xl xl:max-w-3xl">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">
						{resumeTitle ? `${resumeTitle} Preview` : "Resume Preview"}
					</DialogTitle>
                    <DialogDescription className="text-justify">
                        Preview of your resume's content and layout. The downloaded PDF will maintain the same structure and content with possible minor adjustments in font style and spacing. In smaller devices, the preview may not be properly visible.
                    </DialogDescription>
				</DialogHeader>
				<div className="flex-1 h-full w-full">
					{loading ? (
						<div className="flex items-center justify-center h-full">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<ScrollArea className="h-[70vh] border-border border-2 rounded-md p-2">
							<div
								// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized and trusted
								dangerouslySetInnerHTML={{ __html: html || "" }}
								className="h-full w-full overflow-auto"
							/>
						</ScrollArea>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
