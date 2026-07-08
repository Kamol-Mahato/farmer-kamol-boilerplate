import { safeJsonLd } from "@/lib/jsonLd"

export default function OrganizationSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Farmer Kamol",
      image: "https://www.farmerkamol.com/uploads/kamol.png",
      url: "https://www.farmerkamol.com",
      telephone: "+8801737939688",
      priceRange: "৫০-১৫০০ টাকা",
      address: {
        "@type": "PostalAddress",
        addressLocality: "রায়গঞ্জ",
        addressRegion: "সিরাজগঞ্জ",
        addressCountry: "BD",
      },
      description:
        "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি মধু, দেশি ঘি, সরিষার তেল ও চীন হাঁসের বাচ্চা সরবরাহকারী কৃষি ব্র্যান্ড।",
      sameAs: [
        "https://www.facebook.com/farmerkamol",
        "https://youtube.com/@FarmerKamol",
        "https://www.instagram.com/farmer.kamol",
        "https://www.tiktok.com/@farmer.kamol",
        "https://wa.me/8801737939688",
      ],geo: {
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
      slogan: "খামার থেকে আপনার দরজায়",
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