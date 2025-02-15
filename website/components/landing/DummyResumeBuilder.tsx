"use client";
import { ChevronDown, Plus } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface Field {
	label: string;
	value: string;
}

interface Section {
	id: number;
	title: string;
	fields: Field[];
}

const sections: Section[] = [
	{
		id: 1,
		title: "Personal Details",
		fields: [
			{ label: "Full Name", value: "John Doe" },
			{ label: "Email", value: "john.doe@example.com" },
			{ label: "Location", value: "San Francisco, CA" },
			{ label: "LinkedIn", value: "linkedin.com/in/johndoe" },
		],
	},
	{
		id: 2,
		title: "Education",
		fields: [
			{ label: "Institution", value: "Harvard University" },
			{ label: "Degree", value: "Bachelor of Science" },
			{ label: "Duration", value: "2019 - 2023" },
		],
	},
	{
		id: 3,
		title: "Work Experience",
		fields: [
			{ label: "Company", value: "Google" },
			{ label: "Position", value: "Software Engineer" },
			{ label: "Duration", value: "2023 - Present" },
		],
	},
	{
		id: 4,
		title: "Projects",
		fields: [
			{ label: "Project Name", value: "Portfolio Website" },
			{ label: "Tech Stack", value: "React, Node.js, MongoDB" },
			{ label: "Link", value: "github.com/portfolio" },
		],
	},
];

const useIntersectionObserver = (ref: React.RefObject<HTMLElement>) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => setIsVisible(entry.isIntersecting),
			{ threshold: 0.1 },
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, [ref]);

	return isVisible;
};

export default function DummyResumeBuilder() {
	const [activeSection, setActiveSection] = useState(1);
	const containerRef = useRef<HTMLDivElement>(null);
	const isVisible = useIntersectionObserver(containerRef);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (isVisible) {
			timer = setInterval(() => {
				setActiveSection((prev) => (prev === sections.length ? 1 : prev + 1));
			}, 2000);
		}
		return () => clearInterval(timer);
	}, [isVisible]);

	return (
		<div
			ref={containerRef}
			className="w-full max-w-2xl mx-auto space-y-4 p-6 rounded-lg"
		>
			{sections.map(({ id, title, fields }) => (
				<div
					key={id}
					className={`border rounded-lg transition-all duration-500 ease-in-out overflow-hidden
          ${activeSection === id ? "border-primary bg-card" : "border-border bg-transparent"}`}
				>
					<div className="p-4 flex justify-between items-center">
						<h3 className="text-lg font-semibold text-foreground">{title}</h3>
						<ChevronDown
							className={`w-5 h-5 text-muted-foreground transition-transform duration-300
              ${activeSection === id ? "rotate-180" : "rotate-0"}`}
						/>
					</div>

					<div
						className={`transition-all duration-500 ease-in-out
          ${activeSection === id ? "max-h-96 p-4" : "max-h-0"}`}
					>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								{fields.map((field, index) => (
									<div key={field.label} className="space-y-2">
										<span className="text-sm text-muted-foreground">
											{field.label}
										</span>
										<div className="p-2 rounded bg-muted text-primary text-sm font-medium">
											{field.value}
										</div>
									</div>
								))}
							</div>
							{id !== 1 && (
								<button
									type="button"
									disabled
									className="flex items-center gap-2 px-4 py-2 mt-4 text-sm text-muted-foreground hover:text-primary"
								>
									<Plus className="w-4 h-4" />
									Add {title}
								</button>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
