// lib/siteConfig.ts
// এই ফাইলটাই siteConfig — প্রতিটা ক্লায়েন্ট সাইটের জন্য শুধু এই একটা ফাইল বদলালেই হবে

export const siteConfig = {
    // ব্র্যান্ড পরিচিতি
    brand: {
      name: "Farmer Kamol",
      nameEn: "Farmer Kamol",
      slogan: "খামার থেকে আপনার দরজায়",
      sloganEn: "From the Farm to Your Door",
      founderName: "Kamol Kumar Mahato",
      founderNameBn: "কমল কুমার মাহাতো",
      youtubeHandle: "@FarmerKamol",
      foundingYear: "2026",
    },

    // পেমেন্ট সংক্রান্ত তথ্য
  payment: {
    bkashNumber: "01737939688",
    nagadNumber: "01737939688",
    bank: {
      accountName: "",       // এখনো যোগ করা হয়নি
      accountNumber: "",     // এখনো যোগ করা হয়নি
      bankName: "",          // এখনো যোগ করা হয়নি
      branch: "",            // এখনো যোগ করা হয়নি
    },
  },
  
    // ডোমেইন ও URL
    domain: {
        url: "https://farmerkamol.com",
        host: "farmerkamol.com",
        ogImage: "/uploads/og-image.jpg",
        logo: "/uploads/kamol.png",
      },
  
    // যোগাযোগ তথ্য
    contact: {
      phone: "+8801737939688",
      phoneDisplay: "01737939688",
      whatsapp: "88017379396888",
    },
  
    // ঠিকানা
    address: {
      locality: "রায়গঞ্জ",
      localityEn: "Raiganj",
      region: "সিরাজগঞ্জ",
      regionEn: "Sirajganj",
      village: "সারইল",
      villageEn: "Sarail",
      country: "BD",
      latitude: 24.53776236620221,
      longitude: 89.40731198780867,
    },
  
    // সোশ্যাল লিংক
    social: {
      facebook: "https://www.facebook.com/farmerkamol",
      youtube: "https://youtube.com/@FarmerKamol",
      instagram: "https://www.instagram.com/farmer.kamol",
      tiktok: "https://www.tiktok.com/@farmer.kamol",
    },
  
    // মেটাডেটা / SEO
    seo: {
      defaultTitle: "Farmer Kamol - খামার থেকে আপনার দরজায়",
      titleTemplate: "%s | Farmer Kamol",
      description: "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্য মূল্যে।",
      descriptionEn:
        "Agro-commerce brand based in Raiganj, Sirajganj, Bangladesh, supplying pure honey, ghee, mustard oil, and Chinese duck chicks directly from the farm.",
      keywords: [
        "খাঁটি মধু",
        "সরিষার তেল",
        "দেশি ঘি",
        "চীন হাঁসের বাচ্চা",
        "সিরাজগঞ্জ খামার",
        "Farmer Kamol",
      ],
    },
  
    // ব্যবসায়িক তথ্য
    business: {
        priceRange: "৳50-৳3000",
        paymentAccepted: "Cash on Delivery, bKash, Nagad",
        currenciesAccepted: "BDT",
        orderIdPrefix: "FK", // FK-YYYY-MM-DD-00001
        openingHours: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59",
        },
      },
  
    // অ্যানালিটিক্স
    analytics: {
      gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    },
  } as const
  
  export type SiteConfig = typeof siteConfig