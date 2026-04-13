"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const WHATSAPP_NUMBER = "542615417818";

function buildPostPurchaseWhatsAppURL(method: string): string {
  const message = `¡Hola CFC! Acabo de realizar una compra. Mi método de pago fue ${method}. Aquí te envío mi comprobante y los datos para el envío:`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function SuccessContent() {
  const params = useSearchParams();
  // Mercado Pago appends status to the redirect URL
  const status = params.get("status") ?? params.get("collection_status");
  const isApproved = !status || status === "approved";

  const waURL = buildPostPurchaseWhatsAppURL("Mercado Pago");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-stadium-black text-cream-bone">
      <div className="w-full max-w-md flex flex-col gap-10">

        {/* Status icon */}
        <div className="flex flex-col gap-5">
          <div className="w-14 h-14 border border-cream-bone/20 flex items-center justify-center">
            {isApproved ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="w-7 h-7 text-cream-bone/70"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="w-7 h-7 text-cream-bone/40"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>

          <div>
            <p className="text-cream-bone/45 text-xs tracking-widest uppercase font-light mb-2">
              Club Futbol Collection
            </p>
            <h1 className="font-display font-black uppercase tracking-tight text-3xl sm:text-4xl text-cream-bone leading-none">
              {isApproved ? "¡Pedido\nConfirmado!" : "Pago pendiente"}
            </h1>
          </div>

          <p className="text-cream-bone/45 text-sm font-light leading-relaxed tracking-wide">
            {isApproved
              ? "Tu pago fue procesado correctamente. Para coordinar el envío, envianos tus datos por WhatsApp."
              : "Tu pago está siendo procesado. Una vez acreditado, coordinamos el envío por WhatsApp."}
          </p>
        </div>

        {/* WhatsApp CTA */}
        <div className="flex flex-col gap-4">
          <a
            href={waURL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-5 bg-cream-bone text-stadium-black font-bold text-sm tracking-widest uppercase text-center transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
          >
            Enviar comprobante y coordinar envío
          </a>

          <Link
            href="/"
            className="w-full py-4 border border-cream-bone/20 text-cream-bone/60 hover:text-cream-bone hover:border-cream-bone/40 font-light text-sm tracking-widest uppercase text-center transition-all duration-300"
          >
            Volver a la tienda
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-cream-bone/25 text-xs font-light text-center leading-relaxed">
          También podés escribirnos directamente al +54 261 541-7818
        </p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-stadium-black">
          <span className="text-cream-bone/30 text-xs tracking-widest uppercase font-light">
            Cargando…
          </span>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
