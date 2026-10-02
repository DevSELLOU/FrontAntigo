// Crop/resize geometry for the image-processing engine. Ported from
// `_Sellou/packages/ui/src/components/envio-de-imagem/plano-de-tratamento.ts` — see that file
// for the fuller design rationale. Kept as pure functions on purpose: no `document`, `Canvas`
// or `Worker` in here, so this is the one part of the engine that's actually unit-testable
// (see `crop-plan.util.test.ts`). The worker/canvas code is a dumb painter that only executes
// the plan this file produces — it never decides anything itself.
//
// THE MODEL: the output is a "canvas" with the target aspect ratio. The source image is placed
// on that canvas at some scale `s`; whatever falls outside the canvas bounds is what gets cropped.
// - `fill` (product photo): the canvas is the largest rectangle of the target ratio that fits
//   INSIDE the source — image spills outside the canvas, and that's what the crop removes.
// - `contain` (logo): the canvas is the smallest rectangle of the target ratio that CONTAINS
//   the whole source — nothing is lost, and whatever canvas area is left over stays transparent.
//
// RULE THAT RUNS THROUGH EVERYTHING: never upscale. `s` is always ≤ 1 — stretching pixels that
// don't exist would only bloat the file and make it look worse, the opposite of the point.
// Zooming IN shrinks the canvas instead of stretching the source: it crops deeper and the
// output gets SMALLER, never blurrier.

/** Target aspect ratio — `{ width: 1, height: 1 }` for logo and product photo. */
export interface AspectRatio {
  readonly width: number
  readonly height: number
}

/** `fill` crops what spills over; `contain` preserves the whole source and pads the rest with
 * transparency. The choice belongs to the context (see `image-limits.constant.ts`), never to
 * whoever is uploading. */
export type FramingMode = 'fill' | 'contain'

/** What the person adjusted in the (optional) crop editor. `centerX`/`centerY` are the point
 * of the source image (0 to 1) that ends up at the center of the canvas; `zoom` of 1 is the
 * automatic default framing. */
export interface Framing {
  readonly zoom: number
  readonly centerX: number
  readonly centerY: number
}

export const DEFAULT_FRAMING: Framing = { zoom: 1, centerX: 0.5, centerY: 0.5 }

export interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

export interface CropPlan {
  /** Crop region on the source image, in its own pixels. */
  readonly source: Rect
  /** Where that crop region is painted on the output canvas. */
  readonly destination: Rect
  /** Final size of the generated file, in pixels. */
  readonly canvas: Size
  /** `true` when the crop doesn't reach the minimum the context needs to stay sharp — the
   * caller warns BEFORE accepting, with what to do about it, not just a number. */
  readonly tooSmall: boolean
}

export interface CropPlanInput {
  readonly sourceWidth: number
  readonly sourceHeight: number
  /** `null` preserves the source's own aspect ratio — only `maxSideInPixels` applies, nothing
   * is cropped. This is the extension over the ported original, added for the Company logo. */
  readonly aspect: AspectRatio | null
  readonly mode: FramingMode
  readonly maxSideInPixels: number
  readonly minSideInPixels?: number | undefined
  readonly framing: Framing
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

export function calculateCropPlan(input: CropPlanInput): CropPlan {
  const { sourceWidth: width, sourceHeight: height, mode } = input
  // `aspect: null` = the canvas ratio IS the source ratio, so the "largest/smallest rect that
  // fits/contains" reduces to the full source — no cropping, only the size cap below applies.
  const ratio = input.aspect === null ? width / height : input.aspect.width / input.aspect.height
  const zoom = Math.max(1, input.framing.zoom)

  // Canvas at 1:1 and no zoom. `min`/`max` are the two halves of the same idea: the width of
  // the target ratio that fits inside the source (`fill`) or that wraps around it (`contain`).
  const rawWidth = mode === 'fill' ? Math.min(width, height * ratio) : Math.max(width, height * ratio)

  // Zooming in shrinks the canvas — see the header: it crops deeper instead of stretching.
  const zoomedWidth = rawWidth / zoom
  const zoomedHeight = zoomedWidth / ratio

  // The context's ceiling. Scales down proportionally; never scales up (`Math.min(1, ...)`).
  const shrink = Math.min(1, input.maxSideInPixels / Math.max(zoomedWidth, zoomedHeight))
  const canvasWidth = Math.max(1, Math.round(zoomedWidth * shrink))
  const canvasHeight = Math.max(1, Math.round(zoomedHeight * shrink))

  // Draw scale: how much canvas space each source pixel occupies. The `× zoom` is what makes
  // zooming in CROP instead of stretching: the canvas already shrank by the zoom factor, so
  // reapplying zoom here keeps the drawn image at the size it had — it's the canvas around it
  // that got smaller. Without this factor, zooming would only shrink the file; the whole image
  // would still show, and the editor wouldn't crop anything.
  const canvasScale =
    mode === 'fill'
      ? Math.max(canvasWidth / width, canvasHeight / height)
      : Math.min(canvasWidth / width, canvasHeight / height)
  const scale = canvasScale * zoom

  const drawnWidth = width * scale
  const drawnHeight = height * scale

  // Where the source image's top-left corner lands on the canvas. When the image covers the
  // canvas, the offset is pinned to the edges — dragging too far never opens an empty gap.
  // When it's smaller than the canvas (`contain`), it's centered and that axis simply doesn't move.
  const offsetX = position(input.framing.centerX, drawnWidth, canvasWidth)
  const offsetY = position(input.framing.centerY, drawnHeight, canvasHeight)

  const destination = intersect(offsetX, offsetY, drawnWidth, drawnHeight, canvasWidth, canvasHeight)
  const source: Rect = {
    x: Math.round((destination.x - offsetX) / scale),
    y: Math.round((destination.y - offsetY) / scale),
    width: Math.max(1, Math.round(destination.width / scale)),
    height: Math.max(1, Math.round(destination.height / scale))
  }

  const minimum = input.minSideInPixels
  return {
    source,
    destination,
    canvas: { width: canvasWidth, height: canvasHeight },
    tooSmall: minimum !== undefined && (source.width < minimum || source.height < minimum)
  }
}

function position(normalizedCenter: number, drawnSize: number, canvasSize: number): number {
  if (drawnSize <= canvasSize) {
    return (canvasSize - drawnSize) / 2
  }
  const raw = canvasSize / 2 - normalizedCenter * drawnSize
  return clamp(raw, canvasSize - drawnSize, 0)
}

function intersect(
  offsetX: number,
  offsetY: number,
  drawnWidth: number,
  drawnHeight: number,
  canvasWidth: number,
  canvasHeight: number
): Rect {
  const x = Math.max(0, offsetX)
  const y = Math.max(0, offsetY)
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.max(1, Math.round(Math.min(canvasWidth, offsetX + drawnWidth) - x)),
    height: Math.max(1, Math.round(Math.min(canvasHeight, offsetY + drawnHeight) - y))
  }
}

export interface EditorDrag {
  readonly deltaXOnCanvas: number
  readonly deltaYOnCanvas: number
  /** Width, in canvas pixels, of the window the person is dragging inside. */
  readonly canvasWidth: number
  readonly currentPlan: CropPlan
  readonly sourceWidth: number
  readonly sourceHeight: number
}

/** Converts a drag (or an arrow key press) into the equivalent framing. Dragging right reveals
 * what was on the left — the image follows the pointer, like any map. Clamping stays inside
 * `calculateCropPlan`, so there's ONE edge rule, not two. */
export function shiftFraming(current: Framing, drag: EditorDrag): Framing {
  const sourcePixelsPerCanvasPixel = drag.currentPlan.source.width / drag.canvasWidth
  return {
    zoom: current.zoom,
    centerX: current.centerX - (drag.deltaXOnCanvas * sourcePixelsPerCanvasPixel) / drag.sourceWidth,
    centerY: current.centerY - (drag.deltaYOnCanvas * sourcePixelsPerCanvasPixel) / drag.sourceHeight
  }
}
