import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { createClient } from "@/lib/supabase-server";
import { UsersScreen } from "@/components/warung/users-screen";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in?redirect=/users");
  }

  const [profile] = await db
    .select({ role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, session.user.id));

  if (!profile || profile.role !== "owner") {
    redirect("/dashboard");
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <UsersScreen />
    </div>
  );
}
