/**
 * DOM utility helpers for consistent and safe DOM manipulation
 */

import { ErrorHandler, ErrorLevel } from './errorHandler';

export class DOMHelper {
  private static elementCache = new Map<string, HTMLElement>();

  /**
   * Get a DOM element with type safety and error handling
   */
  static getElement<T extends HTMLElement>(selector: string): T {
    // Check cache first
    const cached = this.elementCache.get(selector);
    if (cached) {
      return cached as T;
    }

    // Query the DOM
    const element = document.querySelector<T>(selector);
    if (!element) {
      ErrorHandler.handleDOMError(selector);
    }

    // Cache the element
    this.elementCache.set(selector, element);
    return element;
  }

  /**
   * Get multiple elements with type safety
   */
  static getElements<T extends HTMLElement>(selector: string): NodeListOf<T> {
    const elements = document.querySelectorAll<T>(selector);
    if (elements.length === 0) {
      ErrorHandler.logError(
        ErrorLevel.WARN,
        `No elements found for selector: ${selector}`,
        { operation: 'dom_query_all', details: { selector } }
      );
    }
    return elements;
  }

  /**
   * Safely set text content
   */
  static setText(selector: string, text: string): void {
    const element = this.getElement(selector);
    element.textContent = text;
  }

  /**
   * Safely set input value
   */
  static setInputValue(selector: string, value: string): void {
    const input = this.getElement<HTMLInputElement>(selector);
    input.value = value;
  }

  /**
   * Safely get input value
   */
  static getInputValue(selector: string): string {
    const input = this.getElement<HTMLInputElement>(selector);
    return input.value.trim();
  }

  /**
   * Add event listener with error handling
   */
  static addEventListener<K extends keyof HTMLElementEventMap>(
    selector: string,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    const element = this.getElement(selector);
    element.addEventListener(type, listener, options);
  }

  /**
   * Set button disabled state
   */
  static setButtonDisabled(selector: string, disabled: boolean): void {
    const button = this.getElement<HTMLButtonElement>(selector);
    button.disabled = disabled;
  }

  /**
   * Get canvas context with error handling
   */
  static getCanvasContext(selector: string): CanvasRenderingContext2D {
    const canvas = this.getElement<HTMLCanvasElement>(selector);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error(`Failed to get 2D context for canvas: ${selector}`);
    }
    return ctx;
  }

  /**
   * Set canvas dimensions
   */
  static setCanvasDimensions(
    selector: string,
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = this.getElement<HTMLCanvasElement>(selector);
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Clear element cache (useful for testing or dynamic content)
   */
  static clearCache(): void {
    this.elementCache.clear();
  }

  /**
   * Check if element exists without throwing
   */
  static elementExists(selector: string): boolean {
    return document.querySelector(selector) !== null;
  }
}

// Commonly used element selectors as constants
export const SELECTORS = {
  // Main containers
  MAP_CONTAINER: '#map-container',
  MAP: '#map',
  HEX_OVERLAY: '#hex-overlay',

  // Controls
  GENERATE_BUTTON: '#btn',
  SCREENSHOT_BUTTON: '#screenshot',
  HEX_DECREASE: '#hex-decrease',
  HEX_INCREASE: '#hex-increase',

  // Displays
  HEX_SIZE_DISPLAY: '#hex-size-display',
  CURRENT_SEED_DISPLAY: '#current-seed-display',

  // Inputs
  SEED_INPUT: '#seed-input',
} as const;
