import db from "@/lib/database/client"
import { oauthAccountTable, userTable } from "@/lib/database/schema"
import { lucia } from "@/lib/lucia"
import { google } from "@/lib/lucia/oauth"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

interface GoogleUser {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  picture: string
  locale: string
}

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")

    if (!code || !state) {
      return Response.json({ error: "Invalid request" }, { status: 400 })
    }

    const codeVerifier = cookies().get("codeVerifier")?.value
    const savedState = cookies().get("state")?.value

    if (!codeVerifier || !savedState) {
      return Response.json({ error: "Code verifier or saved state is missing" }, { status: 400 })
    }

    if (savedState !== state) {
      return Response.json({ error: "State does not match" }, { status: 400 })
    }

    const { accessToken, idToken, accessTokenExpiresAt, refreshToken } =
      await google.validateAuthorizationCode(code, codeVerifier)

    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: "GET",
      }
    )

    const googleData = (await googleRes.json()) as GoogleUser

    await db.transaction(async (trx) => {
      const user = await trx.query.userTable.findFirst({
        where: eq(userTable.id, googleData.id),
      })

      if (!user) {
        const createdUserRes = await trx
          .insert(userTable)
          .values({
            email: googleData.email,
            id: googleData.id,
            provider: "google",
            isEmailVerified: googleData.verified_email,
          })
          .returning({ id: userTable.id })

        if (createdUserRes.length === 0) {
          throw new Error("Failed to create user")
        }

        await trx
          .insert(oauthAccountTable)
          .values({
            accessToken,
            expiresAt: Math.floor(accessTokenExpiresAt.getTime() / 1000), // Store as Unix timestamp
            id: googleData.id,
            provider: "google",
            providerUserId: googleData.id,
            userId: googleData.id,
            refreshToken,
          })
      } else {
        await trx
          .update(oauthAccountTable)
          .set({
            accessToken,
            expiresAt: Math.floor(accessTokenExpiresAt.getTime() / 1000), // Store as Unix timestamp
            refreshToken,
          })
          .where(eq(oauthAccountTable.id, googleData.id))

        await trx
          .update(userTable)
          .set({ isEmailVerified: googleData.verified_email })
          .where(eq(userTable.id, googleData.id))
      }
    })

    const session = await lucia.createSession(googleData.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    cookies().delete("state")
    cookies().delete("codeVerifier")

    return NextResponse.redirect(
      new URL("/dashboard", process.env.NEXT_PUBLIC_BASE_URL),
      { status: 302 }
    )
  } catch (error) {
    console.error("OAuth callback error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}