/**
 * Density calculation utilities for time-based density accumulation
 */

import type { Point, CellBounds, Config } from '../types/spreadsheet';
import { calculateDistance, getCellCenter } from './subdivision';

/**
 * Calculate the increase rate for a cell based on distance from cursor
 * Uses linear falloff: full rate at cursor, zero at radius edge
 * Optionally boosted by cursor velocity
 */
export function calculateIncreaseRate(
  distance: number,
  config: Config,
  velocity: number = 0
): number {
  const { increaseRate, increaseMultiplier, influenceRadius } = config;

  // Outside influence radius - no increase
  if (distance >= influenceRadius) {
    return 0;
  }

  // Linear falloff from full rate at center to zero at edge
  const falloff = 1 - distance / influenceRadius;

  // Apply velocity multiplier
  const velocityMultiplier = calculateVelocityMultiplier(
    velocity,
    config.velocityInfluence
  );

  return increaseRate * increaseMultiplier * falloff * velocityMultiplier;
}

/**
 * Calculate time-based decay multiplier
 * Returns 0 (no decay) during hold period, then ramps up exponentially
 *
 * @param timeSincePainted - Time in seconds since cell was last painted
 * @param config - Density configuration
 */
export function calculateTimeBasedDecayMultiplier(
  timeSincePainted: number,
  config: Config
): number {
  const { holdDuration, decayAcceleration } = config;

  // During hold period: no decay
  if (timeSincePainted < holdDuration) {
    return 0;
  }

  // After hold period: exponential ramp-up
  const timeAfterHold = timeSincePainted - holdDuration;

  // Exponential curve: 1 - exp(-x * acceleration)
  // This creates smooth S-curve from 0 to 1
  const rawMultiplier = 1 - Math.exp(-timeAfterHold * decayAcceleration / 2.0);

  return rawMultiplier;
}

/**
 * Update a cell's density value for one frame
 * Returns the new density value (clamped to [0, 1])
 *
 * @param currentDensity - Current density value of the cell
 * @param cell - Cell bounds
 * @param cursorPositions - Array of cursor positions (for interpolated paths)
 * @param deltaTime - Time elapsed since last frame
 * @param config - Density configuration
 * @param cursorVelocity - Current cursor velocity
 * @param lastPaintedTime - Timestamp when cell was last painted (milliseconds)
 * @param currentTime - Current timestamp (milliseconds)
 */
export function updateCellDensity(
  currentDensity: number,
  cell: CellBounds,
  cursorPositions: Point[],
  deltaTime: number,
  config: Config,
  cursorVelocity: number = 0,
  lastPaintedTime: number,
  currentTime: number
): number {
  let newDensity = currentDensity;

  // Apply increase if cursor positions are present
  if (cursorPositions.length > 0) {
    const cellCenter = getCellCenter(cell);

    // Accumulate density from all cursor positions
    // Each position contributes proportionally
    let totalIncreaseRate = 0;

    for (const cursorPos of cursorPositions) {
      const distance = calculateDistance(cursorPos, cellCenter);
      const increaseRate = calculateIncreaseRate(distance, config, cursorVelocity);
      totalIncreaseRate += increaseRate;
    }

    // Average the increase rate to prevent over-accumulation
    const avgIncreaseRate = totalIncreaseRate / cursorPositions.length;

    // Increase is per-second, so multiply by deltaTime
    newDensity += avgIncreaseRate * deltaTime;
  }

  // Apply time-based decay
  const timeSincePainted = (currentTime - lastPaintedTime) / 1000; // Convert to seconds
  const timeBasedMultiplier = calculateTimeBasedDecayMultiplier(timeSincePainted, config);

  const { decayRate, decayMultiplier } = config;
  const finalDecayRate = decayRate * decayMultiplier * timeBasedMultiplier;
  newDensity -= finalDecayRate * deltaTime;

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
 * Calculate velocity multiplier based on cursor speed
 * velocity: pixels per second
 * velocityInfluence: direct multiplier (1x to 15x) applied at max speed
 * Returns multiplier from 1.0 (slow) up to velocityInfluence (fast)
 * Uses cubic curve for dramatic boost only at high speeds
 */
export function calculateVelocityMultiplier(
  velocity: number,
  velocityInfluence: number
): number {
  if (velocityInfluence <= 1.0) {
    return 1.0; // No velocity boost
  }

  // High threshold: 1000 px/s is considered "very fast"
  const maxVelocity = 1000;
  const normalizedVelocity = Math.min(velocity / maxVelocity, 1.0);

  // Apply cubic curve (x^3) for very steep boost at high speeds
  const curvedVelocity = normalizedVelocity * normalizedVelocity * normalizedVelocity;

  // Interpolate from 1.0 (no boost) to velocityInfluence (max boost)
  // At 0 velocity: 1.0, at max velocity: velocityInfluence
  return 1.0 + curvedVelocity * (velocityInfluence - 1.0);
}

/**
 * Create default configuration
 * Target: 2.5 seconds to build max, 4 seconds to decay fully (at 60fps)
 */
export function createDefaultConfig(): Config {
  // At 60fps: 1.0 / (2.5 * 60) ≈ 0.00667 per frame
  // Convert to per-second: 0.00667 * 60 ≈ 0.4
  const increaseRate = 0.4; // per second

  // At 60fps: 1.0 / (4.0 * 60) ≈ 0.00417 per frame
  // Convert to per-second: 0.00417 * 60 ≈ 0.25
  const decayRate = 0.25; // per second

  return {
    // Grid properties
    baseCellWidth: 80,
    baseCellHeight: 24,
    columns: 26,
    rows: 30,

    // Painting/density properties
    increaseRate,
    decayRate,
    influenceRadius: 200, // Small brush by default
    increaseMultiplier: 0.8, // Slow build speed
    decayMultiplier: 1.0, // Normal fade speed
    velocityInfluence: 8.0, // 8x velocity boost
    interpolationDensity: 5.0, // 5x smoothness - very smooth strokes
    holdDuration: 1.5, // Hold steady for 1.5 seconds before decay starts
    decayAcceleration: 5.0, // Fast acceleration - quick drop-off after hold
    maxSubdivisionLevel: 6, // Default max subdivision level
  };
}
