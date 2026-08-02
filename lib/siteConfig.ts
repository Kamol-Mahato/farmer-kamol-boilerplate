// lib/siteConfig.ts
// এই ফাইলটাই siteConfig — নতুন ক্লায়েন্ট সাইটের জন্য প্রথমে শুধু এই ফাইল + .env বদলান

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
      accountName: "",
      accountNumber: "",
      bankName: "",
      branch: "",
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
    /** WhatsApp wa.me ফরম্যাট — দেশ কোডসহ, + চিহ্ন ছাড়া */
    whatsapp: "8801737939688",
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
    /** অর্ডার আইডি প্রিফিক্স — যেমন FK20260803001 */
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

  // লাইভ চ্যাট UI টেক্সট (সিস্টেম মেসেজ DB-তে থাকতে পারে; UI লেবেল এখান থেকে)
  chat: {
    supportTitle: "Farmer Kamol Support",
    onlineTooltip: "👋 আমরা এখন অনলাইনে আছি, যেকোনো কিছু জিজ্ঞাসা করুন!",
    inputPlaceholder: "আপনার প্রশ্নটি লিখুন...",
    agentLabel: "এজেন্ট",
    supportLabel: "সাপোর্ট",
  },

  // থিম (CSS-এ ধীরে ব্যবহার করা যাবে)
  theme: {
    primary: "#055a36",
    primaryHover: "#034026",
  },

  // অ্যানালিটিক্স — খালি রাখলে GA লোড হবে না
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  },
} as const

export type SiteConfig = typeof siteConfig
