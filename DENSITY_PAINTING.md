# Density Painting System

## Overview

The density painting system transforms the spreadsheet from an instant distance-based subdivision effect into a time-based accumulation system. Instead of cells subdividing instantly when the cursor approaches, they gradually "paint" density that persists and decays over time, creating heat trail effects.

## Key Concepts

### Density Accumulation
- Each base cell tracks a **density value** from 0.0 (no density) to 1.0 (maximum density)
- Density increases when the cursor is nearby
- Density decays over time everywhere
- Subdivision level is determined by accumulated density, not cursor distance

### Painting Behavior
- **Increase**: Cells near the cursor accumulate density over time
- **Decay**: All cells lose density continuously (even when cursor is present)
- **Persistence**: High-density areas remain visible after the cursor moves away
- **Trails**: Moving the cursor creates visible trails that fade gradually

## How It Works

### 1. Density Update Loop

Every frame (via `requestAnimationFrame`):

```typescript
for each base cell:
  1. Get current density value
  2. Calculate increase based on cursor distance
  3. Apply global decay
  4. Clamp result to [0, 1]
  5. Store new density value
```

### 2. Increase Calculation

Density increases when cursor is within the influence radius:

```typescript
// Linear falloff from cursor to edge of radius
if (distance < influenceRadius) {
  falloff = 1 - (distance / influenceRadius)
  increase = baseIncreaseRate * increaseMultiplier * falloff * deltaTime
}
```

**Example**: With 500px radius and cursor at cell center:
- At 0px: 100% increase rate
- At 250px: 50% increase rate
- At 500px: 0% increase rate

### 3. Decay Calculation

Density decays uniformly everywhere:

```typescript
density -= baseDecayRate * decayMultiplier * deltaTime
```

Decay is global and constant - all cells lose density at the same rate regardless of cursor position.

### 4. Density to Subdivision Mapping

```typescript
subdivisionLevel = floor(density * maxSubdivisionLevel)
```

- Density 0.0 → Level 0 (no subdivision)
- Density 0.5 → Level 4 (medium subdivision)
- Density 1.0 → Level 8 (maximum subdivision)

## Default Parameters

Based on user preferences for **medium** build and decay speeds:

### Build Speed: ~2.5 seconds to maximum
```typescript
baseIncreaseRate = 0.4 per second
// At cursor position with 1.0x multiplier:
// Time to reach 1.0 density ≈ 2.5 seconds
```

### Fade Speed: ~4 seconds to zero
```typescript
baseDecayRate = 0.25 per second
// Time for 1.0 density to decay to 0.0 ≈ 4 seconds
```

### Influence Radius
```typescript
influenceRadius = 500px (default)
// Adjustable via controls: 100px to 800px
```

## User Controls

### Build Speed (Increase Multiplier)
- **Range**: 0.1x to 3.0x
- **Default**: 1.0x
- **Effect**: Multiplies the base increase rate
  - 0.1x = very slow accumulation (~25 seconds to max)
  - 1.0x = medium speed (~2.5 seconds to max)
  - 3.0x = very fast accumulation (~0.8 seconds to max)

### Fade Speed (Decay Multiplier)
- **Range**: 0.0x to 3.0x
- **Default**: 1.0x
- **Effect**: Multiplies the base decay rate
  - 0.0x = no decay (permanent trails)
  - 1.0x = medium decay (~4 seconds to fade)
  - 3.0x = fast decay (~1.3 seconds to fade)

### Brush Size (Influence Radius)
- **Range**: 100px to 800px
- **Default**: 500px
- **Effect**: Determines how far from cursor density accumulates
  - 100px = tight, focused painting
  - 500px = balanced spread
  - 800px = wide, diffuse painting

## Debug Mode

Debug mode provides visual feedback on the density system:

### Heat Map Visualization
- **Blue/Purple** (low density): Cells with density 0.0-0.3
- **Yellow/Orange** (medium density): Cells with density 0.4-0.7
- **Red** (high density): Cells with density 0.8-1.0

### Visual Elements
- Red dot: Current cursor position
- Red circle: Influence radius boundary
- Heat colors: Real-time density values

## Visual Effects

### Painting Trails
Move the cursor across the spreadsheet to create visible trails:
- **Slow movement**: Creates dense, persistent trails
- **Fast movement**: Creates lighter, more ephemeral trails
- **Hovering**: Density builds to maximum over 2-3 seconds

### Decay Patterns
After cursor moves away or leaves:
- Trails gradually fade from red → yellow → blue → white
- Higher density areas persist longer
- Full decay takes 3-5 seconds (at default settings)

### Heat Map Effect
With debug mode enabled, you can see the entire density field as a heat map, showing exactly where and how much density has accumulated.

## Technical Implementation

### Data Structure

```typescript
// Density storage (key = "col,row")
cellDensities: Map<string, number>

// Per-cell density range
density: 0.0 to 1.0

// Density configuration
densityConfig: {
  increaseRate: 0.4,      // Base rate per second
  decayRate: 0.25,        // Base rate per second
  influenceRadius: 500,   // Pixels
  increaseMultiplier: 1.0, // User adjustment
  decayMultiplier: 1.0,    // User adjustment
}
```

### Frame-Rate Independence

The system uses delta time to ensure consistent behavior regardless of frame rate:

```typescript
deltaTime = (currentTime - lastFrameTime) / 1000 // Convert to seconds
cappedDeltaTime = min(deltaTime, 0.1) // Cap at 100ms to prevent huge jumps

// Apply time-based updates
densityIncrease = increaseRate * deltaTime
densityDecrease = decayRate * deltaTime
```

This ensures:
- Same accumulation/decay speed at 30fps, 60fps, or 144fps
- Smooth behavior when browser throttles inactive tabs
- No sudden jumps if frame drops

### Performance Considerations

**Continuous Updates**:
- Animation loop runs continuously (not just on mousemove)
- Updates density for all visible cells every frame
- Typical grid: 26 columns × 30 rows = 780 cells updated per frame

**Optimizations**:
- Delta time capping prevents expensive calculations during tab switches
- State updates batched per frame (single `setCellDensities` call)
- Canvas rendering uses device pixel ratio for crisp output

## Use Cases

### Dense Data Visualization
Paint high-density areas to focus on specific regions of data

### Exploration Tool
Gradually reveal detail as you explore different parts of the spreadsheet

### Visual Annotation
Use density trails to mark areas of interest without permanent changes

### Interactive Art
Create organic, flowing patterns by moving the cursor artistically

## Comparison: Distance-Based vs Density-Based

### Original (Distance-Based)
- ✓ Instant response
- ✓ Always centered on cursor
- ✗ No persistence
- ✗ Disappears when cursor leaves

### New (Density-Based)
- ✓ Persistent effects
- ✓ Creates trails and patterns
- ✓ Organic, flowing feel
- ✓ Adjustable behavior
- ✗ Less immediate feedback
- ✗ More complex to understand

## Future Enhancements

Potential additions to the density painting system:

1. **Erase Mode**: Hold modifier key (Ctrl/Cmd) to subtract density instead of adding
2. **Clear All Button**: Reset entire grid to zero density
3. **Pause Decay Toggle**: Freeze current density, prevent fading
4. **Preset Patterns**: Load predefined density distributions
5. **Export/Import**: Save and load density maps
6. **Alternative Falloff Curves**: Exponential, inverse square, stepped
7. **Directional Effects**: Density influenced by cursor velocity
8. **Multi-Layer Density**: Multiple density channels with different colors

---

**Implementation Date**: November 2025
**Status**: Complete and functional
**Next Steps**: User testing and parameter fine-tuning
