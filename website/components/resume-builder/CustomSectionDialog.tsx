// components/CustomSectionDialog.tsx
"use client";

import { useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
	SectionConfig,
	SectionField,
	SectionFieldType,
} from "@/lib/types";

export function CustomSectionCreationDialog({
	onAddSection,
}: {
	onAddSection: (section: SectionConfig) => void;
}) {
	const [open, setOpen] = useState(false);
	const [sectionTitle, setSectionTitle] = useState("");
	const [sectionDescription, setSectionDescription] = useState("");
	const [fields, setFields] = useState<SectionField[]>([
		{
			id: crypto.randomUUID(),
			name: "",
			label: "",
			type: "text",
			required: false,
			fullWidth: false,
		},
	]);

	const handleAddField = () => {
		setFields([
			...fields,
			{
				id: crypto.randomUUID(),
				name: "",
				label: "",
				type: "text",
				required: false,
				fullWidth: false,
			},
		]);
	};

	const handleRemoveField = (index: number) => {
		setFields(fields.filter((_, i) => i !== index));
	};

	const handleFieldChange = (
		index: number,
		key: keyof SectionField,
		value: unknown,
	) => {
		setFields(
			fields.map((field, i) =>
				i === index ? { ...field, [key]: value } : field,
			),
		);
	};

	const handleClose = () => {
		setOpen(false);
		setSectionTitle("");
		setSectionDescription("");
		setFields([
			{
				id: crypto.randomUUID(),
				name: "",
				label: "",
				type: "text",
				required: false,
				fullWidth: false,
			},
		]);
	};

	const handleSubmit = () => {
		const newSection: SectionConfig = {
			title: sectionTitle,
			description: sectionDescription,
			fields: fields.map((field) => ({
				...field,
				name: field.label.toLowerCase().replace(/\s+/g, "_"),
			})),
		};
		onAddSection(newSection);
		handleClose();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" type="button">
					<Plus className="h-4 w-4 mr-2" />
					Create a Custom Section
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-3xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Create Custom Section</DialogTitle>
					<DialogDescription>
						Create a custom section for your resume with fields of your choice
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-full max-h-[calc(80vh-120px)] pr-4">
					<div className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="sectionTitle">
									Section Title<span className="text-red-500">*</span>
								</Label>
								<Input
									id="sectionTitle"
									value={sectionTitle}
									onChange={(e) => setSectionTitle(e.target.value)}
									placeholder="e.g., Awards & Achievements"
								/>
							</div>
							<div>
								<Label htmlFor="sectionDescription">Description</Label>
								<Input
									id="sectionDescription"
									value={sectionDescription}
									onChange={(e) => setSectionDescription(e.target.value)}
									placeholder="Enter a description for the section"
								/>
							</div>
						</div>
						<div className="space-y-4">
							<Label>Fields</Label>
							{fields.map((field, index) => (
								<Card key={field.id}>
									<CardContent className="pt-6">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label>
													Field Label<span className="text-red-500">*</span>
												</Label>
												<Input
													value={field.label}
													onChange={(e) =>
														handleFieldChange(index, "label", e.target.value)
													}
													placeholder="e.g., Award Title"
												/>
											</div>
											<div>
												<Label>Field Type</Label>
												<Select
													value={field.type}
													onValueChange={(value) =>
														handleFieldChange(
															index,
															"type",
															value as SectionFieldType,
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select field type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="text">Text</SelectItem>
														<SelectItem value="textarea">Text Area</SelectItem>
														<SelectItem value="date">Date</SelectItem>
														<SelectItem value="link">Link</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="flex items-center space-x-2">
												<Switch
													checked={field.required || false}
													onCheckedChange={(checked) =>
														handleFieldChange(index, "required", checked)
													}
												/>
												<Label>Required Field</Label>
											</div>
											<div className="flex items-center space-x-2">
												<Switch
													checked={field.fullWidth || false}
													onCheckedChange={(checked) =>
														handleFieldChange(index, "fullWidth", checked)
													}
												/>
												<Label>Full Width</Label>
											</div>
										</div>
										{fields.length > 1 && (
											<Button
												variant="destructive"
												size="sm"
												type="button"
												onClick={() => handleRemoveField(index)}
												className="mt-4"
											>
												<Trash className="h-4 w-4 mr-2" />
												Remove Field
											</Button>
										)}
									</CardContent>
								</Card>
							))}
							<Button
								variant="outline"
								onClick={handleAddField}
								className="w-full"
								type="button"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Field
							</Button>
						</div>
						<Button
							onClick={handleSubmit}
							type="button"
							disabled={!sectionTitle || fields.some((f) => !f.label)}
							className="w-full"
						>
							Create Section
						</Button>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
