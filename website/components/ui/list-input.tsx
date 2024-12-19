// components/ui/list-input.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/utils";

interface ListInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	onBlur?: () => void;
	placeholder?: string;
	className?: string;
}

export function ListInput({
	value,
	onChange,
	onBlur,
	placeholder,
	className,
}: ListInputProps) {
	const [currentInput, setCurrentInput] = useState("");

	const handleAddItem = () => {
		if (currentInput.trim()) {
			onChange([...value, currentInput.trim()]);
			setCurrentInput("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddItem();
		}
	};

	const handleRemoveItem = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex gap-2">
				<Input
					value={currentInput}
					onChange={(e) => setCurrentInput(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={onBlur}
					placeholder={placeholder}
					className="flex-1"
				/>
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={handleAddItem}
					disabled={!currentInput.trim()}
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>
			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((item, index) => (
						<div
							key={`list-input-${item}-${
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								index
							}`}
							className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm group"
						>
							<span>{item}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={() => handleRemoveItem(index)}
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
