"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const DarkModeSwitch = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (!theme) setTheme("dark");
	}, [theme, setTheme]);

	if (!mounted) return null;

	const themes = [
		{ id: "light", icon: Sun, color: "text-amber-600" },
		{ id: "system", icon: Monitor, color: "text-primary" },
		{ id: "dark", icon: Moon, color: "text-blue-500" },
	] as const;

	return (
		<div className="inline-flex items-center bg-background/40 rounded-lg p-2 backdrop-blur-sm border-2 border-border/45 shadow-md">
			{themes.map(({ id, icon: Icon, color }) => (
				<button
					type="button"
					key={id}
					onClick={() => setTheme(id)}
					className={`
						flex items-center justify-center p-2 rounded-md transition-all duration-200 ease-in-out
            			${theme === id ? "bg-background border border-border/65" : "hover:bg-background/50"}
            			${theme === id ? "scale-105" : "scale-100"}
            			${id !== "light" ? "ml-1" : ""}`}
					aria-label={`Switch to ${id} theme`}
				>
					<Icon
						className={`
							w-4 h-4 transition-all duration-100 ease-in-out
							${theme === id ? color : "text-foreground/60"}
							${theme === id ? "scale-110" : "scale-100"}`}
					/>
				</button>
			))}
		</div>
	);
};

export default DarkModeSwitch;
