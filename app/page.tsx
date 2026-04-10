"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import FeaturedProducts, { type Product } from "@/components/sections/FeaturedProducts";
import FittingRoom from "@/components/FittingRoom";

// ─── Product catalogues per category ────────────────────────────────────────

const CAMISETAS: Product[] = [
  { team: "Arsenal",           label: "2026",           sizes: ["XL"],          file: "Arsenal 2026 XL.jpg" },
  { team: "Arsenal",           label: "Casual",         sizes: ["XL", "XXL"],   file: "Arsenal Casual XL y XXL.jpg" },
  { team: "Atlético Mineiro",  label: "2025",           sizes: ["XL", "XXL"],   file: "Atletico Mineiro 2025 XL y XXL.jpg" },
  { team: "Boca",              label: "1997",           sizes: ["XL", "XXL"],   file: "Boca 1997 XL y XXL.jpg" },
  { team: "Boca",              label: "2002",           sizes: ["XXL"],         file: "Boca 2002 XXL.jpg" },
  { team: "Boca",              label: "2026",           sizes: ["XL", "XXL"],   file: "Boca 2026 XL y XXL_.jpg" },
  { team: "Corinthians",       label: "2025",           sizes: ["XXL"],         file: "Corinthians 2025 XXL.jpg" },
  { team: "Flamengo",          label: "2026",           sizes: ["XXL"],         file: "Flamengo 2026 XXL.jpg" },
  { team: "Grêmio",            label: "2001",           sizes: ["XL"],          file: "Gremio 2001 XL.jpg" },
  { team: "Liverpool",         label: "2025",           sizes: ["XXXL"],        file: "Liverpool 2025 XXXL.jpg" },
  { team: "Manchester United", label: "2008",           sizes: ["XL"],          file: "Manchester United 2008 XL.jpg" },
  { team: "Palmeiras",         label: "1997",           sizes: ["XL"],          file: "Palmeiras 1997 XL.jpg" },
  { team: "Real Madrid",       label: "2024",           sizes: ["XL", "XXL"],   file: "Real Madrid 2024 XL y XXL.jpg" },
  { team: "Real Madrid",       label: "2025",           sizes: ["XXL", "XXXL"], file: "Real Madrid 2025 XXL y XXXL.jpg" },
  { team: "River",             label: "1999",           sizes: ["XL"],          file: "River 1999 XL.jpg" },
  { team: "River",             label: "2025",           sizes: ["XL"],          file: "River 2025 XL.jpg" },
  { team: "River",             label: "75° Aniversario",sizes: ["XL"],          file: "River 75º Aniversario XL.jpg" },
  { team: "Santos",            label: "2011",           sizes: ["XXL"],         file: "Santos 2011 XXL.jpg" },
];

const BUZOS: Product[] = [
  { team: "Alemania", label: "Buzo", sizes: ["XXL"], file: "Buzo Alemania XXL.jpg" },
];

const SHORTS: Product[] = [];

type CategoryKey = "CAMISETAS" | "BUZOS" | "SHORTS";

const CATEGORY_DATA: Record<CategoryKey, { folder: string; products: Product[] }> = {
  CAMISETAS: { folder: "CAMISETAS", products: CAMISETAS },
  BUZOS:     { folder: "BUZOS",     products: BUZOS     },
  SHORTS:    { folder: "SHORTS",    products: SHORTS    },
};

const CATEGORY_LIST: { label: string; key: CategoryKey | null }[] = [
  { label: "Camisetas", key: "CAMISETAS" },
  { label: "Buzos",     key: "BUZOS"     },
  { label: "Shorts",    key: null        }, // folder is empty
];

// ─── Shared animation config ─────────────────────────────────────────────────

type View = "home" | "categories" | "products" | "fitting";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const viewVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.35, ease } },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  const [currentView, setCurrentView]           = useState<View>("home");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  function openCategory(key: CategoryKey) {
    setSelectedCategory(key);
    setCurrentView("products");
  }

  const activeCategoryData = selectedCategory ? CATEGORY_DATA[selectedCategory] : null;

  return (
    <>
      <Navbar onHome={() => setCurrentView("home")} onFittingRoom={() => setCurrentView("fitting")} />

      <AnimatePresence mode="wait">

        {/* ── HOME ─────────────────────────────────────────────────────────── */}
        {currentView === "home" && (
          <motion.main
            key="home"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center min-h-screen px-4 sm:px-6 text-center bg-stadium-black pt-28 sm:pt-40 pb-20"
          >
            <div className="max-w-3xl mx-auto flex flex-col items-center">

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease }}
                className="mb-6"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo-transparente.png" alt="Club Futbol Collection" className="mx-auto w-64" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease }}
                className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none text-cream-bone uppercase font-display text-center mb-8 sm:mb-10"
              >
                Arma tu Colección Perfecta
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease }}
                className="max-w-xl text-base md:text-lg text-cream-bone font-light leading-relaxed text-center mb-16"
              >
                Encuentra las joyas retro que definieron la historia del fútbol mundial.
                Tu pasión, tu museo personal.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.45, ease }}
              >
                <button
                  onClick={() => setCurrentView("categories")}
                  className="px-12 py-4 bg-cream-bone text-stadium-black font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(242,232,198,0.45)] active:scale-95"
                >
                  Empezar Mi Colección
                </button>
              </motion.div>

            </div>
          </motion.main>
        )}

        {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
        {currentView === "categories" && (
          <motion.main
            key="categories"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col min-h-screen bg-stadium-black px-4 sm:px-6 pt-24 sm:pt-32 pb-20"
          >
            <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">

              <button
                onClick={() => setCurrentView("home")}
                className="self-start text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 flex items-center gap-2 mb-10 sm:mb-16 min-h-[44px]"
              >
                ← Volver
              </button>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease }}
                className="text-cream-bone/40 text-xs tracking-widest uppercase font-light mb-10"
              >
                ¿Qué estás buscando?
              </motion.p>

              <nav className="flex flex-col w-full">
                {CATEGORY_LIST.map(({ label, key }, i) => {
                  const available = key !== null && CATEGORY_DATA[key].products.length > 0;
                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease }}
                    >
                      <div className="border-t border-cream-bone/10" />
                      <button
                        onClick={() => available && key && openCategory(key)}
                        disabled={!available}
                        className="group w-full flex items-center justify-between py-8 text-left disabled:cursor-default"
                      >
                        <span
                          className={`font-display font-black uppercase text-3xl sm:text-4xl md:text-5xl tracking-tight transition-colors duration-200 ${
                            available
                              ? "text-cream-bone/70 group-hover:text-cream-bone"
                              : "text-cream-bone/20"
                          }`}
                        >
                          {label}
                        </span>
                        {available ? (
                          <span className="text-cream-bone/0 group-hover:text-cream-bone/60 transition-all duration-200 text-lg translate-x-2 group-hover:translate-x-0">
                            →
                          </span>
                        ) : (
                          <span className="text-cream-bone/20 text-xs tracking-widest uppercase font-light">
                            Próximamente
                          </span>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
                <div className="border-t border-cream-bone/10" />
              </nav>

            </div>
          </motion.main>
        )}

        {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
        {currentView === "products" && activeCategoryData && (
          <motion.div
            key={`products-${selectedCategory}`}
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FeaturedProducts
              title={selectedCategory ?? ""}
              folder={activeCategoryData.folder}
              products={activeCategoryData.products}
              onBack={() => setCurrentView("categories")}
              onFittingRoom={() => setCurrentView("fitting")}
            />
          </motion.div>
        )}

        {/* ── FITTING ROOM ─────────────────────────────────────────────────── */}
        {currentView === "fitting" && (
          <motion.div
            key="fitting"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FittingRoom onBack={() => setCurrentView("products")} />
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}
