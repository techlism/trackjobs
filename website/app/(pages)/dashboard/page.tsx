import { validateRequest } from "@/lib/lucia";
import SignOutButton from '@/components/SignOut';
import { KanbanBoard } from '@/components/KanbanBoard';
import { fetchAllJobs } from './action';
import type { Job } from '@/lib/types'; // Add this import

export default async function Dashboard() {
  const { user } = await validateRequest();
  if (!user) {
    return (
      <div className="grid grid-cols-1 items-center p-4 border rounded-md gap-4 mx-auto max-w-96 min-h-[80dvh]">
        <h1>Please sign in to access the dashboard</h1> 
        <a href="/sign-in" className="p-4 border rounded-md">
          Sign-in
        </a>
      </div>
    );
  }
  const result = await fetchAllJobs();
  let initialJobs = JSON.parse(result);
  if(initialJobs.error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Job Application Dashboard</h1>
        <p>{initialJobs.error}</p>
      </div>
    );
  }
  initialJobs = initialJobs as Job[];

  return ( 
    <main className="p-4 mx-auto max-w-7xl min-h-[60dvh] flex justify-center items-center">
      <KanbanBoard initialJobs={initialJobs} />
    </main>
  );
}