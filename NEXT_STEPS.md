# Next Steps for Density Spreadsheet

## Pending Features & Improvements

### 1. Fast Mouse Movement - Line Interpolation
**Problem:** When moving the mouse very fast, there's no mouse position in the middle, so the density effect can look very spotty with gaps.

**Solution:** Consider "painting" the entire line between previous position (p1) and current position (p2).
- Interpolate points along the line between mouse positions
- Apply density updates to all cells along this path
- This will create smoother, continuous trails even at high cursor speeds

### 2. Paint-Before-Subdivide Toggle
**Feature:** Boolean control to decide whether we should paint cells even when not subdivided.

Currently, base cells (subdivision level 0) stay white and only show colors when subdivided. This creates a "discovery" effect.

**Options to consider:**
- Toggle to allow base cells to show image colors immediately
- Could be useful for different use cases/effects
- Add as a control in the DensityControls panel

### 3. Code Audit & Refactoring
Before implementing more complex features, audit and clean up the codebase:

**Areas to review:**
- DensitySpreadsheet.tsx render loop (getting complex with multiple rendering modes)
- Subdivision line collection and drawing logic
- Image color sampling and bounds calculation (repeated logic)
- State management - consider if refs vs state are being used optimally
- Performance optimizations for subdivision line deduplication
- Type definitions - ensure all interfaces are properly defined
- Comment complex sections, especially the layered rendering logic

**Potential refactors:**
- Extract rendering logic into separate functions
- Create a dedicated renderer class/module for normal mode vs debug mode
- Consolidate image-related calculations
- Consider memoization for expensive calculations
- Clean up variable naming for clarity

## Current Implementation Notes

### Subdivision Line Rendering (Recent Win!)
- Successfully implemented layered subdivision line rendering
- Each subdivision level draws only the NEW lines it creates
- Lines have progressive transparency (level 0 = 30%, level 7-8 = 0%)
- Base cell borders always drawn first, then subdivision lines on top
- Prevents density/stacking issues by deduplicating lines

### Drawing Order (Important!)
1. Fill cells with image colors
2. Draw base cell borders (level 0)
3. Draw subdivision lines (levels 1-8)

This ensures borders are never covered by fills.

## Future Ideas (Backlog)
- Export the painted image
- Animation/recording mode
- Different brush shapes (not just circular influence)
- Persistence - save/load painted states
- Multiple images with blending modes
