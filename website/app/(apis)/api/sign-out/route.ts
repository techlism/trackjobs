import { validateRequest, lucia } from "@/lib/lucia"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    try {
        const { session } = await validateRequest()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await lucia.invalidateSession(session.id)

        const sessionCookie = lucia.createBlankSessionCookie()

        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            {
                ...sessionCookie.attributes,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict'
            }
        )

        return NextResponse.redirect(new URL("/"));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred while signing out";
        return NextResponse.redirect(new URL("/", req.url));
    }
}