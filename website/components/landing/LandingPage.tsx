"use client";
import { motion } from "framer-motion";
import {
	Check,
	ChevronRight,
	FileText,
	Globe,
	Linkedin,
	Quote,
	Sparkles,
	Star,
} from "lucide-react";
import IllustrationRenderer from "../IllustrationRenderer";
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
import DummyKanbanHomePage from "./DummyKanbanHomePage";
import DummyResumeBuilder from "./DummyResumeBuilder";

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

const TESTIMONIALS = [
	{
		name: "Sarah Chen",
		role: "Software Engineer at Meta",
		image: "/placeholder.svg?height=100&width=100",
		quote:
			"TrackJobs' AI resume builder helped me land interviews at 5 FAANG companies. The tailored suggestions for each application were game-changing.",
	},
	{
		name: "Marcus Rodriguez",
		role: "Product Manager at Stripe",
		image: "/placeholder.svg?height=100&width=100",
		quote:
			"The startup tracking feature helped me identify and join a unicorn startup at the perfect time. Now I'm part of one of the fastest-growing teams in fintech.",
	},
	{
		name: "Emily Watson",
		role: "UX Designer at Airbnb",
		image: "/placeholder.svg?height=100&width=100",
		quote:
			"The Chrome extension makes job hunting so much more efficient. I can organize my applications without switching between tabs.",
	},
];

const DETAILED_FEATURES = [
	{
		illustrationPath: "/career.svg",
		illustrationAlt: "Kanban board visualization",
		title: "Visual Job Search Pipeline",
		description:
			"Transform your job search into a visual journey with our intuitive Kanban board. Drag-and-drop applications between customizable stages, from 'Applied' to 'Offer Received'.",
		size: "medium",
	},
	{
		illustrationPath: "/datacloud.svg",
		illustrationAlt: "Cross-device synchronization",
		title: "Seamless Multi-Device Experience",
		description:
			"Your job search follows you everywhere. Real-time sync across all devices ensures you never miss an update or opportunity, whether you're on desktop, tablet, or mobile.",
		size: "medium",
	},
	{
		illustrationPath: "/sync.svg",
		illustrationAlt: "Application tracking system",
		title: "Comprehensive Application Tracking",
		description:
			"Monitor every aspect of your applications with military-grade precision. Track status changes, interview schedules, and follow-ups all in one place.",
		size: "large",
	},
	{
		illustrationPath: "/stage.svg",
		illustrationAlt: "Custom pipeline stages",
		title: "Flexible Pipeline Management",
		description:
			"Create and customize your job search stages to match your unique strategy. From initial research to salary negotiation, stay organized at every step.",
		size: "medium",
	},
	{
		illustrationPath: "/ai.svg",
		illustrationAlt: "AI-powered insights",
		title: "AI-Powered Job Analysis",
		description:
			"Let our AI digest job descriptions and provide actionable insights. Understand key requirements, identify matching skills, and craft targeted applications with confidence.",
		size: "large",
	},
];

const FAQs = [
	{
		question: "How does the AI resume builder improve my chances?",
		answer:
			"Our AI analyzes job descriptions to identify key requirements and suggests optimal content, formatting, and keywords to help your resume pass ATS systems and catch recruiters' attention.",
	},
	{
		question: "How accurate is your startup funding data?",
		answer:
			"We aggregate real-time data from multiple verified sources including Crunchbase, SEC filings, and official press releases to ensure you get the most accurate and timely information.",
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
		<div className="flex flex-col">
			<section className="w-full min-h-[70vh] flex flex-col items-center justify-center mt-4 p-2 py-10 rounded-lg hero-bg dark:border dark:border-border relative">
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-sm font-semibold text-primary mb-4"
				>
					Your Job Search, Supercharged with AI
				</motion.div>

				<motion.h1 className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
					Turn Your Job Search into a Success Story
				</motion.h1>

				<motion.p className="text-xl text-muted-foreground max-w-2xl text-center mb-8">
					Join thousands of professionals using AI-powered tools to land their
					dream jobs faster
				</motion.p>

				<div className="flex lg:flex-row md:flex-row sm:flex-row flex-col gap-4">
					<Button size="lg" className="gap-2">
						Start Free Trial <ChevronRight className="w-4 h-4" />
					</Button>
					<Button variant="outline" size="lg">
						Watch Demo
					</Button>
				</div>

				<motion.div className="mt-12 lg:w-full md:w-[90%] max-w-3xl mx-auto">
					<DummyKanbanHomePage />
				</motion.div>
			</section>

			<section className="py-16 w-full">
				<h2 className="text-3xl font-bold text-center mb-4">
					Everything You Need to Succeed
				</h2>
				<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
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
									<div className="p-3 rounded-lg magicpattern w-full sm:w-fit">
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

			<section className="h-screen flex flex-row justify-between items-center border rounded-lg p-4">
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-6">
						Resume Builder ✨
					</h2>
					<Separator />
					<h3>Just fill in your details once and you are good to go.</h3>
				</div>
				<DummyResumeBuilder />
			</section>

			<section className="min-h-screen grid grid-cols-2 items-center border rounded-lg p-4">
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-6">
						Funding News
					</h2>
					<Separator />
					<h3>Just fill in your details once and you are good to go.</h3>
				</div>
				<DummyFundingTable />
			</section>

			<section className="py-16 bg-muted/30">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-4">
						Success Stories
					</h2>
					<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
						Join thousands of professionals who've transformed their job search
						with TrackJobs
					</p>

					<div className="grid md:grid-cols-3 gap-8">
						{TESTIMONIALS.map((testimonial, index) => (
							<Card key={index} className="p-6">
								<div className="flex items-start gap-4 mb-4">
									<Avatar className="w-12 h-12">
										<AvatarImage
											src={testimonial.image}
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
									<Quote className="w-8 h-8 text-primary/20" />
									<p className="text-muted-foreground">{testimonial.quote}</p>
									<div className="flex gap-1">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
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

			<section className="py-16 container mx-auto px-4">
				<h2 className="text-3xl font-bold text-center mb-4">
					Powerful Features
				</h2>
				<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
					Every tool you need to organize, track, and accelerate your job search
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{DETAILED_FEATURES.map((feature, index) => (
						<Card
							key={index}
							className={`p-8 hover:shadow-lg transition-all duration-300 ${
								feature.size === "large" ? "md:col-span-2" : ""
							}`}
						>
							<div className="flex flex-col md:flex-row gap-6 items-center">
								<IllustrationRenderer
									illustrationPath={feature.illustrationPath}
									illustrationAlt={feature.illustrationAlt}
									//   className="w-32 h-32"
								/>
								<div>
									<h3 className="text-2xl font-semibold mb-2">
										{feature.title}
									</h3>
									<p className="text-muted-foreground">{feature.description}</p>
								</div>
							</div>
						</Card>
					))}
				</div>
			</section>

			<section className="py-16 bg-muted/30">
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
								key={index}
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

			{/* <section className="py-24 bg-gradient-to-b from-background to-primary/5">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-4xl font-bold mb-6">Ready to Transform Your Job Search?</h2>
					<p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
						Join thousands of successful professionals who've already landed their dream jobs with TrackJobs
					</p>
					<div className="flex gap-4 justify-center">
						<Button size="lg" className="gap-2">
							Start Free Trial <ChevronRight className="w-4 h-4" />
						</Button>
						<Button variant="outline" size="lg">
							Schedule Demo
						</Button>
					</div>
				</div>
			</section> */}
		</div>
	);
}
