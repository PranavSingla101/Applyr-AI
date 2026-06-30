import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  await updateSession({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestCookies: request.cookies as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseCookies: response.cookies as any,
  });

  const path = request.nextUrl.pathname;
  const isProtected = ["/dashboard", "/profile", "/find-jobs"].some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );

  const accessToken = response.cookies.get("insforge_access_token")?.value;

  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  if (path === "/login" && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
