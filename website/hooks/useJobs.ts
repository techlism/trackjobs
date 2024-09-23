import { useState, useCallback } from 'react';
import type { Job, JobStatus } from '@/lib/types';
import { updateJob, deleteJob, addJob } from '@/app/(pages)/dashboard/action';

export const useJobs = (initialJobs: Job[]) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const moveJob = useCallback(async (jobId: string, newStatus: JobStatus) => {
    const result = await updateJob(jobId, { currentStatus: newStatus });
    const parsedResult = JSON.parse(result);
    if (!(parsedResult.error)) {
      setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? { ...job, currentStatus: newStatus } : job));
    }
    return parsedResult;
  }, []);

  const editJob = useCallback(async (updatedJob: Job) => {
    const jobToUpdate = {
      ...updatedJob,
      appliedOn: updatedJob.appliedOn
    };
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const result = await updateJob(updatedJob.id!, jobToUpdate);
    const parsedResult = JSON.parse(result);
    if (!('error' in parsedResult)) {
      setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    }
    return parsedResult;
  }, []);

  const removeJob = useCallback(async (jobId: string) => {
    const result = await deleteJob(jobId);
    const parsedResult = JSON.parse(result);
    if (!('error' in parsedResult)) {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    }
    return parsedResult;
  }, []);

  return { jobs, moveJob, editJob, removeJob };
};