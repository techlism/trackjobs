"use client";
import { motion } from "framer-motion";
import { Check, ChevronRight, Quote, Star } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import DummyFundingTable from "./DummyFundingTable";
import DummyJobTracker from "./DummyJobTracker";
import DummyKanbanHomePage from "./DummyKanbanHomePage";
import DummyResumeBuilder from "./DummyResumeBuilder";
import IllustrationRenderer from "./IllustrationRenderer";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import VideoEmbed from "./VideoEmbed";

const FEATURES = [
	{
		title: "AI Resume Builder",
		description:
			"AI-powered resume tailoring that matches job requirements and ATS keywords",
		illustration: (
			<IllustrationRenderer
				illustrationAlt="A hand holding Resume"
				illustrationPath="/ats_resume.svg"
			/>
		),
		highlights: [
			"ATS-Friendly Optimization",
			"Keyword Optimization",
			"Customizable",
		],
		size: "large",
	},
	{
		title: "Application Tracker",
		description:
			"Visual kanban board to track applications from submission to offer",
		illustration: (
			<IllustrationRenderer
				illustrationAlt="A skeleton web page"
				illustrationPath="/scrum_board.svg"
			/>
		),
		highlights: [
			"Comprehensive application stages",
			"View all of your applications at a glance",
			"Save every detail",
		],
		size: "large",
	},
	{
		title: "Startup Intel",
		description:
			"Track funding rounds and growth metrics to find promising opportunities",
		illustration: (
			<IllustrationRenderer
				illustrationAlt="A man flying with having a formal attire"
				illustrationPath="/startup.svg"
			/>
		),
		highlights: ["Funding insights", "Growth indicators", "Company insights"],
		size: "medium",
	},
	{
		title: "Quick Capture",
		description: "Save job listings from any website with our Chrome extension",
		illustration: (
			<IllustrationRenderer
				illustrationAlt="A skeleton web page"
				illustrationPath="/landing_page_job.svg"
			/>
		),
		highlights: ["One-click save", "Auto data extraction", "Cross-device sync"],
		size: "medium",
	},
];

type testimonial = {
	name: string;
	role: string;
	quote: string;
	avatarURL?: string;
}

const TESTIMONIALS: testimonial[] = [
	{
		name: "Rajkumar Verma",
		role: "Co-Founder and CEO of SHER DeepAI Research",
		quote: "TrackJob's Funding Dashboard is a game-changer for founders and investors. It offers weekly insights into the startup ecosystem, tracking funding rounds from pre-seed to later stages. It helps identify key investors and highlights which industries are attracting the most funds, making it easy to spot market trends."
	},
	{
		name: "Sourabh Sinha",
		role: "Senior Software Engineer at Velotio Technologies",
		quote: "The funding news Dashboard is quite nice and it offers a lot of news and trends at a glance. The resume builder is quite good too as it allows to have custom fields."
	},
	{
		name: "Kajal Kumari",
		role: "UI Designer at TopKlickz",
		quote:
			"The Chrome extension makes job hunting so much more efficient. I can organize my applications without switching between tabs.",
	},
];


const FAQs = [
	{
		question: "How does the AI resume builder improve my chances?",
		answer:
			"Our AI analyzes job descriptions to identify key requirements and suggests optimal content and keywords to help your resume pass ATS systems and catch recruiters' attention.",
	},
	{
		question: "How accurate is your startup funding data?",
		answer:
			"The funding data is sourced from the various websites such as Tracxn, Crunchbase, Inc42 etc. However, there might be some discrepancies here and there, please reach out, if you find one.",
	},
	{
		question: "Can I use the Chrome extension with any job board?",
		answer:
			"Yes! Our extension works seamlessly with LinkedIn, Indeed, Glassdoor, and virtually any job board or company careers page. Simply click the extension icon to save jobs instantly.",
	},
	{
		question: "How does cross-device sync work?",
		answer:
			"Your data is automatically synchronized in real-time across all your devices. Whether you save a job on mobile or update an application status on desktop, changes appear instantly everywhere.",
	},
];
function computeTotalRows(items: typeof FEATURES) {
	let rows = 0;
	let usedCols = 0;
	for (let i = 0; i < items.length; i++) {
		if (items[i].size === "large") {
			usedCols += 2;
		} else {
			usedCols += 1;
		}
		if (usedCols >= 2) {
			rows++;
			usedCols -= 2;
		}
	}
	// If there's still 1 col used, that's another partial row
	if (usedCols > 0) rows++;
	return rows;
}
export default function LandingPage() {
	const totalRows = computeTotalRows(FEATURES);

	let usedCols = 0;
	let currentRow = 0;
	return (
		<div className="grid grid-cols-1 gap-12">
			<section className="w-full flex flex-col items-center justify-center mt-10 p-2 py-10 rounded-lg magicpattern dark:border dark:border-border relative">
				{/* <motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-sm font-semibold text-primary mb-4"
				>
					Your Job Search, Supercharged with AI
				</motion.div> */}
		  <div className="absolute inset-0 backdrop-blur-sm bg-white/5 dark:bg-black/20 z-0" />

		  <div className="relative z-10 flex flex-col items-center justify-center w-full">

					
				<motion.h1 className="landing-page-font text-4xl md:text-5xl lg:text-7xl dark:text-[#f0f8ff] text-[#000032] text-center mb-6 mt-6 max-w-4xl">
					Turn Your Job Search into a Success Story
				</motion.h1>

				<motion.p className="text-xl text-primary/70 font-medium max-w-2xl text-center mb-8">
				Your Job Search, Supercharged with AI
				</motion.p>

				<div className="flex lg:flex-row md:flex-row sm:flex-row flex-col gap-4">
					<Button size="lg" className="gap-2  text-lg">
						Elevate Your Job Hunt <ChevronRight className="w-4 h-4" />
					</Button>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline" size="lg" className="text-lg">
								Watch Demo
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Watch Demo</DialogTitle>
							</DialogHeader>

							<VideoEmbed />

						</DialogContent>
					</Dialog>
				</div>

				<motion.div className="mt-10 lg:w-full md:w-[90%] max-w-3xl mx-auto">
					<DummyKanbanHomePage />
				</motion.div>
				</div>
			</section>

			<section className="w-full">
				<h2 className="text-3xl font-bold text-center mb-4">
					Everything You Need to Succeed
				</h2>
				<p className="text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
					Powerful tools and insights that transform your job search from
					chaotic to strategic
				</p>

				<div
					className="
						rounded-lg
						border border-border dark:border-border
						overflow-hidden
						grid grid-cols-1 md:grid-cols-2
						gap-0
          "
				>
					{FEATURES.map((feature, index) => {
						const itemRowIndex = currentRow;

						// isLarge => occupies 2 desktop columns
						const isLarge = feature.size === "large";

						// on mobile, we want a bottom border if it's NOT the last item
						const isLastMobile = index === FEATURES.length - 1;

						const isLastRowDesktop = itemRowIndex === totalRows - 1;

						const isLeftColumn = usedCols % 2 === 0;
						const showRightBorder = !isLarge && isLeftColumn;

						const mobileBottom = !isLastMobile ? "border-b" : "";

						const desktopBottom = !isLastRowDesktop
							? "md:border-b"
							: "md:border-b-0";

						const desktopRight = showRightBorder ? "md:border-r" : "";

						if (isLarge) {
							usedCols += 2;
						} else {
							usedCols += 1;
						}

						if (usedCols >= 2) {
							currentRow++;
							usedCols -= 2;
						}

						return (
							<div
								key={feature.title}
								className={[
									"p-4 transition-all duration-300 border-border rounded-none",
									isLarge ? "md:col-span-2" : "",
									mobileBottom,
									desktopBottom,
									desktopRight,
								].join(" ")}
							>
								<div className="flex items-center gap-6 flex-col lg:flex-row">
									<div className="p-3 rounded-lg magicpattern w-full sm:w-fit lg:w-fit md:w-fit lg:block sm:block md:block flex justify-center items-center">
										{feature.illustration}
									</div>
									<div className="flex-1">
										<h3 className="text-2xl font-semibold mb-2">
											{feature.title}
										</h3>
										<p className="text-muted-foreground mb-4">
											{feature.description}
										</p>
										<div className="flex flex-col gap-4">
											{feature.highlights.map((highlight) => (
												<div
													key={highlight}
													className="flex items-center gap-2"
												>
													<Check className="w-4 h-4 text-primary" />
													<span className="text-sm">{highlight}</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<section className="min-h-screen p-6 grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 items-center border rounded-lg gap-6">
				<div className="grid grid-cols-1 gap-6">
					<h2 className="text-3xl font-bold text-primary">
						AI Resume Builder ✨
					</h2>
					<Separator className="max-w-[50%]" />
					<p className="text-lg text-muted-foreground">
						Just fill in your details once and you are good to go. Going forward you can generate Resume that is tailored to the Job Description.
					</p>
					<Link
						href={'/resume-builder'}
						className="border p-4 px-6 hover:bg-primary/90 rounded-lg bg-primary text-primary-foreground font-medium w-fit"
					>
						Give it a Try
					</Link>
				</div>
				<DummyResumeBuilder />
			</section>

			<section className="min-h-screen p-6 grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 items-center border rounded-lg">
				<div className="grid grid-cols-1 gap-6">
					<h2 className="text-3xl font-bold text-primary">
						Stay Informed 📰
					</h2>
					<Separator className="max-w-[50%]" />
					<p className="text-lg text-muted-foreground">
						Track the latest funding news and startup opportunities. Get real-time updates about companies actively hiring and expanding their teams.
					</p>
					<Link
						href={'/funding-news'}
						className="border p-4 px-6 hover:bg-primary/90 rounded-lg bg-primary text-primary-foreground font-medium w-fit"
					>
						View Latest News
					</Link>
				</div>
				<DummyFundingTable />
			</section>

			<section className="min-h-screen p-6 grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 items-center border rounded-lg">
				<div className="grid grid-cols-1 gap-6">
					<h2 className="text-3xl font-bold text-primary">
						Smart Job Tracking 🎯
					</h2>
					<Separator className="max-w-[50%]" />
					<p className="text-lg text-muted-foreground">
						Effortlessly manage your job applications with our intuitive tracking system. Keep all your applications organized and never miss an opportunity.
					</p>
					<Link
						href={'/job-tracker'}
						className="border p-4 px-6 hover:bg-primary/90 rounded-lg bg-primary text-primary-foreground font-medium w-fit"
					>
						Start Tracking
					</Link>
				</div>
				<DummyJobTracker />
			</section>

			<section className="py-16 bg-muted/50 rounded-lg">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-4">
						Success Stories
					</h2>
					<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
						Join thousands of professionals who've transformed their job search
						with TrackJobs
					</p>

					<div className="grid md:grid-cols-3 gap-8 ">
						{TESTIMONIALS.map((testimonial, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<Card key={`${index}_testimonial`} className="p-6">
								<div className="flex items-start gap-4 mb-4">
									<Avatar className="w-12 h-12">
										<AvatarImage
											src={testimonial?.avatarURL}
											alt={testimonial.name}
										/>
										<AvatarFallback>
											{testimonial.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<h4 className="font-semibold">{testimonial.name}</h4>
										<p className="text-sm text-muted-foreground">
											{testimonial.role}
										</p>
									</div>
								</div>
								<div className="space-y-2">
									<Quote className="w-8 h-8 text-primary/30" />
									<p className="text-muted-foreground">{testimonial.quote}</p>
									<div className="flex gap-1">
										{[...Array(5)].map((_, i) => (
											<Star
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={`${i}th_star_of_${index}th_testimonial`}
												className="w-4 h-4 fill-primary text-primary"
											/>
										))}
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			<section className="py-16 bg-muted/50 rounded-lg">
				<div className="container mx-auto px-4 max-w-3xl">
					<h2 className="text-3xl font-bold text-center mb-4">
						Frequently Asked Questions
					</h2>
					<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
						Everything you need to know about TrackJobs
					</p>

					<Accordion type="single" collapsible className="space-y-4">
						{FAQs.map((faq, index) => (
							<AccordionItem
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={`${index}th_faq_landing_page`}
								value={`faq-${index}`}
								className="border rounded-lg bg-card"
							>
								<AccordionTrigger className="px-6 py-4 hover:no-underline">
									<span className="text-left font-semibold">
										{faq.question}
									</span>
								</AccordionTrigger>
								<AccordionContent className="px-6 pb-4 text-muted-foreground">
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>
		</div>
	);
}
