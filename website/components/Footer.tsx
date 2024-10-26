import Link from "next/link";
import DarkModeSwitch from "./DarkModeSwitch";
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/utils";

type FooterProps = {
	className?: HTMLAttributes<HTMLDivElement>["className"];
}

export default async function Footer({ className }: FooterProps) {
	return (
		<footer
			className={cn("bg-accent text-accent-foreground w-full mx-auto", className)}
			id="footer"
		>
			<div className="container mx-auto p-4 max-w-7xl flex align-middle items-center flex-wrap justify-center md:justify-between lg:justify-between xl:justify-between">
				<div className="flex flex-col space-y-4 opacity-85">
					<p className="text-left">© 2024 TrackJobs. All rights reserved.</p>
					<div>
						<p className="text-left text-sm">Made with ❤️ by <a href="https://github.com/techlism" target="_blank" rel="noopener noreferrer" className="hover:underline">Techlism</a></p>
						<Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
					</div>
				</div>
				<div className="mt-5 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0">
					<DarkModeSwitch />
				</div>
			</div>
		</footer>
	);
}