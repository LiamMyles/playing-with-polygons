import { P5 } from "types/p5"
import {
  PolygonAnimationCalculation,
  PolygonAnimation,
} from "polygon-logic/polygon-animation-calculation"
import { PolygonRing, PolygonGroup } from "reducer-contexts/polygon-groups"

function singlePolygonDraw(polygonAnimation: PolygonAnimation, p5: P5) {
  const { currentRotation, dots, sides } = polygonAnimation
  p5.push()
  p5.translate(0, 0)
  p5.rotate(currentRotation)
  if (sides.enabled) {
    sides.positions.forEach((cords, index) => {
      const stokeColour = index % sides.strokeColours.length
      p5.stroke(sides.strokeColours[stokeColour])
      p5.strokeWeight(sides.strokeWidth)
      p5.line(cords[0].x, cords[0].y, cords[1].x, cords[1].y)
    })
  }
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

export function generatePolygonRingSketch(PolygonRing: Readonly<PolygonRing>) {
  const polygonRingInstance = new PolygonAnimationCalculation(PolygonRing)

  return (p5: P5) => {
    p5.setup = () => {
      p5.createCanvas(600, 600)
      p5.background("grey")
    }
    p5.draw = () => {
      polygonRingInstance.getPolygonFrameAndStep()
      p5.angleMode("degrees")
      p5.translate(300, 300)
      singlePolygonDraw(polygonRingInstance.getPolygonFrameAndStep(), p5)
    }
  }
}

export function generatePolygonGroupSketch(
  polygonGroup: Readonly<PolygonGroup>
) {
  const polygonRingInstances = polygonGroup.rings.map((polygonRing) => {
    return new PolygonAnimationCalculation(polygonRing)
  })

  return (p5: P5) => {
    p5.setup = () => {
      p5.createCanvas(600, 600)
      p5.background("grey")
    }
    p5.draw = () => {
      p5.angleMode("degrees")
      p5.background("grey")
      p5.translate(300, 300)
      p5.push()
      for (const polygonRing of polygonRingInstances) {
        singlePolygonDraw(polygonRing.getPolygonFrameAndStep(), p5)
      }
      p5.pop()
    }
  }
}

export function generateAllPolygonRingGroupsSketch(
  polygonGroups: Readonly<PolygonGroup[]>
) {
  const polygonGroupInstances = polygonGroups.map(({ rings }) =>
    rings.map((polygonRing) => {
      return new PolygonAnimationCalculation(polygonRing)
    })
  )

  return (p5: P5) => {
    p5.setup = () => {
      p5.createCanvas(600, 600)
      p5.background("grey")
    }
    p5.draw = () => {
      p5.angleMode("degrees")
      p5.background("grey")
      p5.translate(300, 300)
      for (const polygonGroupRings of polygonGroupInstances) {
        p5.push()
        p5.translate(0, 0)
        for (const polygonRingInstance of polygonGroupRings) {
          singlePolygonDraw(polygonRingInstance.getPolygonFrameAndStep(), p5)
        }
        p5.pop()
      }
    }
  }
}