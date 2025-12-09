import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names.
 * Combines clsx for conditional classes and twMerge to resolve Tailwind conflicts.
 * 
 * @param inputs - Variable number of class name inputs (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```ts
 * cn('px-2', 'px-4') // Returns 'px-4' (last one wins)
 * cn({ 'bg-red': true, 'text-white': false }) // Returns 'bg-red'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic seeded RNG utilities for SSR/CSR-safe randomness.
 * These utilities ensure consistent random values across server and client renders.
 */

/**
 * Converts a string to a 32-bit unsigned integer hash.
 * Uses FNV-1a hash algorithm variant for deterministic hashing.
 * 
 * @param input - String to hash
 * @returns 32-bit unsigned integer hash value
 * 
 * @example
 * ```ts
 * hashStringToUint32('hello') // Returns consistent hash value
 * ```
 */
export function hashStringToUint32(input: string): number {
  let hash = 2166136261 >>> 0; // FNV offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }
  return hash >>> 0; // Ensure unsigned 32-bit
}

/**
 * Mulberry32 pseudorandom number generator.
 * Fast, high-quality PRNG suitable for seeded random number generation.
 * 
 * @param seed - 32-bit seed value
 * @returns Function that generates random numbers between 0 and 1
 * 
 * @example
 * ```ts
 * const random = mulberry32(12345);
 * random() // Returns value between 0 and 1
 * ```
 */
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a seeded random number generator from a string seed.
 * Useful for generating consistent random values based on string identifiers.
 * 
 * @param seedString - String seed to generate random numbers from
 * @returns Function that generates random numbers between 0 and 1
 * 
 * @example
 * ```ts
 * const random = seededRandom('project-id-123');
 * random() // Returns consistent random value for this seed
 * ```
 */
export function seededRandom(seedString: string): () => number {
  return mulberry32(hashStringToUint32(seedString));
}

/**
 * Maps a number from one range to another range.
 * Clamps the input value to the input range, then scales it to the output range.
 * 
 * @param value - Value to map
 * @param inMin - Minimum value of input range
 * @param inMax - Maximum value of input range
 * @param outMin - Minimum value of output range
 * @param outMax - Maximum value of output range
 * @returns Mapped value in the output range
 * 
 * @example
 * ```ts
 * mapNumber(50, 0, 100, 0, 1) // Returns 0.5
 * mapNumber(150, 0, 100, 0, 1) // Returns 1 (clamped)
 * ```
 */
export function mapNumber(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const clamped = Math.min(Math.max(value, inMin), inMax);
  const ratio = (clamped - inMin) / (inMax - inMin || 1);
  return outMin + ratio * (outMax - outMin);
}

/**
 * Clamps a number between a minimum and maximum value.
 * 
 * @param value - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value between min and max
 * 
 * @example
 * ```ts
 * clampNumber(150, 0, 100) // Returns 100
 * clampNumber(-10, 0, 100) // Returns 0
 * clampNumber(50, 0, 100)  // Returns 50
 * ```
 */
export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
