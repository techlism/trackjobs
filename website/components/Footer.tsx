import Link from "next/link";
import DarkModeSwitch from "./DarkModeSwitch";

export default async function Footer() {
	return (
		<footer
			className="bg-accent text-accent-foreground w-full mx-auto mt-10"
			id="footer"
		>
			<div className="container mx-auto p-4 max-w-7xl flex align-middle items-center flex-wrap justify-center md:justify-between lg:justify-between xl:justify-between">
				<div className="flex flex-col space-y-4 opacity-85">
					<p className="text-left">© 2024 TrackJobs. All rights reserved.</p>
					<div>
						<p className="text-left">Made with ❤️ by <a href="https://github.com/techlism" target="_blank" rel="noopener noreferrer" className="hover:underline">Techlism</a></p>
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