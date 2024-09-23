import React from 'react';
import type { Job, JobStatus as JobStatusType } from '@/lib/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { JobStatusValues } from '@/lib/types';
import { IndividualColumn } from './IndividualColumn';

type SingleColumnViewProps = {
  jobs: Job[];
  onMoveJob: (jobId: string, newStatus: JobStatusType) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
};

export const SingleColumnView: React.FC<SingleColumnViewProps> = ({ jobs, onMoveJob, onEditJob, onDeleteJob }) => {
  const [selectedStatus, setSelectedStatus] = React.useState<JobStatusType>('Saved');

  return (
    <div className="p-4">
      <Select onValueChange={(value) => setSelectedStatus(value as JobStatusType)} defaultValue="Saved">
        <SelectTrigger className="w-full focus:ring-0 font-medium">
          <SelectValue placeholder="Select a status"/>
        </SelectTrigger>
        <SelectContent className='font-medium'>
          {JobStatusValues.map(status => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-4">
        <IndividualColumn
          status={selectedStatus}
          jobs={jobs.filter(job => job.currentStatus === selectedStatus)}
          onMoveJob={onMoveJob}
          onEditJob={onEditJob}
          onDeleteJob={onDeleteJob}
        />
      </div>
    </div>
  );
};