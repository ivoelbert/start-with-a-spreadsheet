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
