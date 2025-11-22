/**
 * Canvas drawing utilities for the density spreadsheet
 */

import type { CellBounds } from '../types/spreadsheet';

/**
 * Calculate border color that gets lighter with subdivision level
 * Level 0 = #d0d0d0 (base), Level 8 = #f0f0f0 (very light)
 */
function calculateBorderColor(subdivisionLevel: number, maxLevel: number = 8): string {
  // Base color: rgb(208, 208, 208) = #d0d0d0
  // Max color: rgb(245, 245, 245) = #f5f5f5
  const baseValue = 208;
  const maxValue = 245;

  const normalizedLevel = Math.min(subdivisionLevel / maxLevel, 1.0);
  const colorValue = Math.floor(baseValue + (maxValue - baseValue) * normalizedLevel);

  return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
}

/**
 * Calculate border color with transparency for image cells
 * Higher subdivision = more transparent borders
 * Level 0 = rgba(128, 128, 128, 0.3), Level 8 = rgba(128, 128, 128, 0.05)
 */
export function calculateImageBorderColor(subdivisionLevel: number, maxLevel: number = 8): string {
  // Start with 30% opacity, fade to 5% opacity at max subdivision
  const baseAlpha = 0.3;
  const minAlpha = 0.05;

  const normalizedLevel = Math.min(subdivisionLevel / maxLevel, 1.0);
  const alpha = baseAlpha - (baseAlpha - minAlpha) * normalizedLevel;

  return `rgba(128, 128, 128, ${alpha.toFixed(3)})`;
}

/**
 * Draw a single cell on the canvas with Excel-like styling
 * Border gets progressively lighter with subdivision level
 */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: CellBounds,
  fillColor: string = '#ffffff',
  strokeColor?: string,
  subdivisionLevel: number = 0
): void {
  // Fill
  ctx.fillStyle = fillColor;
  ctx.fillRect(cell.x, cell.y, cell.width, cell.height);

  // Stroke (border) - gets lighter with subdivision
  const borderColor = strokeColor || calculateBorderColor(subdivisionLevel);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(cell.x + 0.25, cell.y + 0.25, cell.width - 0.5, cell.height - 0.5);
}

/**
 * Draw cells with a color based on distance (for debug visualization)
 */
export function drawCellWithDistanceColor(
  ctx: CanvasRenderingContext2D,
  cell: CellBounds,
  distance: number,
  maxRadius: number
): void {
  // Normalize distance to 0-1
  const normalized = Math.min(distance / maxRadius, 1);

  // Color gradient: blue (far) -> red (near)
  const red = Math.floor(255 * (1 - normalized));
  const blue = Math.floor(255 * normalized);
  const green = 0;

  const fillColor = `rgb(${red}, ${green}, ${blue})`;

  drawCell(ctx, cell, fillColor, '#808080');
}

/**
 * Clear the entire canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Draw a grid of cells
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  cells: CellBounds[],
  fillColor?: string,
  strokeColor?: string
): void {
  cells.forEach((cell) => {
    drawCell(ctx, cell, fillColor, strokeColor);
  });
}

/**
 * Draw column headers (A, B, C, ...)
 */
export function drawColumnHeaders(
  ctx: CanvasRenderingContext2D,
  columns: number,
  cellWidth: number,
  headerWidth: number,
  headerHeight: number
): void {
  ctx.fillStyle = '#c0c0c0';
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.font = '11px ms_sans_serif, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < columns; i++) {
    const x = headerWidth + i * cellWidth;
    const y = 0;

    // Draw header background with 3D effect
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x, y, cellWidth, headerHeight);

    // Draw border
    ctx.strokeStyle = '#808080';
    ctx.strokeRect(x, y, cellWidth, headerHeight);

    // Draw text
    ctx.fillStyle = '#000000';
    const letter = String.fromCharCode(65 + i);
    ctx.fillText(letter, x + cellWidth / 2, y + headerHeight / 2);
  }
}

/**
 * Draw row headers (1, 2, 3, ...)
 */
export function drawRowHeaders(
  ctx: CanvasRenderingContext2D,
  rows: number,
  cellHeight: number,
  headerWidth: number,
  headerHeight: number
): void {
  ctx.fillStyle = '#c0c0c0';
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.font = '11px ms_sans_serif, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < rows; i++) {
    const x = 0;
    const y = headerHeight + i * cellHeight;

    // Draw header background
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x, y, headerWidth, cellHeight);

    // Draw border
    ctx.strokeStyle = '#808080';
    ctx.strokeRect(x, y, headerWidth, cellHeight);

    // Draw text
    ctx.fillStyle = '#000000';
    ctx.fillText(String(i + 1), x + headerWidth / 2, y + cellHeight / 2);
  }
}

/**
 * Draw corner header cell (top-left)
 */
export function drawCornerHeader(
  ctx: CanvasRenderingContext2D,
  headerWidth: number,
  headerHeight: number
): void {
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, headerWidth, headerHeight);
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, headerWidth, headerHeight);
}
