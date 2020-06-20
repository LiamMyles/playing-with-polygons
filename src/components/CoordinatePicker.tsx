import React, { useState, useRef, useEffect } from "react"
import { Slider } from "./Slider"
import styled from "styled-components"

interface CoordinatePickerProps {
  initialX: number
  initialY: number
  scrollingParentRef?: React.RefObject<HTMLDivElement>
}

const CoordinatePickerWrappingDiv = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 1fr;
  grid-template-rows: 1fr 1fr 50px;
  width: 300px;
  height: 300px;
`
const YSliderWrappingDiv = styled.div`
  grid-column: 1/2;
  grid-row: 1/3;
  justify-self: center;
  align-self: center;
  display: grid;
  grid-template-rows: 10px 1fr;
  text-align: center;
`
const XSliderWrappingDiv = styled.div`
  grid-column: 2/4;
  grid-row: 3/4;
  justify-self: center;
  align-self: center;
  display: grid;
  grid-template-columns: 10px 1fr;
  align-items: center;
  grid-gap: 5px;
`
const CoordinatePositionsDiv = styled.div`
  grid-column: 1/2;
  grid-row: 3/4;
  justify-self: center;
  align-self: center;
  text-align: center;
`
const CoordinatePanelDiv = styled.div`
  background: lightgray;
  grid-column: 2/4;
  grid-row: 1/3;
  position: relative;
  border: 10px solid darkgrey;
  &:before,
  &:after {
    position: absolute;
    content: "";
    border: 2px darkgrey dashed;
  }
  &:before {
    width: 100%;
    top: 50%;
    transform: translateY(-2px);
  }
  &:after {
    z-index: 0;
    height: 100%;
    right: 50%;
    transform: translateX(2px);
  }
`
const CoordinateThumbDiv = styled.div`
  position: absolute;
  z-index: 1;
  background: grey;
  border-radius: 20px;
  width: 20px;
  height: 20px;
  top: 0%;
  right: 0%;
  transform: translate(50%, -50%);
  &.moving {
    background: darkgrey;
    border: solid 2px grey;
    width: 18px;
    height: 18px;
  }
`

interface getNewValueForRangeOptions {
  oldValue: number
  oldMin: number
  oldMax: number
  newMin: number
  newMax: number
}

function getNewValueForRange({
  oldValue,
  oldMin,
  oldMax,
  newMin,
  newMax,
}: getNewValueForRangeOptions): number {
  return ((oldValue - oldMin) * (newMin - newMax)) / (oldMax - oldMin) + newMax
}

export const CoordinatePicker: React.FC<CoordinatePickerProps> = ({
  initialX,
  initialY,
  scrollingParentRef,
}) => {
  const [xCord, setXCord] = useState(initialX)
  const [yCord, setYCord] = useState(initialY)

  const yToTopPosition = getNewValueForRange({
    oldValue: yCord,
    oldMin: -100,
    oldMax: 100,
    newMin: 0,
    newMax: 100,
  })
  const xToTopPosition = getNewValueForRange({
    oldValue: xCord,
    oldMin: -100,
    oldMax: 100,
    newMin: 0,
    newMax: 100,
  })
  const positionStyles = {
    top: `${yToTopPosition}%`,
    right: `${xToTopPosition}%`,
  }

  const coordinatePanel = useRef<HTMLDivElement>(null)

  return (
    <CoordinatePickerWrappingDiv>
      <YSliderWrappingDiv>
        <Slider
          max={100}
          min={-100}
          currentValue={yCord}
          label="Y"
          id="y"
          simpleThumb={true}
          vertical={true}
          setFunction={setYCord}
        />
      </YSliderWrappingDiv>
      <CoordinatePositionsDiv>
        <p>X:{xCord}</p>
        <p>Y:{yCord}</p>
      </CoordinatePositionsDiv>
      <CoordinatePanelDiv ref={coordinatePanel}>
        <CoordinateThumbDiv
          style={positionStyles}
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()

            const elementClassList = event.currentTarget.classList
            elementClassList.add("moving")

            function pointerMove(event: PointerEvent) {
              if (coordinatePanel.current === null) return
              const diffX =
                (event.pageX | event.clientX) -
                coordinatePanel.current.offsetLeft
              const newX = Math.round(
                -100 +
                  ((100 - -100) * diffX) / coordinatePanel.current.offsetWidth
              )
              if (newX >= -100 && newX <= 100) {
                setXCord(newX)
              } else if (newX >= -100) {
                setXCord(100)
              } else if (newX <= 100) {
                setXCord(-100)
              }
              let diffY =
                (event.pageY | event.clientY) -
                coordinatePanel.current.offsetTop

              if (scrollingParentRef?.current?.scrollTop) {
                diffY = diffY + scrollingParentRef.current.scrollTop
              }

              const newY = Math.round(
                100 +
                  ((-100 - 100) * diffY) / coordinatePanel.current.offsetHeight
              )
              if (newY >= -100 && newY <= 100) {
                setYCord(newY)
              } else if (newY >= -100) {
                setYCord(100)
              } else if (newY <= 100) {
                setYCord(-100)
              }
            }

            function pointerUp() {
              elementClassList.remove("moving")
              document.removeEventListener("pointerup", pointerUp)
              document.removeEventListener("pointermove", pointerMove)
            }

            document.addEventListener("pointerup", pointerUp)
            document.addEventListener("pointermove", pointerMove)
          }}
        />
      </CoordinatePanelDiv>
      <XSliderWrappingDiv>
        <Slider
          max={100}
          min={-100}
          currentValue={xCord}
          label="X"
          id="x"
          simpleThumb={true}
          setFunction={setXCord}
        />
      </XSliderWrappingDiv>
    </CoordinatePickerWrappingDiv>
  )
}
