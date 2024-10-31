import React from 'react';
import { Separator } from '@/components/ui/separator';

type JobStatus = 'Saved' | 'Applied' | 'Assignment' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn' | 'Other';

interface Job {
  id: string;
  role: string;
  companyName: string;
}

type JobsData = Record<JobStatus, Job[]>;

const jobs: JobsData = {
    Saved: [
      { id: '1', role: 'Software Engineer Intern', companyName: 'Branch International' },
      { id: '2', role: 'Summer Intern', companyName: 'Kevell Corp' },
      { id: '3', role: 'Frontend Developer', companyName: 'TechCorp' }
    ],
    Applied: [
      { id: '5', role: 'Fullstack Developer', companyName: 'Infraveo Technologies' },
      { id: '6', role: 'Junior Backend Developer', companyName: 'Kreativstorm' },
      { id: '7', role: 'Software Developer', companyName: 'CodeCraft' }
    ],
    "Assignment": [
      { id: '8', role: 'Angular Developer', companyName: 'Truelancer.com' },
      { id: '9', role: 'React Developer', companyName: 'WebForge' },
      { id: '10', role: 'Full Stack Developer', companyName: 'StackWorks' }
    ],
    Interview: [
      { id: '11', role: 'Frontend Developer', companyName: 'micro1' },
      { id: '12', role: 'Software Engineer', companyName: 'TechGiant' },
      { id: '13', role: 'Backend Developer', companyName: 'ServerPro' }
    ],
    Offer: [
      { id: '14', role: 'Full Stack Engineer', companyName: 'Soul AI' },
      { id: '15', role: 'Senior Developer', companyName: 'LeadTech' },
      { id: '16', role: 'Software Architect', companyName: 'ArchSolutions' }
    ],
    Rejected: [
      { id: '17', role: 'Software Engineer', companyName: 'BrowserStack' },
      { id: '18', role: 'DevOps Engineer', companyName: 'CloudOps' },
      { id: '19', role: 'System Analyst', companyName: 'SysCore' }
    ],
    Withdrawn: [
      { id: '20', role: 'Full Stack Developer', companyName: 'Vijeta Placements' },
      { id: '21', role: 'Mobile Developer', companyName: 'AppWorks' },
      { id: '22', role: 'Cloud Engineer', companyName: 'CloudTech' }
    ],
    Other: [
      { id: '23', role: 'Teaching Assistant', companyName: 'BeaconFire Inc.' },
      { id: '24', role: 'Technical Writer', companyName: 'DocuTech' },
      { id: '25', role: 'QA Engineer', companyName: 'QualityFirst' }
    ]
  };
  
  const colorBasedOnStatus = (status: string): { bg: string; text: string; separator: string; jobBg: string } => {
    const colors: Record<string, { bg: string; text: string; separator: string; jobBg: string }> = {
      Saved: { 
        bg: 'bg-teal-100/90 dark:bg-teal-900/90', 
        text: 'text-teal-900 dark:text-teal-100', 
        separator: 'bg-teal-300 dark:bg-teal-600',
        jobBg: 'bg-teal-50/90 dark:bg-teal-800/90'
      },
      Applied: { 
        bg: 'bg-blue-100/90 dark:bg-blue-900/90', 
        text: 'text-blue-900 dark:text-blue-100', 
        separator: 'bg-blue-300 dark:bg-blue-600',
        jobBg: 'bg-blue-50/90 dark:bg-blue-800/90'
      },
      Assignment: { 
        bg: 'bg-purple-100/90 dark:bg-purple-900/90', 
        text: 'text-purple-900 dark:text-purple-100', 
        separator: 'bg-purple-300 dark:bg-purple-600',
        jobBg: 'bg-purple-50/90 dark:bg-purple-800/90'
      },
      Interview: { 
        bg: 'bg-green-100/90 dark:bg-green-900/90', 
        text: 'text-green-900 dark:text-green-100', 
        separator: 'bg-green-300 dark:bg-green-600',
        jobBg: 'bg-green-50/90 dark:bg-green-800/90'
      },
      Offer: { 
        bg: 'bg-lime-100/90 dark:bg-lime-900/90', 
        text: 'text-lime-900 dark:text-lime-100', 
        separator: 'bg-lime-300 dark:bg-lime-600',
        jobBg: 'bg-lime-50/90 dark:bg-lime-800/90'
      },
      Rejected: { 
        bg: 'bg-red-100/90 dark:bg-red-900/90', 
        text: 'text-red-900 dark:text-red-100', 
        separator: 'bg-red-300 dark:bg-red-600',
        jobBg: 'bg-red-50/90 dark:bg-red-800/90'
      },
      Withdrawn: { 
        bg: 'bg-orange-100/90 dark:bg-orange-900/90', 
        text: 'text-orange-900 dark:text-orange-100', 
        separator: 'bg-orange-300 dark:bg-orange-600',
        jobBg: 'bg-orange-50/90 dark:bg-orange-800/90'
      },
      Other: { 
        bg: 'bg-sky-100/90 dark:bg-sky-900/90', 
        text: 'text-sky-900 dark:text-sky-100', 
        separator: 'bg-sky-300 dark:bg-sky-600',
        jobBg: 'bg-sky-50/90 dark:bg-sky-800/90'
      }
    };
    return colors[status];
};

const KanbanColumn = ({ status, jobs }: { status: JobStatus; jobs: Job[] }) => {
  const colors = colorBasedOnStatus(status);
  return (
    <div className={`rounded-lg ${colors.bg} p-2`}>
      <div className="flex items-center justify-between">
        <h3 className={`font-bold ${colors.text} text-xs md:text-sm`}>{status}</h3>
        <span className={`font-medium ${colors.text} text-xs md:text-sm`}>{jobs.length}</span>
      </div>
      <Separator className={`${colors.separator} my-1`} />
      <div className="space-y-1">
        {jobs.map((job) => (
            <div key={job.id} className={`${colors.jobBg} rounded p-1.5`}>
            <div className={`${colors.text} font-medium text-[0.65rem] md:text-xs line-clamp-1`}>
              {job.role}
            </div>
            <div className={`${colors.text} opacity-75 text-[0.6rem] md:text-[0.65rem] line-clamp-1`}>
              {job.companyName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DummyKanbanHomePage = () => {
  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-1.5 bg-card p-2 border rounded-lg shadow-md hover:shadow-md hover:shadow-primary">
        {Object.entries(jobs).map(([status, statusJobs]) => (
          <KanbanColumn key={status} status={status as JobStatus} jobs={statusJobs} />
        ))}
      </div>
    </div>
  );
};

export default DummyKanbanHomePage;