"use client";

import { useEffect, useState } from "react";
import InstagramFeedGrid from "./InstagramFeedGrid";

const IG_HANDLE = "clubfootball.co";
const IG_URL    = `https://www.instagram.com/${IG_HANDLE}/`;

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}

export default function InstagramFeed() {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/instagram-photos")
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => {});
  }, []);

  if (photos.length === 0) return null;

  return (
    <section className="bg-stadium-black py-24 px-4 sm:px-6 border-t border-cream-bone/10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
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
        </div>

        {/* Grid + CTA */}
        <InstagramFeedGrid photos={photos} />

      </div>
    </section>
  );
}
