import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    
    const publicRoutes = ["/login", "/signup"];

    const currentPath = request.nextUrl.pathname;

    console.log(request.cookies)

    const token = request.cookies.get("accessToken")
    
    if (publicRoutes.includes(currentPath)) {
        return NextResponse.next();
    }

  
    if (!token?.value) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
