"use client"
import { useRef, useState } from "react"

interface RichTextFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

const COLORS = [
  { label: "লাল", value: "#dc2626" },
  { label: "সবুজ", value: "#16a34a" },
  { label: "নীল", value: "#2563eb" },
  { label: "হলুদ", value: "#ca8a04" },
  { label: "কালো", value: "#000000" },
]

export default function RichTextField({
  value,
  onChange,
  placeholder,
  rows = 8,
}: RichTextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  function wrapSelection(before: string, after: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)

    const newValue = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newValue)

    // selection আবার ঠিক জায়গায় বসানোর জন্য (state update এর পর)
    requestAnimationFrame(() => {
      textarea.focus()
      const newStart = start + before.length
      const newEnd = newStart + selected.length
      textarea.selectionStart = newStart
      textarea.selectionEnd = newEnd
    })
  }

  function applyBold() {
    wrapSelection("<b>", "</b>")
  }

  function applyItalic() {
    wrapSelection("<i>", "</i>")
  }

  function applyColor(color: string) {
    wrapSelection(`<span style="color:${color}">`, "</span>")
    setShowColorPicker(false)
  }

  function applyLink() {
    const url = window.prompt("Link এর URL দিন (যেমন: https://youtube.com/...)")
    if (!url) return
    wrapSelection(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, "</a>")
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-visible focus-within:border-green-500">
      {/* Toolbar */}
      <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 px-2 py-1.5 rounded-t-lg">
        <button
          type="button"
          onClick={applyBold}
          title="Bold"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 font-bold text-sm text-gray-700"
        >
          B
        </button>
        <button
          type="button"
          onClick={applyItalic}
          title="Italic"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 italic text-sm text-gray-700"
        >
          I
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker((v) => !v)}
            title="Color"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-sm"
          >
            🎨
          </button>
          {showColorPicker && (
            <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => applyColor(c.value)}
                  title={c.label}
                  style={{ backgroundColor: c.value }}
                  className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition"
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={applyLink}
          title="Link"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-sm"
        >
          🔗
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 outline-none rounded-b-lg"
      />
    </div>
  )
}
