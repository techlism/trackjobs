import Link from "next/link"
import { KanbanIcon, FolderSyncIcon, WatchIcon, ReplaceIcon } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <section className="flex flex-col md:flex-row items-center justify-between py-12">
        <div className="flex flex-col space-y-4 md:w-1/2">
          <h1 className="text-3xl lg:text-5xl md:text-4xl sm:text-4xl font-bold">
            Stay on Top of Your Job Search with TrackJobs
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Organize your job search with our powerful kanban-style board. Never lose track of your applications again.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="btn btn-primary">Try Demo</Link>
            <Link href="#" className="btn btn-secondary">Sign Up</Link>
          </div>
        </div>
        <div className="mt-8 md:mt-0 md:w-1/2">
          <img
            src="/kanban_demo_light.png"
            alt="TrackJobs Kanban Board"
            className="dark:hidden w-full max-w-[600px] rounded-md"
          />
          <img
            src="/kanban_demo_dark.png"
            alt="TrackJobs Kanban Board"
            className="hidden dark:block w-full max-w-[600px] rounded-md"
          />
        </div>
      </section>

      <section className="bg-secondary py-12 px-4 rounded-md">
        <h2 className="text-3xl font-bold mb-4">Features to Keep You Organized</h2>
        <p className="text-muted-foreground mb-8">
          TrackJobs offers a suite of tools to help you stay on top of your job search and manage your applications.
        </p>
        <ul className="grid grid-cols-1 items-center gap-4">
          {[
            { icon: KanbanIcon, title: "Kanban Board", description: "Visualize your job search with a customizable kanban board." },
            { icon: FolderSyncIcon, title: "Cross-Device Sync", description: "Access your job search data from any device. Your progress is always up-to-date." },
            { icon: WatchIcon, title: "Application Tracking", description: "Keep track of every job application you submit. Never lose sight of your progress." },
            { icon: ReplaceIcon, title: "Customizable Stages", description: "Tailor your job search process with custom stages. Stay organized your way." },
          ].map((feature, index) => (
            <li key={index} className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col md:flex-row items-center justify-between py-12">
        <div className="flex flex-col space-y-4 md:w-1/2">
          <h2 className="text-3xl font-bold sm:text-5xl">
            Extend TrackJobs with the Browser Extension
          </h2>
          <p className="text-muted-foreground md:text-xl">
            Our browser extension seamlessly integrates TrackJobs with your job search workflow. Never leave your browser to manage your applications.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="btn btn-primary">Download Extension</Link>
            <Link href="#" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
        <div className="mt-8 md:mt-0 md:w-1/2">          
        </div>
      </section>
    </div>
  )
}