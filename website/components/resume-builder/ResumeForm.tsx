"use client";

import { useState } from "react";
import { PersonalDetails } from "@/components/resume-builder/PersonalDetailsSection";
import { Section } from "@/components/resume-builder/ResumeSection";
import { CustomSectionDialog } from "@/components/resume-builder/CustomSectionDialog";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	type ResumeData,
	ResumeSchema,
	type SectionConfig,
	type SectionData,
	type SectionItemData,
	type SectionFieldType,
	SectionField,
} from "@/lib/types";
// import { z } from "zod";
import { showValidationErrors } from "./ResumeValidatorError";
import { toast } from "sonner";
interface ResumeFormProps {
	initialData?: ResumeData;
}
import { predefinedSectionConfigs } from "./DefaultSectionsConfig";
import { convertResumeToHTMLNodes } from "@/lib/resume-data-to-json";

export default function ResumeForm({ initialData }: ResumeFormProps) {
	const [sectionConfigs, setSectionConfigs] = useState<
		Record<string, SectionConfig>
	>(predefinedSectionConfigs);

	const [sections, setSections] = useState<SectionData[]>(
		initialData?.sections ||
			Object.keys(predefinedSectionConfigs).map((key) => ({
				id: key,
				title: predefinedSectionConfigs[key].title,
				description: predefinedSectionConfigs[key].description,
				items: [
					{
						id: crypto.randomUUID(),
						fields: predefinedSectionConfigs[key].fields.reduce(
							(acc, field) => {
								acc[field.name] =
									field.type === "link" ||
									field.type === "text" ||
									field.type === "textarea"
										? ""
										: "";
								return acc;
							},
							{} as SectionItemData["fields"],
						),
					},
				],
			})),
	);

	const [personalDetails, setPersonalDetails] = useState<
		ResumeData["personal"]
	>(
		initialData?.personal || {
			fullName: "",
			email: "",
			phone: undefined,
			location: undefined,
			summary: undefined,
			github: undefined,
			linkedin: undefined,
			portfolio: undefined,
		},
	);

	const handleSectionChange = (
		sectionId: string,
		newItems: SectionItemData[],
	) => {
		setSections((prevSections) =>
			prevSections.map((section) =>
				section.id === sectionId ? { ...section, items: newItems } : section,
			),
		);
	};

	const handlePreview = () => {
		const finalData: ResumeData = {
			personal: personalDetails,
			sections,
		};

		const parseResult = ResumeSchema.safeParse(finalData);

		if (!parseResult.success) {
			const formattedErrors = parseResult.error.errors.map((err) => ({
				path: err.path.map(String),
				message: err.message,
			}));
			showValidationErrors(formattedErrors);
			// return;
		}

		console.log("Preview:", finalData);
	};
	const handleAddCustomSection = (sectionConfig: SectionConfig) => {
		const newSectionId = crypto.randomUUID();
		setSectionConfigs((prevConfigs) => ({
			...prevConfigs,
			[newSectionId]: sectionConfig,
		}));

		const newSection: SectionData = {
			id: newSectionId,
			title: sectionConfig.title,
			description: sectionConfig.description,
			items: [
				{
					id: crypto.randomUUID(),
					fields: sectionConfig.fields.reduce(
						(acc, field) => {
							acc[field.name] =
								field.type === "link" ||
								field.type === "text" ||
								field.type === "textarea"
									? ""
									: "";
							return acc;
						},
						{} as SectionItemData["fields"],
					),
				},
			],
		};
		setSections([...sections, newSection]);
	};

	const handleRemoveSection = (sectionId: string) => {
		setSections(sections.filter((section) => section.id !== sectionId));
		setSectionConfigs((prevConfigs) => {
			const newConfigs = { ...prevConfigs };
			delete newConfigs[sectionId];
			return newConfigs;
		});
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const finalData: ResumeData = {
			personal: personalDetails,
			sections: sections,
		};
		const parseResult = ResumeSchema.safeParse(finalData);
		if (!parseResult.success) {
			console.error(parseResult.error);
			toast("Incomplete or Invalid", {
				description : "Please fill in all the required fields correctly.",
				action:{
					label : "Dismiss",
					onClick : () => toast.dismiss()
				}
			});
			return;
		}
		console.log(convertResumeToHTMLNodes(parseResult.data));
		
		toast.success("Resume Saved", {
			description: "Your resume has been saved successfully.",
		});
	};

	return (
		<form
			onSubmit={onSubmit}
			className="xl:min-w-[750px] lg:min-w-[650px] md:min-w-[550px]"
		>
			<Card>
				<CardHeader>
					<CardTitle className="text-3xl">Build Your Resume</CardTitle>
					<CardDescription>
						Just fill in the details correctly and ✨ magic will happen..
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PersonalDetails
						values={personalDetails}
						onChange={setPersonalDetails}
					/>
					<div className="space-y-6">
						{sections.map((section) => {
							const config = sectionConfigs[section.id];
							return (
								<Section
									key={section.id}
									title={section.title}
									description={config?.description}
									fields={config?.fields || []}
									values={section.items}
									onChange={(newItems) =>
										handleSectionChange(section.id, newItems)
									}
									canAddMore
									minItems={1}
									maxItems={5}
									onRemoveSection={() => handleRemoveSection(section.id)}
								/>
							);
						})}
					</div>
					<div className="mt-3">
						<CustomSectionDialog onAddSection={handleAddCustomSection} />
					</div>
					<Separator className="my-3" />
					<div className="flex gap-4 mt-3">
						<Button type="button" variant="outline" onClick={handlePreview}>
							Preview
						</Button>
						<Button type="submit">Save Resume</Button>
					</div>
				</CardContent>
			</Card>
		</form>
	);
}
