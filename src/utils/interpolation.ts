/**
 * Interpolation utilities for smooth mouse path rendering
 */

import type { Point } from '../types/spreadsheet';

/**
 * Interpolates points along a line between two positions
 *
 * @param p1 - Start point
 * @param p2 - End point
 * @param stepSize - Distance between interpolated points in pixels
 * @returns Array of evenly-spaced points along the line (including start and end)
 */
export function interpolatePoints(p1: Point, p2: Point, stepSize: number): Point[] {
  // Calculate distance between points
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If points are very close, just return the end point
  if (distance < stepSize) {
    return [p2];
  }

  // Calculate number of steps needed
  const numSteps = Math.ceil(distance / stepSize);

  // Generate interpolated points
  const points: Point[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps; // Interpolation parameter from 0 to 1
    points.push({
      x: p1.x + dx * t,
      y: p1.y + dy * t,
    });
  }

  return points;
}

/**
 * Represents a point with a timestamp for tracking active interpolation points
 */
export interface TimestampedPoint extends Point {
  timestamp: number;
}

/**
 * Filters out points older than the specified max age
 *
 * @param points - Array of timestamped points
 * @param maxAge - Maximum age in milliseconds
 * @param currentTime - Current timestamp
 * @returns Filtered array containing only recent points
 */
export function filterRecentPoints(
  points: TimestampedPoint[],
  maxAge: number,
  currentTime: number
): TimestampedPoint[] {
  return points.filter(p => (currentTime - p.timestamp) <= maxAge);
}
