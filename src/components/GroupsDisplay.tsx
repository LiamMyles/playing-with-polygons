import React, { useContext } from "react"
import styled from "styled-components"

import {
  polygonGroupsStateContext,
  PolygonRing,
} from "reducer-contexts/polygon-groups"

import {
  generatePolygonGroupSketch,
  generatePolygonRingSketch,
} from "polygon-logic/polygon-p5-draw"

import { P5Canvas } from "components/P5Canvas"

const GroupsUl = styled.ul`
  display: grid;
  grid-gap: 10px;
  background: grey;
  list-style: none;
  overflow-y: scroll;
  height: 100%;
`

const GroupsLi = styled.li`
  background: lightgrey;
  display: grid;
  grid-gap: 10px;
  grid-template-rows: 200px 170px;
`
const AddGroupButton = styled.button`
  margin: 0 10px;
  font-size: 18px;
  border-radius: 10px;
  height: 50px;
  margin-bottom: 10px;
`

const GroupCanvas = styled.div`
  justify-self: center;
`

const RingsUl = styled.ul`
  display: flex;
  width: 100%;
  overflow-x: scroll;
`

const RingsLi = styled.li`
  margin: 0 5px 0;
`

export function GroupsDisplay() {
  const polygonGroupsState = useContext(polygonGroupsStateContext)
  return (
    <GroupsUl>
      {polygonGroupsState.map((polygonGroup, groupIndex) => {
        const key = `${polygonGroup.rings.length}-${polygonGroup.rings[0].rotation.startingRotation}-${groupIndex}`
        const isLastPolygonGroup = groupIndex === polygonGroupsState.length - 1
        return (
          <GroupsLi key={key} aria-label={`Group ${groupIndex} Canvas`}>
            <GroupCanvas>
              <P5Canvas
                sketch={generatePolygonGroupSketch(
                  polygonGroup,
                  {
                    height: 200,
                    width: 200,
                  },
                  0.2
                )}
              />
            </GroupCanvas>
            <PolygonRingsDisplay
              polygonRings={polygonGroup.rings}
              groupNumber={groupIndex}
            />
            {isLastPolygonGroup && <AddGroupButton>Add Group</AddGroupButton>}
          </GroupsLi>
        )
      })}
    </GroupsUl>
  )
}

const PolygonRingsDisplay: React.FC<{
  polygonRings: PolygonRing[]
  groupNumber: number
}> = ({ polygonRings, groupNumber }) => {
  return (
    <RingsUl>
      {polygonRings.map((ring, ringIndex) => {
        const key = `${polygonRings.length}-${ring.rotation.startingRotation}-${ringIndex}`
        return (
          <RingsLi
            key={key}
            aria-label={`Group ${groupNumber}, Ring ${ringIndex} Canvas`}
          >
            <P5Canvas
              sketch={generatePolygonRingSketch(
                ring,
                {
                  height: 150,
                  width: 150,
                },
                0.15
              )}
            />
          </RingsLi>
        )
      })}
    </RingsUl>
  )
}
