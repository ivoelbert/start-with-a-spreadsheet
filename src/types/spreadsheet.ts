/**
 * TypeScript type definitions for the density spreadsheet
 */

export interface Point {
  x: number;
  y: number;
}

export interface CellBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SubdividedCell extends CellBounds {
  level: number;
  baseX: number; // Original grid column
  baseY: number; // Original grid row
  density?: number; // Accumulated density value (0.0 to 1.0)
}

export interface GridConfig {
  baseCellWidth: number;
  baseCellHeight: number;
  columns: number;
  rows: number;
  influenceRadius: number;
  maxSubdivisionLevel: number;
}

export type SubdivisionDirection = 'horizontal' | 'vertical';

export interface SubdivisionParams {
  distance: number;
  maxRadius: number;
  maxLevel: number;
}

export interface DensityConfig {
  increaseRate: number; // Base density increase per second at cursor position
  decayRate: number; // Global density decay per second
  influenceRadius: number; // Radius of cursor influence in pixels
  increaseMultiplier: number; // User-adjustable multiplier for increase rate
  decayMultiplier: number; // User-adjustable multiplier for decay rate
}
