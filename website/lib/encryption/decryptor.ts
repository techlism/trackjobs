import { createDecipheriv, createCipheriv, randomBytes } from "node:crypto";

export function decrypt(data: string) {
    const rawKey = process?.env?.ENCRYPTION_KEY;
    if (!rawKey) {
        throw new Error("Encryption key not found");
    }
    try {
        const key = Buffer.from(rawKey, "utf8");        
        if (key.length !== 32) {            
            throw new Error("Invalid key length");
        }
        
        const dataBuffer = Buffer.from(data, "base64");
        if (dataBuffer.length < 16) {
            throw new Error("Invalid encrypted data");
        }
        
        const iv = dataBuffer.subarray(0, 16);
        const encrypted = dataBuffer.subarray(16);
        
        const decipher = createDecipheriv("aes-256-cbc", key, iv);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]).toString("utf8");
        
        return decrypted;
    // biome-ignore lint/suspicious/noExplicitAny: It's okay to return any here
    } catch (error : any) {
        throw new Error(`Decryption failed: ${error?.message || "An unknown error occurred"}`);
    }
}

