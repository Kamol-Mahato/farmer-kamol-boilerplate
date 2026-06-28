import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { phone, otp, newPassword } = await req.json();

  if (!phone || !otp || !newPassword) {
    return NextResponse.json({ error: "সব ফিল্ড আবশ্যক" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "পাসওয়ার্ড কমপক্ষে ৬ ডিজিট/অক্ষর হতে হবে" },
      { status: 400 }
    );
  }

  const admin = await prisma.user.findUnique({ where: { phone } });

  if (!admin || !admin.otp) {
    return NextResponse.json({ error: "ভুল রিকোয়েস্ট" }, { status: 400 });
  }

  if (admin.otpAttempts >= 5) {
    await prisma.user.update({
      where: { phone },
      data: { otp: null, otpExpiry: null, otpAttempts: 0 },
    });
    return NextResponse.json(
      { error: "অনেকবার ভুল চেষ্টা হয়েছে, নতুন OTP চান" },
      { status: 429 }
    );
  }

  if (admin.otp !== otp) {
    await prisma.user.update({
      where: { phone },
      data: { otpAttempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "ভুল OTP" }, { status: 400 });
  }

  if (!admin.otpExpiry || new Date() > admin.otpExpiry) {
    return NextResponse.json({ error: "OTP এর মেয়াদ শেষ" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { phone },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
    },
  });

  return NextResponse.json({ message: "Password reset success" });
}