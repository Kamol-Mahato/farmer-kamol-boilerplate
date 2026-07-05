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
export function switchLocalePath(pathname: string, targetLocale: Locale): string {
  const isEn = pathname.startsWith("/en")
  if (targetLocale === "en") {
    if (isEn) return pathname
    return pathname === "/" ? "/en" : `/en${pathname}`
  } else {
    if (!isEn) return pathname
    const stripped = pathname.replace(/^\/en/, "")
    return stripped === "" ? "/" : stripped
  }
}