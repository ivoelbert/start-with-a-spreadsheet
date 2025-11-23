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

export type SubdivisionDirection = 'horizontal' | 'vertical';

export interface SubdivisionParams {
  distance: number;
  maxRadius: number;
  maxLevel: number;
}

export interface Config {
  // Grid properties
  baseCellWidth: number;
  baseCellHeight: number;
  columns: number;
  rows: number;

  // Painting/density properties
  increaseRate: number; // Base density increase per second at cursor position
  decayRate: number; // Global density decay per second
  influenceRadius: number; // Radius of cursor influence in pixels
  increaseMultiplier: number; // User-adjustable multiplier for increase rate
  decayMultiplier: number; // User-adjustable multiplier for decay rate
  velocityInfluence: number; // How much velocity affects build speed (1.0 to 15.0)
  interpolationDensity: number; // Density of interpolation points (0.5 to 10.0, higher = smoother)
  holdDuration: number; // Time in seconds before decay starts (0 to 3 seconds)
  decayAcceleration: number; // How quickly decay ramps up over time (0.5 to 10.0)
  maxSubdivisionLevel: number; // Maximum subdivision level (1 to 12)
}

export interface CellDensityState {
  density: number; // Current density value (0.0 to 1.0)
  lastPaintedTime: number; // Timestamp when this cell was last painted (milliseconds)
}
