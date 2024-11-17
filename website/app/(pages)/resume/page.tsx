import ResumeForm from '@/components/resume-builder/ResumeForm';
import fs from 'node:fs';
import { ServerHTMLJSONConverter } from 'html-json-converter/server';
interface HTMLNode {
    tag: string;
    attributes?: Record<string, string>;
    children?: (HTMLNode | string)[];
}

export default async function ResumePage() {
	const json = [
		{
			"tag": "section",
			"children": [
				{
					"tag": "h1",
					"children": [
						"Kundan"
					]
				},
				{
					"tag": "nav",
					"children": [
						{
							"tag": "a",
							"attributes": {
								"href": "mailto:email4kundanprasad@gmail.com"
							},
							"children": [
								"email4kundanprasad@gmail.com"
							]
						}
					]
				}
			]
		},
		{
			"tag": "section",
			"children": [
				{
					"tag": "h2",
					"children": [
						"Education"
					]
				},
				{
					"tag": "div",
					"children": [
						{
							"tag": "article",
							"children": [
								{
									"tag": "h3",
									"children": [
										"IIEST"
									]
								},
								{
									"tag": "p",
									"children": [
										"B.Tech IT"
									]
								},
								{
									"tag": "time",
									"children": [
										"December, 2021 - June, 2025"
									]
								},
								{
									"tag": "p",
									"children": [
										"7.6/10"
									]
								}
							]
						}
					]
				}
			]
		},
		{
			"tag": "section",
			"children": [
				{
					"tag": "h2",
					"children": [
						"Work Experience"
					]
				},
				{
					"tag": "div",
					"children": [
						{
							"tag": "article",
							"children": [
								{
									"tag": "h3",
									"children": [
										"Junior Mentor Intern"
									]
								},
								{
									"tag": "p",
									"children": [
										"GUVI"
									]
								},
								{
									"tag": "time",
									"children": [
										"October, 2022 - September, 2023"
									]
								},
								{
									"tag": "ul",
									"children": [
										{
											"tag": "li",
											"children": [
												"Taught something"
											]
										}
									]
								}
							]
						}
					]
				}
			]
		},
		{
			"tag": "section",
			"children": [
				{
					"tag": "h2",
					"children": [
						"Projects"
					]
				},
				{
					"tag": "div",
					"children": [
						{
							"tag": "article",
							"children": [
								{
									"tag": "h3",
									"children": [
										"TrackJobs"
									]
								},
								{
									"tag": "p",
									"children": [
										"• A full edged chrome extension (published in Chrome Store) to scrape all info about a job application.\n• NextJs app responsible for formatting correctly and extracting the job detail using ChatGPT’s api.\n• A personalized intuitive Kanban based Dashboard where a user can manage all their application’s status."
									]
								},
								{
									"tag": "nav",
									"children": [
										{
											"tag": "a",
											"attributes": {
												"href": "https://trackjobs.online"
											},
											"children": [
												"Live Demo"
											]
										},
										{
											"tag": "a",
											"attributes": {
												"href": "https://github.com/techlism/trackjobs"
											},
											"children": [
												"Repository"
											]
										}
									]
								}
							]
						}
					]
				}
			]
		},
		{
			"tag": "section",
			"children": [
				{
					"tag": "h2",
					"children": [
						"Skills"
					]
				},
				{
					"tag": "div",
					"children": [
						{
							"tag": "article",
							"children": [
								{
									"tag": "p",
									"children": [
										"skill: Programming Languages : JavaScript, Typescript, C++"
									]
								}
							]
						}
					]
				}
			]
		},
		{
			"tag": "section",
			"children": [
				{
					"tag": "h2",
					"children": [
						"Positions of Responsibility"
					]
				},
				{
					"tag": "div",
					"children": [
						{
							"tag": "article",
							"children": [
								{
									"tag": "p",
									"children": [
										"Web Development and Graphic Design Lead"
									]
								},
								"",
								"",
								{
									"tag": "p",
									"children": [
										"• Developed and deployed a full-scale production website using React, serving 400,000+ requests over 1 year.\n• Designed 10+ branding materials (logos, posters) to ensure a consistent visual identity."
									]
								}
							]
						}
					]
				}
			]
		},
		{
			"tag": "section",
			"children": [
				{
					"tag": "h2",
					"children": [
						"Certifications & Accomplishments"
					]
				},
				{
					"tag": "div",
					"children": [
						{
							"tag": "article",
							"children": [
								{
									"tag": "p",
									"children": [
										"Odoo Hackathon Finalist"
									]
								},
								"",
								{
									"tag": "p",
									"children": [
										"Ranked in the top 150 out of 2300+ participants in the Odoo Hackathon, advancing to the final round."
									]
								}
							]
						}
					]
				}
			]
		},
		{
			"tag": "section",
			"children": [
				{
					"tag": "h2",
					"children": [
						"Extra-Curricular Activities"
					]
				},
				{
					"tag": "div",
					"children": [
						{
							"tag": "article",
							"children": [
								{
									"tag": "p",
									"children": [
										"Content Creation"
									]
								}
							]
						}
					]
				}
			]
		}
	];
	const convertibleJSON : HTMLNode = {
		tag : 'main',
		children : json
	}
	const converter = new ServerHTMLJSONConverter();
	const htmlString = converter.toHTML(convertibleJSON);
	console.log(htmlString);
	return (
		<div className="flex justify-center items-center max-w-5xl md:mx-auto sm:mx-auto lg:mx-auto mx-4 my-6">
			<ResumeForm />
		</div>
	);
}
