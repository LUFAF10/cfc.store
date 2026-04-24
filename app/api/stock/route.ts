import { NextResponse } from "next/server";
import { getSoldKeys } from "@/lib/stock";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sold = await getSoldKeys();
    return NextResponse.json({ sold });
  } catch {
    return NextResponse.json({ sold: [] });
  }
}
