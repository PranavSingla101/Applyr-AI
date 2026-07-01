import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[560px] rounded-2xl border border-border bg-surface p-10 text-center shadow-[0px_4px_32px_rgba(0,0,0,0.08)]">
          <p className="text-[13px] text-text-secondary mb-1">Welcome to</p>
          <h1 className="text-[30px] font-bold text-text-primary tracking-tight mb-4">
            Applyr
          </h1>
          <p className="text-[15px] text-text-secondary">
            You&apos;re signed in as{" "}
            <span className="font-medium text-text-primary">{user.email}</span>.
          </p>
          <p className="mt-3 text-[13px] text-text-muted">
            This is a placeholder dashboard — job matching and application tools land here next.
          </p>
        </div>
      </main>
    </div>
  );
}
