import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatZodErrors = (error: ZodError) => {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join('.');
    const message = err.message;
    if (!acc[path]) {
      acc[path] = [];
    }
    acc[path].push(message);
    return acc;
  }, {} as Record<string, string[]>);
};