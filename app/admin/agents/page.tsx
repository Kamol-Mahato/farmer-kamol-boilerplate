"use client"
import { useState, useEffect } from "react"

interface Agent {
  id: number
  name: string
  phone: string
  isActive: boolean
  createdAt: string
  totalOrders: number
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [resettingId, setResettingId] = useState<number | null>(null)
  const [resetResult, setResetResult] = useState<{ name: string; phone: string; password: string } | null>(null)

  function loadAgents() {
    fetch("/api/admin/agents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAgents()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "এজেন্ট তৈরি হয়নি")
        return
      }
      setName("")
      setPhone("")
      setPassword("")
      setShowForm(false)
      loadAgents()
    } catch {
      setError("সার্ভার এরর হয়েছে")
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(id: number, current: boolean) {
    await fetch(`/api/admin/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    loadAgents()
  }

  // 🔑 এজেন্টের জন্য নতুন পাসওয়ার্ড জেনারেট করা
  async function handleResetPassword(agentId: number, name: string, phone: string) {
    if (!confirm(`${name} (${phone}) এর জন্য নতুন পাসওয়ার্ড জেনারেট করতে চান?`)) return
    setResettingId(agentId)
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/reset-password`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "পাসওয়ার্ড রিসেট করা যায়নি")
        return
      }
      setResetResult({ name, phone, password: data.newPassword })
    } catch {
      alert("সার্ভার সমস্যা, আবার চেষ্টা করুন")
    } finally {
      setResettingId(null)
    }
  }

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        এজেন্ট ডেটা লোড হচ্ছে...
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-green-800">এজেন্ট ম্যানেজমেন্ট</h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-800 transition shadow-sm"
        >
          {showForm ? "✕ বন্ধ করুন" : "+ নতুন এজেন্ট যোগ করুন"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">নাম</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">মোবাইল নম্বর</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">পাসওয়ার্ড</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm sm:col-span-3">{error}</p>
          )}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-800 transition disabled:opacity-50"
            >
              {submitting ? "তৈরি হচ্ছে..." : "এজেন্ট তৈরি করুন"}
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          মোট এজেন্ট: <span className="font-bold text-green-800">{agents.length}</span> জন
        </p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[700px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">#</th>
              <th className="px-6 py-4 font-medium">নাম</th>
              <th className="px-6 py-4 font-medium">মোবাইল</th>
              <th className="px-6 py-4 font-medium">মোট অর্ডার</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">যোগদানের তারিখ</th>
              <th className="px-6 py-4 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  কোনো এজেন্ট পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              agents.map((agent, index) => (
                <tr
                  key={agent.id}
                  className={`transition hover:bg-gray-50/50 ${
                    !agent.isActive ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-gray-400 text-xs">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{agent.name}</td>
                  <td className="px-6 py-4 text-gray-600">{agent.phone}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
                      {agent.totalOrders} টি
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {agent.isActive ? (
                      <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full text-xs">
                        সক্রিয়
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full text-xs">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(agent.createdAt).toLocaleDateString("bn-BD")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(agent.id, agent.isActive)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          agent.isActive
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {agent.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      </button>
                      <button
                        onClick={() => handleResetPassword(agent.id, agent.name, agent.phone)}
                        disabled={resettingId === agent.id}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50"
                      >
                        {resettingId === agent.id ? "..." : "পাসওয়ার্ড রিসেট"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {resetResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-green-800 mb-2">নতুন পাসওয়ার্ড তৈরি হয়েছে</h2>
            <p className="text-sm text-gray-600 mb-4">
              {resetResult.name} ({resetResult.phone}) — এই পাসওয়ার্ডটা কপি করে এজেন্টকে WhatsApp/কলে জানিয়ে দিন। এটা আর দেখা যাবে না।
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                readOnly
                value={resetResult.password}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-center text-lg font-bold tracking-widest"
              />
              <button
                onClick={() => navigator.clipboard.writeText(resetResult.password)}
                className="bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-600"
              >
                কপি
              </button>
            </div>
            <button
              onClick={() => setResetResult(null)}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  )
}