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

	type themes = "light" | "dark" | "system";

	const cycleTheme = (theme: themes) => {
		setTheme(theme);
	};

	return (
		<div className="grid grid-cols-3 items-center rounded-lg border">
			<button type="button" onClick={() => cycleTheme("light")} className="p-1 flex items-center justify-center h-full">
				<Sun
					className={`${theme === "light" ? "text-yellow-500 h-6 w-6" : "text-gray-100 h-5 w-5"} transition-all duration-300`}
				/>
			</button>
			<button type="button" onClick={() => cycleTheme("system")} className="border-r border-l p-1 flex items-center justify-center h-full">
				<Monitor
					className={`${theme === "system" ? "text-neutral-400 h-6 w-6" : "text-gray-100 h-5 w-5"} transition-all duration-300`}
				/>
			</button>
			<button type="button" onClick={() => cycleTheme("dark")} className="p-1 flex items-center justify-center h-full">
				<Moon
					className={`${theme === "dark" ? "text-blue-400 h-6 w-6" : "text-gray-100 h-5 w-5"} transition-all duration-300`}
				/>
			</button>
		</div>
	);
};

export default DarkModeSwitch;