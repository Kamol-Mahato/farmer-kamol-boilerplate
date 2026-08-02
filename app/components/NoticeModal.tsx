"use client";
import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig"

export default function NoticeModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    const key = `${siteConfig.storage.cartKey}_notice_last_shown`
    const lastShown = localStorage.getItem(key);
    const twelveHours = 12 * 60 * 60 * 1000;
    if (!lastShown || Date.now() - parseInt(lastShown) > twelveHours) {
      setIsVisible(true);
      localStorage.setItem(key, Date.now().toString());
    }
  }, []);
  useEffect(() => {
    if (isPaused || !isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isPaused, isVisible]);
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 p-4">
      <div 
        className="bg-white p-8 rounded-2xl shadow-2xl relative max-w-lg w-full text-center border-4 border-green-700"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-6 text-gray-500 hover:text-black font-bold text-2xl"
        >
          ✕
        </button>
        <h3 className="text-2xl font-bold text-green-800 mb-4">স্বাগতম </h3>
        <p className="text-lg text-gray-700 leading-relaxed">
        {`${siteConfig.brand.name} ওয়েবসাইটে আপনাকে স্বাগতম — আমাদের সকল পণ্য এখানেই পাবেন। এখনই অর্ডার করুন! ধন্যবাদ।`}
        </p>
      </div>
    </div>
  );
}
