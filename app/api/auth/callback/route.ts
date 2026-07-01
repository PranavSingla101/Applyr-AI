import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@insforge/sdk";
import { setAuthCookies } from "@insforge/sdk/ssr";
import { getPostHogClient } from "@/lib/posthog-server";

function getUserIdFromJWT(token: string): string | undefined {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );
    return payload.sub as string | undefined;
  } catch {
    return undefined;
  }
}

function fail(request: NextRequest, code: string, detail?: string | null) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: "anonymous",
    event: "oauth_login_failed",
    properties: { error_code: code, error_detail: detail ?? null },
  });
  const url = new URL("/login", request.url);
  url.searchParams.set("error", code);
  if (detail) url.searchParams.set("detail", detail);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("insforge_code");
  const oauthError = params.get("error");
  const oauthErrorDescription = params.get("error_description");

  // Log the full incoming callback so the real provider error is visible in the server console
  console.error("[auth/callback] incoming", {
    hasCode: !!code,
    oauthError,
    oauthErrorDescription,
    allParams: Object.fromEntries(params.entries()),
  });

  if (oauthError || !code) {
    return fail(request, oauthError ?? "no_code", oauthErrorDescription);
  }

  const cookieStore = await cookies();
  const redirectTo = cookieStore.get("insforge_redirect_to")?.value ?? "/dashboard";
  const codeVerifier = cookieStore.get("insforge_code_verifier")?.value;

  if (!codeVerifier) {
    return fail(request, "missing_verifier");
  }

  // isServerMode makes the exchange use the mobile endpoint, which returns the
  // refreshToken in the response body. Without it, the refresh token is only set
  // as an httpOnly cookie on the SDK's internal fetch and is lost — leaving us
  // unable to persist it, so proxy.ts's updateSession wipes the session on the
  // next request and bounces the user back to /login.
  const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    isServerMode: true,
  });

  const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.accessToken) {
    console.error("[auth/callback] code exchange failed", error);
    return fail(request, "exchange_failed", error?.message);
  }

  if (!data.refreshToken) {
    console.error("[auth/callback] exchange succeeded but no refreshToken in body", {
      hasAccessToken: !!data.accessToken,
    });
    return fail(request, "no_refresh_token");
  }

  const userId = getUserIdFromJWT(data.accessToken);
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId ?? "anonymous",
    event: "oauth_login_completed",
    properties: { redirect_to: redirectTo },
  });
  if (userId) {
    posthog.identify({ distinctId: userId });
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
