/**
 * DensityControls Component
 *
 * UI controls for adjusting density painting parameters
 */

import React from "react";
import { GroupBox, Slider, Tooltip } from "react95";
import type { Config } from "../../types/spreadsheet";

interface DensityControlsProps {
  config: Config;
  onChange: (config: Partial<Config>) => void;
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
    <GroupBox label="Controls" style={{ marginBottom: "10px" }}>
      <div style={{ padding: "10px" }}>
        {/* Increase Rate Multiplier */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
            }}
          >
            Build Speed: {config.increaseMultiplier.toFixed(2)}x
          </label>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={0.1}
            max={3}
            step={0.1}
            value={config.increaseMultiplier}
            onChange={(value) => onChange({ increaseMultiplier: value })}
          />
        </div>

        {/* Decay Rate Multiplier */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
            }}
          >
            Fade Speed: {config.decayMultiplier.toFixed(2)}x
          </label>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={0}
            max={3}
            step={0.1}
            value={config.decayMultiplier}
            onChange={(value) => onChange({ decayMultiplier: value })}
          />
        </div>

        {/* Influence Radius */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
            }}
          >
            Brush Size: {config.influenceRadius}px
          </label>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={100}
            max={800}
            step={50}
            value={config.influenceRadius}
            onChange={(value) => onChange({ influenceRadius: value })}
          />
        </div>

        {/* Velocity Influence */}
        <div style={{ marginBottom: "15px" }}>
          <Tooltip text="Faster cursor = stronger painting" enterDelay={100} leaveDelay={500}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                cursor: "help",
              }}
            >
              Speed Boost: {config.velocityInfluence.toFixed(1)}x<span style={{ marginLeft: "6px" }}>ⓘ</span>
            </label>
          </Tooltip>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={1}
            max={15}
            step={0.5}
            value={config.velocityInfluence}
            onChange={(value) => onChange({ velocityInfluence: value })}
          />
        </div>

        {/* Interpolation Density */}
        <div style={{ marginBottom: "15px" }}>
          <Tooltip text="Higher = smoother fast strokes" enterDelay={100} leaveDelay={500}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                cursor: "help",
              }}
            >
              Paint Smoothness: {config.interpolationDensity.toFixed(1)}x<span style={{ marginLeft: "6px" }}>ⓘ</span>
            </label>
          </Tooltip>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={0.5}
            max={10}
            step={0.5}
            value={config.interpolationDensity}
            onChange={(value) => onChange({ interpolationDensity: value })}
          />
        </div>

        {/* Hold Duration */}
        <div style={{ marginBottom: "15px" }}>
          <Tooltip text="How long painting holds before fading" enterDelay={100} leaveDelay={500}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                cursor: "help",
              }}
            >
              Hold Duration: {config.holdDuration.toFixed(1)}s<span style={{ marginLeft: "6px" }}>ⓘ</span>
            </label>
          </Tooltip>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={0}
            max={3}
            step={0.1}
            value={config.holdDuration}
            onChange={(value) => onChange({ holdDuration: value })}
          />
        </div>

        {/* Decay Acceleration */}
        <div style={{ marginBottom: "15px" }}>
          <Tooltip text="How quickly decay speeds up over time" enterDelay={100} leaveDelay={500}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                cursor: "help",
              }}
            >
              Decay Acceleration: {config.decayAcceleration.toFixed(1)}x<span style={{ marginLeft: "6px" }}>ⓘ</span>
            </label>
          </Tooltip>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={0.5}
            max={10}
            step={0.1}
            value={config.decayAcceleration}
            onChange={(value) => onChange({ decayAcceleration: value })}
          />
        </div>

        {/* Max Subdivisions */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
            }}
          >
            Max Subdivisions: {config.maxSubdivisionLevel}
          </label>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={1}
            max={12}
            step={1}
            value={config.maxSubdivisionLevel}
            onChange={(value) => onChange({ maxSubdivisionLevel: value })}
          />
        </div>

        {/* Image Scale */}
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
            }}
          >
            Image Scale: {imageScale.toFixed(2)}x
          </label>
          <Slider
            style={{ marginBottom: 0 }}
            size="100%"
            min={0}
            max={2}
            step={0.05}
            value={imageScale}
            onChange={(value) => onImageScaleChange(value)}
          />
        </div>
      </div>
    </GroupBox>
  );
};

export default DensityControls;
