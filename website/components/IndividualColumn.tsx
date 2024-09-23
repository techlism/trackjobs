"use client";
import React from "react";
import type { Job, JobStatus as JobStatusType } from "@/lib/types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { JobStatusValues } from "@/lib/types";
import Link from "next/link";
import { Expand } from "lucide-react";
import { Separator } from "./ui/separator";

type IndividualColumnProps = {
  status: JobStatusType;
  jobs: Job[];
  onMoveJob: (jobId: string, newStatus: JobStatusType) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
};

const colorBasedOnStatus = (status: JobStatusType, type: 'background' | 'text' | 'border' | 'hover' | 'separator' | 'card' | 'scrollBar' = 'background') => {
    const colors: Record<JobStatusType, Record<'background' | 'text' | 'border' | 'hover' | 'separator' | 'card' | 'scrollBar', string>> = {
        Saved: { background: 'bg-teal-100 dark:bg-teal-800', text: 'text-teal-800 dark:text-teal-100', border: 'border-teal-300 dark:border-teal-600', hover: 'hover:bg-teal-200 dark:hover:bg-teal-700', separator: 'bg-teal-400 dark:bg-teal-500', card: 'bg-teal-50 dark:bg-teal-900', scrollBar: 'bg-teal-300 dark:bg-teal-400' },
        Applied: { background: 'bg-blue-100 dark:bg-blue-800', text: 'text-blue-800 dark:text-blue-100', border: 'border-blue-300 dark:border-blue-600', hover: 'hover:bg-blue-200 dark:hover:bg-blue-700', separator: 'bg-blue-400 dark:bg-blue-500', card: 'bg-blue-50 dark:bg-blue-900', scrollBar: 'bg-blue-300 dark:bg-blue-400' },
        "OA/Assignment" : { background : 'bg-purple-100 dark:bg-purple-800', text: 'text-purple-800 dark:text-purple-100', border: 'border-purple-300 dark:border-purple-600', hover: 'hover:bg-purple-200 dark:hover:bg-purple-700', separator: 'bg-purple-400 dark:bg-purple-500', card: 'bg-purple-50 dark:bg-purple-900', scrollBar: 'bg-purple-300 dark:bg-purple-400' },
        Interview: { background: 'bg-green-100 dark:bg-green-800', text: 'text-green-800 dark:text-green-100', border: 'border-green-300 dark:border-green-600', hover: 'hover:bg-green-200 dark:hover:bg-green-700', separator: 'bg-green-400 dark:bg-green-500', card: 'bg-green-50 dark:bg-green-900', scrollBar: 'bg-green-300 dark:bg-green-400' },
        Offer: { background: 'bg-lime-100 dark:bg-lime-800', text: 'text-lime-800 dark:text-lime-100', border: 'border-lime-300 dark:border-lime-600', hover: 'hover:bg-lime-200 dark:hover:bg-lime-700', separator: 'bg-lime-400 dark:bg-lime-500', card: 'bg-lime-50 dark:bg-lime-900', scrollBar: 'bg-lime-300 dark:bg-lime-400' },
        Rejected: { background: 'bg-red-100 dark:bg-red-800', text: 'text-red-800 dark:text-red-100', border: 'border-red-300 dark:border-red-600', hover: 'hover:bg-red-200 dark:hover:bg-red-700', separator: 'bg-red-400 dark:bg-red-500', card: 'bg-red-50 dark:bg-red-900', scrollBar: 'bg-red-300 dark:bg-red-300' },
        Withdrawn: { background: 'bg-orange-100 dark:bg-orange-800', text: 'text-orange-800 dark:text-orange-100', border: 'border-orange-300 dark:border-orange-600', hover: 'hover:bg-orange-200 dark:hover:bg-orange-700', separator: 'bg-orange-400 dark:bg-orange-500', card: 'bg-orange-50 dark:bg-orange-900', scrollBar: 'bg-orange-300 dark:bg-orange-400' },
        Other: { background: 'bg-sky-100 dark:bg-sky-800', text: 'text-sky-800 dark:text-sky-100', border: 'border-sky-300 dark:border-sky-600', hover: 'hover:bg-sky-200 dark:hover:bg-sky-700', separator: 'bg-sky-400 dark:bg-sky-500', card: 'bg-sky-50 dark:bg-sky-900', scrollBar: 'bg-sky-300 dark:bg-sky-400' },
    };

    return colors[status][type];
}
export const IndividualColumn: React.FC<IndividualColumnProps> = ({
  status,
  jobs,
  onMoveJob,
  onEditJob,
  onDeleteJob,
}) => {
  return (
    <div className={`rounded-lg shadow-md ${colorBasedOnStatus(status, 'background')} min-w-[280px] mx-auto sm:min-w-[350px] md:min-w-[450px] lg:min-w-[550px] xl:min-w-[750px]`}>
      <div className="flex items-center justify-between p-2.5">
        <h3 className={`text-xl font-bold ${colorBasedOnStatus(status, 'text')}`}>{status}</h3>
        <div className={`text-lg font-medium ${colorBasedOnStatus(status, 'text')}`}>{jobs.length}</div>
      </div>
      <Separator className={`${colorBasedOnStatus(status, 'separator')} my-2 `} />
      <ScrollArea className="h-[55dvh] px-2">
        <ScrollBar className={`${colorBasedOnStatus(status, 'scrollBar')}`} />
        {jobs.map((job) => (
          <div key={job.id} className={`mb-2 mx-2 max-w-[99.8%] hover:scale-[1.02] transition-all duration-150 hover:rounded-md hover:shadow-sm`}>
            <div className={`flex justify-between items-center rounded-md p-2 ${colorBasedOnStatus(status, 'card')} `}>
              <div className="font-medium max-w-[95%] grid grid-cols-1 text-wrap">
                <h4 className={`${colorBasedOnStatus(status, 'text')} text-base`}>{job.role}</h4>
                <p className={`${colorBasedOnStatus(status, 'text')} text-sm opacity-65`}>{job.companyName}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className={`${colorBasedOnStatus(status, 'hover')}`}>
                    <Expand className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="mt-2">
                    <DialogTitle className="text-xl">{job.role}</DialogTitle>
                    <DialogDescription className="leading-7 [&:not(:first-child)]:mt-6 text-sm">{job.companyName} | {new Date(job.appliedOn).toLocaleDateString()} {new Date(job.appliedOn).toLocaleTimeString()}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 grid-cols-1">
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Job Description</p>
                      <ScrollArea className="h-[180px]">
                        <ScrollBar className="bg-border" />
                        <p className="font-medium text-justify text-sm max-w-[97%]">{job.jobDescriptionSummary}</p>
                      </ScrollArea>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Link</p>
                      <Link href={job.link} target="_blank" className="truncate block max-w-full hover:underline font-medium text-sm hover:text-blue-500">{job.link}</Link>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Status</p>
                      <Select onValueChange={(newStatus) => onMoveJob(job.id || "", newStatus as JobStatusType)}>
                        <SelectTrigger id="job-status" className="focus:ring-0">
                          <SelectValue placeholder={job.currentStatus} className="font-medium"/>
                        </SelectTrigger>
                        <SelectContent className="font-medium">
                          {JobStatusValues.filter((newStatus) => status !== newStatus).map((newStatus) => (
                            <SelectItem key={newStatus} value={newStatus}>
                              {newStatus}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {job.notes && job.notes.length > 0 &&  (
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Notes</p>
                      <ScrollArea className="h-[100px]">
                      <ScrollBar className="bg-border" />
                          <p className="font-medium text-justify text-sm max-w-[97%]">{job.notes}</p>
                      </ScrollArea>
                    </div>
                    )}
                  </div>
                  <DialogFooter>            
                    <Button variant="destructive" onClick={() => onDeleteJob(job.id || "")}>Delete</Button>
                    <Button variant="outline" onClick={() => onEditJob(job)}>Edit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};