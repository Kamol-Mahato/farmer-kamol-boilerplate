import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  const admin = await prisma.admin.findUnique({
    where: { phone },
  });

  if (!admin || !admin.otp) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (admin.otp !== otp) {
    return NextResponse.json({ error: "Wrong OTP" }, { status: 400 });
  }

  if (new Date() > (admin.otpExpiry as Date)) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  return NextResponse.json({ message: "OTP verified" });
}