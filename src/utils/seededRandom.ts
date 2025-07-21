/**
 * Seeded random number generator for reproducible randomness
 * Uses Linear Congruential Generator (LCG) algorithm
 */

import { RANDOM_GENERATOR } from '../constants';

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate the next random number in the sequence (0 to 1)
   */
  next(): number {
    this.seed =
      (this.seed * RANDOM_GENERATOR.MULTIPLIER + RANDOM_GENERATOR.INCREMENT) %
      RANDOM_GENERATOR.MODULUS;
    return this.seed / RANDOM_GENERATOR.MODULUS;
  }

  /**
   * Reset the generator to a specific seed
   */
  reset(seed: number): void {
    this.seed = seed;
  }

  /**
   * Get the current seed value
   */
  getCurrentSeed(): number {
    return this.seed;
  }
}
