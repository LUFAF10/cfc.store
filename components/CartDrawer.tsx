"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, CreditCard, Landmark, Copy, Check } from "lucide-react";
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

type Step = "cart" | "payment" | "bank" | "confirmed";

function buildPostPurchaseWhatsAppURL(method: string, promo?: string | null): string {
  const promoLine = promo ? ` Código aplicado: ${promo}.` : "";
  const message = `¡Hola CFC! Acabo de realizar una compra. Mi método de pago fue ${method}.${promoLine} Aquí te envío mi comprobante y los datos para el envío:`;
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
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    totalItems, totalAmount,
    promoCode, discountPct, discountAmount, discountedTotal,
    applyPromoCode, clearPromoCode,
  } = useCart();

  const [step, setStep]       = useState<Step>("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [promoInput, setPromoInput]   = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [customerErrors, setCustomerErrors] = useState({ name: false, email: false, phone: false });

  function handleClose() {
    closeCart();
    setTimeout(() => {
      setStep("cart"); setError(null);
      setPromoInput(""); setPromoStatus("idle");
      setCustomer({ name: "", email: "", phone: "" });
      setCustomerErrors({ name: false, email: false, phone: false });
    }, 400);
  }

  function handleProceedToPayment() {
    const errors = {
      name:  customer.name.trim().length < 2,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()),
      phone: customer.phone.replace(/\D/g, "").length < 6,
    };
    setCustomerErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setStep("payment");
  }

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    const result = applyPromoCode(promoInput);
    if (result === "valid") {
      setPromoStatus("valid");
      setPromoInput("");
    } else {
      setPromoStatus("invalid");
    }
  }

  // ── Mercado Pago ────────────────────────────────────────────────────────────
  async function handleMercadoPago() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, paymentMethod: "mp", promoCode, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al conectar con Mercado Pago.");
      handleClose();
      // window.open(_blank) is blocked by mobile browsers after an async call.
      // window.location.href navigates in the same tab — works on all devices.
      window.location.href = data.init_point;
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
        body: JSON.stringify({ items, paymentMethod: "transfer", promoCode, customer }),
      });
    } catch {
      // email failure is non-blocking
    } finally {
      setLoading(false);
    }
    setStep("confirmed");
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
                {step !== "cart" && step !== "confirmed" && (
                  <button
                    onClick={() => { setStep(step === "bank" ? "payment" : "cart"); setError(null); }}
                    className="text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 mr-1"
                  >
                    ←
                  </button>
                )}
                <div>
                  <h2 className="font-display font-black uppercase tracking-tight text-2xl text-cream-bone">
                    {step === "cart"      && "Carrito"}
                    {step === "payment"   && "Pago"}
                    {step === "bank"      && "Transferencia"}
                    {step === "confirmed" && "¡Confirmado!"}
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
                      <>
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

                      {/* ── Datos de contacto / envío ─────────────────────── */}
                      <div className="mt-8 pt-8 border-t border-cream-bone/10 flex flex-col gap-4">
                        <p className="text-cream-bone/40 text-xs tracking-widest uppercase font-light">
                          Datos de contacto / envío
                        </p>

                        {[
                          { key: "name",  placeholder: "Nombre completo",      type: "text",  error: customerErrors.name  },
                          { key: "email", placeholder: "Correo electrónico",   type: "email", error: customerErrors.email },
                          { key: "phone", placeholder: "Teléfono (WhatsApp)",  type: "tel",   error: customerErrors.phone },
                        ].map(({ key, placeholder, type, error: fieldError }) => (
                          <div key={key} className="flex flex-col gap-1">
                            <input
                              type={type}
                              placeholder={placeholder}
                              value={customer[key as keyof typeof customer]}
                              onChange={(e) => {
                                setCustomer((prev) => ({ ...prev, [key]: e.target.value }));
                                setCustomerErrors((prev) => ({ ...prev, [key]: false }));
                              }}
                              className={`w-full bg-transparent border text-cream-bone text-sm font-light px-3 py-3 placeholder:text-cream-bone/25 focus:outline-none transition-colors duration-200 ${
                                fieldError
                                  ? "border-cream-bone/50"
                                  : "border-cream-bone/20 focus:border-cream-bone/50"
                              }`}
                            />
                            {fieldError && (
                              <p className="text-cream-bone/40 text-[10px] tracking-wider font-light">
                                {key === "name"  && "Ingresá tu nombre completo"}
                                {key === "email" && "Email inválido"}
                                {key === "phone" && "Ingresá un teléfono válido"}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      </>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="px-5 sm:px-8 py-6 border-t border-cream-bone/10 shrink-0 flex flex-col gap-4">

                      {/* Promo code input */}
                      {!promoCode ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoInput}
                              onChange={(e) => { setPromoInput(e.target.value); setPromoStatus("idle"); }}
                              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                              placeholder="Código de promoción"
                              className="flex-1 bg-transparent border border-cream-bone/20 text-cream-bone text-xs tracking-widest uppercase font-light px-3 py-2.5 placeholder:text-cream-bone/25 placeholder:normal-case focus:outline-none focus:border-cream-bone/50 transition-colors duration-200"
                            />
                            <button
                              onClick={handleApplyPromo}
                              className="px-4 py-2.5 border border-cream-bone/20 text-cream-bone/60 hover:text-cream-bone hover:border-cream-bone/50 text-xs tracking-widest uppercase font-light transition-all duration-200 shrink-0"
                            >
                              Aplicar
                            </button>
                          </div>
                          {promoStatus === "invalid" && (
                            <p className="text-cream-bone/40 text-[10px] tracking-wider font-light">
                              Código no válido
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-cream-bone/50 text-[10px] tracking-widest uppercase font-light">
                            Código: <span className="text-cream-bone/80">{promoCode}</span> · {discountPct}% aplicado
                          </span>
                          <button
                            onClick={() => { clearPromoCode(); setPromoStatus("idle"); }}
                            className="text-cream-bone/30 hover:text-cream-bone/60 text-[10px] tracking-widest uppercase font-light transition-colors duration-200"
                          >
                            Quitar
                          </button>
                        </div>
                      )}

                      {/* Totals breakdown */}
                      <div className="flex flex-col gap-2">
                        {promoCode ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-cream-bone/40 text-xs tracking-widest uppercase font-light">Subtotal</span>
                              <span className="text-cream-bone/60 text-sm font-light">{formatARS(totalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-cream-bone/40 text-xs tracking-widest uppercase font-light">
                                Descuento ({promoCode} {discountPct}%)
                              </span>
                              <span className="text-cream-bone/60 text-sm font-light">− {formatARS(discountAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-cream-bone/10 pt-2 mt-1">
                              <span className="text-cream-bone/50 text-xs tracking-widest uppercase font-light">Total</span>
                              <span className="text-cream-bone font-black text-xl tracking-wide font-display">{formatARS(discountedTotal)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-cream-bone/50 text-xs tracking-widest uppercase font-light">Total</span>
                            <span className="text-cream-bone font-black text-xl tracking-wide font-display">{formatARS(totalAmount)}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleProceedToPayment}
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

              {/* ── STEP: Confirmed (bank transfer) ─────────────────────── */}
              {step === "confirmed" && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.3, ease }}
                  className="flex flex-col flex-1 min-h-0 px-5 sm:px-8 py-10"
                >
                  <div className="flex flex-col flex-1 justify-center gap-8">
                    {/* Icon */}
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 border border-cream-bone/20 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          className="w-6 h-6 text-cream-bone/70"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-cream-bone font-display font-black uppercase tracking-tight text-xl leading-tight">
                          Tu pedido fue recibido
                        </p>
                        <p className="text-cream-bone/45 text-xs font-light mt-2 leading-relaxed tracking-wide">
                          Para confirmar el envío, envianos el comprobante de transferencia por WhatsApp junto con tus datos de entrega.
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={buildPostPurchaseWhatsAppURL("Transferencia Bancaria", promoCode)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-cream-bone text-stadium-black font-bold text-sm tracking-widest uppercase text-center transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                    >
                      Enviar comprobante y coordinar envío
                    </a>

                    <button
                      onClick={handleClose}
                      className="text-cream-bone/30 hover:text-cream-bone/60 text-xs tracking-widest uppercase font-light text-center transition-colors duration-200"
                    >
                      Cerrar
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
