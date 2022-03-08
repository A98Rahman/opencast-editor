import React, { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { SegmentsList as CuttingSegmentsList, Waveforms } from "./Timeline";
import {
  selectDummyData,
  setDummySegment,
} from '../redux/subtitleSlice'
import { useDispatch, useSelector } from "react-redux";
import useResizeObserver from "use-resize-observer";
import { selectDuration } from "../redux/videoSlice";
import { RootState } from "../redux/store";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import Draggable from "react-draggable";

/**
 * Copy-paste of the timeline in Video.tsx, so that we can make some small adjustments,
 * like adding in a list of subtitle segments
 */
 const SubtitleTimeline: React.FC<{
  selectCurrentlyAt: (state: RootState) => number,
  selectIsPlaying:(state: RootState) => boolean,
  setClickTriggered: ActionCreatorWithPayload<any, string>,
  setCurrentlyAt: ActionCreatorWithPayload<number, string>,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
}> = ({
  selectCurrentlyAt,
  selectIsPlaying,
  setClickTriggered,
  setCurrentlyAt,
  setIsPlaying
}) => {

  // Init redux variables
  const dispatch = useDispatch();
  const duration = useSelector(selectDuration)
  const currentlyAt = useSelector(selectCurrentlyAt)

  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();
  const refTop = useRef<HTMLDivElement>(null);
  const { ref: refMini, width: widthMiniTimeline = 1, } = useResizeObserver<HTMLDivElement>();

  const timelineCutoutInMs = 10000    // How much of the timeline should be visible in milliseconds. Aka a specific zoom level

  const timelineStyle = css({
    position: 'relative',     // Need to set position for Draggable bounds to work
    height: '220px',
    width: ((duration / timelineCutoutInMs)) * 100 + '%',    // Total length of timeline based on number of cutouts
    paddingLeft: '50%',
    paddingRight: '50%',
  });

  const setCurrentlyAtToClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let rect = e.currentTarget.getBoundingClientRect()
    let offsetX = e.clientX - rect.left
    dispatch(setClickTriggered(true))
    dispatch(setCurrentlyAt((offsetX / widthMiniTimeline) * (duration)))
  }

  // Apply horizonal scrolling when scrolled from somewhere else
  useEffect(() => {
    if (currentlyAt !== undefined && refTop.current) {
      const scrollLeftMax = (refTop.current.scrollWidth - refTop.current.clientWidth)
      refTop.current.scrollTo(((currentlyAt / duration)) * scrollLeftMax, 0)
    }
  }, [currentlyAt, duration, width]);

  // draws a triangle on top of the middle line
  const triangleStyle = css({
    width: 0,
    height: 0,
    left: '-19px',
    borderLeft: '20px solid transparent',
    borderRight: '20px solid transparent',
    position: "relative",
    borderTop: '20px solid black',
  })

  return (
    <div css={{position: 'relative', width: '100%', height: '230px'}}>
      {/* Sits smack dab in the middle and does not move */}
      <div
        css={{position: 'absolute',
        width: '2px',
        height: '190px',
        ...(refTop.current) && {left: (refTop.current.clientWidth / 2)},
        top: '10px',
        background: 'black'}}>
          <div css={triangleStyle} />
      </div>
      {/* Scrollable timeline */}
      {/* Container. Has width of parent*/}
      <div ref={refTop} css={{overflowX: 'auto', overflowY: 'hidden', width: '100%', height: '100%'}}>
        {/* Container. Overflows. Width based on parent times zoom level*/}
        <div ref={ref} css={timelineStyle} title="Timeline" >
          <div css={{height: '10px'}} />    {/* Fake padding. TODO: Figure out a better way to pad absolutely positioned elements*/}
          <TimelineSubtitleSegmentsList timelineWidth={width}/>
          <div css={{position: 'relative', height: '100px'}} >
            <Waveforms />
            <CuttingSegmentsList timelineWidth={width}/>
          </div>
        </div>
      </div>
      {/* Mini Timeline. Makes it easier to understand position in scrollable timeline */}
      <div
        title="Mini Timeline"
        onMouseDown={e => setCurrentlyAtToClick(e)}
        css={{position: 'relative', width: '100%', height: '15px', background: 'lightgrey'}}
        ref={refMini}
      >
        <div
          css={{position: 'absolute', width: '2px', height: '100%', left: (currentlyAt / duration) * (widthMiniTimeline), top: 0, background: 'black'}}
        >
        </div>
      </div>
    </div>
  );
};


/**
 * Displays subtitle segments as a row of boxes
 */
const TimelineSubtitleSegmentsList: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  const dummyData = useSelector(selectDummyData)

  const segmentsListStyle = css({
    position: 'relative',
    width: '100%',
    height: '80px',
    overflow: 'hidden',
  })

  return (
    <div css={segmentsListStyle}>
      {dummyData.map((item, i) => {
        return (
          <TimelineSubtitleSegment timelineWidth={timelineWidth} textInit={item[0]} startInit={item[1]} endInit={item[2]} key={i} index={i}/>
        )
      })}
    </div>
  );

}

/**
 * A single segments for the timeline subtitle segments list
 */
const TimelineSubtitleSegment: React.FC<{timelineWidth: number, textInit: string, startInit: number, endInit: number, index: number}> = ({timelineWidth, textInit, startInit, endInit, index}) => {

  const dispatch = useDispatch()
  const duration = useSelector(selectDuration)
  const [controlledPosition, setControlledPosition] = useState({x: 0, y: 0})
  const [isGrabbed, setIsGrabbed] = useState(false)
  const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  // Callback for when the scrubber gets dragged by the user
  const onControlledDrag = (e: any, position: any) => {
    // Update position
    const {x} = position
    dispatch(setDummySegment({
      index: index,
      text: textInit,
      start: (x / timelineWidth) * (duration),
      end: (x / timelineWidth) * (duration) + (endInit - startInit),
    }))
  }

  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    // if(currentlyAt !== wasCurrentlyAtRef.current && !isGrabbed) {
      // updateXPos();
      setControlledPosition({x: (startInit / duration) * (timelineWidth), y: 0});
      // wasCurrentlyAtRef.current = currentlyAt;
    // }
  },[duration, startInit, timelineWidth])

  const onStartDrag = () => {
    setIsGrabbed(true)

    // // Halt video playback
    // if (isPlaying) {
    //   setWasPlayingWhenGrabbed(true)
    //   dispatch(setIsPlaying(false))
    // } else {
    //   setWasPlayingWhenGrabbed(false)
    // }
  }
  const onStopDrag = (e: any, position: any) => {
    // // Update position
    // const {x} = position;
    // setControlledPosition({x, y: 0});
    // dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));

    setIsGrabbed(false)
    // // Resume video playback
    // if (wasPlayingWhenGrabbed) {
    //   dispatch(setIsPlaying(true))
    // }
  }

  const segmentStyle = css({
    // Use absolute positioning to allow for overlap
    position: 'absolute',
    // top: 0,
    // left: (startInit / duration) * 100 + '%',
    height: '100%',
    width: ((endInit - startInit) / duration) * 100 + '%',

    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '5px',
    borderStyle: 'solid',
    borderColor: 'dark-grey',
    borderWidth: '1px',
    boxSizing: 'border-box',
    zIndex: 1,

    cursor: isGrabbed ? "grabbing" : "grab",

    // Center text
    display: 'flex',
    alignItems: 'center',
  })

  const textStyle = css({
    overflow: 'hidden',
    whiteSpace: "nowrap",
    textOverflow: 'ellipsis',
    padding: '2px',
    color: 'white',
  })

  return (
    <Draggable
      onDrag={onControlledDrag}
      onStart={onStartDrag}
      onStop={onStopDrag}
      axis="x"
      bounds="parent"
      position={controlledPosition}
      // defaultPosition={{x: (startInit / duration) * (timelineWidth), y: 0}}
      nodeRef={nodeRef}
      >
        <div ref={nodeRef} css={segmentStyle}>
          <span css={textStyle}>{textInit}</span>
        </div>
    </Draggable>
  );
}

export default SubtitleTimeline
