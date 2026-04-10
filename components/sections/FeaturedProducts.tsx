"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { encodeImagePath } from "@/lib/imageUtils";

export type Product = {
  team: string;
  label: string;
  sizes: string[];
  file: string;
};

interface FeaturedProductsProps {
  title: string;
  folder: string;
  products: Product[];
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
}: {
  product: Product;
  folder: string;
}) {
  const { addItem, openCart, items } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState(false);

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
    });
    openCart();
  }

  return (
    <motion.div variants={cardVariants} className="group flex flex-col">

      {/* Image */}
      <div className="overflow-hidden aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={encodeImagePath(folder, product.file)}
          alt={`${product.team} ${product.label}`}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="mt-5 flex flex-col gap-4">
        <div>
          <p className="text-cream-bone font-black tracking-wider uppercase font-display text-lg leading-tight">
            {product.team}
          </p>
          <p className="text-cream-bone/60 font-bold tracking-widest uppercase text-sm mt-0.5">
            {product.label}
          </p>
        </div>

        {/* Size selector */}
        {product.sizes.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-cream-bone/40 text-xs tracking-widest uppercase font-light">
              Talle
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setError(false); }}
                  className={`px-3 py-1.5 text-xs tracking-widest uppercase font-light border transition-all duration-200 ${
                    selectedSize === size
                      ? "bg-cream-bone text-stadium-black border-cream-bone font-bold"
                      : "border-cream-bone/25 text-cream-bone/55 hover:border-cream-bone/60 hover:text-cream-bone/80"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleAdd}
            className={`w-full py-3 text-xs tracking-widest uppercase font-bold transition-all duration-200 ${
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

export default function FeaturedProducts({ title, folder, products, onBack, onFittingRoom }: FeaturedProductsProps) {
  return (
    <section className="bg-stadium-black min-h-screen py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Back + header + fitting room */}
        <div className="flex items-start justify-between mb-16">
          <button
            onClick={onBack}
            className="text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 flex items-center gap-2 pt-1"
          >
            ← Volver
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-center flex-1"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase font-display text-cream-bone">
              {title}
            </h2>
            <p className="mt-3 text-sm tracking-widest uppercase text-cream-bone/40 font-light">
              Piezas únicas — stock limitado
            </p>
          </motion.div>

          <button
            onClick={onFittingRoom}
            className="text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 flex items-center gap-2 pt-1"
          >
            Guía de talles →
          </button>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {products.map((product) => (
            <ProductCard key={product.file} product={product} folder={folder} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
