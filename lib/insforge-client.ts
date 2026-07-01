import { createBrowserClient } from "@insforge/sdk/ssr";

export const insforge = createBrowserClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

// The access token cookie is intentionally non-httpOnly so the client can read it
// directly for UI purposes (e.g. show/hide the Sign Out button) without a network
// round trip. This mirrors the same local JWT-expiry check proxy.ts already uses
// server-side — actual authorization is still enforced by InsForge on each API call.
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function getSessionUser(): { id: string; email?: string } | null {
  const token = getCookie("insforge_access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) return null;
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
