"use client";
import Link from "next/link";
import {
	KanbanIcon,
	FolderSyncIcon,
	WatchIcon,
	ReplaceIcon,
	Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import VideoEmbed from "./VideoEmbed";
import IllustrationRenderer from "./IllustrationRenderer";
import { Separator } from "./ui/separator";

export default function LandingPage() {
	return (
		<div className="flex flex-col w-full">
			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex flex-col md:flex-row items-center justify-between py-8 min-h-[95dvh]"
			>
				<div className="flex flex-col space-y-6 md:w-1/2">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="text-4xl lg:text-6xl md:text-5xl sm:text-4xl font-bold leading-tight"
					>
						Stay on Top of Your <span className="text-primary">Job Search</span>{" "}
						with TrackJobs
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.5 }}
						className="text-muted-foreground text-xl"
					>
						Organize your job search with our powerful kanban-style board. Never
						lose track of your applications <span className="text-2xl font-medium text-destructive">again</span>.
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.5 }}
					>
						<Link
							href="/sign-up"
							className="border btn-primary p-4 rounded-md font-semibold hover:shadow-md hover:rounded-md transition-all duration-200"
						>
							Get Started for Free
						</Link>
					</motion.div>
				</div>
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.4, duration: 0.5 }}
					className="mt-12 md:mt-0 md:w-1/2"
				>
					<img
						src="/kanban_demo_light.png"
						alt="TrackJobs Kanban Board"
						className="dark:hidden w-full max-w-[600px] rounded-lg shadow-2xl"
					/>
					<img
						src="/kanban_demo_dark.png"
						alt="TrackJobs Kanban Board"
						className="hidden dark:block w-full max-w-[600px] rounded-lg shadow-2xl"
					/>
				</motion.div>
			</motion.section>

			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="py-8 px-6 rounded-lg border border-border/50 shadow-md bg-card"
			>
				<h2 className="text-3xl font-bold mb-2 text-center">
					Features to Keep You Organized
				</h2>
				<p className="text-muted-foreground mb-3 text-center max-w-2xl mx-auto">
          Here are some key features that TrackJobs offers to help you stay organized.
				</p>
				<ul className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
					{[
						{
							illustrationPath: "/career.svg",
							illustrationAlt: "career_illustration",
							title: "Kanban Board",
							description:
								"Visualize your job search with a customizable kanban board. Easily move job applications across different stages, track your progress, and stay organized throughout your job search journey.",
						},
						{
							illustrationPath: "/datacloud.svg",
							illustrationAlt: "cross device sync illustration",
							title: "Cross-Device Sync",
							description:
								"Access your job search data from any device, whether you're on your desktop, tablet, or smartphone. Your progress is always up-to-date, ensuring you can manage your applications seamlessly across all your devices.",
						},
						{
							illustrationPath: "/sync.svg",
							illustrationAlt: "application tracking illustration",
							title: "Application Tracking",
							description:
								"Keep track of every job application you submit with detailed tracking features. Monitor the status of each application, add notes for each application, and never lose sight of your progress in the competitive job market.",
						},
						{
							illustrationPath: "/stage.svg",
							illustrationAlt: "customizable stage illustration",
							title: "Customizable Stages",
							description:
								"Tailor your job search process with custom stages that fit your unique workflow. Create, edit, and organize stages to match your job search strategy, helping you stay organized and focused on your goals.",
						},
						{
							illustrationPath: "/ai.svg",
							illustrationAlt: "Artificial Intelligence Illustration",
							title: "Enhanced with AI",
							description:
								"Leverage the power of AI to enhance your job search. All jobs are processed with AI to provide you with a summary of the job description and key insights. This allows you to quickly understand what the company needs for the role and refer to it later in your job search.",
							fullWidth: true,
						},
					].map((feature, index) => (
						<motion.li
							key={feature.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.5 }}
							className={`flex items-center hover:scale-105 gap-6 bg-background p-6 rounded-xl hover:shadow-md border border-border/70 hover:border-primary  hover:shadow-primary transition-all ease-in-out duration-200 ${feature.fullWidth ? "col-span-1 md:col-span-2" : ""}`}
						>		
								<IllustrationRenderer
									illustrationPath={feature.illustrationPath}
									illustrationAlt={feature.illustrationAlt}
								/>
                <Separator orientation="vertical" />
                <div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
						</motion.li>
					))}
				</ul>
        <p className="font-medium mt-1 ml-1 text-muted-foreground">
          and many more...
        </p>
			</motion.section>

			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex flex-col md:flex-row items-center py-16 max-w-full"
			>
				<div className="flex flex-col space-y-6 md:w-1/2">
					<h2 className="text-3xl font-bold sm:text-5xl leading-tight">
						Extend TrackJobs with the{" "}
						<span className="text-primary">Browser Extension</span>
					</h2>
					<p className="text-muted-foreground text-xl">
						Our browser extension seamlessly integrates TrackJobs with your job
						search workflow. Never leave your browser to manage your
						applications.
					</p>
					<div>
						<Link
							href="https://chromewebstore.google.com/detail/trackjobs/nhljjijjdmllkimdkfmflfpmfpopnnco"
							target="_blank"
							className="border btn-primary p-4 rounded-md font-semibold hover:shadow-md hover:rounded-md transition-all duration-200"
						>
							Download Extension
						</Link>
					</div>
				</div>
				<VideoEmbed />
			</motion.section>
		</div>
	);
}