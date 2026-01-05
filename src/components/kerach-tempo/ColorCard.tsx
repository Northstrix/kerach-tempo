"use client";

import React, { useState, useMemo } from 'react';
import chroma from 'chroma-js';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorCardProps {
  hex: string;
  label?: string;
}

export default function ColorCard({ hex, label }: ColorCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const contrastWithWhite = useMemo(() => {
    if (!chroma.valid(hex)) return 1;
    const contrastWhite = chroma.contrast(hex, '#FFFFFF');
    const contrastBlack = chroma.contrast(hex, '#000000');
    return Math.max(contrastWhite, contrastBlack);
  }, [hex]);

  const isLightColor = useMemo(() => {
    if (!chroma.valid(hex)) return false;
    const luminance = chroma(hex).luminance();
    return luminance > 0.5;
  }, [hex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(true);
    toast({ title: 'Copied to clipboard!', description: hex.toUpperCase() });
    setTimeout(() => setCopied(false), 2000);
  };

  const getContrastBadge = (contrast: number, level: 'AA' | 'AAA') => {
    const requiredRatio = level === 'AA' ? 4.5 : 7;
    const pass = contrast >= requiredRatio;
    return (
      <span
        className={`text-[9px] px-1.5 py-0.5 rounded-[100px] border flex items-center gap-1 font-bold ${
          pass
            ? 'border-green-600/80 bg-green-500/20 text-green-400 shadow-sm'
            : 'border-red-500/50 bg-red-500/10 text-red-400 border-opacity-60'
        }`}
      >
        {level}
      </span>
    );
  };

  const textColor = isLightColor ? '#000000' : '#FFFFFF';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-w-[320px] bg-black border border-border rounded-xl p-3 flex flex-col gap-3 flex-1"
    >
      {/* Color Preview - SAME border color as main card, SAME radius */}
      <div
        className="relative h-20 w-full border border-border rounded-xl overflow-hidden border"
        style={{
          backgroundColor: hex,
        }}
      >
        {label && (
          <span
            className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold shadow-sm"
            style={{
              color: textColor,
              backgroundColor: chroma(hex).alpha(0.3).hex()
            }}
          >
            {label}
          </span>
        )}
      </div>

      {/* Copy section */}
      <div className="flex justify-between items-center">
        <code className="text-xs font-mono font-bold tracking-wider text-foreground/90">
          {hex.toUpperCase()}
        </code>
      </div>

      {/* Contrast Section - Removed 1px line & kept consistent styling */}
      <div className="flex flex-col gap-3 rounded-xl bg-black/50 backdrop-blur-sm pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Letter preview - unchanged */}
            <div
              className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg shadow-md border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: hex,
                borderColor: isLightColor ? '#00000020' : '#ffffff20',
                color: textColor
              }}
            >
              A
            </div>
            <div className="flex flex-col items-baseline">
              <span className="text-sm font-mono font-bold text-foreground tracking-wide">
                {contrastWithWhite.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground/80 font-mono">
                {isLightColor ? 'vs Black' : 'vs White'}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {getContrastBadge(contrastWithWhite, 'AA')}
            {getContrastBadge(contrastWithWhite, 'AAA')}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
