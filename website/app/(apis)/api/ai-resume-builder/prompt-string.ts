export default function generatePromptString(
	resumeData: string,
	description: string,
	jobrole: string,
) {
	const prompt = `
    RESUME OPTIMIZATION TASK:

    SCHEMA REFERENCE:
    - Resume uses predefined schemas for validation
    - Maintain existing structure and IDs strictly

    OPTIMIZATION GUIDELINES:
    1. Fix grammatical errors in resume content
    2. Align resume with job description:
        - Match keywords in job description
        - Adjust projects to 3-4 atmost relevant to the JOB Desciption.
        - Ensure mentioned skills are reflected and key-word coverage is high.
    	- Quantify work experiences and impact in projects or anywhere, if possible
    3. Constraints:
       	- Do not modify personal data section
       	- Preserve section titles
       	- Do not alter dates
       	- Maintain similar resume size
       	- Move section's order if job description justifies

    INPUT DETAILS:
    Resume Data: ${resumeData}
    Job Role: ${jobrole}
    Job Description: ${description}

    OUTPUT REQUIREMENT:
    - Return modified resume JSON exactly matching input schema (ResumeData).
    - Do not include greetings or additional text just the JSON.
    `;

	return prompt;
}

// export default function generatePromptString(resumeData : string, description : string, jobrole : string){
//     const prompt =`
//     YOU ARE BEING PROVIDED WITH DETAILS BEST KNOWN TO THE USER. THE USER HAS PROVIDED DATA IN THE FOLLOWING SCHEMA.
//             export interface SectionField {
//                 name: string;
//                 label: string;
//                 type: SectionFieldType;
//                 required?: boolean;
//                 fullWidth?: boolean;
//                 placeholder?: string;
//                 listType?: SectionFieldType;
//                 id?: string;
//             }

//             export interface SectionConfig {
//                 title: string;
//                 description?: string;
//                 fields: SectionField[];
//                 allowMultiple?: boolean;
//                 minItems?: number;
//                 maxItems?: number;
//             }
//             export const SectionFieldSchema = z.object({
//                 id: z.string().optional(),
//                 name: z.string(),
//                 label: z.string(),
//                 type: z.enum(["text", "date", "textarea", "link"]),
//                 required: z.boolean().optional(),
//                 fullWidth: z.boolean().default(true),
//                 placeholder: z.string().optional(),
//                 listType: z.enum(["text", "date", "textarea", "link"]).optional(),
//                 displayOrder: z.number()
//             });

//             // Align with SectionConfig interface and DB schema
//             export const SectionConfigSchema = z.object({
//                 title: z.string(),
//                 description: z.string().optional(),
//                 fields: z.array(SectionFieldSchema),
//                 allowMultiple: z.boolean().optional(),
//                 minItems: z.number().optional(),
//                 maxItems: z.number().optional()
//             });

//             // Align with DB schema personal fields
//             export const PersonalSchema = z.object({
//                 fullName: z.string().min(1, "Full name is required"),
//                 email: z.string().email("Invalid email"),
//                 phone: z.string().optional().transform(val => val === "" ? undefined : val),
//                 location: z.string().optional().transform(val => val === "" ? undefined : val),
//                 summary: z.string().optional().transform(val => val === "" ? undefined : val),
//                 github: z.string().url("Invalid URL").optional()
//                     .transform(val => val === "" ? undefined : val),
//                 linkedin: z.string().url("Invalid URL").optional()
//                     .transform(val => val === "" ? undefined : val),
//                 portfolio: z.string().url("Invalid URL").optional()
//                     .transform(val => val === "" ? undefined : val),
//             });

//             // Align with DB schema section field values
//             export const SectionFieldValueSchema = z.object({
//                 id: z.string(),
//                 sectionItemId: z.string(),
//                 fieldId: z.string(),
//                 value: z.string(),
//             });

//             // Align with DB schema section items
//             export const SectionItemSchema = z.object({
//                 id: z.string(),
//                 sectionId: z.string(),
//                 displayOrder: z.number(),
//                 fieldValues: z.array(SectionFieldValueSchema).optional()
//             });

//             // Align with DB schema sections
//             export const SectionSchema = z.object({
//                 id: z.string(),
//                 resumeId: z.string(),
//                 title: z.string(),
//                 description: z.string().optional(),
//                 displayOrder: z.number(),
//                 allowMultiple: z.boolean().optional(),
//                 minItems: z.number().optional(),
//                 maxItems: z.number().optional(),
//                 fields: z.array(SectionFieldSchema).optional(),
//                 items: z.array(SectionItemSchema).optional()
//             });

//             // Main Resume Schema aligned with DB schema
//             export const ResumeSchema = z.object({
//                 id: z.string().optional(),
//                 userId: z.string().optional(),
//                 resumeTitle: z.string().default("Resume - $new Date().toLocaleDateString()"),
//                 fullName: z.string().min(1, "Full name is required"),
//                 email: z.string().email("Invalid email"),
//                 phone: z.string().optional(),
//                 location: z.string().optional(),
//                 summary: z.string().optional(),
//                 github: z.string().url("Invalid URL").optional(),
//                 linkedin: z.string().url("Invalid URL").optional(),
//                 portfolio: z.string().url("Invalid URL").optional(),
//                 sections: z.array(SectionSchema).optional()
//             });

//             LISTEN TO THE INSTRUCTIONS CAREFULLY.
//             1. THERE COULD BE GRAMMATICAL ERRORS IN THE RESUME DATA, FIX THEM (IN THE SECTIONS, ETC).
//             2. YOU NEED TO MODIFY THE RESUME DATA TO FIT THE JOB DESCRIPTION THINGS LIKE KEYWORDS. IN ORDER TO DO THIS, FOR EXAMPLE IF THERE IS A PROJECTS SECTION AND TRY TO FIND THE KEYWORDS IN THE JOB DESCRIPTION AND ADD THEM TO THE PROJECTS SECTION AND YOU MAY REDUCE THE NUMBER OF PROJECTS BASED ON THE ALIGNMENT WITH THE JOB DESCRIPTION. IF 3 PROJECTS ARE MENTIONED, KEEP IT TO 3 PROJECTS, IF 4, 5 OR MORE THEN LIMIT THEM 3 OR 4 AT THE RARITY.
//             3. IF THE JOB DESCRIPTION MENTIONS A SKILL, MAKE SURE IT IS MENTIONED IN THE RESUME (NOT TO VAGUELY DIFFERENT BUT IF SOMETHING SIMILAR IS THERE THEN ONLY DO THAT).
//             4. ALIGN THE WORK EXPERIENCE WITH THE JOB DESCRIPTION, AS IN 'DON'T FAKE IT' BUT QUANTIFY (IF POSSIBLE IN NUMBERS, PERCENTAGES ETC.) THE WORK EXPERIENCE TO MATCH THE JOB DESCRIPTION.
//             5. IF THE JOB DESCRIPTION MENTIONS A CERTAIN TECHNOLOGY, MAKE SURE IT IS MENTIONED IN THE RESUME, PREFERRABLY IN SKILLS OR IF A PROJECT MATCHES WITH THAT, IT WILL BE ALSO FINE.
//             6. YOU WILL NOT TAMPER WITH THE DATES.
//             7. THE MOST IMPORTANT THING IS THAT YOU WILL STICK TO THE RESUME SCHEMA (AS PROVIDED IN THE INPUT) AND WILL RETURN THE MODIFIED RESUME DATA IN THE SAME SCHEMA AND YOUR ONLY RESPONSE SHOULD BE THAT JSON AND THAT'S IT NO GREETINGS, NOTHING.
//             8. IF YOU ARE NOT SURE ABOUT SOMETHING, YOU CAN LEAVE IT AS IT IS.
//             9. DON'T INCREASE THE SIZE OF THE RESUME TOO SIGNIFICANTLY, NEITHER DECREASE IT TOO MUCH.
//             10. YOU NEED NOT TO WORRY ABOUT RESUME TITLE.
//             11. YOU MOVE A SECTION UP OR DOWN, IF IT MAKES SENSE ACCORDING TO THE JOB DESCRIPTION.
//             12. KEEP IDS OF THE SECTIONS, FIELDS, ETC. SAME AS THEY ARE.
//             YOU ARE A VERY CAPABLE AND HELPFUL AI, YOU CAN DO THIS.

//             THE USER HAS PROVIDED THE FOLLOWING RESUME DATA:
//             ${resumeData}.
//             YOU WILL NOT MODIFY THE PERSONAL DATA(SECTION) OF THE RESUME, EXCEPT FIXING GRAMMATICAL ERRORS IN THE PROFESSIONAL (IF THE SUMMARY PRESENT AT ALL, ELSE DON'T BOTHER TOUCHING IT).
//             YOU WILL NOT MODIFY THE SECTION TITLES.
//             HERE IS THE DETAILS OF THE JOB:
//             JOB ROLE: ${jobrole}.
//             JOB DESCRIPTION SUMMARY: ${JSON.stringify(description)}.
//         `
//     return prompt;
// }

/*

FOR BACKUP

       const prompt = `
            YOU ARE BEING PROVIDED WITH DETAILS BEST KNOWN TO THE USER. THE USER HAS PROVIDED DATA IN THE FOLLOWING SCHEMA.
            export interface SectionField {
                name: string;
                label: string;
                type: SectionFieldType;
                required?: boolean;
                fullWidth?: boolean;
                placeholder?: string;
                listType?: SectionFieldType;
                id?: string;
            }

            export interface SectionConfig {
                title: string;
                description?: string;
                fields: SectionField[];
                allowMultiple?: boolean;
                minItems?: number;
                maxItems?: number;
            }
            export const SectionFieldSchema = z.object({
                id: z.string().optional(),
                name: z.string(),
                label: z.string(),
                type: z.enum(["text", "date", "textarea", "link"]),
                required: z.boolean().optional(),
                fullWidth: z.boolean().default(true),
                placeholder: z.string().optional(),
                listType: z.enum(["text", "date", "textarea", "link"]).optional(),
                displayOrder: z.number()
            });

            // Align with SectionConfig interface and DB schema
            export const SectionConfigSchema = z.object({
                title: z.string(),
                description: z.string().optional(),
                fields: z.array(SectionFieldSchema),
                allowMultiple: z.boolean().optional(),
                minItems: z.number().optional(),
                maxItems: z.number().optional()
            });

            // Align with DB schema personal fields
            export const PersonalSchema = z.object({
                fullName: z.string().min(1, "Full name is required"),
                email: z.string().email("Invalid email"),
                phone: z.string().optional().transform(val => val === "" ? undefined : val),
                location: z.string().optional().transform(val => val === "" ? undefined : val),
                summary: z.string().optional().transform(val => val === "" ? undefined : val),
                github: z.string().url("Invalid URL").optional()
                    .transform(val => val === "" ? undefined : val),
                linkedin: z.string().url("Invalid URL").optional()
                    .transform(val => val === "" ? undefined : val),
                portfolio: z.string().url("Invalid URL").optional()
                    .transform(val => val === "" ? undefined : val),
            });

            // Align with DB schema section field values
            export const SectionFieldValueSchema = z.object({
                id: z.string(),
                sectionItemId: z.string(),
                fieldId: z.string(),
                value: z.string(),
            });

            // Align with DB schema section items
            export const SectionItemSchema = z.object({
                id: z.string(),
                sectionId: z.string(),
                displayOrder: z.number(),
                fieldValues: z.array(SectionFieldValueSchema).optional()
            });

            // Align with DB schema sections
            export const SectionSchema = z.object({
                id: z.string(),
                resumeId: z.string(),
                title: z.string(),
                description: z.string().optional(),
                displayOrder: z.number(),
                allowMultiple: z.boolean().optional(),
                minItems: z.number().optional(),
                maxItems: z.number().optional(),
                fields: z.array(SectionFieldSchema).optional(),
                items: z.array(SectionItemSchema).optional()
            });

            // Main Resume Schema aligned with DB schema
            export const ResumeSchema = z.object({
                id: z.string().optional(),
                userId: z.string().optional(),
                resumeTitle: z.string().default("Resume - $new Date().toLocaleDateString()"),
                fullName: z.string().min(1, "Full name is required"),
                email: z.string().email("Invalid email"),
                phone: z.string().optional(),
                location: z.string().optional(),
                summary: z.string().optional(),
                github: z.string().url("Invalid URL").optional(),
                linkedin: z.string().url("Invalid URL").optional(),
                portfolio: z.string().url("Invalid URL").optional(),
                sections: z.array(SectionSchema).optional()
            });                      

            LISTEN TO THE INSTRUCTIONS CAREFULLY.
            1. THERE COULD BE GRAMMATICAL ERRORS IN THE RESUME DATA, FIX THEM (IN THE SECTIONS, ETC).
            2. YOU NEED TO MODIFY THE RESUME DATA TO FIT THE JOB DESCRIPTION THINGS LIKE KEYWORDS. IN ORDER TO DO THIS, FOR EXAMPLE IF THERE IS A PROJECTS SECTION AND TRY TO FIND THE KEYWORDS IN THE JOB DESCRIPTION AND ADD THEM TO THE PROJECTS SECTION AND YOU MAY REDUCE THE NUMBER OF PROJECTS BASED ON THE ALIGNMENT WITH THE JOB DESCRIPTION. IF 3 PROJECTS ARE MENTIONED, KEEP IT TO 3 PROJECTS, IF 4, 5 OR MORE THEN LIMIT THEM 3 OR 4 AT THE RARITY.
            3. IF THE JOB DESCRIPTION MENTIONS A SKILL, MAKE SURE IT IS MENTIONED IN THE RESUME (NOT TO VAGUELY DIFFERENT BUT IF SOMETHING SIMILAR IS THERE THEN ONLY DO THAT).
            4. ALIGN THE WORK EXPERIENCE WITH THE JOB DESCRIPTION, AS IN 'DON'T FAKE IT' BUT QUANTIFY (IF POSSIBLE IN NUMBERS, PERCENTAGES ETC.) THE WORK EXPERIENCE TO MATCH THE JOB DESCRIPTION.
            5. IF THE JOB DESCRIPTION MENTIONS A CERTAIN TECHNOLOGY, MAKE SURE IT IS MENTIONED IN THE RESUME, PREFERRABLY IN SKILLS OR IF A PROJECT MATCHES WITH THAT, IT WILL BE ALSO FINE.
            6. YOU WILL NOT TAMPER WITH THE DATES.
            7. THE MOST IMPORTANT THING IS THAT YOU WILL STICK TO THE RESUME SCHEMA (AS PROVIDED IN THE INPUT) AND WILL RETURN THE MODIFIED RESUME DATA IN THE SAME SCHEMA AND YOUR ONLY RESPONSE SHOULD BE THAT JSON AND THAT'S IT NO GREETINGS, NOTHING.
            8. IF YOU ARE NOT SURE ABOUT SOMETHING, YOU CAN LEAVE IT AS IT IS.
            9. DON'T INCREASE THE SIZE OF THE RESUME TOO SIGNIFICANTLY, NEITHER DECREASE IT TOO MUCH.
            10. YOU NEED NOT TO WORRY ABOUT RESUME TITLE.
            11. YOU MOVE A SECTION UP OR DOWN, IF IT MAKES SENSE ACCORDING TO THE JOB DESCRIPTION.
            12. KEEP IDS OF THE SECTIONS, FIELDS, ETC. SAME AS THEY ARE.
            YOU ARE A VERY CAPABLE AND HELPFUL AI, YOU CAN DO THIS.
            
            THE USER HAS PROVIDED THE FOLLOWING RESUME DATA:
            ${JSON.stringify(resumeResponse.data)}.
            YOU WILL NOT MODIFY THE PERSONAL DATA(SECTION) OF THE RESUME, EXCEPT FIXING GRAMMATICAL ERRORS IN THE PROFESSIONAL (IF THE SUMMARY PRESENT AT ALL, ELSE DON'T BOTHER TOUCHING IT).
            YOU WILL NOT MODIFY THE SECTION TITLES.
            HERE IS THE DETAILS OF THE JOB:
            JOB ROLE: ${jobData.data.role}.
            JOB DESCRIPTION SUMMARY: ${JSON.stringify(jobData.data.jobDescriptionSummary)}.            
        `

 */
