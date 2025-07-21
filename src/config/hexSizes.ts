/**
 * Hex grid size configuration
 */

export interface HexSizeConfig {
  size: number;
  label: string;
}

export const HEX_SIZE_MAP: Record<number, HexSizeConfig> = {
  1: { size: 9.3, label: 'Tiny' },
  2: { size: 22.2, label: 'Small' },
  3: { size: 28.6, label: 'Medium' },
  4: { size: 40, label: 'Large' },
  5: { size: 66.7, label: 'Huge' },
} as const;
