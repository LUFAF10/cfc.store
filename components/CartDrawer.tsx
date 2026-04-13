"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, CreditCard, Landmark, Copy, Check, Smartphone } from "lucide-react";
import QRCode from "react-qr-code";
import { useCart } from "@/context/CartContext";
import { encodeImagePath } from "@/lib/imageUtils";
import { formatARS } from "@/lib/pricing";

// ─── Config ──────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "542615417818";

// ← Reemplazá con tus datos bancarios reales
const BANK_DETAILS = {
  cbu:     "0070757430004005724113",
  alias:   "collection.cfc",
  titular: "Facundo Nicolas Consorte",
  banco:   "Galicia",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Step = "cart" | "payment" | "bank";

function buildWhatsAppURL(items: ReturnType<typeof useCart>["items"]): string {
  const lines = items
    .map((i) => `- ${i.quantity}x ${i.team.toUpperCase()} ${i.label.toUpperCase()} (Talle ${i.size})`)
    .join("\n");
  const message = `¡Hola CFC! Quiero finalizar mi pedido:\n\n${lines}\n\n¡Muchas gracias!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={handleCopy}
      className="text-cream-bone/40 hover:text-cream-bone transition-colors duration-150 ml-2 shrink-0"
      aria-label="Copiar"
    >
      {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalAmount } = useCart();

  const [step, setStep]       = useState<Step>("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function handleClose() {
    closeCart();
    // Reset step after drawer exits
    setTimeout(() => { setStep("cart"); setError(null); }, 400);
  }

  // ── Mercado Pago ────────────────────────────────────────────────────────────
  async function handleMercadoPago() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, paymentMethod: "mp" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al conectar con Mercado Pago.");
      handleClose();
      window.open(data.init_point, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  // ── Bank transfer confirm ───────────────────────────────────────────────────
  async function handleConfirmTransfer() {
    setLoading(true);
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, paymentMethod: "transfer" }),
      });
    } catch {
      // email failure is non-blocking
    } finally {
      setLoading(false);
    }
    window.open(buildWhatsAppURL(items), "_blank");
    handleClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:max-w-md bg-[#080808] border-l border-cream-bone/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6 border-b border-cream-bone/10 shrink-0">
              <div className="flex items-center gap-3">
                {step !== "cart" && (
                  <button
                    onClick={() => { setStep(step === "bank" ? "payment" : "cart"); setError(null); }}
                    className="text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 mr-1"
                  >
                    ←
                  </button>
                )}
                <div>
                  <h2 className="font-display font-black uppercase tracking-tight text-2xl text-cream-bone">
                    {step === "cart"    && "Carrito"}
                    {step === "payment" && "Pago"}
                    {step === "bank"    && "Transferencia"}
                  </h2>
                  {step === "cart" && totalItems > 0 && (
                    <p className="text-cream-bone/50 text-xs tracking-widest uppercase font-light mt-0.5">
                      {totalItems} {totalItems === 1 ? "producto" : "productos"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-cream-bone/40 hover:text-cream-bone transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cerrar"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <AnimatePresence mode="wait">

              {/* ── STEP: Cart ──────────────────────────────────────────── */}
              {step === "cart" && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                        <ShoppingBag size={40} strokeWidth={1} className="text-cream-bone/20" />
                        <div>
                          <p className="text-cream-bone/50 text-sm tracking-widest uppercase font-light">
                            Tu carrito está vacío
                          </p>
                          <p className="text-cream-bone/25 text-xs font-light mt-2">
                            Agregá piezas desde el catálogo
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-6">
                        <AnimatePresence initial={false}>
                          {items.map((item) => (
                            <motion.li
                              key={item.id}
                              layout
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                              transition={{ duration: 0.35, ease }}
                              className="flex gap-4 items-start"
                            >
                              <div className="w-20 h-24 shrink-0 overflow-hidden bg-[#111]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={encodeImagePath(item.folder, item.file)}
                                  alt={`${item.team} ${item.label}`}
                                  className="w-full h-full object-cover object-top"
                                />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0 gap-1">
                                <p className="text-cream-bone font-display font-black uppercase tracking-wider text-base leading-tight">
                                  {item.team}
                                </p>
                                <p className="text-cream-bone/55 text-xs tracking-widest uppercase font-light">
                                  {item.label}
                                </p>
                                <p className="text-cream-bone/40 text-xs tracking-wider font-light mt-0.5">
                                  Talle {item.size}
                                </p>
                                <p className="text-cream-bone/80 text-sm font-semibold tracking-wide mt-1">
                                  {formatARS(item.price)}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                  <div className="flex items-center gap-3 border border-cream-bone/15 px-3 py-1.5">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="text-cream-bone/40 hover:text-cream-bone transition-colors duration-150" aria-label="Restar">
                                      <Minus size={12} strokeWidth={2} />
                                    </button>
                                    <span className="text-cream-bone text-sm font-light tabular-nums w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="text-cream-bone/40 hover:text-cream-bone transition-colors duration-150" aria-label="Sumar">
                                      <Plus size={12} strokeWidth={2} />
                                    </button>
                                  </div>
                                  <button onClick={() => removeItem(item.id)} className="text-cream-bone/25 hover:text-cream-bone/70 text-xs tracking-widest uppercase font-light transition-colors duration-200">
                                    Quitar
                                  </button>
                                </div>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="px-5 sm:px-8 py-6 border-t border-cream-bone/10 shrink-0 flex flex-col gap-4">

                      {/* QR — desktop only */}
                      <div className="max-sm:hidden flex items-center gap-4 py-4 px-4 border border-cream-bone/10 bg-cream-bone/[0.03]">
                        <div className="shrink-0 bg-white p-2">
                          <QRCode
                            value="https://cfc-store-rgp2.vercel.app"
                            size={72}
                            bgColor="#ffffff"
                            fgColor="#000000"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Smartphone size={12} strokeWidth={1.5} className="text-cream-bone/50" />
                            <p className="text-cream-bone/80 text-xs font-bold tracking-widest uppercase">
                              Pagá desde el celular
                            </p>
                          </div>
                          <p className="text-cream-bone/40 text-xs font-light leading-relaxed">
                            Escaneá el QR para abrir la tienda en tu teléfono y completar la compra.
                          </p>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <span className="text-cream-bone/50 text-xs tracking-widest uppercase font-light">
                          Total
                        </span>
                        <span className="text-cream-bone font-black text-xl tracking-wide font-display">
                          {formatARS(totalAmount)}
                        </span>
                      </div>

                      <button
                        onClick={() => setStep("payment")}
                        className="w-full py-4 bg-cream-bone text-stadium-black font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                      >
                        Finalizar Pedido
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STEP: Payment selection ─────────────────────────────── */}
              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.3, ease }}
                  className="flex flex-col flex-1 min-h-0 px-5 sm:px-8 py-8"
                >
                  <p className="text-cream-bone/50 text-xs tracking-widest uppercase font-light mb-8">
                    Elegí cómo pagar
                  </p>

                  <div className="flex flex-col gap-4">
                    {/* Mercado Pago */}
                    <button
                      onClick={handleMercadoPago}
                      disabled={loading}
                      className="group w-full flex items-center gap-5 px-6 py-5 border border-cream-bone/15 hover:border-cream-bone/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <CreditCard size={22} strokeWidth={1.2} className="text-cream-bone/50 group-hover:text-cream-bone transition-colors duration-200 shrink-0" />
                      <div>
                        <p className="text-cream-bone font-bold text-sm tracking-widest uppercase">
                          {loading ? "Conectando…" : "Mercado Pago"}
                        </p>
                        <p className="text-cream-bone/40 text-xs font-light mt-0.5">
                          Tarjeta de crédito / débito
                        </p>
                      </div>
                    </button>

                    {/* Bank Transfer */}
                    <button
                      onClick={() => setStep("bank")}
                      disabled={loading}
                      className="group w-full flex items-center gap-5 px-6 py-5 border border-cream-bone/15 hover:border-cream-bone/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <Landmark size={22} strokeWidth={1.2} className="text-cream-bone/50 group-hover:text-cream-bone transition-colors duration-200 shrink-0" />
                      <div>
                        <p className="text-cream-bone font-bold text-sm tracking-widest uppercase">
                          Transferencia Bancaria
                        </p>
                        <p className="text-cream-bone/40 text-xs font-light mt-0.5">
                          CBU / Alias
                        </p>
                      </div>
                    </button>
                  </div>

                  {error && (
                    <p className="mt-6 text-cream-bone/60 text-xs text-center font-light tracking-wide">
                      {error}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── STEP: Bank transfer details ─────────────────────────── */}
              {step === "bank" && (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.3, ease }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-8">
                    <p className="text-cream-bone/50 text-xs tracking-widest uppercase font-light mb-8">
                      Datos bancarios
                    </p>

                    <div className="flex flex-col gap-6">
                      {[
                        { label: "Banco",   value: BANK_DETAILS.banco   },
                        { label: "Titular", value: BANK_DETAILS.titular },
                        { label: "CBU",     value: BANK_DETAILS.cbu     },
                        { label: "Alias",   value: BANK_DETAILS.alias   },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-cream-bone/40 text-xs tracking-widest uppercase font-light mb-1">
                            {label}
                          </p>
                          <div className="flex items-center justify-between border-b border-cream-bone/10 pb-2">
                            <p className="text-cream-bone text-sm font-light tracking-wide">
                              {value}
                            </p>
                            <CopyButton value={value} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-cream-bone/35 text-xs font-light mt-8 leading-relaxed">
                      Una vez realizada la transferencia, envianos el comprobante por WhatsApp y confirmamos tu pedido.
                    </p>
                  </div>

                  <div className="px-5 sm:px-8 py-6 border-t border-cream-bone/10 shrink-0">
                    <button
                      onClick={handleConfirmTransfer}
                      disabled={loading}
                      className="w-full py-4 bg-cream-bone text-stadium-black font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    >
                      {loading ? "Enviando…" : "Confirmar y enviar comprobante"}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
