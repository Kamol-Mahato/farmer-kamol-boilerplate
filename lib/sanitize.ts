import DOMPurify from "isomorphic-dompurify"

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "span", "a", "br"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  })
}