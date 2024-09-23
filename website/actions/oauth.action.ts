// Server-side code (e.g., in an API route or Server Action)
"use server"
import { generateCodeVerifier, generateState } from "arctic";
import { google } from "@/lib/lucia/oauth"
import { cookies } from "next/headers";

export const createGoogleAuthorizationURL = async () => {
  try {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    cookies().set("codeVerifier", codeVerifier, {
      httpOnly: true,
    })

    cookies().set("state", state, {
      httpOnly: true,
    })

    const authorizationURL = await google.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email"],
      }
    )

    return {
      success: true,
      data: authorizationURL.toString(), // Convert URL to string
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: errorMessage,
    }
  }
}



