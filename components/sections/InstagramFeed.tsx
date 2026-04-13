import { motion } from "framer-motion";

const IG_HANDLE   = "clubfootball.co";
const IG_URL      = `https://www.instagram.com/${IG_HANDLE}/`;
const PHOTO_COUNT = 6;

// Photos go in /public/images/instagram/ named ig-1.jpg … ig-6.jpg
const PHOTOS = Array.from({ length: PHOTO_COUNT }, (_, i) => ({
  src: `/images/instagram/ig-${i + 1}.jpg`,
  alt: `Club Football Collection — foto ${i + 1}`,
}));

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

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function InstagramFeed() {
  return (
    <section className="bg-stadium-black py-24 px-4 sm:px-6 border-t border-cream-bone/10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-cream-bone/35 text-xs tracking-widest uppercase font-light mb-2">
              Instagram
            </p>
            <h2 className="font-display font-black uppercase tracking-tight text-3xl sm:text-4xl text-cream-bone leading-none">
              Seguinos
            </h2>
          </div>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cream-bone/50 hover:text-cream-bone text-xs tracking-widest uppercase font-light transition-colors duration-200 self-start sm:self-auto"
          >
            <InstagramIcon />
            @{IG_HANDLE}
          </a>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-1.5">
          {PHOTOS.map((photo, i) => (
            <motion.a
              key={i}
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.07, ease }}
              className="group relative aspect-square overflow-hidden bg-[#0D0D0D]"
              aria-label={`Ver en Instagram — ${photo.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Hover overlay */}
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

      </div>
    </section>
  );
}
