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
		<div className="p-1 grid grid-cols-3 items-center gap-3 rounded-lg">
			<button onClick={() => cycleTheme("light")}>
				<Sun
					className={`${theme === "light" ? "text-yellow-500 h-7 w-7" : "text-gray-100 h-6 w-6"} transition-all duration-300`}
				/>
			</button>
			<button onClick={() => cycleTheme("system")}>
				<Monitor
					className={`${theme === "system" ? "text-blue-500 h-7 w-7" : "text-gray-100 h-6 w-6"} transition-all duration-300`}
				/>
			</button>
			<button onClick={() => cycleTheme("dark")}>
				<Moon
					className={`${theme === "dark" ? "text-gray-700 h-7 w-7" : "text-gray-100 h-6 w-6"} transition-all duration-300`}
				/>
			</button>
		</div>
	);
};

export default DarkModeSwitch;