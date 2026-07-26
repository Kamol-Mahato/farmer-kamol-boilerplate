import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendTelegramMessage } from "@/lib/telegram";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rateLimiter";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    // 🔒 একই নম্বরে বারবার OTP অনুরোধ (Telegram spam) ঠেকাতে rate limit
const rateCheck = await checkRateLimit(`admin-forgot-password:${phone}`);
if (!rateCheck.allowed) {
  const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000);
  return NextResponse.json(
    { error: `অনেকবার চেষ্টা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।` },
    { status: 429 }
  );
}

    const admin = await prisma.user.findUnique({
      where: { phone },
    });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ message: "OTP sent" });
    }

    const otp = generateOTP();

    await prisma.user.update({
      where: { phone },
      data: {
        otp,
        otpExpiry: getOTPExpiry(),
        otpAttempts: 0,
      },
    });
    await recordFailedAttempt(`admin-forgot-password:${phone}`);

    await sendTelegramMessage(
      `🔐 OTP for Farmer Kamol: ${otp}\n📱 Phone: ${phone}`
    );
    await recordFailedAttempt(`admin-forgot-password:${phone}`);

    return NextResponse.json({ message: "OTP sent" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { error: "OTP পাঠাতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}