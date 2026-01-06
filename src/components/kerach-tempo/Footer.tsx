"use client";

import React, { useState } from "react";
import NamerUiBadge from "@/components/ui/NamerUiBadge";

export default function Footer() {
  const [verifiedLoaded, setVerifiedLoaded] = useState(false);
  const [twelveLoaded, setTwelveLoaded] = useState(false);
  const [turboLoaded, setTurboLoaded] = useState(false);
  const [auraLoaded, setAuraLoaded] = useState(false);

  return (
    <footer className="pb-4">
      {/* Top badge */}
      <div className="flex justify-center">
        <NamerUiBadge />
      </div>

      {/* Feature badges row */}
      <div className="mt-[10px] flex flex-wrap items-center justify-center">
        {/* Verified Tools */}
        <a
          href={verifiedLoaded ? "https://www.verifiedtools.info" : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center pointer-events-auto transition-transform"
        >
          <img
            src="https://www.verifiedtools.info/badge.png"
            alt={verifiedLoaded ? "Verified on Verified Tools" : ""}
            width={200}
            height={54}
            loading="lazy"
            onLoad={() => setVerifiedLoaded(true)}
            onError={() => setVerifiedLoaded(false)}
            className={`rounded-md transition-opacity duration-300 ease-out ${
              verifiedLoaded ? "opacity-100 h-auto" : "opacity-5 h-[1px]"
            }`}
          />
        </a>

        {/* Twelve Tools */}
        <a
          href={twelveLoaded ? "https://twelve.tools" : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center mt-[9px] items-center pointer-events-auto transition-transform"
        >
          <img
            src="https://twelve.tools/badge0-white.svg"
            alt={twelveLoaded ? "Featured on Twelve Tools" : ""}
            width={200}
            height={54}
            loading="lazy"
            onLoad={() => setTwelveLoaded(true)}
            onError={() => setTwelveLoaded(false)}
            className={`rounded-md transition-opacity duration-300 ease-out ${
              twelveLoaded ? "opacity-100 h-auto" : "opacity-5 h-[1px]"
            }`}
          />
        </a>

        {/* Turbo0 */}
        <a
          href={turboLoaded ? "https://turbo0.com/item/kerach-tempo" : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center mt-[15px] pointer-events-auto transition-transform"
        >
          <img
            src="https://img.turbo0.com/badge-listed-light.svg"
            alt={turboLoaded ? "Listed on Turbo0" : ""}
            loading="lazy"
            onLoad={() => setTurboLoaded(true)}
            onError={() => setTurboLoaded(false)}
            className={`rounded-md transition-opacity duration-300 ease-out ${
              turboLoaded ? "opacity-100 h-[54px]" : "opacity-5 h-[1px]"
            }`}
          />
        </a>

        {/* Aura++ */}
        <a
          href={auraLoaded ? "https://auraplusplus.com/projects/kerach-tempo" : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center mt-[14px] mb-[-1px] pointer-events-auto transition-transform"
        >
          <img
            src="https://auraplusplus.com/images/badges/featured-on-light.svg"
            alt={auraLoaded ? "Featured on Aura++" : ""}
            loading="lazy"
            width={200}
            height={54}
            onLoad={() => setAuraLoaded(true)}
            onError={() => setAuraLoaded(false)}
            className={`rounded-md transition-opacity duration-300 ease-out ${
              auraLoaded ? "opacity-100 h-auto" : "opacity-5 h-[1px]"
            }`}
          />
        </a>
      </div>

      {/* Footer links */}
      <div
        className="mt-6 pt-4 flex items-center justify-center gap-2 border-t text-center text-sm text-gray-400"
        dir="ltr"
      >
        <a
          href="https://sourceforge.net/projects/kerach-tempo/"
          target="_blank"
          className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
        >
          SourceForge
        </a>
        <a
          href="https://github.com/Northstrix/kerach-tempo"
          target="_blank"
          className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
        >
          GitHub
        </a>
      </div>

      {/* Credit line */}
      <div className="pt-4 text-center text-sm text-gray-400" dir="ltr">
        <div className="mb-1">
          Made by{" "}
          <a
            href="https://maxim-bortnikov.netlify.app/"
            target="_blank"
            className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
          >
            Maxim Bortnikov
          </a>
        </div>

        <div className="mb-10">
          using{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
          >
            Next.js
          </a>
          ,{" "}
          <a
            href="https://www.perplexity.ai"
            target="_blank"
            className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
          >
            Perplexity
          </a>
          ,{" "}
          and{" "}
          <a
            href="https://firebase.studio"
            target="_blank"
            className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
          >
            Firebase Studio
          </a>.
        </div>
      </div>
    </footer>
  );
}
