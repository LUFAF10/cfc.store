"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types/cart";

// ─── Types ───────────────────────────────────────────────────────────────────

export type { CartItem } from "@/types/cart";

import { PROMO_CODES } from "@/lib/promoCodes";
export { PROMO_CODES };

export type PromoResult = "valid" | "invalid" | "already_applied";

type CartContextType = {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  totalItems: number;
  totalAmount: number;
  // Promo
  promoCode: string | null;
  discountPct: number;
  discountAmount: number;
  discountedTotal: number;
  applyPromoCode: (code: string) => PromoResult;
  clearPromoCode: () => void;
  // Cart drawer
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "cfc-cart-v1";

// ─── Provider ────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountPct, setDiscountPct] = useState(0);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Omit<CartItem, "id" | "quantity">) => {
    const id = `${product.team}__${product.label}__${product.size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, id, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const totalItems     = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount    = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = Math.round(totalAmount * discountPct / 100);
  const discountedTotal = totalAmount - discountAmount;

  const applyPromoCode = useCallback((code: string): PromoResult => {
    const normalized = code.trim().toUpperCase();
    if (promoCode) return "already_applied";
    const pct = PROMO_CODES[normalized];
    if (!pct) return "invalid";
    setPromoCode(normalized);
    setDiscountPct(pct);
    return "valid";
  }, [promoCode]);

  const clearPromoCode = useCallback(() => {
    setPromoCode(null);
    setDiscountPct(0);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        totalAmount,
        promoCode,
        discountPct,
        discountAmount,
        discountedTotal,
        applyPromoCode,
        clearPromoCode,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
