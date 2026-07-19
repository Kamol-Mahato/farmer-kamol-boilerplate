import Link from "next/link";
import Image from "next/image";
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center  px-2 text-center">
      <Image
        src="/uploads/kamol.png"
        alt="Farmer Kamol"
        width={80}
        height={80}
        className="w-14 h-14 rounded-full mb-3 object-cover"
      />
      <h1 className="text-2xl font-bold text-green-800 mb-2">পেজটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-gray-500 mb-4 text-sm max-w-sm">
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