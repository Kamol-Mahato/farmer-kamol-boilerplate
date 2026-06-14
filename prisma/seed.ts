import { PrismaClient, Role, OrderSource, OrderStatus, PaymentMethod, PaymentStatus, WalletTxnType, DiscountType } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔄 প্রিসমা ডাটাবেসে পুরো ই-কমার্স ইকোসিস্টেম সীড করা শুরু হচ্ছে...')

  // ⚠️ ডুপ্লিকেট এবং ফরেন-কী এরর এড়াতে আগের সব টেবিলের ডেটা ক্রমানুসারে ডিলিট করা
  await prisma.agentLog.deleteMany()
  await prisma.walletTransaction.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.courierSummary.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.productReview.deleteMany()
  await prisma.productPackagingRecipe.deleteMany()
  await prisma.packagingMaterial.deleteMany()
  await prisma.productBatch.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.navigationMenu.deleteMany()
  await prisma.systemControlCenter.deleteMany()
  await prisma.user.deleteMany()

  // -------------------------------------------------------------
  // ১. সিস্টেম কন্ট্রোল সেন্টার (System Control Center Setup)
  // -------------------------------------------------------------
  await prisma.systemControlCenter.create({
    data: {
      id: 1,
      enableOtpForGuest: false,
      defaultLanguage: "BN",
      heroYoutubeUrl: "https://youtube.com",
      maskCustomerData: false,
      disableLiveCourierAPI: true,
      paperSizeMode: "POS",
      invoicePrefix: "FK",
      useFreeWhatsAppOnly: true,
      useGoogleSMTP: true,
    }
  })

  // -------------------------------------------------------------
  // ২. ইউজার তৈরি করা (Admin, Agent, Customer Roles)
  // -------------------------------------------------------------
  // পাসওয়ার্ড হিসেবে ডামি হ্যাশ ব্যবহার করা হলো (১ থেকে ৬ পাসওয়ার্ড)
  const fakePasswordHash = "$2a$10$eImiTXuWVxfM37uY4JANjOqF6.tTuxCInXzJ096Doz9yC2XQpYJ9a"

  const superAdmin = await prisma.user.create({
    data: { name: "Farmer Kamol (Admin)", phone: "01700000001", password: fakePasswordHash, role: Role.SUPER_ADMIN, walletBalance: 5000.0 }
  })

  const agent = await prisma.user.create({
    data: { name: "Rahat Ahmed (Agent Panel)", phone: "01700000002", password: fakePasswordHash, role: Role.AGENT, walletBalance: 1500.0 }
  })

  const customer = await prisma.user.create({
    data: { name: "Prity Mahato (Customer)", phone: "01700000003", password: fakePasswordHash, role: Role.CUSTOMER, walletBalance: 200.0 }
  })

  // -------------------------------------------------------------
  // ৩. নেভিগেশন মেনু ডাটা (Dynamic Navbar System)
  // -------------------------------------------------------------
  const shopMenu = await prisma.navigationMenu.create({
    data: { title: 'শপ', url: '/shop', displayOrder: 1, isVisible: true }
  })
  const blogMenu = await prisma.navigationMenu.create({
    data: { title: 'ব্লগ', url: '/blog', displayOrder: 2, isVisible: true }
  })
  await prisma.navigationMenu.create({
    data: { title: 'মিডিয়া', url: '/media', displayOrder: 3, isVisible: true }
  })
  await prisma.navigationMenu.create({
    data: { title: 'আমাদের সম্পর্কে', url: '/about', displayOrder: 4, isVisible: true }
  })
  await prisma.navigationMenu.create({
    data: { title: 'যোগাযোগ', url: '/contact', displayOrder: 5, isVisible: true }
  })

  // ব্লগের ড্রপডাউন সাব-মেনু
  await prisma.navigationMenu.createMany({
    data: [
      { title: 'খামারের গল্প', url: '/blog/organic-farming', displayOrder: 1, isVisible: true, parentId: blogMenu.id },
      { title: 'খাঁটি পণ্য চেনার উপায়', url: '/blog/health-tips', displayOrder: 2, isVisible: true, parentId: blogMenu.id },
      { title: 'স্বাস্থ্যকর লাইফস্টাইল', url: '/blog/recipes', displayOrder: 3, isVisible: true, parentId: blogMenu.id },
    ]
  })

  // -------------------------------------------------------------
  // ৪. ক্যাটাগরি ও সাব-ক্যাটাগরি তৈরি (Categories with Multi-layer relation)
  // -------------------------------------------------------------
  const honeyCat = await prisma.category.create({
    data: { name: "প্রাকৃতিক মধু", slug: "natural-honey", displayOrder: 1, isVisible: true }
  })
  const dairyCat = await prisma.category.create({
    data: { name: "দুগ্ধজাত পণ্য", slug: "dairy-products", displayOrder: 2, isVisible: true }
  })
  const oilCat = await prisma.category.create({
    data: { name: "খাঁটি তেল সমূহ", slug: "pure-oils", displayOrder: 3, isVisible: true }
  })

  // দুগ্ধজাত পণ্যের নিচে ১টি সাব-ক্যাটাগরি তৈরি
  const gheeSubCat = await prisma.category.create({
    data: { name: "গাওয়া ঘি", slug: "gawa-ghee", displayOrder: 1, isVisible: true, parentId: dairyCat.id }
  })
  // -------------------------------------------------------------
  // ৫. পণ্য ও ছবির ডাটা (Products, Images, Batches & Packaging Recipes)
  // -------------------------------------------------------------
  // পণ্য ১: মধু
  const honeyProduct = await prisma.product.create({
    data: {
      name: "সুন্দরবনের খাঁটি মধু",
      slug: "sundarban-khati-modhu",
      description: "খামার থেকে সংগৃহীত শতভাগ খাঁটি ও প্রাকৃতিক সুন্দরবনের মধু।",
      categoryId: honeyCat.id,
      pricePerUnit: 650,
      unit: "৫০০ গ্রাম",
      stockQty: 50,
      isFeatured: true,
      isActive: true
    }
  })
  await prisma.productImage.create({
    data: { productId: honeyProduct.id, imageUrl: "/uploads/honey.jpg", isPrimary: true }
  })
  await prisma.productBatch.create({
    data: {
      productId: honeyProduct.id,
      batchNumber: "BATCH-HONEY-01",
      productionDate: new Date("2026-05-01"),
      expiryDate: new Date("2028-05-01"),
      quantityProduced: 50,
      notes: "তাজা সংগৃহীত সুন্দরবনের প্রথম লটের মধু।"
    }
  })

  // পণ্য ২: ঘি
  const gheeProduct = await prisma.product.create({
    data: {
      name: "গাওয়া ঘি (দেশি গরুর)",
      slug: "gawa-ghee-deshi-goru",
      description: "সম্পূর্ণ ঐতিহ্যবাহী নিয়মে তৈরি দেশি গরুর দুধের খাঁটি গাওয়া ঘি।",
      categoryId: gheeSubCat.id,
      pricePerUnit: 850,
      unit: "৫০০ গ্রাম",
      stockQty: 30,
      isFeatured: true,
      isActive: true
    }
  })
  await prisma.productImage.create({
    data: { productId: gheeProduct.id, imageUrl: "/uploads/ghee.jpg", isPrimary: true }
  })
  await prisma.productBatch.create({
    data: {
      productId: gheeProduct.id,
      batchNumber: "BATCH-GHEE-01",
      productionDate: new Date("2026-05-15"),
      expiryDate: new Date("2027-05-15"),
      quantityProduced: 30,
      notes: "সিরাজগঞ্জের খাঁটি দুধ থেকে তৈরি ঘি।"
    }
  })

  // পণ্য ৩: সরিষার তেল
  const oilProduct = await prisma.product.create({
    data: {
      name: "খাঁটি সরিষার তেল",
      slug: "khati-sorishar-tel",
      description: "কাঠের घানিতে ভাঙা শতভাগ খাঁটি ও ঝাঁঝালো সরিষার তেল।",
      categoryId: oilCat.id,
      pricePerUnit: 320,
      unit: "প্রতি লিটার",
      stockQty: 100,
      isFeatured: false,
      isActive: true
    }
  })
  await prisma.productImage.create({
    data: { productId: oilProduct.id, imageUrl: "/uploads/oil.jpg", isPrimary: true }
  })

  // পণ্য ৪: ডিম
  const eggProduct = await prisma.product.create({
    data: {
      name: "দেশি মুরগির ডিম",
      slug: "deshi-morgir-dim",
      description: "সম্পূর্ণ অর্গানিক উপায়ে খামারে পালিত দেশি মুরগির তাজা ডিম।",
      categoryId: dairyCat.id,
      pricePerUnit: 180,
      unit: "প্রতি ডজন",
      stockQty: 25,
      isFeatured: false,
      isActive: true
    }
  })
  await prisma.productImage.create({
    data: { productId: eggProduct.id, imageUrl: "/uploads/eggs.jpg", isPrimary: true }
  })

  // কাস্টমার রিভিউ যোগ করা
  await prisma.productReview.create({
    data: { productId: honeyProduct.id, userId: customer.id, rating: 5, comment: "মধু অনেক ভালো ছিল, একদম খাঁটি স্বাদ!", isApproved: true }
  })

  // কুপন ডিসকাউন্ট কোড তৈরি
  const promoCoupon = await prisma.coupon.create({
    data: {
      code: "FARMER20",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10, // ১০% ডিসকাউন্ট
      minOrderAmount: 500,
      isActive: true,
      expiryDate: new Date("2026-12-31")
    }
  })

  // 📦 প্যাকেজিং ইনভেন্টরি এবং মেটেরিয়াল রেসিপি সেটআপ
  const boxMaterial = await prisma.packagingMaterial.create({
    data: { itemName: "ডেলিভারি কার্টন বক্স", stockCount: 500, alertLimit: 30, unitCost: 15.0 }
  })
  await prisma.productPackagingRecipe.create({
    data: { productId: honeyProduct.id, materialId: boxMaterial.id, quantityUsed: 1 }
  })
  await prisma.productPackagingRecipe.create({
    data: { productId: gheeProduct.id, materialId: boxMaterial.id, quantityUsed: 1 }
  })
  // -------------------------------------------------------------
  // ৬. অর্ডার, ইনভয়েস, কুরিয়ার ৩পিএল সামারি এবং অ্যাক্টিভিটি লগস
  // -------------------------------------------------------------
  // কাস্টমারের জন্য ১টি সফল লাইভ অর্ডার তৈরি করা
  const liveOrder = await prisma.order.create({
    data: {
      customerId: customer.id,
      orderSource: OrderSource.WEBSITE,
      createdById: agent.id, // এজেন্ট প্যানেল দ্বারা অর্ডার প্রসেস
      deliveryAddress: "বাড়ি নং ৫, রোড ২, মিরপুর, ঢাকা",
      customerNote: "মধু ও ঘি দুইটাই যেন ভালো প্যাকেজিংয়ে আসে।",
      internalNote: "এজেন্ট ভেরিফাইড কাস্টমার কল কনফার্মড।",
      totalProductPrice: 1500.0, // মধু (৬৫০) + ঘি (৮৫০) = ১৫০০ টাকা
      deliveryCharge: 120.0,
      discountAmount: 150.0, // কুপন ১০% ডিসকাউন্ট = ১৫০ টাকা
      couponId: promoCoupon.id,
      finalCodAmount: 1470.0, // (১৫০০ + ১২০) - ১৫০ = ১৪৭০ টাকা
      orderStatus: OrderStatus.DELIVERY_ONGOING, // স্ট্যাটাস পাঠানো হয়েছে
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      orderItems: {
        create: [
          { productId: honeyProduct.id, quantity: 1, finalPrice: 650.0 },
          { productId: gheeProduct.id, quantity: 1, finalPrice: 850.0 },
        ]
      }
    }
  })

  // কুরিয়ার ৩পিএল ট্র্যাকিং সামারি কানেকশন অন করা [আপনার ৩পিএল স্কিমা অনুযায়ী]
  await prisma.courierSummary.create({
    data: {
      orderId: liveOrder.id,
      courierStatus: "Steadfast", // ৩পিএল কুরিয়ারের নাম
      collectedAmount: 0.0,
      codFee: 14.7, // ১% ক্যাশ অন ডেলিভারি চার্জ
      deliveryCharge: 120.0,
      netPayout: 1335.3,
      isDiscrepancy: false
    }
  })

  // অর্ডারের জন্য বারকোড ও সিকিউর টোকেন সমৃদ্ধ ইনভয়েস জেনারেট করা
  await prisma.invoice.create({
    data: {
      orderId: liveOrder.id,
      invoiceNumber: `FK-2026-${String(liveOrder.id).padStart(5, '0')}`,
      subTotal: 1500.0,
      deliveryCharge: 120.0,
      discountAmount: 150.0,
      finalCodAmount: 1470.0,
      barcodeString: `BARCODE-FK-${liveOrder.id}`,
      qrCodeUrl: `/track/invoice-${liveOrder.id}`,
      secureToken: `SECURE-TOKEN-HASH-998822-${liveOrder.id}`,
    }
  })

  // কাস্টমার ওয়ালেট হিস্ট্রি বা ট্র্যানজেকশন
  await prisma.walletTransaction.create({
    data: {
      userId: customer.id,
      amount: 200.0,
      type: WalletTxnType.CREDIT,
      reason: "অর্ডার ক্যাশব্যাক বোনাস যুক্ত হয়েছে।"
    }
  })

  // এজেন্ট ড্যাশবোর্ড বা প্যানেল অ্যাক্টিভিটি লগ (Agent Logs)
  await prisma.agentLog.create({
    data: {
      agentId: agent.id,
      action: "ORDER_CONFIRMATION",
      details: `এজেন্ট রাহাত কাস্টমার প্রীতির অর্ডার #${liveOrder.id} সফলভাবে কনফার্ম করেছেন।`,
      targetId: liveOrder.id,
      targetType: "ORDER",
      ipAddress: "192.168.1.45"
    }
  })

  console.log('✅ সব মেনু, পণ্য, ইনভয়েস, কুরিয়ার ও এজেন্ট লগ সফলভাবে প্রিসমা ডাটাবেসে পুশ হয়েছে!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
