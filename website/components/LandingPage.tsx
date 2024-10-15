'use client'
import Link from "next/link"
import { KanbanIcon, FolderSyncIcon, WatchIcon, ReplaceIcon, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import VideoEmbed from "./VideoEmbed"

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between py-12 min-h-[95dvh]"
      >
        <div className="flex flex-col space-y-6 md:w-1/2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl lg:text-6xl md:text-5xl sm:text-4xl font-bold leading-tight"
          >
            Stay on Top of Your <span className="text-primary">Job Search</span> with TrackJobs
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground text-xl"
          >
            Organize your job search with our powerful kanban-style board. Never lose track of your applications again.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link href="/sign-up" className="border btn-primary p-4 rounded-md font-semibold hover:shadow-md hover:rounded-md transition-all duration-200">
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
        className="bg-secondary py-16 px-6 rounded-lg shadow-inner"
      >
        <h2 className="text-3xl font-bold mb-4 text-center">Features to Keep You Organized</h2>
        <p className="text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
          TrackJobs offers a suite of tools to help you stay on top of your job search and manage your applications.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: KanbanIcon, title: "Kanban Board", description: "Visualize your job search with a customizable kanban board." },
            { icon: FolderSyncIcon, title: "Cross-Device Sync", description: "Access your job search data from any device. Your progress is always up-to-date." },
            { icon: WatchIcon, title: "Application Tracking", description: "Keep track of every job application you submit. Never lose sight of your progress." },
            { icon: ReplaceIcon, title: "Customizable Stages", description: "Tailor your job search process with custom stages. Stay organized your way." },
            { icon: Sparkles, title: "Enhanced with AI", description: "All jobs are processed with AI to give you a summary of the job description and what the company needs for the role. So that can refer to it later in your job search.", fullWidth: true }
          ].map((feature, index) => (
            <motion.li 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`flex flex-col bg-background p-6 rounded-lg shadow-lg ${feature.fullWidth ? 'col-span-1 md:col-span-2' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center py-16 max-w-full"
      >
        <div className="flex flex-col space-y-6 md:w-1/2">
          <h2 className="text-3xl font-bold sm:text-5xl leading-tight">
            Extend TrackJobs with the <span className="text-primary">Browser Extension</span>
          </h2>
          <p className="text-muted-foreground text-xl">
            Our browser extension seamlessly integrates TrackJobs with your job search workflow. Never leave your browser to manage your applications.
          </p>
          <div>
          <Link href="https://chromewebstore.google.com/detail/trackjobs/nhljjijjdmllkimdkfmflfpmfpopnnco" target="_blank" className="border btn-primary p-4 rounded-md font-semibold hover:shadow-md hover:rounded-md transition-all duration-200">              
            Download Extension
          </Link>
          </div>
        </div>
        <VideoEmbed/>
      </motion.section>
    </div>
  )
}