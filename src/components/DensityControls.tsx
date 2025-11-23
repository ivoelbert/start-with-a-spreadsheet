/**
 * DensityControls Component
 *
 * UI controls for adjusting density painting parameters
 */

import React from 'react';
import { GroupBox } from 'react95';
import type { DensityConfig } from '../types/spreadsheet';

interface DensityControlsProps {
  config: DensityConfig;
  onChange: (config: Partial<DensityConfig>) => void;
  imageScale: number;
  onImageScaleChange: (scale: number) => void;
}

export const DensityControls: React.FC<DensityControlsProps> = ({
  config,
  onChange,
  imageScale,
  onImageScaleChange,
}) => {
  return (
    <GroupBox label="Density Controls" style={{ marginBottom: '10px' }}>
      <div style={{ padding: '10px' }}>
        {/* Increase Rate Multiplier */}
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="increase-rate"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '11px',
            }}
          >
            Build Speed: {config.increaseMultiplier.toFixed(2)}x
          </label>
          <input
            id="increase-rate"
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={config.increaseMultiplier}
            onChange={(e) =>
              onChange({ increaseMultiplier: parseFloat(e.target.value) })
            }
            style={{ width: '100%' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Decay Rate Multiplier */}
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="decay-rate"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '11px',
            }}
          >
            Fade Speed: {config.decayMultiplier.toFixed(2)}x
          </label>
          <input
            id="decay-rate"
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={config.decayMultiplier}
            onChange={(e) =>
              onChange({ decayMultiplier: parseFloat(e.target.value) })
            }
            style={{ width: '100%' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>Never</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Influence Radius */}
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="influence-radius"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '11px',
            }}
          >
            Brush Size: {config.influenceRadius}px
          </label>
          <input
            id="influence-radius"
            type="range"
            min="100"
            max="800"
            step="50"
            value={config.influenceRadius}
            onChange={(e) =>
              onChange({ influenceRadius: parseInt(e.target.value, 10) })
            }
            style={{ width: '100%' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Velocity Influence */}
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="velocity-influence"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '11px',
            }}
          >
            Speed Boost: {config.velocityInfluence.toFixed(1)}x
          </label>
          <input
            id="velocity-influence"
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={config.velocityInfluence}
            onChange={(e) =>
              onChange({ velocityInfluence: parseFloat(e.target.value) })
            }
            style={{ width: '100%' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>1x (Off)</span>
            <span>15x (Max)</span>
          </div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
            Faster cursor = stronger painting
          </div>
        </div>

        {/* Interpolation Density */}
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="interpolation-density"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '11px',
            }}
          >
            Paint Smoothness: {config.interpolationDensity.toFixed(1)}x
          </label>
          <input
            id="interpolation-density"
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={config.interpolationDensity}
            onChange={(e) =>
              onChange({ interpolationDensity: parseFloat(e.target.value) })
            }
            style={{ width: '100%' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>0.5x</span>
            <span>10x</span>
          </div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
            Higher = smoother fast strokes
          </div>
        </div>

        {/* Image Scale */}
        <div style={{ marginBottom: '10px' }}>
          <label
            htmlFor="image-scale"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '11px',
            }}
          >
            Image Scale: {imageScale.toFixed(2)}x
          </label>
          <input
            id="image-scale"
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={imageScale}
            onChange={(e) =>
              onImageScaleChange(parseFloat(e.target.value))
            }
            style={{ width: '100%' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>0x</span>
            <span>2x</span>
          </div>
        </div>
      </div>
    </GroupBox>
  );
};

export default DensityControls;
