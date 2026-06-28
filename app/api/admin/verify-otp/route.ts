import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  const admin = await prisma.user.findUnique({
    where: { phone },
  });

  if (!admin || !admin.otp) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
    return NextResponse.json({ error: "Wrong OTP" }, { status: 400 });
  }

  if (new Date() > (admin.otpExpiry as Date)) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  return NextResponse.json({ message: "OTP verified" });
}