// import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  '/ocr/:path*',
  '/translate/:path*',
  '/profile/:path*',
  '/settings/:path*',
  '/history/:path*',
  '/report/:path*',
];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  // console.log("token", token)
  // console.log("pathname", req.nextUrl.pathname)

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/ocr/:path*',
    '/translate/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/history/:path*',
    '/report/:path*',
  ],
};
