import { Globe, Linkedin } from "lucide-react";
import React from "react";

const companiesData = [
	{
		name: "TechFlow AI",
		amount: "$2.7M",
		stage: "Series A",
		hasWebsite: true,
		hasLinkedin: true,
	},
	{
		name: "GreenCart",
		amount: "$1.4M",
		stage: "Seed",
		hasWebsite: false,
		hasLinkedin: true,
	},
	{
		name: "PayWise",
		amount: "$5.3M",
		stage: "Series B",
		hasWebsite: true,
		hasLinkedin: true,
	},
	{
		name: "CloudSecure",
		amount: "$3.9M",
		stage: "Series A",
		hasWebsite: true,
		hasLinkedin: true,
	},
	{
		name: "RoboTech",
		amount: "$8.5M",
		stage: "Series B",
		hasWebsite: true,
		hasLinkedin: false,
	},
	{
		name: "CryptoFlow",
		amount: "$4.2M",
		stage: "Series A",
		hasWebsite: true,
		hasLinkedin: true,
	},
	{
		name: "SmartLogistics",
		amount: "$6.3M",
		stage: "Series B",
		hasWebsite: true,
		hasLinkedin: true,
	},
	{
		name: "AIConnect",
		amount: "$1.8M",
		stage: "Seed",
		hasWebsite: true,
		hasLinkedin: false,
	},
	{
		name: "CloudOps",
		amount: "$3.4M",
		stage: "Series A",
		hasWebsite: false,
		hasLinkedin: true,
	},
];

const DummyFundingTable = () => {
	return (
		<div className="w-full p-4 bg-background select-none">
			<div className="overflow-hidden rounded-lg border border-border">
				<table className="w-full text-sm">
					<thead className="bg-muted">
						<tr>
							<th className="p-3 text-left font-medium text-muted-foreground">
								Company
							</th>
							<th className="p-3 text-right font-medium text-muted-foreground">
								Amount
							</th>
							<th className="p-3 text-left font-medium text-muted-foreground">
								Stage
							</th>
							<th className="p-3 text-right font-medium text-muted-foreground">
								Links
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{companiesData.map((company, index) => (
							<tr key={company.name} className="bg-card hover:bg-muted/50">
								<td className="p-3 font-medium text-foreground">
									{company.name}
								</td>
								<td className="p-3 text-right text-primary font-medium">
									{company.amount}
								</td>
								<td className="p-3 text-muted-foreground">{company.stage}</td>
								<td className="p-3">
									<div className="flex gap-3 justify-end text-muted-foreground">
										{company.hasWebsite && (
											<Globe className="w-4 h-4 hover:text-primary cursor-pointer" />
										)}
										{company.hasLinkedin && (
											<Linkedin className="w-4 h-4 hover:text-primary cursor-pointer" />
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default DummyFundingTable;
