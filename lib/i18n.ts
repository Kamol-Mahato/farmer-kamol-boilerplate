export type Locale = "bn" | "en"

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith("/en") ? "en" : "bn"
}

// একটা বাংলা পাথকে (/shop) locale অনুযায়ী ঠিক করে দেয় (/en/shop বা /shop)
export function localizeHref(path: string, locale: Locale): string {
  if (locale === "bn") return path
  if (path === "/") return "/en"
  return `/en${path}`
}

// টগল বাটনের জন্য — এখনকার পাথ থেকে উল্টো ভাষার পাথ বের করে
// search: বর্তমান query string (যেমন "productId=123") — থাকলে নতুন পাথেও জুড়ে দেওয়া হয়,
// না হলে /order?productId=123 -> /en/order টগল করলে productId হারিয়ে যায়
export function switchLocalePath(pathname: string, targetLocale: Locale, search?: string): string {
  const isEn = pathname.startsWith("/en")
  let base: string
  if (targetLocale === "en") {
    base = isEn ? pathname : (pathname === "/" ? "/en" : `/en${pathname}`)
  } else {
    if (!isEn) {
      base = pathname
    } else {
      const stripped = pathname.replace(/^\/en/, "")
      base = stripped === "" ? "/" : stripped
    }
  }
  return search ? `${base}?${search}` : base
}