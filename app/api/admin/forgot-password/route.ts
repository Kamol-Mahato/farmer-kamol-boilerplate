import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  const { phone } = await req.json();

  const admin = await prisma.admin.findUnique({
    where: { phone },
  });

  if (!admin) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const otp = generateOTP();

  await prisma.admin.update({
    where: { phone },
    data: {
      otp,
      otpExpiry: getOTPExpiry(),
    },
  });

  await sendTelegramMessage(
    `🔐 OTP for Farmer Kamol: ${otp}\n📱 Phone: ${phone}`
  );

  return NextResponse.json({ message: "OTP sent" });
}