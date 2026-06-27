"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge-client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        const redirectTo = searchParams.get("redirectTo") || "/dashboard";

        if (error) {
          throw error;
        }

        if (data?.user) {
          router.replace(redirectTo);
        } else {
          router.replace("/login");
        }
      } catch (err: any) {
        console.error("[auth/callback]", err);
        router.replace(`/login?error=${encodeURIComponent(err?.message || "Authentication failed")}`);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
      <p className="text-sm font-medium text-text-secondary">Completing sign in...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background">
      <Suspense fallback={
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          <p className="text-sm font-medium text-text-secondary">Loading...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
