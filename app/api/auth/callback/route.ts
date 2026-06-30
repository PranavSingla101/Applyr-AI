import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@insforge/sdk";
import { setAuthCookies } from "@insforge/sdk/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError || !code) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const cookieStore = await cookies();
  const redirectTo = cookieStore.get("insforge_redirect_to")?.value ?? "/dashboard";
  const codeVerifier = cookieStore.get("insforge_code_verifier")?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=missing_verifier", request.url));
  }

  const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  });

  const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.accessToken) {
    console.error("[auth/callback] code exchange failed", error);
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  setAuthCookies(response.cookies, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  response.cookies.delete("insforge_code_verifier");
  response.cookies.delete("insforge_redirect_to");

  return response;
}
