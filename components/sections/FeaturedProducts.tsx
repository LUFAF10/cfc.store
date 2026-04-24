"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Ruler } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { encodeImagePath } from "@/lib/imageUtils";
import { getPriceForFolder, formatARS } from "@/lib/pricing";

export type Product = {
  team: string;
  label: string;
  sizes: string[];
  file: string;
  file2?: string; // optional back/alternate image — shown on hover
};

interface FeaturedProductsProps {
  title: string;
  folder: string;
  products: Product[];
  soldSet: Set<string>;
  onBack: () => void;
  onFittingRoom: () => void;
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease } as { duration: number; ease: [number, number, number, number] },
  },
};

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  folder,
  soldSet,
  onFittingRoom,
}: {
  product: Product;
  folder: string;
  soldSet: Set<string>;
  onFittingRoom: () => void;
}) {
  const { addItem, openCart, items } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const price = getPriceForFolder(folder);

  function isSold(size: string) {
    return soldSet.has(`${product.team}__${product.label}__${size}`);
  }

  // Reset selection when the item is removed from the cart
  const itemId = selectedSize ? `${product.team}__${product.label}__${selectedSize}` : null;
  const isInCart = itemId ? items.some((i) => i.id === itemId) : false;
  const wasInCartRef = useRef(false);

  useEffect(() => {
    if (isInCart) {
      wasInCartRef.current = true;
    } else if (wasInCartRef.current) {
      setSelectedSize(null);
      wasInCartRef.current = false;
    }
  }, [isInCart]);

  function handleAdd() {
    if (!selectedSize) {
      setError(true);
      setTimeout(() => setError(false), 1800);
      return;
    }
    addItem({
      team: product.team,
      label: product.label,
      file: product.file,
      folder,
      size: selectedSize,
      price,
    });
    openCart();
  }

  return (
    <motion.div variants={cardVariants} className="group flex flex-col">

      {/* Image */}
      <div className={`relative overflow-hidden ${folder === "CAMISETAS" ? "aspect-[3/4]" : "h-[45vh] md:h-auto md:aspect-[3/4]"}`}>
        {/* Primary image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={encodeImagePath(folder, product.file)}
          alt={`${product.team} ${product.label}`}
          className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
            folder === "CAMISETAS" ? "object-cover object-top" : "object-contain object-center md:object-cover md:object-top"
          } ${product.file2 ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
        />
        {/* Secondary image (hover) — only rendered when file2 exists */}
        {product.file2 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={encodeImagePath(folder, product.file2)}
            alt={`${product.team} ${product.label} — vista alternativa`}
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out ${
              folder === "CAMISETAS" ? "object-cover object-top" : "object-contain object-center md:object-cover md:object-top"
            }`}
          />
        )}
      </div>

      {/* Info */}
      <div className="mt-3 md:mt-5 flex flex-col gap-3 md:gap-4">
        <div>
          <p className="text-cream-bone font-black tracking-wider uppercase font-display text-lg leading-tight">
            {product.team}
          </p>
          <p className="text-cream-bone/60 font-bold tracking-widest uppercase text-sm mt-0.5">
            {product.label}
          </p>
          {price > 0 && (
            <p className="text-cream-bone font-semibold tracking-wider text-base mt-1.5">
              {formatARS(price)}
            </p>
          )}
        </div>

        {/* Size selector */}
        {product.sizes.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-cream-bone/40 text-xs tracking-widest uppercase font-light">
                Talle
              </p>
              <button
                onClick={onFittingRoom}
                className="md:hidden flex items-center gap-1 text-cream-bone/50 hover:text-cream-bone transition-colors duration-200"
              >
                <Ruler size={11} strokeWidth={1.5} />
                <span className="text-[10px] tracking-wider uppercase font-light underline underline-offset-2 decoration-cream-bone/30">
                  Guía de talles
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const sold = isSold(size);
                return (
                  <button
                    key={size}
                    onClick={() => { if (!sold) { setSelectedSize(size); setError(false); } }}
                    disabled={sold}
                    className={`relative min-h-[44px] px-3 py-2 text-xs tracking-widest uppercase font-light border transition-all duration-200 ${
                      sold
                        ? "border-cream-bone/10 text-cream-bone/20 cursor-not-allowed line-through"
                        : selectedSize === size
                          ? "bg-cream-bone text-stadium-black border-cream-bone font-bold"
                          : "border-cream-bone/25 text-cream-bone/55 hover:border-cream-bone/60 hover:text-cream-bone/80"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleAdd}
            className={`w-full py-3 min-h-[44px] text-xs tracking-widest uppercase font-bold transition-all duration-200 ${
              selectedSize
                ? "bg-cream-bone text-stadium-black hover:opacity-90 active:scale-[0.98]"
                : "border border-cream-bone/20 text-cream-bone/30 hover:border-cream-bone/40 hover:text-cream-bone/50 cursor-pointer"
            }`}
          >
            {selectedSize ? "Añadir al Carrito" : "Seleccioná un Talle"}
          </button>
          {error && (
            <p className="text-cream-bone/50 text-xs tracking-wider text-center font-light">
              Por favor seleccioná un talle primero
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function FeaturedProducts({ title, folder, products, soldSet, onBack, onFittingRoom }: FeaturedProductsProps) {
  return (
    <section className="bg-stadium-black min-h-screen pt-28 pb-20 px-4 md:pt-32 md:pb-24 md:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Back + header + fitting room */}
        <div className="mb-16 md:mb-16">

          {/* Nav row — always visible */}
          <div className="relative flex items-center justify-between mb-10 md:mb-0">
            <button
              onClick={onBack}
              className="text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 flex items-center gap-2 min-h-[44px]"
            >
              ← Volver
            </button>

            {/* Desktop: title absolutely centred in this row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="hidden md:block absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
            >
              <h2 className="text-5xl font-black tracking-tight uppercase font-display text-cream-bone whitespace-nowrap">
                {title}
              </h2>
              <p className="mt-3 text-sm tracking-widest uppercase text-cream-bone/40 font-light">
                Piezas únicas — stock limitado
              </p>
            </motion.div>

            <button
              onClick={onFittingRoom}
              className="text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 items-center gap-2 min-h-[44px] hidden md:flex"
            >
              Guía de talles →
            </button>
          </div>

          {/* Mobile: title stacked below the nav row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="md:hidden text-center"
          >
            <h2 className="text-3xl font-black tracking-tight uppercase font-display text-cream-bone leading-tight">
              {title}
            </h2>
            <p className="mt-5 text-xs tracking-widest uppercase text-cream-bone/40 font-light leading-relaxed">
              Piezas únicas — stock limitado
            </p>
          </motion.div>

        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
        >
          {products.map((product) => (
            <ProductCard key={product.file} product={product} folder={folder} soldSet={soldSet} onFittingRoom={onFittingRoom} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
