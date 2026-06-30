import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@insforge/sdk";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") ?? "/dashboard";

  if (!provider) {
    return NextResponse.redirect(new URL("/login?error=missing_provider", request.url));
  }

  const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  });

  const callbackUrl = new URL("/api/auth/callback", request.url).toString();

  const { data, error } = await insforge.auth.signInWithOAuth(provider, {
    redirectTo: callbackUrl,
    skipBrowserRedirect: true,
  });

  if (error || !data?.url) {
    console.error("[auth/login] OAuth init failed", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const cookieStore = await cookies();

  // Store redirectTo separately — not in the callback URL — to match the bare URL in allowedRedirectUrls
  cookieStore.set("insforge_redirect_to", redirectTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  if (data.codeVerifier) {
    cookieStore.set("insforge_code_verifier", data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }

  return NextResponse.redirect(data.url);
}
