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
    whatsapp: "8801737939688",
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

  /** About পেজ — গল্প/মিশন (ক্লায়েন্ট বদলাবে) */
  about: {
    founderImage: "/uploads/kamol.png",
    headerImages: [
      "/uploads/header-1st-about.jpg",
      "/uploads/header-2nd-about.jpg",
      "/uploads/header-3rd-about.jpg",
    ],
    sectionImages: {
      integrated: "/uploads/about-1st-sub.jpg",
      livestock: "/uploads/about-2nd-sub.jpg",
      crops: "/uploads/about-3rd-sub.jpg",
    },
    storyIntroBn:
      "আমি কমল । বাংলা সাহিত্যে স্নাতক করেছি, কিন্তু আমার আসল পরিচয় বইয়ের পাতায় নয় — সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রামের মাটিতে। নিজেকে বলি \"মাটির মানুষ\" — ঢাকায় চাকরি করলেও শিকড় থেকে যায় গ্রামের মাঠে, খামারে।",
    storyBodyBn:
      "ঢাকায় কুরিয়ার কোম্পানিতে কাজ করার সময় দেখেছি, শহরের মানুষ কতটা মরিয়া এক বোতল খাঁটি মধু বা ভেজালমুক্ত ঘি খুঁজে পেতে। অথচ আমাদের গ্রামে এই প্রকৃতির আশীর্বাদগুলো হাতের কাছেই আছে। এই দূরত্ব ঘুচিয়ে দিতেই জন্ম হয়েছে এই ব্র্যান্ডের — সরাসরি খামার থেকে আপনার দরজায়, কোনো মধ্যস্থতাকারী ছাড়া।",
    missionBn:
      "খাঁটি, ভেজালমুক্ত ও স্বচ্ছ প্রক্রিয়ায় উৎপাদিত প্রাকৃতিক খাদ্যপণ্য সরাসরি কৃষকের ঘর থেকে বাংলাদেশের প্রতিটি ঘরে পৌঁছে দেওয়া।",
    visionBn: [
      "গ্রামীণ কৃষক ও খামারিদের জন্য নির্ভরযোগ্য বাজার তৈরি করা",
      "ভেজালমুক্ত খাঁটি পণ্য পৌঁছে দিয়ে ভেজালের বিরুদ্ধে প্রতিরোধ গড়ে তোলা",
      "আধুনিক কন্টেন্ট ও ই-কমার্সের মাধ্যমে কৃষিকাজকে নতুন প্রজন্মের কাছে আকর্ষণীয় করা",
      "একদিন সম্পূর্ণভাবে পরিবারের জমিতে ফিরে পুরোদমে কৃষিকাজ করা",
    ],
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

  /** localStorage কী — ক্লায়েন্ট সাইটে আলাদা রাখুন যাতে কার্ট মিক্স না হয় */
  storage: {
    cartKey: "fk_cart",
    cartDismissKey: "fk_cart_dismissed_at",
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
