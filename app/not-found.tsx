import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <img
        src="/uploads/kamol.png"
        alt="Farmer Kamol"
        className="w-20 h-20 rounded-full mb-4 object-cover"
      />
      <h1 className="text-2xl font-bold text-green-800 mb-2">পেজটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-gray-500 mb-6 text-sm max-w-sm">
        আপনি যে পেজটি খুঁজছেন তা সরানো হয়েছে বা আর নেই। আমাদের শপ থেকে পছন্দের পণ্য দেখুন, অথবা আমাদের খামারের ভিডিও দেখুন।
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition"
        >
          হোমপেজে যান
        </Link>
        <Link
          href="/shop"
          className="border-2 border-green-700 text-green-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 transition"
        >
          শপ দেখুন
        </Link>
        <Link
          href="/media/video"
          className="border-2 border-green-600 text-green-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-50 transition"
        >
          ভিডিও দেখুন
        </Link>
      </div>
    </div>
  );
}