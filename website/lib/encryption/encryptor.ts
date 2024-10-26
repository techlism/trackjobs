import { createCipheriv, randomBytes } from "node:crypto";

export function encrypt(data: string) {
    const rawKey = process?.env?.ENCRYPTION_KEY;
    if (!rawKey) {
        throw new Error("Encryption key not found");
    }
    
    try {
        const key = Buffer.from(rawKey, "utf8");
        if (key.length !== 32) {
            throw new Error("Invalid key length");
        }
        
        const iv = randomBytes(16);
        const cipher = createCipheriv("aes-256-cbc", key, iv);
        
        const encrypted = Buffer.concat([
            iv,
            cipher.update(Buffer.from(data, "utf8")),
            cipher.final()
        ]);
        
        return encrypted.toString("base64");
        // biome-ignore lint/suspicious/noExplicitAny: It's okay to return any here
        } catch (error : any) {
        throw new Error(`Encryption failed: ${error?.message || "An unknown error occurred"}`);
    }
}