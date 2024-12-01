import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axiosInstance from "./app/utils/axiosInstance";

export function middleware(request: NextRequest) {
    
    const publicRoutes = ["/login", "/signup"];

    const currentPath = request.nextUrl.pathname;

    

    const accessToken = request.cookies.get("accessToken")
    const refreshToken = request.cookies.get("refreshToken")
    
    if (publicRoutes.includes(currentPath)) {
        
        return NextResponse.next();
    }

  
    if (!accessToken?.value) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }
    

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
