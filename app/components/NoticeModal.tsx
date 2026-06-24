"use client";
import { useState, useEffect } from "react";

export default function NoticeModal() {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return; // পজ থাকলে টাইমার চলবে না

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPaused]); // isPaused পরিবর্তন হলে ইফেক্টটি আবার চেক করবে

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 p-4">
      {/* মাউস বা টাচ করলে পজ হবে */}
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
        " Farmer Kamol " ওয়েব সাইটে আপনাকে স্বাগতম ,  আমাদের সব পণ্য গুলো এখানে পেয়ে যাবেন !এখনই অর্ডার করুন!একই সাথে আমাদের ভিডিও গুলো এখানেই দেখতে পারবেন। "ধন্যবাদ "
        </p>
      </div>
    </div>
  );
}