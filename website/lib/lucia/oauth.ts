// For now only supports Google OAuth2

import { Google } from "arctic"

export const google = new Google(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    process.env.GOOGLE_CLIENT_ID!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    process.env.GOOGLE_CLIENT_SECRET!,
        
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/google`
)