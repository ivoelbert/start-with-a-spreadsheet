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
  calculateImageBorderColor,
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
  insertedImage?: string | null;
  imageScale?: number;
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
  insertedImage = null,
  imageScale = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [cellDensities, setCellDensities] = useState<Map<string, number>>(new Map());
  const [cursorVelocity, setCursorVelocity] = useState<number>(0);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const imageDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());
  const lastMousePosRef = useRef<Point | null>(null);
  const lastMouseMoveTimeRef = useRef<number>(performance.now());

  // Merge default configs with overrides
  const config: GridConfig = { ...DEFAULT_CONFIG, ...configOverride };
  const densityConfig: DensityConfig = {
    ...createDefaultDensityConfig(),
    ...densityConfigOverride,
  };

  // Helper function to sample pixel color from ImageData
  const samplePixel = (imageData: ImageData, x: number, y: number): string => {
    const { width, height, data } = imageData;

    // Clamp coordinates to image bounds
    const clampedX = Math.max(0, Math.min(Math.floor(x), width - 1));
    const clampedY = Math.max(0, Math.min(Math.floor(y), height - 1));

    // Calculate pixel index (4 bytes per pixel: RGBA)
    const index = (clampedY * width + clampedX) * 4;

    // Extract RGB values
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper function to get cell color based on image pixel at cell center
  const getCellColor = (
    cell: SubdividedCell,
    imageBounds: { x: number; y: number; width: number; height: number } | null
  ): string | null => {
    if (!imageDataRef.current || !imageDimensionsRef.current || !imageBounds) {
      return null;
    }

    // Calculate cell center point
    const cellCenterX = cell.x + cell.width / 2;
    const cellCenterY = cell.y + cell.height / 2;

    // Check if cell center is within image bounds
    if (
      cellCenterX < imageBounds.x ||
      cellCenterX > imageBounds.x + imageBounds.width ||
      cellCenterY < imageBounds.y ||
      cellCenterY > imageBounds.y + imageBounds.height
    ) {
      return null; // Cell is outside image
    }

    // Map canvas coordinates to image pixel coordinates
    const imageX = ((cellCenterX - imageBounds.x) / imageBounds.width) * imageDimensionsRef.current.width;
    const imageY = ((cellCenterY - imageBounds.y) / imageBounds.height) * imageDimensionsRef.current.height;

    // Sample the pixel color
    return samplePixel(imageDataRef.current, imageX, imageY);
  };

  // Load inserted image and extract pixel data
  useEffect(() => {
    if (insertedImage) {
      const img = new Image();
      img.onload = () => {
        setLoadedImage(img);

        // Create offscreen canvas to extract pixel data
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        if (offscreenCtx) {
          // Fill with white background first (for transparent pixels)
          offscreenCtx.fillStyle = '#ffffff';
          offscreenCtx.fillRect(0, 0, img.width, img.height);

          // Draw image on top of white background
          offscreenCtx.drawImage(img, 0, 0);

          // Extract pixel data
          const imageData = offscreenCtx.getImageData(0, 0, img.width, img.height);
          imageDataRef.current = imageData;
          imageDimensionsRef.current = { width: img.width, height: img.height };
        }
      };
      img.src = insertedImage;
    } else {
      setLoadedImage(null);
      imageDataRef.current = null;
      imageDimensionsRef.current = null;
    }
  }, [insertedImage]);

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
    const newPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const now = performance.now();

    // Calculate velocity if we have a previous position
    if (lastMousePosRef.current) {
      const distance = calculateDistance(newPos, lastMousePosRef.current);
      const deltaTime = (now - lastMouseMoveTimeRef.current) / 1000;

      // Velocity in pixels per second
      const velocity = deltaTime > 0 ? distance / deltaTime : 0;

      // Smooth velocity with exponential moving average
      setCursorVelocity((prev) => prev * 0.7 + velocity * 0.3);
    }

    lastMousePosRef.current = newPos;
    lastMouseMoveTimeRef.current = now;
    setMousePos(newPos);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setMousePos(null);
    setCursorVelocity(0);
    lastMousePosRef.current = null;
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

      // Decay velocity if mouse hasn't moved recently (> 50ms)
      const timeSinceMouseMove = (currentTime - lastMouseMoveTimeRef.current) / 1000;
      if (timeSinceMouseMove > 0.05) {
        // Very rapidly decay velocity when mouse is still
        setCursorVelocity((prev) => Math.max(0, prev * 0.7));
      }

      // Clear canvas
      clearCanvas(ctx, canvasSize.width, canvasSize.height);

      // Get dynamic grid dimensions
      const { columns, rows } = getGridDimensions();

      // Draw headers first (they stay static)
      drawCornerHeader(ctx, HEADER_WIDTH, HEADER_HEIGHT);
      drawColumnHeaders(ctx, columns, config.baseCellWidth, HEADER_WIDTH, HEADER_HEIGHT);
      drawRowHeaders(ctx, rows, config.baseCellHeight, HEADER_WIDTH, HEADER_HEIGHT);

      const baseCells = getBaseCells();

      // Calculate image bounds for cell coloring (used in normal mode)
      let imageBounds: { x: number; y: number; width: number; height: number } | null = null;
      if (loadedImage && !debugMode) {
        const padding = 60;
        const availableWidth = canvasSize.width - (2 * padding);
        const availableHeight = canvasSize.height - (2 * padding);

        const imageAspect = loadedImage.width / loadedImage.height;
        const availableAspect = availableWidth / availableHeight;

        let baseWidth: number;
        let baseHeight: number;

        if (imageAspect > availableAspect) {
          baseWidth = availableWidth;
          baseHeight = availableWidth / imageAspect;
        } else {
          baseHeight = availableHeight;
          baseWidth = availableHeight * imageAspect;
        }

        const drawWidth = baseWidth * imageScale;
        const drawHeight = baseHeight * imageScale;

        imageBounds = {
          x: (canvasSize.width - drawWidth) / 2,
          y: (canvasSize.height - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        };
      }

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
          densityConfig,
          cursorVelocity
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
              drawCell(ctx, subCell, heatColor, '#808080', subdivisionLevel);
            } else {
              // Normal mode: color by image pixel or white, with transparent borders
              const imageColor = getCellColor(subCell, imageBounds);
              const fillColor = imageColor || '#ffffff';
              const borderColor = calculateImageBorderColor(subdivisionLevel);
              drawCell(ctx, subCell, fillColor, borderColor, subdivisionLevel);
            }
          });
        } else {
          // No subdivision - draw base cell
          if (debugMode) {
            // Debug mode: color by density (heat map)
            const heatColor = densityToHeatColor(newDensity);
            drawCell(ctx, baseCell, heatColor, '#808080', 0);
          } else {
            // Normal mode: color by image pixel or white, with transparent borders
            const imageColor = getCellColor(baseCell, imageBounds);
            const fillColor = imageColor || '#ffffff';
            const borderColor = calculateImageBorderColor(0);
            drawCell(ctx, baseCell, fillColor, borderColor, 0);
          }
        }
      });

      // Update state with new densities
      setCellDensities(newDensities);

      // Draw inserted image (debug mode only)
      if (debugMode && loadedImage) {
        const padding = 60;
        const availableWidth = canvasSize.width - (2 * padding);
        const availableHeight = canvasSize.height - (2 * padding);

        // Calculate scaling to fit within available space while maintaining aspect ratio
        const imageAspect = loadedImage.width / loadedImage.height;
        const availableAspect = availableWidth / availableHeight;

        let baseWidth: number;
        let baseHeight: number;

        if (imageAspect > availableAspect) {
          // Image is wider than available space - fit to width
          baseWidth = availableWidth;
          baseHeight = availableWidth / imageAspect;
        } else {
          // Image is taller than available space - fit to height
          baseHeight = availableHeight;
          baseWidth = availableHeight * imageAspect;
        }

        // Apply scale from center
        const drawWidth = baseWidth * imageScale;
        const drawHeight = baseHeight * imageScale;

        // Center the image (always centered regardless of scale)
        const drawX = (canvasSize.width - drawWidth) / 2;
        const drawY = (canvasSize.height - drawHeight) / 2;

        // Draw with opacity
        ctx.globalAlpha = 0.5;
        ctx.drawImage(loadedImage, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1.0;
      }

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
  }, [mousePos, canvasSize.width, canvasSize.height, config, densityConfig, debugMode, cellDensities, cursorVelocity, loadedImage, imageScale]);

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
