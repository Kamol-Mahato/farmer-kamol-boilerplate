// lib/siteConfig.ts
// এই ফাইলটাই siteConfig — নতুন ক্লায়েন্ট সাইটের জন্য প্রথমে শুধু এই ফাইল + .env বদলান

export const siteConfig = {
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

  payment: {
    bkashNumber: "01737939688",
    nagadNumber: "01737939688",
    bank: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      branch: "",
    },
  },

  domain: {
    url: "https://farmerkamol.com",
    host: "farmerkamol.com",
    ogImage: "/uploads/og-image.jpg",
    logo: "/uploads/kamol.png",
  },

  contact: {
    phone: "+8801737939688",
    phoneDisplay: "01737939688",
    /** WhatsApp wa.me — দেশ কোডসহ, + ছাড়া */
    whatsapp: "8801737939688",
    /** ব্যবসায়িক / আলাদা লাইন (ঐচ্ছিক) */
    businessPhoneDisplay: "01521406139",
    businessWhatsapp: "8801521406139",
  },

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
    /** Google Maps শেয়ার লিংক */
    mapsUrl: "https://maps.app.goo.gl/m6P53sDikkd5GE6g6",
  },

  social: {
    facebook: "https://www.facebook.com/farmerkamol",
    youtube: "https://youtube.com/@FarmerKamol",
    instagram: "https://www.instagram.com/farmer.kamol",
    tiktok: "https://www.tiktok.com/@farmer.kamol",
  },

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

  /** টপ মার্কুই / অ্যানাউন্সমেন্ট — পণ্য লাইন */
  announcement: {
    productLineBn: "খাঁটি মধু - ঘি - সরিষার তেল ও হাঁসের বাচ্চা",
    productLineEn: "Pure Honey, Ghee, Mustard oil & Duck Chicks",
  },

  footer: {
    descriptionBn:
      "সমন্বিত কৃষির মাধ্যমে প্রাকৃতিক ও স্বাস্থ্যকর খাদ্যপণ্য সরাসরি আপনার কাছে পৌঁছে দিচ্ছি।",
    descriptionEn:
      "Delivering natural, healthy food straight from our integrated farm to your doorstep.",
    productCategoriesBn: ["মধু", "ঘি", "সরিষার তেল", "চীনা হাঁসের বাচ্চা"],
    productCategoriesEn: ["Honey", "Ghee", "Mustard Oil", "Duck Chicks"],
  },

  business: {
    priceRange: "৳50-৳3000",
    paymentAccepted: "Cash on Delivery, bKash, Nagad",
    currenciesAccepted: "BDT",
    orderIdPrefix: "FK",
    openingHours: {
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  },

  chat: {
    supportTitle: "Farmer Kamol Support",
    onlineTooltip: "👋 আমরা এখন অনলাইনে আছি, যেকোনো কিছু জিজ্ঞাসা করুন!",
    inputPlaceholder: "আপনার প্রশ্নটি লিখুন...",
    agentLabel: "এজেন্ট",
    supportLabel: "সাপোর্ট",
  },

  theme: {
    primary: "#055a36",
    primaryHover: "#034026",
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  },
} as const

export type SiteConfig = typeof siteConfig
