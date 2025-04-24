import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

// Define public and private route patterns
const AUTH_PAGES = ["/login", "/signup", "/forgotpassword", "/verify_email", "/resetpassword"];
const PRIVATE_PAGES = ["/home", "/settings"];

// Helper to verify JWT expiration
function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeJwt(token) as { exp?: number };
    if (!decoded || !decoded.exp) return false;
    return Date.now() < decoded.exp * 1000; // Check if token is still valid
  } catch {
    return false; // Invalid token
  }
} 
   
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const idToken = req.cookies.get("id_token")?.value;
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isPrivatePage = PRIVATE_PAGES.some((page) => pathname.startsWith(page));
  const isAuthenticated = idToken && isTokenValid(idToken);

  // If user is authenticated and on an auth page, redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user is NOT authenticated and on a private page, redirect to login
  if (!isAuthenticated && isPrivatePage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
