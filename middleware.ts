import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Adapt Next.js cookies to InsForge CookieStore shape
  const requestStore = {
    get: (name: string) => request.cookies.get(name)?.value,
    set: (nameOrOptions: any, val?: string, options?: any) => {
      if (typeof nameOrOptions === "object") {
        const { name, value, ...opts } = nameOrOptions;
        request.cookies.set(name, value);
        response.cookies.set(name, value, opts);
      } else {
        request.cookies.set(nameOrOptions, val!);
        response.cookies.set(nameOrOptions, val!, options);
      }
    },
    delete: (nameOrOptions: any) => {
      const name = typeof nameOrOptions === "object" ? nameOrOptions.name : nameOrOptions;
      request.cookies.delete(name);
      response.cookies.delete(name);
    }
  };

  const responseStore = {
    get: (name: string) => response.cookies.get(name)?.value,
    set: (nameOrOptions: any, val?: string, options?: any) => {
      if (typeof nameOrOptions === "object") {
        const { name, value, ...opts } = nameOrOptions;
        response.cookies.set(name, value, opts);
      } else {
        response.cookies.set(nameOrOptions, val!, options);
      }
    },
    delete: (nameOrOptions: any) => {
      const name = typeof nameOrOptions === "object" ? nameOrOptions.name : nameOrOptions;
      response.cookies.delete(name);
    }
  };

  const result = await updateSession({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    requestCookies: requestStore,
    responseCookies: responseStore,
  });

  const path = request.nextUrl.pathname;
  const isProtected = ["/dashboard", "/profile", "/find-jobs"].some((prefix) => 
    path === prefix || path.startsWith(prefix + "/")
  );

  // Redirect to login if path is protected and no access token is active
  if (isProtected && !result.accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged-in user hits /login
  if (path === "/login" && result.accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
