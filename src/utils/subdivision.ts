/**
 * Subdivision utilities for the density spreadsheet
 */

import type {
  Point,
  SubdivisionDirection,
  SubdivisionParams,
  CellBounds,
} from '../types/spreadsheet';

/**
 * Calculate Euclidean distance between two points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get the center point of a cell
 */
export function getCellCenter(cell: CellBounds): Point {
  return {
    x: cell.x + cell.width / 2,
    y: cell.y + cell.height / 2,
  };
}

/**
 * Calculate subdivision level based on distance from pointer
 * Uses linear falloff by default
 */
export function calculateSubdivisionLevel(params: SubdivisionParams): number {
  const { distance, maxRadius, maxLevel } = params;

  // Outside influence radius - no subdivision
  if (distance >= maxRadius) {
    return 0;
  }

  // Linear falloff: level decreases linearly with distance
  const normalizedDistance = distance / maxRadius;
  const level = Math.floor(maxLevel * (1 - normalizedDistance));

  return Math.max(0, Math.min(maxLevel, level));
}

/**
 * Alternative: Exponential falloff for sharper focus at center
 */
export function calculateSubdivisionLevelExponential(
  params: SubdivisionParams
): number {
  const { distance, maxRadius, maxLevel } = params;

  if (distance >= maxRadius) {
    return 0;
  }

  const normalizedDistance = distance / maxRadius;
  const level = Math.floor(maxLevel * Math.pow(1 - normalizedDistance, 2));

  return Math.max(0, Math.min(maxLevel, level));
}

/**
 * Determine which direction to subdivide based on cell dimensions
 * Goal: keep cells as close to square (1:1 ratio) as possible
 */
export function getSubdivisionDirection(
  width: number,
  height: number
): SubdivisionDirection {
  // If width is greater, split vertically (divide width)
  // If height is greater, split horizontally (divide height)
  return width > height ? 'vertical' : 'horizontal';
}

/**
 * Subdivide a cell into two children based on direction
 */
export function subdivideCellOnce(
  cell: CellBounds,
  direction: SubdivisionDirection
): [CellBounds, CellBounds] {
  if (direction === 'vertical') {
    // Split width in half
    const halfWidth = cell.width / 2;
    return [
      { x: cell.x, y: cell.y, width: halfWidth, height: cell.height },
      {
        x: cell.x + halfWidth,
        y: cell.y,
        width: halfWidth,
        height: cell.height,
      },
    ];
  } else {
    // Split height in half
    const halfHeight = cell.height / 2;
    return [
      { x: cell.x, y: cell.y, width: cell.width, height: halfHeight },
      {
        x: cell.x,
        y: cell.y + halfHeight,
        width: cell.width,
        height: halfHeight,
      },
    ];
  }
}

/**
 * Recursively subdivide a cell to a target level
 */
export function subdivideCell(
  cell: CellBounds,
  targetLevel: number,
  currentLevel: number = 0
): CellBounds[] {
  // Base case: reached target level
  if (currentLevel >= targetLevel) {
    return [cell];
  }

  // Determine subdivision direction
  const direction = getSubdivisionDirection(cell.width, cell.height);

  // Subdivide once
  const [child1, child2] = subdivideCellOnce(cell, direction);

  // Recursively subdivide children
  const nextLevel = currentLevel + 1;
  return [
    ...subdivideCell(child1, targetLevel, nextLevel),
    ...subdivideCell(child2, targetLevel, nextLevel),
  ];
}
