"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { JobSchema, type Job } from "@/lib/types";
import { addJob, updateJob } from "@/app/(pages)/dashboard/action";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { z } from "zod";
import DateAndTimePicker from "@/components/ui/DatePicker";
import Loader from "../Loader";
import { Textarea } from "../ui/textarea";

type EditJobFormProps = {
	jobId?: string;
	initialData?: Partial<Job>;
};

export function EditJobForm({ jobId, initialData }: EditJobFormProps) {
	const [message, setMessage] = useState("");
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const form = useForm<z.infer<typeof JobSchema>>({
		resolver: zodResolver(JobSchema),
		defaultValues: {
			...initialData,
			appliedOn: initialData?.appliedOn || Date.now(),
		},
	});

	async function onSubmit(values: z.infer<typeof JobSchema>) {
		setLoading(true);
		let res: string;
		if (jobId === "add-new") {
			res = await addJob(values);
		} else {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			res = await updateJob(jobId!, values);
		}

		const result = JSON.parse(res);
		if (result.error) {
			setMessage(result.error);
			setTimeout(() => setMessage(""), 5000);
			setLoading(false);
			return;
		}
		setLoading(false);
		router.push("/dashboard");
	}

	return (
		<Card className="w-72 md:w-96 lg:w-[450px] xl:w-[550px] my-6">
			<CardHeader>
				<CardTitle className="text-2xl">
					{jobId === "add-new" ? "Add a new Job" : "Edit Job"}
				</CardTitle>
				<CardDescription>
					{jobId === "add-new"
						? "Fill in the role details of the job you applied for."
						: "Update the details of the job you applied for."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{message && (
					<Alert className="mb-4">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{message}</AlertDescription>
					</Alert>
				)}
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<div className="relative">
						<input
							className="w-full border p-2 rounded"
							type="text"
							placeholder="Role"
							{...form.register("role")}
						/>
					</div>
					<div className="relative">
						<input
							className="w-full border p-2 rounded"
							type="text"
							placeholder="Company Name"
							{...form.register("companyName")}
						/>
					</div>
					<div className="relative">
						<Textarea
							className="w-full border p-2 rounded min-h-[100px]"
							placeholder="Job Description Summary"
							{...form.register("jobDescriptionSummary")}
						/>
					</div>
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
					<div className="relative">
						<input
							className="w-full border p-2 rounded"
							type="text"
							placeholder="Link"
							{...form.register("link")}
						/>
					</div>
					<div className="relative">
						<textarea
							className="w-full border p-2 rounded"
							placeholder="Notes"
							{...form.register("notes")}
						/>
					</div>
					<Button type="submit" className="w-full">
						{loading ? (
							<Loader />
						) : jobId === "add-new" ? (
							"Add Job"
						) : (
							"Update Job"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
