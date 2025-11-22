# Spreadsheet Density Concept

## Overview

This document describes the core concept for an interactive spreadsheet where cells dynamically subdivide based on pointer proximity, creating a "density effect" similar to a fisheye lens or magnifying glass.

The fundamental idea: as you hover your mouse over the spreadsheet, cells near the pointer become progressively smaller (more dense) while cells farther away remain at their base size. This creates a focused, detailed view around the cursor while maintaining context of the broader spreadsheet.

## Visual Specifications

### Base Cell Dimensions
- **Width**: 80px
- **Height**: 24px
- **Aspect Ratio**: 3.33:1 (typical Excel-like proportions)

### Minimum Subdivided Cell Size
- **Target**: 4px × 4px (square)
- **At pointer location**: Cells are maximally subdivided to achieve ~4×4px cells
- **Estimated subdivision levels needed**: 6-8 levels to reach target size

### Influence Area
- **Radius**: ~400-600px from pointer
- **Pattern**: Circular/organic (not grid-aligned)
- **Scope**: Individual cells subdivide independently based on their distance from pointer
- **Result**: Creates a smooth, circular gradient of cell density

## Subdivision Behavior

### Core Principle
Each cell evaluates its distance from the mouse pointer and subdivides accordingly:
- **Closest cells** (0-50px): Maximum subdivision (~4×4px cells)
- **Near cells** (50-300px): Graduated subdivision levels
- **Far cells** (300-600px): Minimal or no subdivision
- **Outside influence** (>600px): Base size (80×24px)

### Subdivision Mechanics
Cells subdivide by splitting either:
- **Vertically**: Creating two cells side-by-side (dividing width)
- **Horizontally**: Creating two cells top-to-bottom (dividing height)

**Example subdivision sequence**:
```
Level 0: [80×24] (base)
Level 1: [40×24] [40×24] (vertical split)
Level 2: [20×24] [20×24] [20×24] [20×24] (vertical split again)
Level 3: [20×12] [20×12] ... (horizontal split)
... continues alternating based on algorithm
```

### Transition Behavior
- **No animation**: Cells subdivide/merge instantly as mouse moves
- **Real-time**: Updates on every mousemove event
- **Performance target**: Maintain 60fps interaction

## Subdivision Algorithm

### Goal: Maintain Square Proportions

The algorithm should intelligently choose subdivision direction to keep cells as close to square (1:1 ratio) as possible.

### Proposed Logic
At each subdivision level, determine which dimension (width or height) is longer:
- **If width > height**: Subdivide vertically (split width)
- **If height > width**: Subdivide horizontally (split height)

### Example Progression (Aiming for Square)

Starting from 80×24px base cell:

| Level | Dimensions | Ratio | Next Action |
|-------|------------|-------|-------------|
| 0 | 80×24 | 3.33:1 | Split V (width longer) |
| 1 | 40×24 | 1.67:1 | Split V (width longer) |
| 2 | 20×24 | 0.83:1 | Split H (height longer) |
| 3 | 20×12 | 1.67:1 | Split V (width longer) |
| 4 | 10×12 | 0.83:1 | Split H (height longer) |
| 5 | 10×6 | 1.67:1 | Split V (width longer) |
| 6 | 5×6 | 0.83:1 | Split H (height longer) |
| 7 | 5×3 | 1.67:1 | Split V (width longer) |
| 8 | 2.5×3 | ~1:1 | Approaching target |

**Observation**: This creates a pattern of approximately V, V, H, V, H, V, H, V... with more vertical subdivisions initially due to the wide base cell.

### Alternative Considerations
- **Fixed alternating pattern** (V, H, V, H, V...): Simpler but may not optimize for squareness
- **Ratio threshold**: Only switch direction when ratio exceeds certain threshold (e.g., 1.5:1)
- **Hybrid approach**: Different logic for different subdivision levels

**Decision**: To be finalized during implementation based on visual testing.

## Distance-to-Subdivision Mapping

### The Challenge
Map the distance from pointer to appropriate subdivision level with smooth falloff.

### Variables
- `d` = distance from pointer to cell center (in pixels)
- `r_max` = maximum influence radius (400-600px)
- `level` = subdivision level (0 = base, 8 = maximum)

### Potential Formulas

#### Linear Falloff
```javascript
level = max(0, 8 * (1 - d / r_max))
```
Simple, predictable, but may feel too gradual.

#### Exponential Falloff
```javascript
level = 8 * Math.pow(1 - (d / r_max), 2)
```
Sharper focus at center, more dramatic effect.

#### Stepped/Discrete
```javascript
if (d < 50) level = 8
else if (d < 100) level = 7
else if (d < 200) level = 5
// ... etc
```
Creates distinct "zones" of density.

**Decision**: Experiment with different curves to find optimal feel.

## Technical Implementation

### Rendering Approach

**Challenge**: CSS Grid is insufficient for this dynamic, non-uniform layout.

**Recommended Approach**:
1. **Canvas-based rendering**: Draw cells directly on `<canvas>` for maximum performance
2. **Virtual DOM approach**: Render individual `<div>` elements for each (sub)cell
3. **Hybrid**: Canvas for subdivided regions, DOM for normal cells

**Initial recommendation**: Start with Canvas for performance, simplicity with complex layouts.

### Data Structure

Each base cell needs to track:
```javascript
{
  baseX: number,        // Base grid position
  baseY: number,
  subdivisionLevel: number,
  children: Cell[]      // Subdivided cells if level > 0
}
```

### Mouse Tracking

```javascript
// Pseudocode
onMouseMove((mouseX, mouseY) => {
  for each baseCell in grid {
    distance = calculateDistance(mouseX, mouseY, baseCell.center)
    targetLevel = calculateSubdivisionLevel(distance)

    if (targetLevel !== baseCell.subdivisionLevel) {
      baseCell.subdivide(targetLevel)
    }
  }

  redraw()
})
```

### Performance Considerations

- **Base grid size**: Start with viewport-filling grid only (~20 columns × 30 rows = 600 base cells)
- **Subdivision overhead**: Each base cell at level 8 becomes 256 cells (2^8)
- **Worst case**: If all cells maximally subdivided = 600 × 256 = 153,600 cells
- **Realistic case**: Only cells near pointer subdivide, likely <10,000 active cells
- **Optimization**: Only subdivide cells within influence radius, cull off-screen cells

## Open Questions for Implementation

1. **Exact influence radius**: Start at 500px, adjust based on feel?
2. **Falloff curve**: Linear, exponential, or stepped? Test multiple options.
3. **Subdivision threshold**: At what ratio difference do we switch V/H subdivision?
4. **Cell borders**: How to render borders on subdivided cells? Show all borders or simplify?
5. **Interaction**: Should subdivided cells be clickable/editable individually?
6. **Data model**: How does cell data work with subdivision? Does it stay with parent or split?
7. **Render optimization**: Batch canvas draws? Use WebGL? RequestAnimationFrame?
8. **Edge cases**: What happens at spreadsheet boundaries? Corner cells?

## Development Phases

### Phase 1: Basic Grid
- Render fixed viewport grid of 80×24px cells
- Mouse tracking
- Distance calculation visualization (color cells by distance)

### Phase 2: Single-Level Subdivision
- Implement subdivision logic for one level only
- Test vertical vs horizontal splitting
- Verify distance-based triggering

### Phase 3: Multi-Level Subdivision
- Implement recursive subdivision algorithm
- Test subdivision direction logic (aim for square)
- Implement level calculation based on distance

### Phase 4: Optimization & Polish
- Performance tuning
- Fine-tune falloff curve
- Add visual polish (borders, styling)
- Test edge cases

### Phase 5: Interactivity
- Cell selection
- Cell editing
- Data persistence across subdivision

## Visual Reference

```
Base State (no hover):
┌────────┬────────┬────────┬────────┐
│  80×24 │  80×24 │  80×24 │  80×24 │
├────────┼────────┼────────┼────────┤
│  80×24 │  80×24 │  80×24 │  80×24 │
└────────┴────────┴────────┴────────┘

Hover State (pointer at center of middle cell):
┌────────┬─┬─┬─┬─┬─┬────────┐
│  80×24 │ ││││││ │  80×24 │
├────────┼─┼─┼─┼─┼─┼────────┤
│        │4│4│4│4│4│        │
│  40×24 │×│×│×│×│×│  40×24 │
│        │4│4│4│4│4│        │
└────────┴─┴─┴─┴─┴─┴────────┘
       (cells near pointer are tiny)
```

## Success Criteria

The implementation is successful when:
1. Mouse movement creates smooth density gradient (no lag)
2. Cells near pointer subdivide to ~4×4px
3. Performance remains at 60fps during interaction
4. Visual effect is intuitive and useful (not just cool-looking)
5. Subdivision algorithm produces roughly square cells
6. Edge cases handled gracefully

## Notes & Observations

- The 80×24px base cell ratio (3.33:1) naturally requires more vertical subdivisions
- Aiming for square cells is important for visual consistency
- The density effect should feel like "zooming in" on the area near the cursor
- This could be useful for dense data visualization or precise cell selection
- Future: Could add keyboard modifiers to control subdivision intensity or lock subdivision

---

**Last Updated**: 2025-11-21
**Status**: Concept defined, ready for implementation
