// Geometry for the crop/resize engine — the one part of image processing that's actually
// provable without a browser (the rest depends on Worker/OffscreenCanvas/pointer events, which
// this project doesn't emulate in tests). And it's exactly the part where a bug is INVISIBLE
// until someone notices a logo came out cropped or a photo uploaded stretched.
import { describe, expect, it } from 'vitest'
import { DEFAULT_FRAMING, calculateCropPlan, shiftFraming, type Framing } from './crop-plan.util'

const SQUARE = { width: 1, height: 1 } as const
const WIDESCREEN = { width: 16, height: 9 } as const

describe('calculateCropPlan — crop centered on the target aspect ratio', () => {
  it('a landscape photo cropped to a square loses the sides, never the top', () => {
    const plan = calculateCropPlan({
      sourceWidth: 4000,
      sourceHeight: 3000,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 4000,
      framing: DEFAULT_FRAMING
    })

    // The 3000px square window fits in the height; 500px are left over on each side.
    expect(plan.source).toEqual({ x: 500, y: 0, width: 3000, height: 3000 })
    expect(plan.canvas).toEqual({ width: 3000, height: 3000 })
  })

  it('a portrait photo cropped to a square loses top and bottom in equal parts', () => {
    const plan = calculateCropPlan({
      sourceWidth: 3000,
      sourceHeight: 4000,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 4000,
      framing: DEFAULT_FRAMING
    })

    expect(plan.source).toEqual({ x: 0, y: 500, width: 3000, height: 3000 })
  })

  it('in contain mode, nothing is lost: the whole image fits inside the requested canvas', () => {
    const plan = calculateCropPlan({
      sourceWidth: 1200,
      sourceHeight: 300,
      aspect: SQUARE,
      mode: 'contain',
      maxSideInPixels: 4000,
      framing: DEFAULT_FRAMING
    })

    expect(plan.source).toEqual({ x: 0, y: 0, width: 1200, height: 300 })
    expect(plan.canvas).toEqual({ width: 1200, height: 1200 })
    // Centered vertically: (1200 - 300) / 2.
    expect(plan.destination).toEqual({ x: 0, y: 450, width: 1200, height: 300 })
  })

  it('aspect: null preserves the source ratio — only the size cap applies, nothing is cropped', () => {
    const plan = calculateCropPlan({
      sourceWidth: 1600,
      sourceHeight: 400,
      aspect: null,
      mode: 'contain',
      maxSideInPixels: 4000,
      framing: DEFAULT_FRAMING
    })

    expect(plan.source).toEqual({ x: 0, y: 0, width: 1600, height: 400 })
    expect(plan.canvas).toEqual({ width: 1600, height: 400 })
  })
})

describe('calculateCropPlan — the context size cap', () => {
  it('shrinks the output to the cap, keeping the aspect ratio', () => {
    const plan = calculateCropPlan({
      sourceWidth: 4000,
      sourceHeight: 3000,
      aspect: WIDESCREEN,
      mode: 'fill',
      maxSideInPixels: 1600,
      framing: DEFAULT_FRAMING
    })

    expect(plan.canvas).toEqual({ width: 1600, height: 900 })
    // The crop on the source is still the whole image at 16:9.
    expect(plan.source.width).toBe(4000)
    expect(plan.source.height).toBe(2250)
  })

  it('NEVER upscales: an image smaller than the cap comes out at the size it already had', () => {
    const plan = calculateCropPlan({
      sourceWidth: 200,
      sourceHeight: 200,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 4000,
      framing: DEFAULT_FRAMING
    })

    expect(plan.canvas).toEqual({ width: 200, height: 200 })
  })

  it('zooming in crops deeper instead of stretching — the output shrinks, never blurs', () => {
    const plan = calculateCropPlan({
      sourceWidth: 4000,
      sourceHeight: 4000,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 8000,
      framing: { ...DEFAULT_FRAMING, zoom: 2 }
    })

    expect(plan.source).toEqual({ x: 1000, y: 1000, width: 2000, height: 2000 })
    expect(plan.canvas).toEqual({ width: 2000, height: 2000 })
  })
})

describe('calculateCropPlan — the framing never escapes the image', () => {
  it('pushing the center outward pins the crop to the edge, with no empty gap', () => {
    const plan = calculateCropPlan({
      sourceWidth: 4000,
      sourceHeight: 3000,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 4000,
      framing: { zoom: 1, centerX: 5, centerY: 0.5 }
    })

    expect(plan.source.x).toBe(1000) // 4000 - 3000, pinned to the right.
    expect(plan.source.width).toBe(3000)
  })

  it('the chosen center decides what stays: further left shows the start of the image', () => {
    const plan = calculateCropPlan({
      sourceWidth: 4000,
      sourceHeight: 3000,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 4000,
      framing: { zoom: 1, centerX: 0.25, centerY: 0.5 }
    })

    expect(plan.source.x).toBe(0) // 0.25 × 4000 − 1500 = −500, pinned to 0.
  })
})

describe('calculateCropPlan — image too small for the context', () => {
  it('flags when the crop does not reach the minimum the context requires', () => {
    const plan = calculateCropPlan({
      sourceWidth: 300,
      sourceHeight: 80,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 1000,
      minSideInPixels: 200,
      framing: DEFAULT_FRAMING
    })

    expect(plan.tooSmall).toBe(true)
  })

  it('does not flag when the crop reaches the minimum', () => {
    const plan = calculateCropPlan({
      sourceWidth: 300,
      sourceHeight: 300,
      aspect: SQUARE,
      mode: 'fill',
      maxSideInPixels: 1000,
      minSideInPixels: 200,
      framing: DEFAULT_FRAMING
    })

    expect(plan.tooSmall).toBe(false)
  })
})

describe('shiftFraming — dragging and arrow keys speak the same language', () => {
  const base: Framing = { zoom: 2, centerX: 0.5, centerY: 0.5 }

  it('dragging right reveals what is on the left', () => {
    const moved = shiftFraming(base, {
      deltaXOnCanvas: 100,
      deltaYOnCanvas: 0,
      canvasWidth: 400,
      currentPlan: calculateCropPlan({
        sourceWidth: 4000,
        sourceHeight: 4000,
        aspect: SQUARE,
        mode: 'fill',
        maxSideInPixels: 8000,
        framing: base
      }),
      sourceWidth: 4000,
      sourceHeight: 4000
    })

    // 100px of drag over a 400px window on a 2000px source crop = 500px of source; over a
    // 4000px-wide source, that's 0.125 of the whole.
    expect(moved.centerX).toBeCloseTo(0.375, 5)
    expect(moved.centerY).toBe(0.5)
  })

  it('does not change the zoom', () => {
    const moved = shiftFraming(base, {
      deltaXOnCanvas: 10,
      deltaYOnCanvas: 10,
      canvasWidth: 400,
      currentPlan: calculateCropPlan({
        sourceWidth: 4000,
        sourceHeight: 4000,
        aspect: SQUARE,
        mode: 'fill',
        maxSideInPixels: 8000,
        framing: base
      }),
      sourceWidth: 4000,
      sourceHeight: 4000
    })

    expect(moved.zoom).toBe(2)
  })
})
