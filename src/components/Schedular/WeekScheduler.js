import React, { useState, useRef, useEffect, useCallback } from "react";
import DayTimeline from "./DayTimeline";
import "bootstrap/dist/css/bootstrap.css";
import "./styles/style.css";
import moment from "moment";
import settings from "./config";
import {
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  preventGoBack,
} from "./scripts/touchEventsHandlers";
import { Box, IconButton } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ActionsPanel from "./ActionsPanel";
import SettingsPanel from "./SettingsPanel";
import InfoPanel from "./InfoPanel";
import { isBetween, convertMinsToHrsMins } from "./scripts/helpers";
import styled, { withTheme } from "styled-components";

const WeekDayCard = styled.div`
  width: 120px;
  border-radius: 37px 0 0 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 800;
  font-size: 16px;
  text-transform: uppercase;
  color: white;
  background: ${(props) => props.theme.primary};
`;

const TickContainer = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
  height: ${(props) => props.tickHeight}px;
`;

const Tick = styled.div`
  height: 100%;
  border-left: ${(props) =>
    props.index % props.cellsNumberInInterval === 0 ? "2px solid rgba(2,26,83, 0.2)" : "none"};
  width: ${(props) =>
    props.showLines ? props.cellWidth / props.cellsNumberInInterval : props.cellWidth}px;
`;

const CellsRow = styled.div`
  height: ${(props) => props.cellHeight}px;
  margin-bottom: ${(props) => props.spaceBetweenTimelines}px;
  position: relative;
`;

const Cell = styled.div`
  border-left: ${(props) => (props.index % props.cellsNumberInInterval === 0 ? 2 : 0.5)}px solid
    #021a53;
  border-bottom: 0.5px solid rgba(0, 25, 74, 0.2);
  border-top: 0.5px solid rgba(0, 25, 74, 0.2);
  width: ${(props) =>
    props.showLines ? props.cellWidth / props.cellsNumberInInterval : props.cellWidth}px;
`;

const TimeLabelContainer = styled.div`
  position: relative;
  width: ${(props) => props.cellWidth}px;
  height: ${(props) => props.timesHeight}px;
`;

const TimeLabel = styled.div`
  width: ${(props) => props.cellWidth * 2}px;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const Times = ({ size, cellWidth, interval, totalMinutes, hourFormat, timesHeight }) => {
  return (
    <div style={{ width: `${size}px`, color: "#2d2d61", fontWeight: 500 }}>
      <div className="d-flex w-100 position-relative">
        {new Array(totalMinutes / interval).fill(0).map((_, i) => (
          <TimeLabelContainer cellWidth={cellWidth} timesHeight={timesHeight} key={`time-${i}`}>
            <TimeLabel cellWidth={cellWidth}>
              {convertMinsToHrsMins(i * interval, hourFormat === 12)}
            </TimeLabel>
          </TimeLabelContainer>
        ))}
        <div
          className="position-absolute"
          style={{
            top: 0,
            right: `-${cellWidth}px`,
            width: 2 * cellWidth,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {convertMinsToHrsMins(totalMinutes, hourFormat === 12)}
        </div>
      </div>
    </div>
  );
};

const WeekScheduler = ({
  currentSchedule,
  setCurrentSchedule,
  handlePrevious,
  weekStart,
  setWeekStart,
  theme,
}) => {
  const leftPadding = 30;
  const {
    totalMinutes,
    zoomOptions,
    cellHeight,
    showLines,
    timeGapBetweenZooms,
    defaultHourFormat,
    defaultZoomOption,
    spaceBetweenTimelines,
    tickHeight,
    timesHeight,
    sidePanelWidth,
    rangeLabelHeight,
    defaultJoinAdjacent,
  } = settings;

  const schedulerHeight = timesHeight + tickHeight + 7 * (cellHeight + spaceBetweenTimelines) + 10;

  const [activeButton, setActiveButton] = useState(""); //which button is currently active
  const [hourFormat, setHourFormat] = useState(defaultHourFormat);
  const [joinAdjacent, setJoinAdjacent] = useState(defaultJoinAdjacent);

  const scrollableContainer = useRef(null);
  const zoomableContainer = useRef(null);
  const checkIfDraggingiIntervalRef = useRef(null);
  const didMountRef = useRef(false);

  const zooming = useRef(false);
  const [zoomOption, setZoomOption] = useState(defaultZoomOption);
  const [dragging, setDragging] = useState(false);
  const scrollInterval = useRef(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [movingRange, setMovingRange] = useState({
    range: [],
    from: 0,
    day: -1,
    originDay: -1,
    rangeIndex: -1,
    released: false,
  });

  const { cellWidth, interval, step } = zoomOptions[zoomOption];
  const size = (totalMinutes / interval) * cellWidth;

  const [allowScrollRight, setAllowScrollRight] = useState(false);
  const [allowScrollLeft, setAllowScrollLeft] = useState(false);
  const leftSpeed = useRef(0);
  const rightSpeed = useRef(0);

  const [allowZoom, setAllowZoom] = useState(false);
  const pageRef = useRef(null);

  //changing first day of a week
  moment.updateLocale("en", {
    week: {
      dow: weekStart,
    },
  });

  useEffect(() => {
    if (didMountRef.current) {
      let scheduleCopy = JSON.parse(JSON.stringify(currentSchedule));
      if (weekStart === 0) {
        setCurrentSchedule([scheduleCopy[6], ...scheduleCopy].slice(0, 7));
      } else if (weekStart === 1) {
        setCurrentSchedule([...scheduleCopy, scheduleCopy[0]].slice(-7));
      }
    } else {
      didMountRef.current = true;
    }
  }, [weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let interval;
    if (allowScrollRight) {
      interval = setInterval(() => {
        scrollableContainer.current.scrollLeft += rightSpeed.current;
      }, 2);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [allowScrollRight]);

  useEffect(() => {
    let interval;
    if (allowScrollLeft) {
      interval = setInterval(() => {
        scrollableContainer.current.scrollLeft -= leftSpeed.current;
      }, 2);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [allowScrollLeft]);

  const setScrollBehaviour = (e) => {
    if (dragging) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const maxScroll =
        scrollableContainer.current.scrollWidth - scrollableContainer.current.clientWidth;
      const currentScrollLeft = scrollableContainer.current.scrollLeft;
      //prevent scrolling when user draw timeslot starting from schedular edge
      if (maxScroll !== currentScrollLeft) {
        if (e.currentTarget.offsetWidth - x < 120) {
          setAllowScrollRight(true);
          rightSpeed.current = 2 + (120 - (e.currentTarget.offsetWidth - x)) / 40;
        } else {
          setAllowScrollRight(false);
        }
      }

      //prevent scrolling when user draw timeslot starting from schedular edge
      if (currentScrollLeft !== 0) {
        if (x < 120) {
          setAllowScrollLeft(true);
          leftSpeed.current = 2 + (120 - x) / 45;
        } else {
          setAllowScrollLeft(false);
        }
      }
    } else {
      setAllowScrollRight(false);
      setAllowScrollLeft(false);
    }
  };

  const onZoom = (targetX, direction) => {
    if (!zooming.current) {
      zooming.current = true;
      var bounds = scrollableContainer.current.getBoundingClientRect();
      var x = targetX - bounds.left;
      const oldSize = size;
      const oldScrollLeft = scrollableContainer.current.scrollLeft;

      const focusOnPoint = (newTimelineSize) => {
        let percentsOfTimeline = (x + oldScrollLeft - leftPadding) / oldSize;
        let a = newTimelineSize * percentsOfTimeline;
        let target = a + leftPadding - x;
        let maxScrollLeft =
          newTimelineSize + 2 * leftPadding - scrollableContainer.current.clientWidth;
        target = target > maxScrollLeft ? maxScrollLeft : target < 0 ? 0 : target;

        if (scrollInterval.current) {
          clearInterval(scrollInterval.current);
        }

        let maxIntervals = 5,
          intervals = 0;

        scrollInterval.current = setInterval(() => {
          let diff = target - scrollableContainer.current.scrollLeft;
          intervals++;
          if (isBetween(scrollableContainer.current.scrollLeft, target - 1, target + 1)) {
            clearInterval(scrollInterval.current);
          } else {
            scrollableContainer.current.scrollLeft += diff;
          }

          if (intervals === maxIntervals) {
            clearInterval(scrollInterval.current);
          }
        }, 1);
      };

      if (direction === "in") {
        let zoomOpt = zoomOption < zoomOptions.length - 1 ? zoomOption + 1 : zoomOption;

        focusOnPoint(
          (totalMinutes / zoomOptions[zoomOpt].interval) * zoomOptions[zoomOpt].cellWidth
        );
        setZoomOption(zoomOpt);
      } else if (direction === "out") {
        let zoomOpt = zoomOption > 0 ? zoomOption - 1 : zoomOption;

        focusOnPoint(
          (totalMinutes / zoomOptions[zoomOpt].interval) * zoomOptions[zoomOpt].cellWidth
        );
        setZoomOption(zoomOpt);
      }
      setTimeout(() => {
        zooming.current = false;
      }, timeGapBetweenZooms);
    }
  };

  const onDelete = () => {
    if (selectedItems.length) {
      setCurrentSchedule((prev) => {
        let arr = [...prev];
        for (let i = selectedItems.length - 1; i >= 0; i--) {
          let s = selectedItems[i].split("-").map((y) => parseInt(y));
          arr[s[0]].splice(s[1], 1);
        }

        return arr;
      });
      setSelectedItems((prev) => prev.filter((_, i) => i < 0));
    }
  };

  // const mergeSelectedRanges = () => {
  //   let groupedByDayRanges = selectedItems.reduce((a, b) => {
  //     let key = b.split("-")[0];
  //     if (key in a) {
  //       a[key].push(b);
  //     } else {
  //       a[key] = [b];
  //     }
  //     return a;
  //   }, {});

  //   Object.values(groupedByDayRanges).forEach((r) => {
  //     if (r.length >= 2) {
  //       let dayIndex = r[0].split("-")[0];
  //       let startRangeIndex = r[0].split("-")[1];
  //       let endRangeIndex = r[r.length - 1].split("-")[1];

  //       const bounds = [
  //         currentSchedule[dayIndex][startRangeIndex].range[0],
  //         currentSchedule[dayIndex][endRangeIndex].range[1],
  //       ];

  //       setSelectedItems([]);

  //       let arr = [...currentSchedule[dayIndex]];
  //       insertIntoArrayWithSplicingOverlappingItems(arr, bounds, totalMinutes / step);
  //       setCurrentSchedule((prev) => {
  //         let nestedArr = [...prev];
  //         nestedArr[dayIndex] = arr;
  //         return nestedArr;
  //       });
  //     }
  //   });
  // };

  const onMouseUp = useCallback(() => {
    setDragging(false);
    if (!movingRange.released) {
      setMovingRange((prev) => Object.assign({}, prev, { released: true }));
    }
    setAllowScrollLeft(false);
    setAllowScrollRight(false);
  }, [setDragging, setMovingRange, setAllowScrollLeft, setAllowScrollRight, movingRange.released]);

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", preventGoBack);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", preventGoBack);
    };
  }, [onMouseUp]);

  useEffect(() => {
    const keydown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        setAllowZoom(true);
      }
    };
    const keyup = () => {
      setAllowZoom(false);
    };

    const mouseenter = () => {
      if (checkIfDraggingiIntervalRef.current) {
        clearInterval(checkIfDraggingiIntervalRef.current);
      }
      checkIfDraggingiIntervalRef.current = setInterval(() => {
        if (!dragging) {
          clearInterval(checkIfDraggingiIntervalRef.current);
          pageRef.current.focus({ preventScroll: true });
        }
      }, 100);
    };
    const mouseleave = () => {
      pageRef.current.blur();
    };

    const pRef = pageRef.current;
    if (pRef) {
      pRef.addEventListener("mouseenter", mouseenter);
      pRef.addEventListener("mouseleave", mouseleave);
      pRef.addEventListener("keydown", keydown);
      pRef.addEventListener("keyup", keyup);
    }
    return () => {
      pRef.removeEventListener("mouseenter", mouseenter);
      pRef.removeEventListener("mouseleave", mouseleave);
      pRef.removeEventListener("keydown", keydown);
      pRef.removeEventListener("keyup", keyup);
      clearInterval(checkIfDraggingiIntervalRef.current);
    };
  }, [dragging]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const zContainer = zoomableContainer.current;
    const zoomOnWheel = (e) => {
      if (allowZoom) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          let direction = e.deltaY < 0 ? "in" : "out";
          onZoom(e.clientX, direction);
        }
      }
    };
    zContainer.addEventListener("wheel", zoomOnWheel, {
      passive: false,
    });

    return () => {
      zContainer.removeEventListener("wheel", zoomOnWheel);
    };
  }, [allowZoom, size]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const zContainer = zoomableContainer.current;
    const onTouchEndModified = (e) => {
      onTouchEnd(e, onZoom);
    };
    zContainer.addEventListener("touchstart", onTouchStart);
    zContainer.addEventListener("touchmove", onTouchMove);
    zContainer.addEventListener("touchend", onTouchEndModified);
    return () => {
      zContainer.removeEventListener("touchstart", onTouchStart);
      zContainer.removeEventListener("touchmove", onTouchMove);
      zContainer.removeEventListener("touchend", onTouchEndModified);
    };
  }, [size]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ marginTop: "-8px" }}>
      <div className="d-flex" style={{ maxWidth: "100%", overflow: "hidden" }}>
        <div className="flex-grow-1" style={{ width: 0 }}>
          <Box display="flex" justifyContent="space-between" className="p-4 mb-4">
            <Box display="flex" alignItems="center">
              <IconButton aria-label="goback" onClick={handlePrevious}>
                <ArrowBackIcon fontSize="large" />
              </IconButton>
              <Box
                component="span"
                className="schedule-title"
                style={{ fontSize: 22, fontWeight: 600, color: "#021a53" }}
              >
                Create Schedule
              </Box>
            </Box>
            <Box>
              <ActionsPanel
                selectedItemsLength={selectedItems.length}
                activeButton={activeButton}
                setActiveButton={setActiveButton}
                handleSelectAll={() => {
                  let arr = [];
                  currentSchedule.forEach((x, i) => {
                    x.forEach((y, j) => {
                      arr.push(i + "-" + j);
                    });
                  });
                  setSelectedItems(arr);
                }}
                handleUnselectAll={() => setSelectedItems([])}
                handleDelete={onDelete}
                setJoinAdjacent={setJoinAdjacent}
                joinAdjacent={joinAdjacent}
              ></ActionsPanel>
            </Box>
          </Box>

          <div
            tabIndex={1}
            className="w-100 d-flex flex-center user-select-none focus-outline-0"
            style={{ fontSize: "14px" }}
            ref={pageRef}
          >
            <div className="px-5 pb-5 w-100" style={{ overflowX: "auto" }}>
              <div className="d-flex">
                <div style={{ marginRight: `-${leftPadding}px` }}>
                  <div
                    style={{
                      height: tickHeight + timesHeight,
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#2d2d61",
                    }}
                  ></div>
                  {moment.weekdays(true).map((x, i) => (
                    <div
                      key={`day-name-${i}`}
                      className="d-flex"
                      style={{ marginBottom: spaceBetweenTimelines, height: cellHeight }}
                    >
                      <WeekDayCard theme={theme}>{x}</WeekDayCard>
                      <div
                        style={{
                          background: "white",
                          height: "100%",
                          width: "26px",
                          borderBottom: "0.5px solid rgba(0, 25, 74, 0.2)",
                          borderTop: "0.5px solid rgba(0, 25, 74, 0.2)",
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div
                  style={{ minWidth: "0px" }}
                  className="flex-grow-1"
                  onMouseMove={setScrollBehaviour}
                >
                  <div
                    ref={scrollableContainer}
                    className="pb-3"
                    style={{
                      height: schedulerHeight,
                      width: "100%",
                      overflowX: "auto",
                      overflowY: "hidden",
                      paddingLeft: leftPadding,
                    }}
                  >
                    <Times
                      timesHeight={timesHeight}
                      hourFormat={hourFormat}
                      size={size}
                      interval={interval}
                      cellWidth={cellWidth}
                      totalMinutes={totalMinutes}
                    ></Times>
                    <div className="position-relative">
                      <div
                        style={{
                          width: size,
                        }}
                      >
                        <div className="d-flex align-items-end position-relative">
                          {new Array(totalMinutes / (showLines ? step : interval))
                            .fill(0)
                            .map((x, i) => (
                              <TickContainer key={`step-${i}`} tickHeight={tickHeight}>
                                <Tick
                                  index={i}
                                  showLines={showLines}
                                  cellWidth={cellWidth}
                                  cellsNumberInInterval={interval / step}
                                ></Tick>
                              </TickContainer>
                            ))}
                          <div
                            style={{
                              position: "absolute",
                              right: "-2px",
                              top: 0,
                              height: "100%",
                              width: "2px",
                              background: "rgba(2, 26, 83, 0.2)",
                            }}
                          ></div>
                        </div>
                        {new Array(7).fill(0).map((x, i) => (
                          <CellsRow
                            className="d-flex"
                            key={`grid-row-${i}`}
                            cellHeight={cellHeight}
                            spaceBetweenTimelines={spaceBetweenTimelines}
                          >
                            {new Array(totalMinutes / (showLines ? step : interval))
                              .fill(0)
                              .map((_, j) => (
                                <Cell
                                  key={`row-${i}-cell-${j}`}
                                  showLines={showLines}
                                  index={j}
                                  cellsNumberInInterval={interval / step}
                                  cellWidth={cellWidth}
                                ></Cell>
                              ))}
                            <div
                              style={{
                                borderLeft: "2px solid #021A53",
                                borderRight: "0.5px solid rgba(0,25,74,0.2)",
                                position: "absolute",
                                borderRadius: "0 37px 37px 0",
                                width: "34px",
                                right: "-34px",
                                top: 0,
                                height: cellHeight,
                              }}
                            ></div>
                          </CellsRow>
                        ))}
                      </div>
                      <div
                        onClick={(e) => {
                          if (!e.shiftKey) {
                            setSelectedItems((prev) => prev.filter((_, i) => i < 0));
                          }
                        }}
                        onMouseDown={() => setDragging(true)}
                        ref={zoomableContainer}
                        style={{
                          position: "absolute",
                          width: size,
                          top: 0,
                          left: 0,
                          paddingTop: tickHeight,
                        }}
                      >
                        {currentSchedule.map((x, i) => (
                          <DayTimeline
                            joinAdjacent={joinAdjacent}
                            setJoinAdjacent={setJoinAdjacent}
                            rangeLabelHeight={rangeLabelHeight}
                            setMovingRange={setMovingRange}
                            movingRange={movingRange}
                            spaceBetweenTimelines={spaceBetweenTimelines}
                            activeButton={activeButton}
                            setActiveButton={setActiveButton}
                            hourFormat={hourFormat}
                            pageRef={pageRef}
                            showLines={showLines}
                            allRanges={currentSchedule}
                            ranges={x}
                            setRanges={(fn) => {
                              let newValue = fn(currentSchedule[i]);
                              setCurrentSchedule((prev) => {
                                let arr = [...prev];
                                arr[i] = newValue;
                                return arr;
                              });
                            }}
                            cellHeight={cellHeight}
                            cellWidth={cellWidth}
                            setSelectedItems={setSelectedItems}
                            selectedItems={selectedItems}
                            setDragging={setDragging}
                            dragging={dragging}
                            totalMinutes={totalMinutes}
                            interval={interval}
                            key={`weekday-${i + 1}-timeline`}
                            size={{ width: size }}
                            step={step}
                            day={i}
                            dayName={moment.weekdays(true)[i]}
                          ></DayTimeline>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setSelectedItems([])}
          style={{
            width: sidePanelWidth,
            borderLeft: "1px solid #021A53",
            transition: "margin-right 0.3s",
            marginRight:
              activeButton === "info" || activeButton === "settings" ? 0 : -sidePanelWidth,
          }}
          className="p-4 bg-white"
        >
          {activeButton === "info" ? (
            <InfoPanel
              schedulerHeight={schedulerHeight}
              currentSchedule={currentSchedule}
              onClose={() => setActiveButton("")}
            ></InfoPanel>
          ) : activeButton === "settings" ? (
            <SettingsPanel
              onClose={() => setActiveButton("")}
              hourFormat={hourFormat}
              setHourFormat={setHourFormat}
              weekStart={weekStart}
              setWeekStart={setWeekStart}
              timeInterval={interval}
              setTimeInterval={(int) =>
                setZoomOption(zoomOptions.findIndex((x) => x.interval === int))
              }
            ></SettingsPanel>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default withTheme(WeekScheduler);
