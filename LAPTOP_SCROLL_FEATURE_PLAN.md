# Laptop-Exclusive Full-Screen Scroll Feature - Implementation Plan

## Overview
Create a feature exclusive to laptops that:
1. Detects laptop viewport dimensions
2. Makes each section exactly the screen height
3. Implements scroll snapping for section-by-section navigation
4. Ensures content fits within each section

---

## 1. Laptop Viewport Dimension Detection

### Rationale
Each section is currently around a normal monitor's height. We need to identify laptops specifically (not tablets, phones, or large desktop monitors) to apply this feature.

### Dimension Range Specification

**Viewport Height Range: 600px - 1200px**
- **Minimum (600px)**: Small laptop screens (1366x768 resolution in landscape with browser UI)
- **Maximum (1200px)**: Large laptop screens (2K/4K displays, accounting for browser chrome)
- **Typical**: Most laptops fall in the 720px - 1080px range

**Viewport Width Range: 1024px - 1920px+**
- **Minimum (1024px)**: Smaller laptop screens (13" models)
- **Maximum**: No strict upper limit, but we'll check aspect ratio
- **Aspect Ratio**: Should be landscape (width > height)

**Additional Criteria:**
- Must NOT be mobile/tablet (using existing mobile detection)
- Must be in landscape orientation
- Should have pointer device (mouse/trackpad), not primarily touch
- Viewport height should be the primary constraint

### Implementation
- Create `app/lib/laptop-detection.ts` with `isLaptop()` function
- Use `window.innerHeight` and `window.innerWidth` (viewport dimensions, not screen dimensions)
- Exclude devices detected as mobile/tablet via existing detection
- Create `useIsLaptop()` hook similar to `useMobileDetection()`

---

## 2. Scroll Snapping Implementation

### CSS Scroll Snap
Use native CSS scroll snapping for smooth section-to-section scrolling:

**Container:**
- Add `scroll-snap-type: y mandatory` to the main scroll container
- Ensure `overflow-y: scroll` or `overflow-y: auto` on the scrollable element

**Sections:**
- Add `scroll-snap-align: start` to each section
- Each section will snap to the top of viewport when scrolling

### Implementation Location
- Modify `HomeClient.tsx` main container div (line 48)
- Apply scroll snap classes conditionally when `isLaptop` is true
- Use Tailwind classes: `snap-y snap-mandatory` on container, `snap-center` on sections

---

## 3. Section Height Adjustment

### Current State
- Sections are in a flex column with gaps (`gap-y-48 xl:gap-y-64`)
- Sections have natural heights based on content
- Padding applied: `pt-48 xl:pt-64 2xl:pt-72`

### Target State (Laptop Mode)
- Each section should be exactly `100vh` (viewport height)
- Remove gaps between sections
- Adjust padding to fit content within viewport
- Center content vertically within each section

### Sections to Modify
1. **Navigation** (line 49) - Consider fixed or first section
2. **Hero** (line 50) - Make full height
3. **About** (line 51) - Make full height, ensure content fits
4. **Projects** (line 52) - Make full height, may need scrolling within section
5. **Contact** (line 53) - Make full height
6. **Footer** (line 54) - Can be last section or within previous

### Implementation
- Wrap sections conditionally when `isLaptop` is true
- Apply `h-screen` (100vh) to each section
- Use `flex flex-col justify-center` to center content vertically
- Adjust internal padding/spacing to ensure content fits

---

## 4. Content Fitting Strategy

### Approach
Since sections will be fixed height, we need to ensure content doesn't overflow:

1. **Hero Section:**
   - Already relatively compact
   - May need to reduce spacing/gaps
   - Ensure avatar + text fit vertically

2. **About Section:**
   - Grid layout with cards
   - May need to reduce card sizes or gaps
   - Consider scrollable content within section if needed

3. **Projects Section:**
   - Grid of project cards
   - May need pagination or scrollable grid within section
   - Or reduce card sizes to fit more

4. **Contact Section:**
   - Simple, should fit easily
   - Ensure vertical centering

### Techniques
- Use `overflow-y-auto` within sections that have too much content
- Reduce padding/margins dynamically
- Adjust font sizes if necessary (using responsive classes)
- Use `flex-shrink` and `min-h-0` to prevent overflow

---

## 5. Technical Implementation Steps

### Step 1: Create Laptop Detection Utility
**File**: `app/lib/laptop-detection.ts`
- Function: `isLaptop()` - checks viewport dimensions and device type
- Function: `detectLaptop()` - returns detailed laptop detection result
- Exports: Similar pattern to mobile-detection.ts

### Step 2: Create Laptop Detection Hook
**File**: `app/lib/use-laptop-detection.ts` (or add to existing hook file)
- Hook: `useIsLaptop()` - returns boolean
- Hook: `useLaptopDetection()` - returns full detection object
- Updates on window resize

### Step 3: Modify HomeClient Component
**File**: `app/[locale]/HomeClient.tsx`
- Import and use `useIsLaptop()` hook
- Conditionally apply laptop-specific classes:
  - Container: `snap-y snap-mandatory` when isLaptop
  - Remove gaps when isLaptop
  - Adjust padding when isLaptop

### Step 4: Modify Section Components
**Files**: 
- `app/components/Hero.tsx`
- `app/components/About.tsx`
- `app/components/Projects.tsx`
- `app/components/Contact.tsx`
- `app/components/Footer.tsx`

- Accept optional `isLaptop` prop or use context
- Apply `h-screen snap-center` when isLaptop
- Adjust internal spacing/padding conditionally
- Ensure content fits within viewport

### Step 5: Handle Navigation
**Consideration**: 
- Navigation could be fixed overlay or first section
- Ensure it doesn't interfere with scroll snapping
- May need to adjust z-index

### Step 6: Testing
- Test on various laptop viewport sizes
- Test scroll behavior (wheel, trackpad, arrow keys)
- Verify content doesn't overflow
- Verify sections snap correctly
- Test edge cases (very tall content, window resizing)

---

## 6. CSS Classes Reference

### Tailwind Classes to Use:
- Container: `snap-y snap-mandatory` (scroll snap)
- Sections: `h-screen snap-center` (full height + snap point)
- Content: `flex flex-col justify-center` (vertical centering)
- Conditional: Apply via template literals or className utilities

---

## 7. Edge Cases & Considerations

### Window Resize
- Hook should update on resize
- Sections should re-adjust height
- May need debouncing for performance

### Scroll Behavior
- Ensure smooth scrolling (`scroll-behavior: smooth`)
- Handle programmatic scrolling (if any)
- Navigation links should scroll to correct sections

### Content Overflow
- Some sections may naturally overflow (e.g., Projects grid)
- Options: scrollable content, pagination, or reduce content
- Choose based on UX best practices

### Browser Compatibility
- CSS scroll snap is well-supported in modern browsers
- Add fallback for older browsers (optional)

### Accessibility
- Ensure keyboard navigation works
- Maintain scroll indicators if needed
- Don't break existing navigation functionality

---

## 8. Implementation Order

1. ✅ Create laptop detection utility
2. ✅ Create laptop detection hook
3. ✅ Integrate detection into HomeClient
4. ✅ Apply scroll snapping to container
5. ✅ Make sections full height
6. ✅ Adjust Hero section content fitting
7. ✅ Adjust About section content fitting
8. ✅ Adjust Projects section content fitting
9. ✅ Adjust Contact section content fitting
10. ✅ Test and refine

---

## 9. Files to Create/Modify

### New Files:
- `app/lib/laptop-detection.ts`
- `app/lib/use-laptop-detection.ts` (or extend existing)

### Modified Files:
- `app/[locale]/HomeClient.tsx`
- `app/components/Hero.tsx`
- `app/components/About.tsx`
- `app/components/Projects.tsx`
- `app/components/Contact.tsx`
- `app/components/Footer.tsx` (optional)

---

## 10. Success Criteria

✅ Laptop viewport dimensions correctly identified (600px-1200px height range)
✅ Feature only applies to laptops (not mobile/tablet/desktop monitors)
✅ Each section is exactly viewport height
✅ Scroll snapping works smoothly between sections
✅ Content fits within each section without overflow
✅ Smooth scroll behavior (wheel/trackpad)
✅ Works on various laptop screen sizes
✅ No breaking changes to mobile/desktop experience

---

## Notes

- This feature should be additive and not break existing functionality
- Mobile and desktop experiences remain unchanged
- Consider making scroll snap optional if user has `prefers-reduced-motion`
- May want to add visual indicators for scrollable sections (optional enhancement)

