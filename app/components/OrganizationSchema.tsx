export default function OrganizationSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Farmer Kamol",
      image: "https://www.farmerkamol.com/uploads/kamol.png",
      url: "https://www.farmerkamol.com",
      telephone: "+8801737939688",
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
      ],
    }
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    )
  }