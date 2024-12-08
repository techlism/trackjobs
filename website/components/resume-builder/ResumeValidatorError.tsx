import { toast } from "sonner";

type ValidationError = {
	path: string[];
	message: string;
};

const getFriendlyFieldName = (fieldName: string): string => {
	const fieldNames: Record<string, string> = {
		fullName: "Full Name",
		email: "Email Address",
		phone: "Phone Number",
		location: "Location",
		summary: "Professional Summary",
		github: "GitHub URL",
		linkedin: "LinkedIn URL",
		portfolio: "Portfolio URL",
		institution: "Institution Name",
		degree: "Degree",
		startDate: "Start Date",
		endDate: "End Date",
		company: "Company Name",
		position: "Position",
		responsibilities: "Responsibilities",
		project: "Project Name",
		description: "Description",
		link: "Project Link",
		repository: "Repository Link",
		skills: "Skills",
		// Add other field mappings as needed
	};

	return fieldNames[fieldName] || fieldName.replace(/([A-Z])/g, " $1").trim();
};

const getSectionName = (path: string[]): string => {
	if (path[0] === "personal") {
		return "Personal Information";
	}
	if (path[0] === "sections" && path.length > 1) {
		const sectionIndex = Number.parseInt(path[1]);
		return !Number.isNaN(sectionIndex)
			? `Section ${sectionIndex + 1}`
			: "Custom Section";
	}
	return "Error";
};

const formatErrorMessage = (error: ValidationError): string => {
	const fieldName = getFriendlyFieldName(
		error.path[error.path.length - 1] || "Field",
	);

	if (!error.message) {
		return `Invalid ${fieldName}`;
	}

	if (error.message.toLowerCase().includes("required")) {
		return `${fieldName} is required.`;
	}

	if (error.message.toLowerCase().includes("invalid")) {
		return `${fieldName} is invalid.`;
	}

	return `${fieldName}: ${error.message}`;
};

export const showValidationErrors = (errors: ValidationError[]) => {
	// biome-ignore lint/complexity/noForEach: <explanation>
	errors.forEach((error) => {
		const section = getSectionName(error.path);
		const errorMessage = formatErrorMessage(error);

		toast.error(`Error in ${section}`, {
			description: errorMessage,
            action : {
                label : "Dismiss",
                onClick : () => toast.dismiss
            }
		});
	});
};
