/**
 * DensitySpreadsheet Component
 *
 * Interactive spreadsheet with density effect - cells subdivide based on mouse proximity
 */

import React, { useRef, useEffect, useState } from 'react';
import type { Point, GridConfig, CellBounds, SubdividedCell, DensityConfig } from '../types/spreadsheet';
import {
  calculateDistance,
  getCellCenter,
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
import {
  updateCellDensity,
  densityToSubdivisionLevel,
  densityToHeatColor,
  createDefaultDensityConfig,
} from '../utils/density';

interface DensitySpreadsheetProps {
  width?: number;
  height?: number;
  config?: Partial<GridConfig>;
  densityConfig?: Partial<DensityConfig>;
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
  width,
  height,
  config: configOverride = {},
  densityConfig: densityConfigOverride = {},
  debugMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [cellDensities, setCellDensities] = useState<Map<string, number>>(new Map());
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Merge default configs with overrides
  const config: GridConfig = { ...DEFAULT_CONFIG, ...configOverride };
  const densityConfig: DensityConfig = {
    ...createDefaultDensityConfig(),
    ...densityConfigOverride,
  };

  // Calculate canvas size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: width || rect.width,
          height: height || rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);

  // Calculate how many columns/rows fit in the canvas
  const getGridDimensions = () => {
    const availableWidth = canvasSize.width - HEADER_WIDTH;
    const availableHeight = canvasSize.height - HEADER_HEIGHT;

    const columns = Math.ceil(availableWidth / config.baseCellWidth);
    const rows = Math.ceil(availableHeight / config.baseCellHeight);

    return { columns, rows };
  };

  // Generate base grid cells (offset by headers)
  const getBaseCells = (): SubdividedCell[] => {
    const cells: SubdividedCell[] = [];
    const { columns, rows } = getGridDimensions();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
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

  // Continuous render loop with density updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.scale(dpr, dpr);

    const render = (currentTime: number) => {
      // Calculate delta time in seconds
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = currentTime;

      // Cap delta time to prevent huge jumps (e.g., when tab is inactive)
      const cappedDeltaTime = Math.min(deltaTime, 0.1);

      // Clear canvas
      clearCanvas(ctx, canvasSize.width, canvasSize.height);

      // Get dynamic grid dimensions
      const { columns, rows } = getGridDimensions();

      // Draw headers first (they stay static)
      drawCornerHeader(ctx, HEADER_WIDTH, HEADER_HEIGHT);
      drawColumnHeaders(ctx, columns, config.baseCellWidth, HEADER_WIDTH, HEADER_HEIGHT);
      drawRowHeaders(ctx, rows, config.baseCellHeight, HEADER_WIDTH, HEADER_HEIGHT);

      const baseCells = getBaseCells();

      // Update densities and render
      const newDensities = new Map(cellDensities);

      baseCells.forEach((baseCell) => {
        const cellKey = `${baseCell.baseX},${baseCell.baseY}`;
        const currentDensity = newDensities.get(cellKey) || 0;

        // Update density for this cell
        const newDensity = updateCellDensity(
          currentDensity,
          baseCell,
          mousePos,
          cappedDeltaTime,
          densityConfig
        );

        newDensities.set(cellKey, newDensity);

        // Calculate subdivision level from density
        const subdivisionLevel = densityToSubdivisionLevel(
          newDensity,
          config.maxSubdivisionLevel
        );

        // Subdivide cell if needed
        if (subdivisionLevel > 0) {
          const subdivided = subdivideCell(baseCell, subdivisionLevel);

          // Draw all subdivided cells
          subdivided.forEach((subCell) => {
            if (debugMode) {
              // Debug mode: color by density (heat map)
              const heatColor = densityToHeatColor(newDensity);
              drawCell(ctx, subCell, heatColor, '#808080');
            } else {
              // Normal mode: white cells with light borders
              drawCell(ctx, subCell, '#ffffff', '#d0d0d0');
            }
          });
        } else {
          // No subdivision - draw base cell
          if (debugMode) {
            // Debug mode: color by density (heat map)
            const heatColor = densityToHeatColor(newDensity);
            drawCell(ctx, baseCell, heatColor, '#808080');
          } else {
            drawCell(ctx, baseCell, '#ffffff', '#d0d0d0');
          }
        }
      });

      // Update state with new densities
      setCellDensities(newDensities);

      // Draw mouse cursor position (debug)
      if (debugMode && mousePos) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw influence radius
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, densityConfig.influenceRadius, 0, Math.PI * 2);
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
  }, [mousePos, canvasSize.width, canvasSize.height, config, densityConfig, debugMode, cellDensities]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'block',
          cursor: 'crosshair',
          backgroundColor: '#ffffff',
        }}
      />
    </div>
  );
};

export default DensitySpreadsheet;
