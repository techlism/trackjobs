import Link from "next/link";
import DarkModeSwitch from './DarkModeSwitch';
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/utils";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GithubIcon } from "lucide-react";

type FooterProps = {
	className?: HTMLAttributes<HTMLDivElement>["className"];
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("text-foreground/90 py-12 border-t px-4", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
			  <img src="/trackjobs_logo.svg" alt="trackjobs_logo" className="w-8 h-8 mr-2" />
              <span className="text-xl font-bold">TrackJobs</span>
            </Link>
            <p className="mb-4">
				TrackJobs is a job tracking platform that helps you keep track of your job applications, interviews, and offers.
            </p>
            <p className="mb-4">
              <a href="mailto:support@trackjobs.online" className="hover:underline">
                support@trackjobs.online
              </a>
            </p>
            <div className="flex space-x-4">
				<Link href="https://github.com/techlism/trackjobs" target="_blank" rel="noopener noreferrer" className="hover:underline">
					<GithubIcon/>
				</Link>
            </div>
          </div>
          {/* <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:underline">Pricing</Link></li>
              <li><Link href="#" className="hover:underline">URL Shortener</Link></li>
              <li><Link href="#" className="hover:underline">QR Code Generator</Link></li>
              <li><Link href="#" className="hover:underline">Bio-Links</Link></li>
            </ul>
          </div> */}
          {/* <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:underline">About Us</Link></li>
              <li><Link href="#" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:underline">Blog</Link></li>
              <li><Link href="#" className="hover:underline">Use Cases</Link></li>
            </ul>
          </div> */}
        </div>
        <div className="mt-12 flex justify-between flex-wrap gap-2 items-end">
			<div>
			<h3 className="text-xl font-semibold mb-4">
				Stay up do date on news, product, campaign & resources.
			</h3>
			<form className="flex gap-2 max-w-md">
				<Input
				type="email"
				placeholder="name@email.com"
				className="flex-grow"
				/>
				<Button type="submit">
				Subscribe
				</Button>
			</form>
			</div>
			<DarkModeSwitch/>
          
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 text-sm">
          <p>© Copyright TrackJobs. All rights reserved.</p>
          <div className="mt-2">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
			<p className="text-sm">Made with ❤️ by <a href="https://github.com/techlism" target="_blank" rel="noopener noreferrer" className="hover:underline">Techlism</a></p>
          </div>
        </div>
      </div>
    </footer>
  )
}