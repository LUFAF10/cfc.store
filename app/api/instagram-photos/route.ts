import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|avif)$/i;

function naturalOrder(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export async function GET() {
  const dir = path.join(process.cwd(), "public", "images", "instagram");
  try {
    const files = await fs.readdir(dir);
    const photos = files
      .filter((f) => IMAGE_EXTS.test(f))
      .sort(naturalOrder)
      .map((f) => `/images/instagram/${f}`);
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
