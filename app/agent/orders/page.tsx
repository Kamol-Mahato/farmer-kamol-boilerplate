"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { generateCustomId } from "@/lib/orderUtils"
import { updateOrderStatus } from "@/lib/orderStatusClient"
import { getAllowedNextStatuses } from "@/lib/orderStatusRules"
import OrderDetailModal from "@/app/admin/orders/OrderDetailModal"

// TEMP minimal restore — full page restored next
export default function AgentOrdersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-800 mb-4">আমার অর্ডার সমূহ</h1>
      <p className="text-gray-600">পেজ রিস্টোর হচ্ছে... রিফ্রেশ করুন অথবা <Link className="text-blue-600 underline" href="/agent/orders">এখানে ক্লিক করুন</Link></p>
      <p className="mt-4 text-sm text-gray-500">যদি এই মেসেজ দেখেন, অপেক্ষা করুন — পূর্ণ পেজ শীঘ্রই ফিরে আসবে।</p>
    </div>
  )
}
