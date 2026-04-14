"use client";

import { motion } from "framer-motion";

const IG_URL = "https://www.instagram.com/clubfootball.co/";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-6 h-6"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}

export default function InstagramFeedGrid({ photos }: { photos: string[] }) {
  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-1.5">
        {photos.map((src, i) => (
          <motion.a
            key={src}
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: (i % 6) * 0.07, ease }}
            className="group relative aspect-square overflow-hidden bg-[#0D0D0D]"
            aria-label={`Ver en Instagram — foto ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Club Football Collection — foto ${i + 1}`}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-400 flex items-center justify-center">
              <div className="text-cream-bone opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100 transform">
                <InstagramIcon />
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3, ease }}
        className="mt-10 text-center"
      >
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-3.5 border border-cream-bone/20 text-cream-bone/60 hover:text-cream-bone hover:border-cream-bone/50 text-xs tracking-widest uppercase font-light transition-all duration-300"
        >
          <InstagramIcon />
          Ver más en Instagram
        </a>
      </motion.div>
    </>
  );
}
