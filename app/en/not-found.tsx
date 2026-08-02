import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig"
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center  px-2 text-center">
      <Image
        src="/uploads/kamol.png"
        alt={siteConfig.brand.nameEn}
        width={80}
        height={80}
        className="w-20 h-20 rounded-full mb-4 object-cover"
      />
      <h1 className="text-2xl font-bold text-green-800 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6 text-sm max-w-sm">
        The page you're looking for has been moved or no longer exists. Browse our shop for your favorite products, or watch videos from our farm.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/en"
          className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition"
        >
          Go to Homepage
        </Link>
        <Link
          href="/en/shop"
          className="border-2 border-green-700 text-green-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 transition"
        >
          Visit Shop
        </Link>
        <Link
          href="/en/media/video"
          className="border-2 border-green-600 text-green-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-50 transition"
        >
          Watch Videos
        </Link>
      </div>
      </div>
  );
}