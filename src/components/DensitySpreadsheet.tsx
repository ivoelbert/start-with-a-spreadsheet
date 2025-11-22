/**
 * DensitySpreadsheet Component
 *
 * Interactive spreadsheet with density effect - cells subdivide based on mouse proximity
 */

import React, { useRef, useEffect, useState } from 'react';
import type { Point, GridConfig, CellBounds, SubdividedCell } from '../types/spreadsheet';
import {
  calculateDistance,
  getCellCenter,
  calculateSubdivisionLevel,
  subdivideCell,
} from '../utils/subdivision';
import {
  clearCanvas,
  drawCell,
  drawCellWithDistanceColor,
  drawColumnHeaders,
  drawRowHeaders,
  drawCornerHeader,
} from '../utils/canvas';

interface DensitySpreadsheetProps {
  width?: number;
  height?: number;
  config?: Partial<GridConfig>;
  debugMode?: boolean;
}

const DEFAULT_CONFIG: GridConfig = {
  baseCellWidth: 80,
  baseCellHeight: 24,
  columns: 26,
  rows: 30,
  influenceRadius: 500,
  maxSubdivisionLevel: 8,
};

const HEADER_WIDTH = 45;
const HEADER_HEIGHT = 24;

export const DensitySpreadsheet: React.FC<DensitySpreadsheetProps> = ({
  width = 2200,
  height = 800,
  config: configOverride = {},
  debugMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const animationFrameRef = useRef<number>();

  // Merge default config with overrides
  const config: GridConfig = { ...DEFAULT_CONFIG, ...configOverride };

  // Generate base grid cells (offset by headers)
  const getBaseCells = (): SubdividedCell[] => {
    const cells: SubdividedCell[] = [];
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        cells.push({
          x: HEADER_WIDTH + col * config.baseCellWidth,
          y: HEADER_HEIGHT + row * config.baseCellHeight,
          width: config.baseCellWidth,
          height: config.baseCellHeight,
          level: 0,
          baseX: col,
          baseY: row,
        });
      }
    }
    return cells;
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setMousePos(null);
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const render = () => {
      // Clear canvas
      clearCanvas(ctx, width, height);

      // Draw headers first (they stay static)
      drawCornerHeader(ctx, HEADER_WIDTH, HEADER_HEIGHT);
      drawColumnHeaders(ctx, config.columns, config.baseCellWidth, HEADER_WIDTH, HEADER_HEIGHT);
      drawRowHeaders(ctx, config.rows, config.baseCellHeight, HEADER_WIDTH, HEADER_HEIGHT);

      const baseCells = getBaseCells();

      // If no mouse position, just draw base grid
      if (!mousePos) {
        baseCells.forEach((cell) => {
          drawCell(ctx, cell, '#ffffff', '#d0d0d0');
        });
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Process each base cell
      baseCells.forEach((baseCell) => {
        const cellCenter = getCellCenter(baseCell);
        const distance = calculateDistance(mousePos, cellCenter);

        // Calculate subdivision level based on distance
        const subdivisionLevel = calculateSubdivisionLevel({
          distance,
          maxRadius: config.influenceRadius,
          maxLevel: config.maxSubdivisionLevel,
        });

        // Subdivide cell if needed
        if (subdivisionLevel > 0) {
          const subdivided = subdivideCell(baseCell, subdivisionLevel);

          // Draw all subdivided cells
          subdivided.forEach((subCell) => {
            if (debugMode) {
              // Debug mode: color by distance
              drawCellWithDistanceColor(ctx, subCell, distance, config.influenceRadius);
            } else {
              // Normal mode: white cells with light borders
              drawCell(ctx, subCell, '#ffffff', '#d0d0d0');
            }
          });
        } else {
          // No subdivision - draw base cell
          if (debugMode) {
            drawCellWithDistanceColor(ctx, baseCell, distance, config.influenceRadius);
          } else {
            drawCell(ctx, baseCell, '#ffffff', '#d0d0d0');
          }
        }
      });

      // Draw mouse cursor position (debug)
      if (debugMode) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw influence radius
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, config.influenceRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos, width, height, config, debugMode]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'block',
        border: '1px solid #000',
        cursor: 'crosshair',
        backgroundColor: '#ffffff',
      }}
    />
  );
};

export default DensitySpreadsheet;
