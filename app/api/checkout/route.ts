import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { sendOrderNotification } from "@/lib/mailer";
import type { CartItem } from "@/types/cart";

// Force Node.js runtime (required for nodemailer)
export const runtime = "nodejs";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? "",
});

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    items: CartItem[];
    paymentMethod: "mp" | "transfer";
  };

  const { items, paymentMethod } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  // ── Email notification (both flows) ────────────────────────────────────────
  try {
    await sendOrderNotification(items, paymentMethod);
  } catch (err) {
    // Non-blocking: log but don't fail the checkout if email fails
    console.error("[mailer] Error sending notification:", err);
  }

  // ── Mercado Pago flow ───────────────────────────────────────────────────────
  if (paymentMethod === "mp") {
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN no configurado." },
        { status: 500 },
      );
    }

    try {
      const preference = new Preference(mp);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const isLocalhost = baseUrl.includes("localhost");

      const result = await preference.create({
        body: {
          items: items.map((i, index) => ({
            id: String(index + 1),
            title: `${i.team} ${i.label} Talle ${i.size}`,
            quantity: i.quantity,
            unit_price: i.price,
            currency_id: "ARS",
          })),
          ...(!isLocalhost && {
            back_urls: {
              success: `${baseUrl}/`,
              failure: `${baseUrl}/`,
              pending: `${baseUrl}/`,
            },
            auto_return: "approved" as const,
          }),
        },
      });

      if (!result.init_point) {
        console.error("[mp] preference created but init_point is missing:", result);
        return NextResponse.json(
          { error: "No se pudo obtener el link de pago de Mercado Pago." },
          { status: 500 },
        );
      }

      return NextResponse.json({ init_point: result.init_point });
    } catch (err) {
      console.error("[mp] Error creando preferencia:", JSON.stringify(err, null, 2));
      const message = err instanceof Error ? err.message : "Error al conectar con Mercado Pago.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── Bank transfer flow ──────────────────────────────────────────────────────
  return NextResponse.json({ ok: true });
}
