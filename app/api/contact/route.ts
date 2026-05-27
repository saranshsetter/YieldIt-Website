import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, businessName, phone, email, adSpend, challenge } = body;

    if (!name || !businessName || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("[YieldIt Audit Request]", {
      name,
      businessName,
      phone,
      email,
      adSpend,
      challenge,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
