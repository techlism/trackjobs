"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { JobSchema, Job } from "@/lib/types";
import { addJob, updateJob } from "@/app/(pages)/dashboard/action";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import DateAndTimePicker from "@/components/ui/DatePicker";

type EditJobFormProps = {
  jobId?: string;
  initialData?: Partial<Job>;
};

export function EditJobForm({ jobId, initialData }: EditJobFormProps) {
  const [message, setMessage] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof JobSchema>>({
    resolver: zodResolver(JobSchema),
    defaultValues: {
      ...initialData,
      appliedOn: initialData?.appliedOn || Date.now(),
    },
  });

  async function onSubmit(values: z.infer<typeof JobSchema>) {
    let res;
    if (jobId === "add-new") {
      res = await addJob(values);
    } else {
      res = await updateJob(jobId!, values);
    }

    const result = JSON.parse(res);
    if (result.error) {
      setMessage(result.error);
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{jobId === "add-new" ? "Add Job" : "Edit Job"}</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            type="text"
            placeholder="Role"
            {...form.register("role")}
          />
          <input
            className="w-full border p-2 rounded"
            type="text"
            placeholder="Company Name"
            {...form.register("companyName")}
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Job Description Summary"
            {...form.register("jobDescriptionSummary")}
          />
          <Controller
            name="appliedOn"
            control={form.control}
            render={({ field }) => (
              <DateAndTimePicker
                date={field.value}
                setDate={(date) => field.onChange(date)}
              />
            )}
          />
          <input
            className="w-full border p-2 rounded"
            type="text"
            placeholder="Link"
            {...form.register("link")}
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Notes"
            {...form.register("notes")}
          />
          <Button type="submit" className="w-full">
            {jobId === "add-new" ? "Add Job" : "Update Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}