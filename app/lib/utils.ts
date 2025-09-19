import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Deterministic seeded RNG utilities for SSR/CSR-safe randomness
// Simple 32-bit string hash (FNV-1a based tweak)
export function hashStringToUint32(input: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Mulberry32 PRNG
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(seedString: string): () => number {
  return mulberry32(hashStringToUint32(seedString));
}

export function mapNumber(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const clamped = Math.min(Math.max(value, inMin), inMax);
  const ratio = (clamped - inMin) / (inMax - inMin || 1);
  return outMin + ratio * (outMax - outMin);
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
