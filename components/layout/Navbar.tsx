"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface NavbarProps {
  onHome?: () => void;
  onFittingRoom?: () => void;
}

export default function Navbar({ onHome, onFittingRoom }: NavbarProps) {
  const { totalItems, openCart } = useCart();

  return (
    <nav className="fixed top-8 left-0 right-0 z-50 bg-stadium-black/80 backdrop-blur-md border-b border-cream-bone/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={onHome}
          className="text-cream-bone font-extrabold text-3xl tracking-widest min-h-[44px] flex items-center"
        >
          CFC
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Guía de talles */}
          {onFittingRoom && (
            <button
              onClick={onFittingRoom}
              className="text-cream-bone/50 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 min-h-[44px] hidden sm:flex items-center"
            >
              Guía de Talles
            </button>
          )}

          {/* Cart icon */}
          <button
            onClick={openCart}
            className="relative text-cream-bone/60 hover:text-cream-bone transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-cream-bone text-stadium-black text-[10px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums leading-none">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}
