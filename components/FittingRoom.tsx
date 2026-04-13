"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Size table ──────────────────────────────────────────────────────────────

type SizeEntry = {
  name: string;
  longitud: [number, number];
  ancho: [number, number];
  altura: [number, number];
};

const SIZES: SizeEntry[] = [
  { name: "S",    longitud: [67, 69], ancho: [48, 50], altura: [160, 168] },
  { name: "M",    longitud: [69, 71], ancho: [50, 52], altura: [168, 173] },
  { name: "L",    longitud: [71, 73], ancho: [52, 54], altura: [173, 177] },
  { name: "XL",   longitud: [74, 76], ancho: [54, 56], altura: [173, 178] },
  { name: "XXL",  longitud: [76, 79], ancho: [56, 59], altura: [178, 185] },
  { name: "XXXL", longitud: [79, 82], ancho: [59, 62], altura: [185, 193] },
];

// ─── Recommendation logic ────────────────────────────────────────────────────

function distanceFromRange(value: number, min: number, max: number): number {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

function scoreSize(
  size: SizeEntry,
  altura: number | null,
  ancho: number | null,
  longitud: number | null,
): number {
  let total = 0;
  let count = 0;
  if (altura !== null)   { total += distanceFromRange(altura,   ...size.altura);   count++; }
  if (ancho !== null)    { total += distanceFromRange(ancho,    ...size.ancho);    count++; }
  if (longitud !== null) { total += distanceFromRange(longitud, ...size.longitud); count++; }
  return count === 0 ? Infinity : total / count;
}

function recommend(
  altura: number | null,
  ancho: number | null,
  longitud: number | null,
): string | null {
  if (altura === null && ancho === null && longitud === null) return null;
  let best = SIZES[0];
  let bestScore = scoreSize(SIZES[0], altura, ancho, longitud);
  for (const size of SIZES.slice(1)) {
    const s = scoreSize(size, altura, ancho, longitud);
    if (s < bestScore) { best = size; bestScore = s; }
  }
  return best.name;
}

// ─── Mannequin SVG ───────────────────────────────────────────────────────────

function Mannequin() {
  return (
    <svg
      viewBox="0 0 200 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[180px] mx-auto"
      aria-label="Simulación visual de camiseta"
    >
      {/* Head */}
      <ellipse cx="100" cy="38" rx="20" ry="22" stroke="#F2E8C6" strokeWidth="1" strokeOpacity="0.55" />
      {/* Neck */}
      <rect x="93" y="58" width="14" height="13" stroke="#F2E8C6" strokeWidth="1" strokeOpacity="0.55" />

      {/* T-shirt — filled cream shape */}
      {/* Shoulders + body */}
      <path
        d="
          M 72 71
          L 45 82
          L 32 122
          L 50 128
          L 62 100
          L 62 178
          L 138 178
          L 138 100
          L 150 128
          L 168 122
          L 155 82
          L 128 71
          Q 118 67 100 68
          Q 82 67 72 71
          Z
        "
        fill="#F2E8C6"
        fillOpacity="0.2"
        stroke="#F2E8C6"
        strokeWidth="1.2"
        strokeOpacity="0.8"
        strokeLinejoin="round"
      />
      {/* Collar V-neck */}
      <path
        d="M 82 71 Q 100 90 118 71"
        stroke="#F2E8C6"
        strokeWidth="1.2"
        strokeOpacity="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Lower body (pants outline, very faint) */}
      <path
        d="M 62 178 L 57 270 L 90 270 L 100 225 L 110 270 L 143 270 L 138 178 Z"
        stroke="#F2E8C6"
        strokeWidth="1"
        strokeOpacity="0.35"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Belt line */}
      <line x1="62" y1="178" x2="138" y2="178" stroke="#F2E8C6" strokeWidth="0.8" strokeOpacity="0.45" />
    </svg>
  );
}

// ─── Input field ─────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

function InputField({ label, unit, value, onChange, hint }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-cream-bone/70 text-xs tracking-widest uppercase font-light">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={999}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="
            w-full bg-transparent border-b border-cream-bone/35 focus:border-cream-bone/70
            text-cream-bone text-2xl font-light tracking-wide
            pb-2 pr-10 outline-none placeholder:text-cream-bone/30
            transition-colors duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          "
        />
        <span className="absolute right-0 bottom-2.5 text-cream-bone/55 text-xs tracking-wider uppercase">
          {unit}
        </span>
      </div>
      {hint && (
        <p className="text-cream-bone/50 text-xs font-light">{hint}</p>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FittingRoomProps {
  onBack: () => void;
}

export default function FittingRoom({ onBack }: FittingRoomProps) {
  const [alturaStr,   setAlturaStr]   = useState("");
  const [anchoStr,    setAnchoStr]    = useState("");
  const [longitudStr, setLongitudStr] = useState("");

  const altura   = alturaStr   !== "" ? parseFloat(alturaStr)   : null;
  const ancho    = anchoStr    !== "" ? parseFloat(anchoStr)    : null;
  const longitud = longitudStr !== "" ? parseFloat(longitudStr) : null;

  const recommended = useMemo(
    () => recommend(altura, ancho, longitud),
    [altura, ancho, longitud],
  );

  const hasInput = altura !== null || ancho !== null || longitud !== null;

  return (
    <section className="bg-stadium-black min-h-screen pt-28 pb-20 px-4 md:pt-32 md:pb-24 md:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="relative flex items-center justify-between mb-10 md:mb-16">
          <button
            onClick={onBack}
            className="text-cream-bone/40 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 flex items-center gap-2 min-h-[44px]"
          >
            ← Volver
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase font-display text-cream-bone whitespace-nowrap">
              Tu Talle
            </h2>
            <p className="mt-1 md:mt-3 text-xs md:text-sm tracking-widest uppercase text-cream-bone/60 font-light">
              Encontrá el fit perfecto
            </p>
          </motion.div>

          <div className="w-[60px]" />
        </div>

        {/* Main grid: inputs + mannequin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-16 md:mb-20">

          {/* ── LEFT: Inputs ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="flex flex-col gap-10"
          >
            <InputField
              label="Tu Altura"
              unit="cm"
              value={alturaStr}
              onChange={setAlturaStr}
              hint="Ej: 178"
            />
            <InputField
              label="Ancho"
              unit="cm"
              value={anchoStr}
              onChange={setAnchoStr}
              hint="Medí de costura a costura a la altura de las axilas sobre una remera que te guste como te queda"
            />
            <InputField
              label="Longitud"
              unit="cm"
              value={longitudStr}
              onChange={setLongitudStr}
              hint="Medí del punto más bajo de la remera hacia el punto más alto sobre una remera que te guste como te queda"
            />

            {/* Recommendation result */}
            <AnimatePresence mode="wait">
              {hasInput && recommended && (
                <motion.div
                  key={recommended}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease }}
                  className="border-t border-cream-bone/10 pt-8"
                >
                  <p className="text-cream-bone/60 text-xs tracking-widest uppercase font-light mb-3">
                    Tu talle recomendado
                  </p>
                  <p className="text-cream-bone font-display font-black text-6xl tracking-tight uppercase">
                    {recommended}
                  </p>
<p className="text-cream-bone text-xs tracking-wider mt-4 font-semibold border-t border-cream-bone/15 pt-4">
                    Si sos de usar ropa más oversize, pedí un talle más del recomendado.
                  </p>
                </motion.div>
              )}
              {!hasInput && (
                <motion.p
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-cream-bone/40 text-xs tracking-widest uppercase font-light border-t border-cream-bone/10 pt-8"
                >
                  Ingresá tus medidas para ver tu talle
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: Mannequin ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-cream-bone/55 text-xs tracking-widest uppercase font-light self-start md:self-center">
              Simulación Visual
            </p>

            <div className="relative w-full flex items-center justify-center py-8">
              {/* Subtle glow behind mannequin */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-56 rounded-full bg-cream-bone/[0.03] blur-3xl" />
              </div>
              <Mannequin />
            </div>

            <p className="text-cream-bone/45 text-xs font-light text-center max-w-[200px] leading-relaxed">
              Simulación visual disponible próximamente
            </p>
          </motion.div>

        </div>

        {/* ── Size reference table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease }}
        >
          <p className="text-cream-bone/55 text-xs tracking-widest uppercase font-light mb-6">
            Tabla de talles
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cream-bone/10">
                  {["Talle", "Altura (cm)", "Ancho (cm)", "Longitud (cm)"].map((h) => (
                    <th
                      key={h}
                      className="pb-3 pr-8 text-cream-bone/55 text-xs tracking-widest uppercase font-light whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZES.map((size) => {
                  const isRecommended = recommended === size.name && hasInput;
                  return (
                    <tr
                      key={size.name}
                      className={`border-b transition-colors duration-300 ${
                        isRecommended
                          ? "border-cream-bone/20 bg-cream-bone/[0.06]"
                          : "border-cream-bone/[0.06]"
                      }`}
                    >
                      <td className="py-4 pr-8">
                        <span
                          className={`font-display font-black text-lg tracking-tight uppercase transition-colors duration-300 ${
                            isRecommended ? "text-cream-bone" : "text-cream-bone/55"
                          }`}
                        >
                          {size.name}
                        </span>
                      </td>
                      <td className={`py-4 pr-8 text-sm font-light tabular-nums transition-colors duration-300 ${isRecommended ? "text-cream-bone/90" : "text-cream-bone/50"}`}>
                        {size.altura[0]}–{size.altura[1]}
                      </td>
                      <td className={`py-4 pr-8 text-sm font-light tabular-nums transition-colors duration-300 ${isRecommended ? "text-cream-bone/90" : "text-cream-bone/50"}`}>
                        {size.ancho[0]}–{size.ancho[1]}
                      </td>
                      <td className={`py-4 pr-8 text-sm font-light tabular-nums transition-colors duration-300 ${isRecommended ? "text-cream-bone/90" : "text-cream-bone/50"}`}>
                        {size.longitud[0]}–{size.longitud[1]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
