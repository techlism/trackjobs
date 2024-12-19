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

export function generateRandomId() {
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => b.toString(36))
    .join('')
    .substring(0, 4);
  const timestampPart = Date.now().toString().slice(-6);
  return randomPart + timestampPart;
}