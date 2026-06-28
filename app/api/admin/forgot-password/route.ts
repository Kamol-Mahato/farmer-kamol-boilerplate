import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    const admin = await prisma.user.findUnique({
      where: { phone },
    });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    await sendTelegramMessage(
      `🔐 OTP for Farmer Kamol: ${otp}\n📱 Phone: ${phone}`
    );

    return NextResponse.json({ message: "OTP sent" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { error: "OTP পাঠাতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}