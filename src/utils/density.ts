/**
 * Density calculation utilities for time-based density accumulation
 */

import type { Point, CellBounds, DensityConfig } from '../types/spreadsheet';
import { calculateDistance, getCellCenter } from './subdivision';

/**
 * Calculate the increase rate for a cell based on distance from cursor
 * Uses linear falloff: full rate at cursor, zero at radius edge
 */
export function calculateIncreaseRate(
  distance: number,
  config: DensityConfig
): number {
  const { increaseRate, increaseMultiplier, influenceRadius } = config;

  // Outside influence radius - no increase
  if (distance >= influenceRadius) {
    return 0;
  }

  // Linear falloff from full rate at center to zero at edge
  const falloff = 1 - distance / influenceRadius;
  return increaseRate * increaseMultiplier * falloff;
}

/**
 * Update a cell's density value for one frame
 * Returns the new density value (clamped to [0, 1])
 */
export function updateCellDensity(
  currentDensity: number,
  cell: CellBounds,
  cursorPos: Point | null,
  deltaTime: number,
  config: DensityConfig
): number {
  let newDensity = currentDensity;

  // Apply increase if cursor is present and nearby
  if (cursorPos) {
    const cellCenter = getCellCenter(cell);
    const distance = calculateDistance(cursorPos, cellCenter);
    const increaseRate = calculateIncreaseRate(distance, config);

    // Increase is per-second, so multiply by deltaTime
    newDensity += increaseRate * deltaTime;
  }

  // Always apply global decay
  const { decayRate, decayMultiplier } = config;
  newDensity -= decayRate * decayMultiplier * deltaTime;

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, newDensity));
}

/**
 * Map density value (0-1) to subdivision level (0-maxLevel)
 */
export function densityToSubdivisionLevel(
  density: number,
  maxLevel: number
): number {
  // Simple linear mapping
  const level = Math.floor(density * maxLevel);
  return Math.max(0, Math.min(maxLevel, level));
}

/**
 * Get a heat map color based on density value (for debug visualization)
 * 0.0 = blue/cold, 0.5 = yellow/warm, 1.0 = red/hot
 */
export function densityToHeatColor(density: number): string {
  // Clamp density to [0, 1]
  const d = Math.max(0, Math.min(1, density));

  if (d < 0.5) {
    // Blue (0,0,255) -> Yellow (255,255,0)
    const t = d * 2; // 0 to 1
    const red = Math.floor(255 * t);
    const green = Math.floor(255 * t);
    const blue = Math.floor(255 * (1 - t));
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Yellow (255,255,0) -> Red (255,0,0)
    const t = (d - 0.5) * 2; // 0 to 1
    const red = 255;
    const green = Math.floor(255 * (1 - t));
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

/**
 * Create default density configuration
 * Target: 2.5 seconds to build max, 4 seconds to decay fully (at 60fps)
 */
export function createDefaultDensityConfig(): DensityConfig {
  // At 60fps: 1.0 / (2.5 * 60) ≈ 0.00667 per frame
  // Convert to per-second: 0.00667 * 60 ≈ 0.4
  const increaseRate = 0.4; // per second

  // At 60fps: 1.0 / (4.0 * 60) ≈ 0.00417 per frame
  // Convert to per-second: 0.00417 * 60 ≈ 0.25
  const decayRate = 0.25; // per second

  return {
    increaseRate,
    decayRate,
    influenceRadius: 500,
    increaseMultiplier: 1.0,
    decayMultiplier: 1.0,
  };
}
