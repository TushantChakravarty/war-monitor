import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sb_session";

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySession(cookie: string, secret: string): Promise<boolean> {
  const parts = cookie.split("|");
  if (parts.length !== 3) return false;
  const [email, expiry, sig] = parts;
  if (Date.now() > parseInt(expiry, 10)) return false;
  const payload = `${email}|${expiry}`;
  const expected = await hmac(payload, secret);
  return expected === sig;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pass through login page and auth API routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? "change-me";
  const session = req.cookies.get(SESSION_COOKIE)?.value;

  if (!session || !(await verifySession(session, secret))) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
