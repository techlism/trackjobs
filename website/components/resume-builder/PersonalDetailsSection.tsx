import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PersonalData, ResumeData } from "@/lib/types";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

// PersonalDetailsSection.tsx
interface PersonalDetailsProps {
	values: Omit<ResumeData, "id" | "userId" | "resumeTitle" | "sections">;
	onChange: (
		values: Omit<ResumeData, "id" | "userId" | "resumeTitle" | "sections">,
	) => void;
}

export function PersonalDetails({ values, onChange }: PersonalDetailsProps) {
    const fields = [
        {
            name: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
            fullWidth: false
        },
        {
            name: "email",
            label: "Email",
            type: "text",
            required: true,
            fullWidth: false
        },
        {
            name: "phone",
            label: "Phone",
            type: "text",
            required: false,
            fullWidth: false
        },
        {
            name: "location",
            label: "Location",
            type: "text",
            required: false,
            fullWidth: false
        },
        {
            name: "github",
            label: "GitHub URL",
            type: "text",
            required: false,
            fullWidth: false
        },
        {
            name: "linkedin",
            label: "LinkedIn URL",
            type: "text",
            required: false,
            fullWidth: false
        },
        {
            name: "portfolio",
            label: "Portfolio URL",
            type: "text",
            required: false,
            fullWidth: true
        },
        {
            name: "summary",
            label: "Professional Summary",
            type: "textarea",
            required: false,
            fullWidth: true
        }
    ];

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Enter your personal information here.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div 
                        key={field.name} 
                        className={`grid gap-2 ${field.fullWidth ? "col-span-full" : ""}`}
                    >
                        <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && (
                                <span className="text-destructive">*</span>
                            )}
                        </Label>
                        {field.type === "textarea" ? (
                            <Textarea
                                id={field.name}
                                value={values[field.name as keyof typeof values] || ""}
                                onChange={(e) => 
                                    onChange({
                                        ...values,
                                        [field.name]: e.target.value
                                    })
                                }
                            />
                        ) : (
                            <Input
                                id={field.name}
                                type="text"
                                value={values[field.name as keyof typeof values] || ""}
                                onChange={(e) => 
                                    onChange({
                                        ...values,
                                        [field.name]: e.target.value
                                    })
                                }
                            />
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
