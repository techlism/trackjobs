"use client";

import { Check, ChevronDown, MousePointer2, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRelativePos(child: HTMLElement, parent: HTMLElement) {
	const childRect = child.getBoundingClientRect();
	const parentRect = parent.getBoundingClientRect();
	return {
		x: childRect.left - parentRect.left,
		y: childRect.top - parentRect.top,
		width: childRect.width,
		height: childRect.height,
	};
}

const DummyJobTracker: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const selectRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const appliedOptionRef = useRef<HTMLDivElement>(null);
	const trackButtonRef = useRef<HTMLButtonElement>(null);

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [status, setStatus] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);
	const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
	const [animationKey, setAnimationKey] = useState(0);
	const [isInViewport, setIsInViewport] = useState(false);

	useLayoutEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInViewport(entry.isIntersecting);
			},
			{ threshold: 0.5 },
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useLayoutEffect(() => {
		let isCurrentAnimationActive = true;

		const runSteps = async () => {
			if (!containerRef.current || !isInViewport) return;

			try {
				// Give the browser a moment to render the initial layout
				await delay(50);
				if (!isCurrentAnimationActive) return;

				// Step 1: Move the cursor over the select menu
				if (selectRef.current) {
					const { x, y, width, height } = getRelativePos(
						selectRef.current,
						containerRef.current,
					);
					setCursorPosition({ x: x + width / 2, y: y + height / 2 });
				}
				await delay(1000);
				if (!isCurrentAnimationActive) return;

				// Step 2: Click the select menu to open the dropdown
				setIsDropdownOpen(true);
				await delay(1000);
				if (!isCurrentAnimationActive) return;

				// Step 3: Move the cursor over the "Applied" option
				if (appliedOptionRef.current) {
					const { x, y, width, height } = getRelativePos(
						appliedOptionRef.current,
						containerRef.current,
					);
					setCursorPosition({ x: x + width / 2, y: y + height / 2 });
				}
				await delay(1000);
				if (!isCurrentAnimationActive) return;

				// Step 4: Click the "Applied" option
				setStatus("Applied");
				setIsDropdownOpen(false);
				await delay(1000);
				if (!isCurrentAnimationActive) return;

				// Step 5: Move the cursor over the "Track Job" button
				if (trackButtonRef.current) {
					const { x, y, width, height } = getRelativePos(
						trackButtonRef.current,
						containerRef.current,
					);
					setCursorPosition({ x: x + width / 2, y: y + height / 2 });
				}
				await delay(1000);
				if (!isCurrentAnimationActive) return;

				// Step 6: Click the "Track Job" button and display success
				setShowSuccess(true);
				await delay(1500);
				if (!isCurrentAnimationActive) return;

				// Reset state for next iteration
				setShowSuccess(false);
				setStatus("");
				setCursorPosition({ x: 0, y: 0 });
				await delay(1000);
				if (!isCurrentAnimationActive) return;

				// Trigger next animation cycle
				setAnimationKey((prev) => prev + 1);
			} catch (error) {
				console.error("Animation error:", error);
			}
		};

		if (isInViewport) {
			runSteps();
		}

		return () => {
			isCurrentAnimationActive = false;
		};
	}, [animationKey, isInViewport]); // Added animationKey to dependencies

	if (showSuccess) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="bg-card p-6 rounded-xl shadow-lg flex items-center justify-center gap-3 border border-border">
					<div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
						<Check className="w-6 h-6 text-green-500" />
					</div>
					<span className="text-lg font-medium text-green-500">
						Job Tracked Successfully!
					</span>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="w-full max-w-md mx-auto p-6 bg-background rounded-xl shadow-lg relative select-none border"
		>
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div className="flex items-center gap-2">
					<Image
						src="/trackjobs_logo.svg"
						height={32}
						width={32}
						alt="TrackJobs Logo"
					/>
				</div>
				<span className="text-xl font-semibold text-foreground">
					TrackJobs
				</span>
			</div>

			{/* Content */}
			<div className="space-y-6">
				<div className="text-center py-4 bg-muted rounded-lg text-muted-foreground">
					Hello, John!
				</div>

				<button
					type="button"
					className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
				>
					Refresh Login Status
				</button>

				{/* Status Select */}
				<div className="relative">
					<div
						ref={selectRef}
						className={`w-full p-3 rounded-lg flex justify-between items-center cursor-pointer
									${isDropdownOpen ? "border-2 border-primary" : "border border-input"}
									bg-background transition-colors`
									}
					>
						<span className="text-foreground">
							{status || "Select Application Status"}
						</span>
						<ChevronDown
							className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
								}`}
						/>
					</div>

					{/* Dropdown */}
					{isDropdownOpen && (
						<div
							ref={dropdownRef}
							className="absolute w-full mt-2 py-1 bg-background border border-input rounded-lg shadow-lg z-10"
						>
							{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
							<div
								ref={appliedOptionRef}
								className="px-3 py-2 hover:bg-accent cursor-pointer"
								onClick={() => {
									setStatus("Applied");
									setIsDropdownOpen(false);
								}}
							>
								Applied
							</div>
							<div className="px-3 py-2 hover:bg-accent cursor-pointer">
								Interviewing
							</div>
							<div className="px-3 py-2 hover:bg-accent cursor-pointer">
								Offered
							</div>
						</div>
					)}
				</div>

				{/* Track Job Button */}
				<button
					ref={trackButtonRef}
					type="button"
					className="w-full py-3 bg-primary text-primary-foreground rounded-lg transition-colors"
				>
					Track Job
				</button>

				{/* Animated cursor */}
				<MousePointer2
					className="w-5 h-5 text-yellow-500 absolute transition-all duration-500 ease-in-out"
					style={{
						position: "absolute",
						left: `${cursorPosition.x}px`,
						top: `${cursorPosition.y}px`,
						transform: "translate(-50%, -50%)",
						pointerEvents: "none",
						zIndex: 50,
					}}
				/>
			</div>
		</div>
	);
};

export default DummyJobTracker;