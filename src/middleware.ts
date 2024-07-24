import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'es']

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
    const headers = { 'accept-language': request.headers.get('accept-language') || 'en-US,en;q=0.5' };
    const languages = new Negotiator({ headers }).languages()
    const locales = ['en', 'es']
    return match(languages, locales, "en")
}

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
        return auth
    }
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // Redirect if there is no locale
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}