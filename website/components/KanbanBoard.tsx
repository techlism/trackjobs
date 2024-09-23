"use client";

import type React from 'react';
import { useMemo, useState } from 'react';
import type { Job, JobStatus } from '@/lib/types';
import { JobStatusValues } from '@/lib/types';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { KanbanColumn } from './KanbanColumn';
import { useJobs } from '@/hooks/useJobs';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusIcon } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tab } from './Tab';
import { SingleColumnView } from './SingleColumnView';
import { useRouter } from 'next/navigation';

export const KanbanBoard: React.FC<{ initialJobs: Job[] }> = ({ initialJobs }) => {
  const { jobs, moveJob, editJob, removeJob } = useJobs(initialJobs);
  const { toast } = useToast();
  const router = useRouter();
  const handleAction = async (action: () => Promise<any>, successMessage: string, errorMessage: string) => {
    try {
      const result = await action();
      const parsedResult = JSON.parse(result);
      if (typeof parsedResult === 'object' && 'error' in parsedResult){
        toast({ title: "Error", description: parsedResult.error, variant: "destructive" });
        return null;
      }
      toast({ title: "Success", description: successMessage });
      return parsedResult;
    } catch (error) {
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return null;
    }
  };

  const handleMoveJob = (jobId: string, newStatus: JobStatus) => 
    handleAction(
      () => moveJob(jobId, newStatus),
      "Job status has been updated successfully.",
      "Failed to update job status."
    );

  const handleEditJob = (job: Job) => 
    handleAction(
        async () => { return router.push(`/dashboard/edit-job/${job.id}`); },
        "Job details have been updated successfully.",
        "Failed to update job details."
    );

  const handleDeleteJob = (jobId: string) => 
    handleAction(
      () => removeJob(jobId),
      "Job has been deleted successfully.",
      "Failed to delete job."
    );

  const memoizedColumns = useMemo(() => 
    JobStatusValues.map((status : JobStatus) => (
      <KanbanColumn
        key={status}
        status={status}
        jobs={jobs.filter(job => job.currentStatus === status)}
        onMoveJob={handleMoveJob}
        onEditJob={handleEditJob}
        onDeleteJob={handleDeleteJob}
      />
    )),
  [jobs, handleMoveJob, handleEditJob, handleDeleteJob]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Job Tracker</h2>
      </div>
      <Tab tabs={['Focused', 'At a Glance']}>        
        <SingleColumnView
          jobs={jobs}
          onMoveJob={handleMoveJob}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJob}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-center">
          {memoizedColumns}
        </div>
      </Tab>
    </div>
  );
};