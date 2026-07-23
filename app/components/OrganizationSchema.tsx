import { safeJsonLd } from "@/lib/jsonLd"

export default function OrganizationSchema({ lang }: { lang: "bn" | "en" }) {
  const isEn = lang === "en"

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Farmer Kamol",
    image: "https://farmerkamol.com/uploads/kamol.png",
    url: isEn ? "https://farmerkamol.com/en" : "https://farmerkamol.com",
    telephone: "+8801737939688",
    priceRange: "৳50-৳3000",
    address: {
      "@type": "PostalAddress",
      addressLocality: isEn ? "Raiganj" : "রায়গঞ্জ",
      addressRegion: isEn ? "Sirajganj" : "সিরাজগঞ্জ",
      addressCountry: "BD",
    },
    description: isEn
      ? "Agro-commerce brand based in Raiganj, Sirajganj, Bangladesh, supplying pure honey, ghee, mustard oil, and Chinese duck chicks directly from the farm."
      : "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি মধু, দেশি ঘি, সরিষার তেল ও চীন হাঁসের বাচ্চা সরবরাহকারী কৃষি ব্র্যান্ড।",
    sameAs: [
      "https://www.facebook.com/farmerkamol",
      "https://youtube.com/@FarmerKamol",
      "https://www.instagram.com/farmer.kamol",
      "https://www.tiktok.com/@farmer.kamol",
      "https://wa.me/8801737939688",
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: 24.53776236620221,
      longitude: 89.40731198780867,
    },
    foundingDate: "2026",
    founder: {
      "@type": "Person",
      name: "Kamol Kumar Mahato",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      opens: "00:00",
      closes: "23:59",
    },
    slogan: isEn ? "From the Farm to Your Door" : "খামার থেকে আপনার দরজায়",
    paymentAccepted: "Cash on Delivery, bKash, Nagad",
    currenciesAccepted: "BDT",
    areaServed: "Bangladesh",
    knowsLanguage: ["bn", "en"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  )
}