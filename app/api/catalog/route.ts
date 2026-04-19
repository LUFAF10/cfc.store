import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import type { Product } from "@/components/sections/FeaturedProducts";

export const runtime = "nodejs";

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|avif)$/i;

// Known size tokens — always standalone at the end of the filename
const SIZE_TOKENS = new Set(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);

// ─── Parser ───────────────────────────────────────────────────────────────────
// Filename convention: "[Team Name] [Label] [Size1] y [Size2].jpg"
// Examples:
//   "Boca 2026 XL y XXL.jpg"      → team: Boca,          label: 2026,          sizes: [XL, XXL]
//   "Arsenal Casual XL y XXL.jpg" → team: Arsenal,        label: Casual,        sizes: [XL, XXL]
//   "Real Madrid 2024 XL y XXL"   → team: Real Madrid,    label: 2024,          sizes: [XL, XXL]
//   "River 75° Aniversario XL"    → team: River,          label: 75° Aniversario, sizes: [XL]

function parseFilename(filename: string): Product | null {
  const name = filename
    .replace(IMAGE_EXTS, "")
    .replace(/[_]+$/, "")
    .trim();

  const tokens = name.split(/\s+/);
  const sizes: string[] = [];
  let end = tokens.length;

  // Scan right-to-left: collect sizes and "y" connectors
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i].replace(/[_]+$/, "").toUpperCase();
    if (SIZE_TOKENS.has(t)) {
      sizes.unshift(t);
      end = i;
    } else if (tokens[i].toLowerCase() === "y" && sizes.length > 0) {
      end = i;
    } else {
      break;
    }
  }

  // Need at least 2 tokens before sizes (team + label)
  if (sizes.length === 0 || end < 2) return null;

  // Last non-size token = label, everything before = team name (handles multi-word teams)
  // e.g. "Real Madrid 2024 XL y XXL" → label="2024", team="Real Madrid"
  const label = tokens[end - 1];
  const team  = tokens.slice(0, end - 1).join(" ");

  if (!team || !label) return null;

  return { team, label, sizes, file: filename };
}

// ─── Folder reader ────────────────────────────────────────────────────────────

async function readCategory(folder: string): Promise<Product[]> {
  const dir = path.join(process.cwd(), "public", "images", folder);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => IMAGE_EXTS.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map(parseFilename)
      .filter((p): p is Product => p !== null);
  } catch {
    return [];
  }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function GET() {
  const [camisetas, buzos] = await Promise.all([
    readCategory("CAMISETAS"),
    readCategory("BUZOS"),
  ]);

  return NextResponse.json({ CAMISETAS: camisetas, BUZOS: buzos });
}
