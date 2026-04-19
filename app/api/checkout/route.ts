import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { sendOrderNotification } from "@/lib/mailer";
import { PROMO_CODES } from "@/lib/promoCodes";
import type { CartItem } from "@/types/cart";

// Force Node.js runtime (required for nodemailer)
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    items: CartItem[];
    paymentMethod: "mp" | "transfer";
    promoCode?: string;
  };

  const { items, paymentMethod } = body;

  // Re-validate promo server-side (never trust client)
  const normalizedPromo = body.promoCode?.trim().toUpperCase() ?? null;
  const discountPct     = normalizedPromo ? (PROMO_CODES[normalizedPromo] ?? 0) : 0;
  const discountFactor  = 1 - discountPct / 100;

  if (!items?.length) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  // ── Email notification (both flows) ────────────────────────────────────────
  try {
    await sendOrderNotification(items, paymentMethod, normalizedPromo, discountPct);
  } catch (err) {
    console.error("[mailer] Error sending notification:", err);
  }

  // ── Mercado Pago flow ───────────────────────────────────────────────────────
  if (paymentMethod === "mp") {
    const accessToken = (process.env.MP_ACCESS_TOKEN ?? "").trim();

    console.log("[mp] token length:", accessToken.length);
    console.log("[mp] token prefix:", accessToken.slice(0, 12));

    if (!accessToken) {
      return NextResponse.json({ error: "MP_ACCESS_TOKEN no configurado." }, { status: 500 });
    }

    try {
      // Create config inside handler to avoid module-level caching of stale token
      const mp = new MercadoPagoConfig({ accessToken });
      const preference = new Preference(mp);
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").trim();
      const isLocalhost = baseUrl.includes("localhost");

      const prefBody = {
        items: items.map((i, index) => ({
          id: String(index + 1),
          title: `${i.team} ${i.label} Talle ${i.size}`.slice(0, 256),
          quantity: i.quantity,
          unit_price: Math.round(i.price * discountFactor),
          currency_id: "ARS",
        })),
        ...(!isLocalhost && {
          back_urls: {
            success: `${baseUrl}/success${normalizedPromo ? `?promo=${normalizedPromo}` : ""}`,
            failure: `${baseUrl}/`,
            pending: `${baseUrl}/success${normalizedPromo ? `?promo=${normalizedPromo}` : ""}`,
          },
          auto_return: "approved" as const,
        }),
      };

      console.log("[mp] creating preference:", JSON.stringify(prefBody));

      const result = await preference.create({ body: prefBody });

      console.log("[mp] result init_point:", result.init_point);

      if (!result.init_point) {
        return NextResponse.json(
          { error: "No se pudo obtener el link de pago." },
          { status: 500 },
        );
      }

      return NextResponse.json({ init_point: result.init_point });
    } catch (err) {
      console.error("[mp] Error:", JSON.stringify(err, null, 2));
      const message = err instanceof Error ? err.message : "Error al conectar con Mercado Pago.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── Bank transfer flow ──────────────────────────────────────────────────────
  return NextResponse.json({ ok: true });
}
