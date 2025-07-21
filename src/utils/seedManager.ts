/**
 * Centralized seed management for consistent handling across the application
 */

import { NAVIGATION } from '../constants';
import { ErrorHandler, ErrorLevel } from './errorHandler';
import { DOMHelper, SELECTORS } from './domUtils';

export class SeedManager {
  private static currentSeed: number | null = null;

  /**
   * Get the current seed value
   */
  static getCurrentSeed(): number | null {
    return this.currentSeed;
  }

  /**
   * Set the current seed value
   */
  static setSeed(seed: number | null): void {
    this.currentSeed = seed;
  }

  /**
   * Generate a random seed within the valid range
   */
  static generateRandomSeed(): number {
    return Math.floor(Math.random() * NAVIGATION.MAX_SEED_VALUE);
  }

  /**
   * Extract seed from URL parameters
   */
  static getSeedFromURL(): number | null {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const seedParam = urlParams.get('seed');

      if (!seedParam) {
        return null;
      }

      const seed = parseInt(seedParam, 10);
      if (isNaN(seed)) {
        ErrorHandler.logError(
          ErrorLevel.WARN,
          'Invalid seed in URL parameters',
          { operation: 'url_seed_parsing', details: { seedParam } }
        );
        return null;
      }

      return seed;
    } catch (error) {
      ErrorHandler.logError(
        ErrorLevel.ERROR,
        'Failed to parse seed from URL',
        { operation: 'url_seed_parsing' },
        error
      );
      return null;
    }
  }

  /**
   * Update URL with current seed
   */
  static updateURLWithSeed(seed: number | null): void {
    try {
      const url = new URL(window.location.href);

      if (seed !== null) {
        url.searchParams.set('seed', seed.toString());
      } else {
        url.searchParams.delete('seed');
      }

      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      ErrorHandler.logError(
        ErrorLevel.ERROR,
        'Failed to update URL with seed',
        { operation: 'url_seed_update', details: { seed } },
        error
      );
    }
  }

  /**
   * Update the seed display in the UI
   */
  static updateSeedDisplay(seed: number): void {
    try {
      DOMHelper.setText(SELECTORS.CURRENT_SEED_DISPLAY, seed.toString());
    } catch (error) {
      ErrorHandler.logError(
        ErrorLevel.ERROR,
        'Failed to update seed display',
        { operation: 'seed_display_update', details: { seed } },
        error
      );
    }
  }

  /**
   * Initialize seed from URL without populating input field
   */
  static initializeFromURL(): void {
    const urlSeed = this.getSeedFromURL();
    if (urlSeed !== null) {
      try {
        // Don't populate the input field - keep it empty for user input
        // but still set the current seed and display it
        this.setSeed(urlSeed);
        this.updateSeedDisplay(urlSeed);
      } catch (error) {
        ErrorHandler.logError(
          ErrorLevel.ERROR,
          'Failed to initialize seed from URL',
          { operation: 'seed_url_initialization', details: { urlSeed } },
          error
        );
      }
    }
  }

  /**
   * Process seed input from user
   */
  static processSeedInput(): void {
    try {
      const inputValue = DOMHelper.getInputValue(SELECTORS.SEED_INPUT);
      const validatedSeed = ErrorHandler.validateSeed(inputValue);

      if (validatedSeed !== null) {
        this.setSeed(validatedSeed);
        this.updateURLWithSeed(validatedSeed);
      } else if (inputValue === '') {
        this.setSeed(null);
        this.updateURLWithSeed(null);
      }
      // Invalid seeds are handled by ErrorHandler.validateSeed
    } catch (error) {
      ErrorHandler.logError(
        ErrorLevel.ERROR,
        'Failed to process seed input',
        { operation: 'seed_input_processing' },
        error
      );
    }
  }

  /**
   * Get seed for navigation - either from input or generate new one
   */
  static getSeedForNavigation(): number {
    try {
      const inputValue = DOMHelper.getInputValue(SELECTORS.SEED_INPUT);

      if (inputValue === '') {
        // Generate new random seed
        return this.generateRandomSeed();
      } else {
        const validatedSeed = ErrorHandler.validateSeed(inputValue);
        if (validatedSeed !== null) {
          // Clear the input after using the seed
          DOMHelper.setInputValue(SELECTORS.SEED_INPUT, '');
          return validatedSeed;
        } else {
          // If invalid input, generate new seed
          return this.generateRandomSeed();
        }
      }
    } catch (error) {
      ErrorHandler.logError(
        ErrorLevel.ERROR,
        'Failed to get seed for navigation, using random',
        { operation: 'seed_navigation_get' },
        error
      );
      return this.generateRandomSeed();
    }
  }

  /**
   * Complete seed setup for navigation
   */
  static setupSeedForNavigation(): number {
    const seed = this.getSeedForNavigation();
    this.setSeed(seed);
    this.updateSeedDisplay(seed);
    this.updateURLWithSeed(seed);
    return seed;
  }

  /**
   * Initialize application with seed (from URL or generate new)
   */
  static initializeAppSeed(): number {
    let seed = this.getSeedFromURL();
    if (!seed) {
      seed = this.generateRandomSeed();
    }
    this.setSeed(seed);
    return seed;
  }
}
