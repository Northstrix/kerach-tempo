import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const cleanHex = hex.replace('#', '').padStart(6, '0');
  const bigint = parseInt(cleanHex, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b] as [number, number, number];
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const to255 = (n: number) => Math.round(Math.max(0, Math.min(255, n * 255)));
  const rHex = to255(r).toString(16).padStart(2, '0');
  const gHex = to255(g).toString(16).padStart(2, '0');
  const bHex = to255(b).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
};
