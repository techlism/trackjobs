"use client";

import { useCallback, useMemo, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import Loader from "../Loader";
import { toast } from "sonner";
import { PersonalDetails } from "@/components/resume-builder/PersonalDetailsSection";
import { Section } from "@/components/resume-builder/ResumeSection";
import { CustomSectionCreationDialog } from "@/components/resume-builder/CustomSectionDialog";
import {
	type PersonalData,
	type ResumeData,
	ResumeSchema,
	type SectionConfig,
	type SectionData,
	type SectionFieldData,
	type SectionItemData,
} from "@/lib/types";
import { predefinedSectionConfigs } from "./DefaultSectionsConfig";
import {
	saveResumeData,
	updateResumeData,
} from "@/app/(pages)/resume-builder/action";

interface ResumeFormProps {
	initialData?: ResumeData;
	resumeID?: string;
}

export default function ResumeForm({ initialData, resumeID }: ResumeFormProps) {
	const [processing, setProcessing] = useState<boolean>(false);
	const [resumeId, setResumeId] = useState<string | undefined>(resumeID);

	// Initialize personal details
	const [personalDetails, setPersonalDetails] = useState<PersonalData>(
		() => ({
			fullName: initialData?.fullName || "",
			email: initialData?.email || "",
			phone: initialData?.phone ?? "",
			location: initialData?.location ?? "",
			summary: initialData?.summary ?? "",
			github: initialData?.github ?? "",
			linkedin: initialData?.linkedin ?? "",
			portfolio: initialData?.portfolio ?? "",
		}),
	);

	// Initialize resume title
	const [resumeTitle, setResumeTitle] = useState<string>(() =>
		initialData?.resumeTitle ||
		`Resume - ${new Date().toLocaleDateString()}`
	);

	// Initialize sections
	const [sections, setSections] = useState<SectionData[]>(() => {
		if (initialData?.sections && initialData.sections.length > 0) {
			// Ensure fields and items are arrays
			return initialData.sections.map((section, idx) => ({
				...section,
				fields: section.fields ?? [],
				items: section.items ?? [],
				displayOrder: idx,
			}));
		}

		// If no initial data, create default sections
		return Object.entries(predefinedSectionConfigs).map(
			([key, config], idx) => {
				const sectionId = crypto.randomUUID();
				const fields: SectionFieldData[] = config.fields.map((
					field,
					index,
				) => ({
					id: crypto.randomUUID(),
					name: field.name,
					label: field.label,
					type: field.type,
					required: field.required ?? false,
					fullWidth: field.fullWidth ?? true,
					placeholder: field.placeholder ?? "",
					listType: field.listType,
					displayOrder: index,
				}));

				const itemId = crypto.randomUUID();

				return {
					id: sectionId,
					resumeId: resumeId || "",
					title: config.title,
					description: config.description,
					displayOrder: idx,
					allowMultiple: config.allowMultiple ?? true,
					minItems: config.minItems ?? 1,
					maxItems: config.maxItems ?? 5,
					fields: fields,
					items: [
						{
							id: itemId,
							sectionId: sectionId,
							displayOrder: 0,
							fieldValues: fields.map((field) => ({
								id: crypto.randomUUID(),
								sectionItemId: itemId,
								fieldId: field.id || "",
								value: "",
							})),
						},
					],
				};
			},
		);
	});

	// Memoize form data
	const formData = useMemo<ResumeData>(
		() => ({
			id: resumeId,
			resumeTitle,
			...personalDetails,
			sections: sections.map((section, index) => ({
				...section,
				displayOrder: index,
				items: (section.items || []).map((item, itemIndex) => ({
					...item,
					displayOrder: itemIndex,
				})),
			})),
		}),
		[resumeId, resumeTitle, personalDetails, sections],
	);

	// Handler for personal details change
	const handlePersonalDetailsChange = useCallback(
		(updates: Partial<PersonalData>) => {
			setPersonalDetails((prev) => ({
				...prev,
				...updates,
			}));
		},
		[],
	);

	// Handler for section change
	const handleSectionChange = useCallback(
		(sectionId: string, newItems: SectionItemData[]) => {
			setSections((prevSections) =>
				prevSections.map((section) =>
					section.id === sectionId
						? {
							...section,
							items: newItems,
						}
						: section
				)
			);
		},
		[],
	);

	// Handler for adding a custom section
	const handleAddCustomSection = useCallback(
		(sectionConfig: SectionConfig) => {
			const newSectionId = crypto.randomUUID();
			const newFields: SectionFieldData[] = sectionConfig.fields.map(
				(field, index) => ({
					id: crypto.randomUUID(),
					name: field.name,
					label: field.label,
					type: field.type,
					required: field.required ?? false,
					fullWidth: field.fullWidth ?? true,
					placeholder: field.placeholder ?? "",
					listType: field.listType,
					displayOrder: index,
				}),
			);

			const itemId = crypto.randomUUID();

			const newSection: SectionData = {
				id: newSectionId,
				resumeId: resumeId || "",
				title: sectionConfig.title,
				description: sectionConfig.description,
				displayOrder: sections.length,
				allowMultiple: sectionConfig.allowMultiple ?? true,
				minItems: sectionConfig.minItems ?? 1,
				maxItems: sectionConfig.maxItems ?? 5,
				fields: newFields,
				items: [
					{
						id: itemId,
						sectionId: newSectionId,
						displayOrder: 0,
						fieldValues: newFields.map((field) => ({
							id: crypto.randomUUID(),
							sectionItemId: itemId,
							fieldId: field.id || "",
							value: "",
						})),
					},
				],
			};

			setSections((prevSections) => [...prevSections, newSection]);
		},
		[resumeId, sections.length],
	);

	// Handler for removing a section
	const handleRemoveSection = useCallback((sectionId: string) => {
		setSections((prevSections) =>
			prevSections.filter((section) => section.id !== sectionId)
		);
	}, []);

	// Handle form submission
	const onSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (processing) return;
			setProcessing(true);

			try {
				const parsedData = ResumeSchema.safeParse(formData);

				if (!parsedData.success) {
					const formattedErrors = parsedData.error.errors;
					// biome-ignore lint/complexity/noForEach: <explanation>
					formattedErrors.forEach((error) => {
						toast.error(`Issue in the field ${String(error.path).split('.')[0].charAt(0).toUpperCase() + String(error.path).split('.')[0].slice(1).toLowerCase()}`, {
							description: error.message,
							action : {
								label : 'Dismiss',
								onClick : () => toast.dismiss
							}
						});
					});
					setProcessing(false);
					return;
				}

				const data = parsedData.data;

				const result = resumeId
					? await updateResumeData(resumeId, data)
					: await saveResumeData(data);

				if (result.error) {
					throw new Error(result.error);
				}

				if (!resumeId && result.data?.id) {
					setResumeId(result.data.id);
				}

				toast.success("Resume Saved", {
					description:
						"Your resume data has been saved successfully.",
				});
			} catch (error) {
				toast.error("Failed to save resume", {
					description: error instanceof Error
						? error.message
						: "An unknown error occurred",
						action : {
							label : 'Dismiss',
							onClick : () => toast.dismiss
						}
				});
			} finally {
				setProcessing(false);
			}
		},
		[formData, processing, resumeId],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">
					Resume Builder ✨
				</CardTitle>
				<CardDescription>
					Just fill the form and see your resume come to life!
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={onSubmit}
					className="xl:min-w-[750px] lg:min-w-[650px] md:min-w-[550px] font-medium"
				>
					<PersonalDetails
						values={personalDetails}
						onChange={handlePersonalDetailsChange}
					/>
					{sections.length > 0 &&
						(
							<div className="grid grid-cols-1 gap-4">
								{sections.map((section) => (
									<Section
										key={section.id}
										title={section.title}
										description={section.description}
										fields={section.fields ?? []} // Ensure fields is an array
										values={section.items ?? []} // Ensure values is an array
										onChange={(newItems) =>
											handleSectionChange(
												section.id,
												newItems,
											)}
										canAddMore={section.allowMultiple ??
											true}
										minItems={section.minItems ?? 1}
										maxItems={section.maxItems ?? 5}
										onRemoveSection={predefinedSectionConfigs
												// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
												.hasOwnProperty(
													section.title,
												)
											? undefined
											: () =>
												handleRemoveSection(section.id)}
									/>
								))}
							</div>
						)}
					<div className="flex mt-4">
						<CustomSectionCreationDialog
							onAddSection={handleAddCustomSection}
						/>
					</div>

					<Separator className="my-4" />

					<Card className="mb-6">
						<CardHeader>
							<CardTitle>
								Save your Resume
							</CardTitle>
							<CardDescription>
								Enter a title for your resume and click on the
								save button.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div>
								<Input
									id="resumeTitle"
									value={resumeTitle}
									onChange={(e) =>
										setResumeTitle(e.target.value)}
									placeholder="Resume Title"
									className="w-full"
								/>
							</div>
							<Button
								type="submit"
								disabled={processing}
								className="mt-2"
							>
								{processing ? <Loader /> : "Save Resume"}
							</Button>
						</CardContent>
					</Card>
				</form>
			</CardContent>
		</Card>
	);
}
