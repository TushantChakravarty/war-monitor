import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const expectedEmail = process.env.AUTH_EMAIL ?? "";
  const expectedHash = process.env.AUTH_PASSWORD_HASH ?? "";
  const secret = process.env.AUTH_SECRET ?? "change-me";

  const passwordHash = await sha256(password);

  if (!expectedEmail || !expectedHash || email !== expectedEmail || passwordHash !== expectedHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const expiry = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${email}|${expiry}`;
  const sig = await hmac(payload, secret);
  const cookieValue = `${payload}|${sig}`;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
