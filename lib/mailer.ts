import nodemailer from "nodemailer";
import type { CartItem } from "@/types/cart";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not your regular password)
  },
});

function buildEmailHTML(
  items: CartItem[],
  paymentMethod: "mp" | "transfer",
  promoCode?: string | null,
  discountPct?: number,
): string {
  const methodLabel =
    paymentMethod === "mp" ? "Mercado Pago / Tarjeta" : "Transferencia Bancaria";
  const subtotal       = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = promoCode && discountPct ? Math.round(subtotal * discountPct / 100) : 0;
  const total          = subtotal - discountAmount;

  const rows = items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #1a1a1a;color:#F2E8C6;font-family:sans-serif;font-size:14px;">
            ${i.team} ${i.label}
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a1a1a;color:#F2E8C6;font-family:sans-serif;font-size:14px;text-align:center;">
            ${i.size}
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a1a1a;color:#F2E8C6;font-family:sans-serif;font-size:14px;text-align:center;">
            ${i.quantity}
          </td>
        </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <body style="background:#000;margin:0;padding:40px 0;">
        <table style="max-width:560px;margin:0 auto;background:#080808;border:1px solid #1f1f1f;" cellpadding="0" cellspacing="0">
          <!-- Header -->
          <tr>
            <td colspan="3" style="padding:32px 32px 24px;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0;font-family:sans-serif;font-size:22px;font-weight:900;letter-spacing:4px;color:#F2E8C6;text-transform:uppercase;">
                CFC
              </p>
              <p style="margin:6px 0 0;font-family:sans-serif;font-size:11px;letter-spacing:3px;color:#F2E8C690;text-transform:uppercase;">
                Nuevo pedido recibido
              </p>
            </td>
          </tr>
          <!-- Method badge -->
          <tr>
            <td colspan="3" style="padding:20px 32px 0;">
              <span style="display:inline-block;padding:5px 12px;border:1px solid #F2E8C640;font-family:sans-serif;font-size:10px;letter-spacing:2px;color:#F2E8C6;text-transform:uppercase;">
                ${methodLabel}
              </span>
            </td>
          </tr>
          <!-- Table header -->
          <tr>
            <td style="padding:20px 16px 8px 32px;font-family:sans-serif;font-size:10px;letter-spacing:2px;color:#F2E8C660;text-transform:uppercase;">Producto</td>
            <td style="padding:20px 16px 8px;font-family:sans-serif;font-size:10px;letter-spacing:2px;color:#F2E8C660;text-transform:uppercase;text-align:center;">Talle</td>
            <td style="padding:20px 16px 8px;font-family:sans-serif;font-size:10px;letter-spacing:2px;color:#F2E8C660;text-transform:uppercase;text-align:center;">Cant.</td>
          </tr>
          <!-- Items -->
          ${rows}
          <!-- Totals -->
          <tr>
            <td colspan="3" style="padding:20px 32px 0;">
              ${promoCode ? `
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="font-family:sans-serif;font-size:11px;color:#F2E8C660;letter-spacing:1px;padding:4px 0;">Subtotal</td>
                  <td style="font-family:sans-serif;font-size:11px;color:#F2E8C660;letter-spacing:1px;padding:4px 0;text-align:right;">$${subtotal.toLocaleString("es-AR")}</td>
                </tr>
                <tr>
                  <td style="font-family:sans-serif;font-size:11px;color:#F2E8C660;letter-spacing:1px;padding:4px 0;">Descuento (${promoCode} ${discountPct}%)</td>
                  <td style="font-family:sans-serif;font-size:11px;color:#F2E8C660;letter-spacing:1px;padding:4px 0;text-align:right;">− $${discountAmount.toLocaleString("es-AR")}</td>
                </tr>
                <tr>
                  <td style="font-family:sans-serif;font-size:13px;font-weight:700;color:#F2E8C6;letter-spacing:2px;text-transform:uppercase;padding:8px 0 4px;border-top:1px solid #1a1a1a;">Total</td>
                  <td style="font-family:sans-serif;font-size:13px;font-weight:700;color:#F2E8C6;letter-spacing:2px;padding:8px 0 4px;text-align:right;border-top:1px solid #1a1a1a;">$${total.toLocaleString("es-AR")}</td>
                </tr>
              </table>
              ` : ""}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td colspan="3" style="padding:24px 32px;font-family:sans-serif;font-size:11px;color:#F2E8C640;letter-spacing:1px;">
              Club Fútbol Collection · ${new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendOrderNotification(
  items: CartItem[],
  paymentMethod: "mp" | "transfer",
  promoCode?: string | null,
  discountPct?: number,
): Promise<void> {
  const methodLabel = paymentMethod === "mp" ? "Mercado Pago" : "Transferencia";
  const summary     = items.map((i) => `${i.quantity}x ${i.team} ${i.label} (Talle ${i.size})`).join(", ");
  const promoSuffix = promoCode ? ` — ${promoCode} -${discountPct}%` : "";

  await transporter.sendMail({
    from: `"CFC Tienda" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO ?? "facuconsorte1@gmail.com",
    subject: `🛒 Nuevo pedido — ${methodLabel}${promoSuffix} — ${summary.slice(0, 60)}`,
    html: buildEmailHTML(items, paymentMethod, promoCode, discountPct),
  });
}
