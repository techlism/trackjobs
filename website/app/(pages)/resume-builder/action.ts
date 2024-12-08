'use server'
import { revalidatePath } from "next/cache";
import { and, type AnyColumn, asc, desc, eq, type SQLWrapper } from "drizzle-orm";
import db from "@/lib/database/client";
import { validateRequest } from "@/lib/lucia";
import {
	resumeTable,
	resumeSectionTable,
	resumeSectionFieldTable,
	resumeSectionItemTable,
	resumeSectionFieldValueTable,
} from "@/lib/database/schema";
import {
	type ResumeData,
	type ApiResponse,
	type DbResumeWithRelations,
	ResumeSchema,
} from "@/lib/types";

export async function saveResumeData(
	resumeData: ResumeData
): Promise<ApiResponse<{ id: string }>> {
	try {
		const { session } = await validateRequest();
		if (!session) return { error: "Unauthorized" };

		const validatedData = ResumeSchema.parse(resumeData);

		const result = await db.transaction(async (tx) => {
			const [resume] = await tx.insert(resumeTable).values({
				userId: session.userId,
				resumeTitle: validatedData.resumeTitle,
				fullName: validatedData.fullName,
				email: validatedData.email,
				phone: validatedData.phone || null,
				location: validatedData.location || null,
				summary: validatedData.summary || null,
				github: validatedData.github || null,
				linkedin: validatedData.linkedin || null,
				portfolio: validatedData.portfolio || null,
			}).returning();

			if (validatedData.sections) {
				await Promise.all(validatedData.sections.map(async (section, sectionIndex) => {
					const [savedSection] = await tx.insert(resumeSectionTable).values({
						resumeId: resume.id,
						title: section.title,
						description: section.description || null,
						displayOrder: sectionIndex,
						allowMultiple: section.allowMultiple || true,
						minItems: section.minItems || null,
						maxItems: section.maxItems || null,
					}).returning();

					const savedFields = await Promise.all(
						(section.fields || []).map(async (field, fieldIndex) => {
							const [savedField] = await tx.insert(resumeSectionFieldTable).values({
								sectionId: savedSection.id,
								name: field.name,
								label: field.label,
								type: field.type,
								required: field.required || false,
								fullWidth: field.fullWidth || true,
								placeholder: field.placeholder || null,
								listType: field.listType || null,
								displayOrder: fieldIndex,
							}).returning();
							return savedField;
						})
					);

					await Promise.all((section.items || []).map(async (item, itemIndex) => {
						const [savedItem] = await tx.insert(resumeSectionItemTable).values({
							sectionId: savedSection.id,
							displayOrder: itemIndex,
						}).returning();

						if (item.fieldValues && item.fieldValues.length > 0) {
							await Promise.all(
								item.fieldValues.map(async (fieldValue) => {
									const savedField = savedFields.find(f =>
										f.name === section.fields?.find(sf => sf.id === fieldValue.fieldId)?.name
									);

									if (savedField) {
										await tx.insert(resumeSectionFieldValueTable).values({
											sectionItemId: savedItem.id,
											fieldId: savedField.id,
											value: fieldValue.value,
										});
									}
								})
							);
						}
					}));
				}));
			}

			return { id: resume.id };
		});

		revalidatePath('/resume-builder');
		return { data: result };
	} catch (error) {
		console.error("Error saving resume:", error);
		return { error: "Failed to save resume" };
	}
}

export async function fetchResumeData(
	resumeId: string
): Promise<ApiResponse<ResumeData>> {
	try {
		const { session } = await validateRequest();
		if (!session) return { error: "Unauthorized" };
		if (!resumeId || resumeId === '') return { error: "Resume ID not provided" };

		const resume = await db.query.resumeTable.findFirst({
			where: eq(resumeTable.id, resumeId),
			with: {
				sections: {
					orderBy: (sections: { displayOrder: SQLWrapper | AnyColumn }) => [asc(sections.displayOrder)],
					with: {
						fields: {
							orderBy: (fields: { displayOrder: SQLWrapper | AnyColumn }) => [asc(fields.displayOrder)],
						},
						items: {
							orderBy: (items: { displayOrder: SQLWrapper | AnyColumn }) => [asc(items.displayOrder)],
							with: {
								fieldValues: {
									with: {
										field: true,
									},
								},
							},
						},
					},
				},
			},
		}) as DbResumeWithRelations | null;

		if (!resume) return { error: "Resume not found" };
		if (resume.userId !== session.userId) return { error: "Unauthorized" };

		const resumeData: ResumeData = {
			id: resume.id,
			userId: resume.userId,
			resumeTitle: resume.resumeTitle,
			fullName: resume.fullName,
			email: resume.email,
			phone: resume.phone || undefined,
			location: resume.location || undefined,
			summary: resume.summary || undefined,
			github: resume.github || undefined,
			linkedin: resume.linkedin || undefined,
			portfolio: resume.portfolio || undefined,
			sections: resume.sections.map((section) => ({
				id: section.id,
				resumeId: resume.id,
				title: section.title,
				displayOrder: section.displayOrder,
				description: section.description || undefined,
				allowMultiple: section.allowMultiple || true,
				minItems: section.minItems || undefined,
				maxItems: section.maxItems || undefined,
				fields: section.fields?.map(field => ({
					id: field.id,
					name: field.name,
					label: field.label,
					type: field.type,
					required: field.required || false,
					fullWidth: field.fullWidth || false,
					placeholder: field.placeholder || "",
					listType: field.listType || undefined,
					displayOrder: field.displayOrder,
				})) || [],
				items: section.items?.map((item) => ({
					id: item.id,
					displayOrder: item.displayOrder,
					sectionId: section.id,
					fieldValues: item.fieldValues?.map(fieldValue => ({
						id: fieldValue.id,
						fieldId: fieldValue.fieldId,
						sectionItemId: fieldValue.sectionItemId,
						value: fieldValue.value,
					})) || [],
				})) || [],
			})),
		};

		const validatedData = ResumeSchema.parse(resumeData);
		return { data: validatedData };
	} catch (error) {
		console.error("Error fetching resume:", error);
		return { error: "Failed to fetch resume" };
	}
}

export async function updateResumeData(
	resumeId: string,
	data: ResumeData
): Promise<ApiResponse<{ id: string }>> {
	try {
		const { session } = await validateRequest();
		if (!session) return { error: "Unauthorized" };
		if (!resumeId) return { error: "Resume ID required" };

		const result = await db.transaction(async (tx) => {
			// Update resume base data
			await tx
				.update(resumeTable)
				.set({
					resumeTitle: data.resumeTitle,
					fullName: data.fullName,
					email: data.email,
					phone: data.phone,
					location: data.location,
					summary: data.summary,
					github: data.github,
					linkedin: data.linkedin,
					portfolio: data.portfolio,
					updatedAt: Date.now(),
				})
				.where(eq(resumeTable.id, resumeId));

			// Handle sections
			for (const section of data.sections || []) {
				const sectionExists = await tx.query.resumeSectionTable.findFirst({
					where: and(
						eq(resumeSectionTable.id, section.id),
						eq(resumeSectionTable.resumeId, resumeId)
					),
				});

				if (sectionExists) {
					await tx
						.update(resumeSectionTable)
						.set({
							title: section.title,
							description: section.description,
							displayOrder: section.displayOrder,
							allowMultiple: section.allowMultiple,
							minItems: section.minItems,
							maxItems: section.maxItems,
						})
						.where(eq(resumeSectionTable.id, section.id));
				} else {
					await tx.insert(resumeSectionTable).values({
						id: section.id,
						resumeId: resumeId,
						title: section.title,
						description: section.description,
						displayOrder: section.displayOrder,
						allowMultiple: section.allowMultiple,
						minItems: section.minItems,
						maxItems: section.maxItems,
					});
				}

				// Handle fields
				for (const field of section.fields || []) {
					const fieldExists = field.id ? await tx.query.resumeSectionFieldTable.findFirst({
						where: and(
							eq(resumeSectionFieldTable.id, field.id),
							eq(resumeSectionFieldTable.sectionId, section.id)
						),
					}) : null;

					if (fieldExists && field.id) {
						await tx
							.update(resumeSectionFieldTable)
							.set({
								name: field.name,
								label: field.label,
								type: field.type,
								required: field.required,
								fullWidth: field.fullWidth,
								placeholder: field.placeholder,
								listType: field.listType,
								displayOrder: field.displayOrder,
							})
							.where(eq(resumeSectionFieldTable.id, field.id));
					} else {
						await tx.insert(resumeSectionFieldTable).values({
							id: field.id,
							sectionId: section.id,
							name: field.name,
							label: field.label,
							type: field.type,
							required: field.required,
							fullWidth: field.fullWidth,
							placeholder: field.placeholder,
							listType: field.listType,
							displayOrder: field.displayOrder,
						});
					}
				}

				// Handle items and values
				for (const item of section.items || []) {
					const itemExists = await tx.query.resumeSectionItemTable.findFirst({
						where: and(
							eq(resumeSectionItemTable.id, item.id),
							eq(resumeSectionItemTable.sectionId, section.id)
						),
					});

					if (itemExists) {
						await tx
							.update(resumeSectionItemTable)
							.set({
								displayOrder: item.displayOrder,
							})
							.where(eq(resumeSectionItemTable.id, item.id));
					} else {
						await tx.insert(resumeSectionItemTable).values({
							id: item.id,
							sectionId: section.id,
							displayOrder: item.displayOrder,
						});
					}

					// Handle field values
					for (const fieldValue of item.fieldValues || []) {
						const valueExists = await tx.query.resumeSectionFieldValueTable.findFirst({
							where: and(
								eq(resumeSectionFieldValueTable.id, fieldValue.id),
								eq(resumeSectionFieldValueTable.sectionItemId, item.id)
							),
						});

						if (valueExists) {
							await tx
								.update(resumeSectionFieldValueTable)
								.set({
									value: fieldValue.value,
								})
								.where(eq(resumeSectionFieldValueTable.id, fieldValue.id));
						} else {
							await tx.insert(resumeSectionFieldValueTable).values({
								id: fieldValue.id,
								sectionItemId: item.id,
								fieldId: fieldValue.fieldId,
								value: fieldValue.value,
							});
						}
					}
				}
			}

			return resumeId;
		});

		revalidatePath('/resume-builder');
		return { data: { id: result } };
	} catch (error) {
		console.trace("Error updating resume:", error);
		return { error: "Failed to update resume" };
	}
}

export async function deleteResumeData(
	resumeId: string
): Promise<ApiResponse<{ message: string }>> {
	try {
		const { session } = await validateRequest();
		if (!session) return { error: "Unauthorized" };

		await db.transaction(async (tx) => {
			const resume = await tx.query.resumeTable.findFirst({
				where: eq(resumeTable.id, resumeId),
			});

			if (!resume || resume.userId !== session.userId) {
				throw new Error("Resume not found or unauthorized");
			}

			await tx.delete(resumeSectionFieldValueTable).where(
				eq(resumeSectionFieldValueTable.sectionItemId, resumeId)
			);
			await tx.delete(resumeSectionFieldTable).where(
				eq(resumeSectionFieldTable.sectionId, resumeId)
			);
			await tx.delete(resumeSectionItemTable).where(
				eq(resumeSectionItemTable.sectionId, resumeId)
			);
			await tx.delete(resumeSectionTable).where(eq(resumeSectionTable.resumeId, resumeId));
			await tx.delete(resumeTable).where(eq(resumeTable.id, resumeId));
		});

		revalidatePath('/resume-builder');
		return { data: { message: "Resume deleted successfully" } };
	} catch (error) {
		console.error("Error deleting resume:", error);
		return { error: "Failed to delete resume" };
	}
}

export async function fetchAllResumes(): Promise<ApiResponse<{id : string, resumeTitle : string, createdAt : number, updatedAt : number}[]>> {
	try {
		const { session } = await validateRequest();
		if (!session) return { error: "Unauthorized" };

		const resumes = await db.query.resumeTable.findMany({
			where: eq(resumeTable.userId, session.userId),
			columns: {
				id: true,
				resumeTitle: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: (resumes) => [desc(resumes.updatedAt)],
		});

		return { data: resumes };
	} catch (error) {
		console.error("Error fetching resumes:", error);
		return { error: error instanceof Error ? error.message : "Failed to fetch resumes" };
	}
}