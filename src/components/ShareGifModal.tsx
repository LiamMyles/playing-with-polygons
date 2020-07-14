import styled from "styled-components"
import { P5Canvas } from "./P5Canvas"
import React, { useState, useContext, useEffect } from "react"
import { polygonGroupsStateContext } from "reducer-contexts/polygon-groups"
import { backgroundStateContext } from "reducer-contexts/background"
import { ModalBox } from "./ModalBox"
import { generateGifSketch } from "polygon-logic/polygon-p5-draw"
import { Slider } from "./Slider"
import { StyledButton } from "common-styled-components/StyledButton"

import download from "downloadjs"

declare class GIF {
  constructor(options: {
    workers: number
    quality: number
    workerScript: string
    dither: string
  })

  on(
    type: "start" | "abort" | "finished" | "progress",
    callback: Function
  ): void
  removeListener(
    type: "start" | "abort" | "finished" | "progress",
    callback: Function
  ): void
  render(): void
  abort(): void
  addFrame(canvas: any, options: any): void
}

const GifModalInternalWrappingDiv = styled.div`
  width: 100%;
  min-height: 150px;
  display: grid;
  justify-content: center;
  align-content: center;
  grid-gap: 10px;
  font-size: 20px;
  grid-auto-columns: minmax(280px, 80%);
  justify-items: center;
`
const GifCanvas = styled(P5Canvas)`
  display: flex;
  justify-content: center;
  align-items: center;
`

const gifOptions = {
  workers: 2,
  quality: 5,
  workerScript: "/playing-with-polygons/js/gif.worker.js",
  dither: "FalseFloydSteinberg-serpentine",
}

let gif = typeof GIF !== "undefined" ? new GIF(gifOptions) : null

export const GenerateGifModal: React.FC = () => {
  const [editModalIsClosed, setEditModalIsClosed] = useState(true)
  const polygonContext = useContext(polygonGroupsStateContext)
  const backgroundState = useContext(backgroundStateContext)

  const [recordingLength, setRecordingLength] = useState(5)
  const [startGenerating, setStartGenerating] = useState(false)
  const [gifFile, setGifFile] = useState<Blob | null>(null)

  const [currentProgress, setCurrentProgress] = useState(0)
  const [renderHasStarted, setRenderHasStarted] = useState(false)
  const [renderFinished, setRenderFinished] = useState(false)

  // Reset on close
  useEffect(() => {
    if (gif === null) return
    if (editModalIsClosed) {
      setCurrentProgress(0)
      setRenderHasStarted(false)
      setRenderFinished(false)
      setStartGenerating(false)
      setGifFile(null)
    }
  }, [editModalIsClosed])

  useEffect(() => {
    if (gif === null) return
    const progressHandler = function (progression: any) {
      const roundedProgression = Math.round(progression * 100)
      setCurrentProgress(roundedProgression)
    }
    const startHandler = (starting: any) => {
      setRenderHasStarted(true)
    }
    const abortHandler = (aborting: any) => {}
    const finishedHandler = function (finishedBlob: Blob) {
      setRenderFinished(true)
      setGifFile(finishedBlob)
    }

    gif.on("start", startHandler)
    gif.on("abort", abortHandler)
    gif.on("finished", finishedHandler)
    gif.on("progress", progressHandler)

    if (editModalIsClosed) {
      gif.abort()
      gif = new GIF(gifOptions)
    }
    return () => {
      if (gif === null) return
      gif.removeListener("start", startHandler)
      gif.removeListener("abort", abortHandler)
      gif.removeListener("finished", finishedHandler)
      gif.removeListener("progress", progressHandler)
      gif.abort()
      gif = new GIF(gifOptions)
    }
  }, [editModalIsClosed])
  if (gif === null) return null
  return (
    <ModalBox
      buttonText="Make Gif"
      title="Make Gif"
      StyledButton={StyledButton}
      isClosed={editModalIsClosed}
      setIsClosed={setEditModalIsClosed}
    >
      <GifModalInternalWrappingDiv>
        {renderHasStarted &&
          (!renderFinished ? (
            <p>Processing : {currentProgress}%</p>
          ) : (
            <p>Finished</p>
          ))}
        {!startGenerating && (
          <Slider
            label="Gif Length"
            min={1}
            max={10}
            currentValue={recordingLength}
            setFunction={setRecordingLength}
            id={"gif-recording-length-slider"}
            valueSuffix={" seconds"}
          />
        )}
        {!editModalIsClosed && !renderHasStarted && startGenerating && (
          <>
            <p>Recording</p>
            <GifCanvas
              sketch={generateGifSketch({
                polygonGroups: polygonContext,
                windowSize: { height: 250, width: 250 },
                rgbaBackgroundColour: backgroundState.rgba,
                rgbBackgroundColour: backgroundState.rgb,
                shouldRedrawBackground: backgroundState.shouldRedraw,
                gifClass: gif,
                recordingLength: recordingLength,
                scale: 0.3,
              })}
            />
          </>
        )}
        {!startGenerating && (
          <StyledButton
            type="button"
            onClick={() => {
              setStartGenerating(true)
            }}
          >
            Start Generating
          </StyledButton>
        )}
        {gifFile && (
          <StyledButton
            type="button"
            onClick={() => {
              download(gifFile)
            }}
          >
            Download Gif
          </StyledButton>
        )}
      </GifModalInternalWrappingDiv>
    </ModalBox>
  )
}