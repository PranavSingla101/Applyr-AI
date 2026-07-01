import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient, clearAuthCookies } from "@insforge/sdk/ssr";

export async function POST() {
  const cookieStore = await cookies();

  const insforge = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cookies: cookieStore as any,
  });

  await insforge.auth.signOut();

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response.cookies);

  return response;
}
