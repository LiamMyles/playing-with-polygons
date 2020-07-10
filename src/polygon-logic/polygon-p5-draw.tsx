import { P5 } from "types/p5"
import {
  PolygonAnimationCalculation,
  PolygonAnimation,
} from "polygon-logic/polygon-animation-calculation"
// Disabled because PolygonRing is only used as a type and is getting flagged
// eslint-disable-next-line
import { PolygonRing, PolygonGroup } from "reducer-contexts/polygon-groups"

function getSizeConstrainedCords(
  size: { width: number; height: number },
  cords: { x: number; y: number }
): { x: number; y: number } {
  const x = Math.floor((size.width * (cords.x / 100)) / 2)
  let y = Math.floor((size.height * (cords.y / 100)) / 2)
  //Flip the y axis to have +100 at the top and -100 at the bottom
  if (y < 0) {
    y = y / -1
  } else {
    y = y / -1
  }

  return { x, y }
}
/**
 * Shared function used to draw the polygon
 */

function singlePolygonDraw(
  polygonAnimation: PolygonAnimation,
  size: { width: number; height: number },
  p5: P5,
  scale?: number
) {
  const { currentRotation, dots, sides, position } = polygonAnimation
  const { x, y } = getSizeConstrainedCords(size, position)

  p5.push()
  // Set polygon rings translation point
  p5.translate(x, y)
  if (scale) {
    p5.scale(scale)
  }
  p5.rotate(currentRotation)
  // Draw Sides if enabled
  if (sides.enabled) {
    sides.positions.forEach((cords, index) => {
      const stokeColour = index % sides.strokeColours.length
      p5.stroke(sides.strokeColours[stokeColour])
      p5.strokeWeight(sides.strokeWidth)
      p5.line(cords[0].x, cords[0].y, cords[1].x, cords[1].y)
    })
  }
  // Draw dots if enabled
  if (dots.enabled) {
    p5.push()
    dots.position.forEach((cords, index) => {
      const fillColourIndex = index % dots.fillColours.length
      const stokeColourIndex = index % dots.strokeColours.length
      const { x, y } = cords
      p5.fill(dots.fillColours[fillColourIndex])
      p5.strokeWeight(dots.strokeWidth)
      p5.stroke(dots.strokeColours[stokeColourIndex])
      p5.ellipse(x, y, dots.size)
    })
    p5.pop()
  }
  p5.pop()
}

/**
 * Generates everything needed to draw and setup a single polygon ring
 */

interface PolygonRingSketchParams {
  polygonRing: Readonly<PolygonRing>
  windowSize: { height: number; width: number }
  scale?: number
  backgroundColour: string
  shouldRedrawBackground: boolean
}
export function generatePolygonRingSketch({
  polygonRing,
  windowSize,
  scale,
  backgroundColour,
  shouldRedrawBackground,
}: PolygonRingSketchParams) {
  const polygonRingInstance = new PolygonAnimationCalculation(polygonRing)

  return (p5: P5) => {
    p5.setup = () => {
      p5.createCanvas(windowSize.width, windowSize.height)
      p5.background(backgroundColour)
    }
    p5.draw = () => {
      polygonRingInstance.getPolygonFrameAndStep()
      p5.angleMode("degrees")
      if (shouldRedrawBackground) {
        p5.background(backgroundColour)
      }
      // Set translation point to the center
      p5.translate(windowSize.width / 2, windowSize.height / 2)
      singlePolygonDraw(
        polygonRingInstance.getPolygonFrameAndStep(),
        windowSize,
        p5,
        scale
      )
    }
  }
}

/**
 * Generates everything needed to draw and setup a group of polygon rings
 */

interface PolygonGroupSketchParams {
  polygonGroup: Readonly<PolygonGroup>
  windowSize: { height: number; width: number }
  scale?: number
  backgroundColour: string
  shouldRedrawBackground: boolean
}
export function generatePolygonGroupSketch({
  polygonGroup,
  windowSize,
  scale,
  backgroundColour,
  shouldRedrawBackground,
}: PolygonGroupSketchParams) {
  const polygonRingInstances = polygonGroup.rings.map((polygonRing) => {
    return new PolygonAnimationCalculation(polygonRing)
  })

  return (p5: P5) => {
    p5.setup = () => {
      p5.createCanvas(windowSize.width, windowSize.height)
      p5.background(backgroundColour)
    }
    p5.draw = () => {
      p5.angleMode("degrees")
      if (shouldRedrawBackground) {
        p5.background(backgroundColour)
      }
      // Set translation point to the center
      p5.translate(windowSize.width / 2, windowSize.height / 2)
      p5.push()
      // Set groups translation point
      const { x, y } = getSizeConstrainedCords(
        windowSize,
        polygonGroup.position
      )
      p5.translate(x, y)
      for (const polygonRing of polygonRingInstances) {
        singlePolygonDraw(
          polygonRing.getPolygonFrameAndStep(),
          windowSize,
          p5,
          scale
        )
      }
      p5.pop()
    }
  }
}

interface AllPolygonRingGroupsSketchParams {
  polygonGroups: Readonly<PolygonGroup[]>
  windowSize: { height: number; width: number }
  rgbaBackgroundColour: string
  rgbBackgroundColour: string
  shouldRedrawBackground: boolean
}
export function generateAllPolygonRingGroupsSketch({
  polygonGroups,
  windowSize,
  rgbaBackgroundColour,
  rgbBackgroundColour,
  shouldRedrawBackground,
}: AllPolygonRingGroupsSketchParams) {
  const polygonGroupInstances = polygonGroups.map(({ rings }) =>
    rings.map((polygonRing) => {
      return new PolygonAnimationCalculation(polygonRing)
    })
  )
  return (p5: P5) => {
    p5.setup = () => {
      p5.createCanvas(windowSize.width, windowSize.height)
      p5.background(rgbBackgroundColour)
      p5.frameRate(30)
    }
    p5.draw = () => {
      p5.angleMode("degrees")
      if (shouldRedrawBackground) {
        p5.background(rgbaBackgroundColour)
      }
      // Set translation point to the center
      p5.translate(windowSize.width / 2, windowSize.height / 2)
      polygonGroupInstances.forEach((polygonGroupRings, index) => {
        p5.push()
        // Set groups translation point
        const { x, y } = getSizeConstrainedCords(
          windowSize,
          polygonGroups[index].position
        )
        p5.translate(x, y)
        for (const polygonRingInstance of polygonGroupRings) {
          singlePolygonDraw(
            polygonRingInstance.getPolygonFrameAndStep(),
            windowSize,
            p5
          )
        }
        p5.pop()
      })
    }
  }
}

declare class GIF {
  constructor({}: any)

  on(
    type: "start" | "abort" | "finished" | "progress",
    callback: Function
  ): void
  render(): void
  abort(): void
  addFrame(canvas: any, options: any): void
}
export function generateGifSketch({
  polygonGroups,
  windowSize,
  rgbaBackgroundColour,
  rgbBackgroundColour,
  shouldRedrawBackground,
}: AllPolygonRingGroupsSketchParams) {
  const polygonGroupInstances = polygonGroups.map(({ rings }) =>
    rings.map((polygonRing) => {
      return new PolygonAnimationCalculation(polygonRing)
    })
  )
  return (p5: P5) => {
    let gif = new GIF({
      workers: 2,
      quality: 5,
      workerScript: "playing-with-polygons/js/gif.worker.js",
      dither: "FalseFloydSteinberg-serpentine",
      background: "#ffffff",
    })

    let shouldDraw = true
    p5.setup = () => {
      const canvas = p5.createCanvas(windowSize.width, windowSize.height)
      canvas.id("main-canvas")
      p5.frameRate(30)
      p5.background(rgbBackgroundColour)

      console.log("started")
      gif.on("start", () => {
        console.log("starting")
      })
      gif.on("abort", () => {
        console.log("aborting")
      })
      gif.on("finished", function (blob: any) {
        console.log("finished")
        console.log(URL.createObjectURL(blob))
        window.open(URL.createObjectURL(blob))
      })
      gif.on("progress", function (blob: any) {
        console.log(blob)
      })
    }
    p5.draw = () => {
      if (p5.frameCount === 180) {
        gif.render()
        shouldDraw = false
      }

      if (shouldDraw && document.getElementById("main-canvas")) {
        gif.addFrame(document.getElementById("main-canvas"), {
          delay: 30,
          copy: true,
        })
      } else {
        p5.remove()
      }
      p5.angleMode("degrees")
      if (shouldRedrawBackground) {
        p5.background(rgbaBackgroundColour)
      }
      // Set translation point to the center
      p5.translate(windowSize.width / 2, windowSize.height / 2)

      polygonGroupInstances.forEach((polygonGroupRings, index) => {
        p5.push()
        // Set groups translation point
        const { x, y } = getSizeConstrainedCords(
          windowSize,
          polygonGroups[index].position
        )
        p5.translate(x, y)
        p5.scale(0.2)
        for (const polygonRingInstance of polygonGroupRings) {
          singlePolygonDraw(
            polygonRingInstance.getPolygonFrameAndStep(),
            windowSize,
            p5
          )
        }
        p5.pop()
      })
    }
  }
}
