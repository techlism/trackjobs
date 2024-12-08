// components/job-tracker/ResumeContext.tsx
import { createContext, useContext } from 'react';

interface ResumeContextType {
    resumes: {
        id: string;
        resumeTitle: string;
        createdAt: number;
        updatedAt: number;
    }[];
    generatedResumes: {
        id: string;
        resumeId: string;
        createdAt: number;
        resumeTitle: string;
        jobId: string;
    }[];
}

export const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function useResumes() {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResumes must be used within a ResumeProvider');
    }
    return context;
}