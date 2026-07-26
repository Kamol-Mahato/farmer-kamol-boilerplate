"use client"
import { useEffect } from "react"

// ⌨️ পুরো সাইটজুড়ে: input বক্সে Enter চাপলে ফর্মের পরের input/textarea/select বক্সে ফোকাস চলে যাবে।
// textarea-তে Enter মানেই নতুন লাইন লেখা, তাই সেটাতে হাত দেওয়া হয় না।
export default function EnterKeyNav() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter") return
      const target = e.target as HTMLElement
      if (!target || target.tagName !== "INPUT") return

      const type = (target as HTMLInputElement).type
      if (["submit", "button", "checkbox", "radio", "file"].includes(type)) return

      const scope: Document | Element = target.closest("form") || document
      const focusable = Array.from(
        scope.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
        )
      ).filter((el) => el.offsetParent !== null)

      const index = focusable.indexOf(target)
      if (index === -1) return
      const next = focusable[index + 1]
      if (next) {
        e.preventDefault()
        next.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
  return null
}