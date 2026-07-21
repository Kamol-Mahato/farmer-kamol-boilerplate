"use client"
import { useState } from "react"

const SAMPLE_CSV = "Order ID,Amount,Status\nFK20260721001,850,DELIVERED\nFK20260721002,,CANCELLED\n"

interface RowResult {
  orderIdRaw: string
  success: boolean
  reason?: string
}

export default function AdminBulkUpdatePage() {
  const [fileName, setFileName] = useState("")
  const [rows, setRows] = useState<{ orderIdRaw: string; amount: string; status: string }[]>([])
  const [results, setResults] = useState<RowResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  function downloadSample() {
    const blob = new Blob(["\uFEFF" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sample_bulk_update.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResults(null)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      const parsed = lines.slice(1).map((line) => {
        const [orderIdRaw, amount, status] = line.split(",").map((s) => s.trim())
        return { orderIdRaw: orderIdRaw || "", amount: amount || "", status: status || "" }
      }).filter((r) => r.orderIdRaw)
      setRows(parsed)
    }
    reader.readAsText(file)
  }

  async function handleUpdate() {
    if (rows.length === 0) {
      alert("প্রথমে একটা CSV ফাইল আপলোড করুন")
      return
    }
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch("/api/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "আপডেট করা যায়নি")
        return
      }
      setResults(data.results)
    } catch {
      alert("সার্ভার সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-black mb-6">Bulk Order Update</h1>

      <div className="bg-white border border-black rounded-xl p-6 space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-800 mb-1">Sample file</p>
          <button onClick={downloadSample} className="text-sm underline text-black font-medium">
            Click here to download sample CSV file
          </button>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 mb-1">CSV file</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="border border-gray-400 rounded-lg text-sm w-full px-3 py-2"
          />
          {fileName && <p className="text-xs text-gray-500 mt-1">সিলেক্টেড: {fileName} ({rows.length}টি সারি পাওয়া গেছে)</p>}
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
        >
          {loading ? "আপডেট হচ্ছে..." : "Update"}
        </button>
      </div>

      {results && (
        <div className="bg-white border border-gray-300 rounded-xl p-6 mt-6">
          <h2 className="font-bold text-gray-800 mb-4">ফলাফল</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2">Order ID</th>
                <th className="py-2">স্ট্যাটাস</th>
                <th className="py-2">কারণ</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{r.orderIdRaw}</td>
                  <td className={`py-2 font-bold ${r.success ? "text-green-700" : "text-red-600"}`}>
                    {r.success ? "✅ সফল" : "❌ ব্যর্থ"}
                  </td>
                  <td className="py-2 text-gray-600">{r.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}