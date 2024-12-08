import type { SectionConfig, SectionFieldType } from "@/lib/types";

export const predefinedSectionConfigs: Record<string, SectionConfig> = {
    education: {
        title: "Education",
        description: "Add your educational background",
        fields: [
            {
                name: "institution",
                label: "Institution",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter institution name e.g. Harvard University",
            },
            {
                name: "degree",
                label: "Degree/Certificate",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter degree name e.g. Bachelor of Science",
            },
            {
                name: "startDate",
                label: "Start Date",
                type: "date" as SectionFieldType,
                placeholder: "Select start date",
            },
            {
                name: "endDate",
                label: "End Date",
                type: "date" as SectionFieldType,
                placeholder: "Select end date",
            },
            {
                name: "score",
                label: "Score",
                type: "text" as SectionFieldType,
                fullWidth: true,
                placeholder: "Enter your score e.g. 3.5/4.0 or 85%",
            },
            {
                name: "description",
                label: "Description",
                type: "textarea" as SectionFieldType,
                fullWidth: true,
                placeholder:
                    "Describe your academic achievements, relevant coursework, etc.",
            },
        ],
    },
    experience: {
        title: "Work Experience",
        description: "Add your work experience",
        fields: [
            {
                name: "company",
                label: "Company",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter company name e.g. Google",
            },
            {
                name: "position",
                label: "Position",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter position e.g. Software Engineer",
            },
            {
                name: "startDate",
                label: "Start Date",
                type: "date" as SectionFieldType,
                placeholder: "Select start date",
            },
            {
                name: "endDate",
                label: "End Date",
                type: "date" as SectionFieldType,
                placeholder: "Select end date",
            },
            {
                name: "responsibilities",
                label: "Responsibilities",
                type: "textarea" as SectionFieldType,
                fullWidth: true,
                placeholder: "Describe your key responsibilities and achievements",
            },
        ],
    },
    projects: {
        title: "Projects",
        description: "Add your projects",
        fields: [
            {
                name: "project",
                label: "Project",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter project name e.g. Portfolio Website",
            },
            {
                name : "techstack",
                label: "Tech Stack or Tools Used",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
            },
            {
                name: "description",
                label: "Description",
                type: "textarea" as SectionFieldType,
                fullWidth: true,
                placeholder: "Describe your project in detail",
            },
            {
                name: "link",
                label: "Link",
                type: "link" as SectionFieldType,
                fullWidth: true,
                placeholder: "Enter project link",
            },
            {
                name: "repository",
                label: "Repository Link",
                type: "link" as SectionFieldType,
                fullWidth: true,
                placeholder: "Enter project repository link",
            },
        ],
    },
    skills: {
        title: "Skills",
        description: "Add your skills",
        fields: [
            {
                name: "skill",
                label: "Skill",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder:
                    "Enter skills on a group basis e.g. Programming Languages, Frameworks, Tools",
            },
        ],
    },
    position_of_responsibility: {
        title: "Positions of Responsibility",
        description: "Add your positions of responsibility",
        fields: [
            {
                name: "position",
                label: "Position",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter position e.g. President of Coding Club",
            },
            {
                name: "startDate",
                label: "Start Date",
                type: "date" as SectionFieldType,
                placeholder: "Select start date",
            },
            {
                name: "endDate",
                label: "End Date",
                type: "date" as SectionFieldType,
                placeholder: "Select end date",
            },
            {
                name: "description",
                label: "Description",
                type: "textarea" as SectionFieldType,
                fullWidth: true,
                placeholder: "Describe your responsibilities and achievements",
            },
        ],
    },
    certifications_and_accomplishments: {
        title: "Certifications & Accomplishments",
        description: "Add your certifications and accomplishments",
        fields: [
            {
                name: "title",
                label: "Title",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter title e.g. AWS Certified Solutions Architect",
            },
            {
                name: "date",
                label: "Date",
                type: "date" as SectionFieldType,
                placeholder: "Select date",
            },
            {
                name: "description",
                label: "Description",
                type: "textarea" as SectionFieldType,
                fullWidth: true,
                placeholder: "Describe your accomplishment or certification",
            },
        ],
    },
    extra_curriculars: {
        title: "Extra-Curricular Activities",
        description: "Add your extra-curricular activities",
        fields: [
            {
                name: "activity",
                label: "Activity",
                type: "text" as SectionFieldType,
                fullWidth: true,
                required: true,
                placeholder: "Enter activity e.g. Debate Club",
            }
        ],
    }
};