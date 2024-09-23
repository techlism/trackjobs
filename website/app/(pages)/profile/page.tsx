import { validateRequest } from "@/lib/lucia";
import { Profile } from "@/components/Profile";
import { redirect } from "next/navigation";
import db from "@/lib/database/client";
import { userTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

async function getUserEmail(userId: string) {
    const existingUser = await db.query.userTable.findFirst({
        where: (table) => eq(table.id, userId),
    });
    return existingUser?.email;
}

export default async function ProfilePage() {
  const { user } = await validateRequest();  
  if (!user) {
    return redirect("/sign-in");
  }
  const email = await getUserEmail(user.id);
  if (!email) {
    return redirect("/sign-in");
  }
  return <Profile user={{email}} />;
}