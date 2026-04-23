"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import FeaturedProducts, { type Product } from "@/components/sections/FeaturedProducts";
import FittingRoom from "@/components/FittingRoom";
import InstagramFeed from "@/components/sections/InstagramFeed";

// ─── Category config ─────────────────────────────────────────────────────────

type CategoryKey = "CAMISETAS" | "BUZOS" | "SHORTS";

const CATEGORY_LIST: { label: string; key: CategoryKey | null }[] = [
  { label: "Camisetas", key: "CAMISETAS" },
  { label: "Buzos",     key: "BUZOS"     },
  { label: "Shorts",    key: null        },
];

const EMPTY_CATALOG = {
  CAMISETAS: [] as Product[],
  BUZOS:     [] as Product[],
  SHORTS:    [] as Product[],
};

// ─── Shared animation config ─────────────────────────────────────────────────

type View = "home" | "categories" | "products" | "fitting" | "success";

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
  const [catalog, setCatalog]                   = useState(EMPTY_CATALOG);

  // Load product catalog from API (reads image folders dynamically)
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setCatalog({ CAMISETAS: data.CAMISETAS ?? [], BUZOS: data.BUZOS ?? [], SHORTS: data.SHORTS ?? [] }))
      .catch(() => {});
  }, []);

  // Detect MP payment success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("collection_status") ?? params.get("status");
    if (status === "approved") {
      setCurrentView("success");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const CATEGORY_DATA: Record<CategoryKey, { folder: string; products: Product[] }> = {
    CAMISETAS: { folder: "CAMISETAS", products: catalog.CAMISETAS },
    BUZOS:     { folder: "BUZOS",     products: catalog.BUZOS     },
    SHORTS:    { folder: "SHORTS",    products: catalog.SHORTS    },
  };

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
            className="bg-stadium-black"
          >
            {/* ── Hero ── */}
            <div className="relative flex flex-col items-center min-h-screen px-4 sm:px-6 text-center pt-36 sm:pt-48 pb-24 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center">
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black pointer-events-none" />
              <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">

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
            </div>

            {/* ── Instagram feed ── */}
            <InstagramFeed />
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
            className="flex flex-col min-h-screen bg-stadium-black px-4 sm:px-6 pt-32 sm:pt-40 pb-20"
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

        {/* ── SUCCESS ──────────────────────────────────────────────────────── */}
        {currentView === "success" && (
          <motion.main
            key="success"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-stadium-black"
          >
            <div className="max-w-md mx-auto flex flex-col items-center gap-8">

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <CheckCircle size={64} strokeWidth={1} className="text-cream-bone" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease }}
                className="flex flex-col items-center gap-4"
              >
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase font-display text-cream-bone leading-tight">
                  ¡Gracias por tu compra!
                </h1>
                <p className="text-cream-bone/60 font-light leading-relaxed text-base">
                  Tu pago fue procesado con éxito. En breve nos ponemos en contacto para coordinar el envío.
                </p>
                <p className="text-cream-bone/35 text-xs tracking-widest uppercase font-light">
                  Club Fútbol Collection
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease }}
                onClick={() => setCurrentView("home")}
                className="mt-4 px-10 py-4 bg-cream-bone text-stadium-black font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:opacity-90 active:scale-95"
              >
                Seguir Comprando
              </motion.button>

            </div>
          </motion.main>
        )}

      </AnimatePresence>
    </>
  );
}
