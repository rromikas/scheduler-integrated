import React, { useState, useRef, useEffect } from "react";
import DayTimeline from "./DayTimeline";
import "bootstrap/dist/css/bootstrap.css";
import "./styles/style.css";
import moment from "moment";
import settings from "./settings";
import FormButton from "components/FormButton";
import GetMouseUser from "./scripts/getMouseUserOnWheel";
import { onTouchStart, onTouchEnd, onTouchMove } from "./scripts/touchEventsHandlers";

function isBetween(x, min, max, strict = false) {
  return !strict ? x >= min && x <= max : x > min && x < max;
}
function convertMinsToHrsMins(minutes) {
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  return h + ":" + m;
}

const Times = ({ size, cellWidth, interval, totalMinutes }) => {
  return (
    <div
      className="pb-1"
      style={{ width: `${size}px`, color: "#2d2d61", fontWeight: "500", fontSize: "20px" }}
    >
      <div className="d-flex w-100 position-relative" style={{ transform: "translateX(-51px)" }}>
        {new Array(totalMinutes / interval).fill(0).map((_, i) => (
          <div
            key={`time-${i}`}
            style={{ width: cellWidth, display: "flex", justifyContent: "center" }}
          >
            {convertMinsToHrsMins(i * interval)}
          </div>
        ))}
        <div className="position-absolute" style={{ top: 0, right: "-79px" }}>
          {convertMinsToHrsMins(totalMinutes)}
        </div>
      </div>
    </div>
  );
};

const WeekScheduler = ({ currentSchedule, setCurrentSchedule }) => {
  const leftPadding = 30;
  const {
    totalMinutes,
    zoomOptions,
    cellHeight,
    showLines,
    timeGapBetweenZooms,
    zoomOnWheel,
  } = settings;

  const scrollableContainer = useRef(null);
  const zoomableContainer = useRef(null);

  const zooming = useRef(false);
  const [zoomOption, setZoomOption] = useState(1);
  const [dragging, setDragging] = useState(false);
  const scrollInterval = useRef(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const { cellWidth, interval, step } = zoomOptions[zoomOption];
  const size = (totalMinutes / interval) * cellWidth;

  const [scrollRightSpeed, setScrollRightSpeed] = useState(0);
  const [scrollLeftSpeed, setScrollLeftSpeed] = useState(0);

  const [allowZoom, setAllowZoom] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    let interval;
    if (scrollRightSpeed) {
      interval = setInterval(() => {
        scrollableContainer.current.scrollLeft += scrollRightSpeed;
      }, 2);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [scrollRightSpeed]);

  useEffect(() => {
    let interval;
    if (scrollLeftSpeed) {
      interval = setInterval(() => {
        scrollableContainer.current.scrollLeft -= scrollLeftSpeed;
      }, 2);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [scrollLeftSpeed]);

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

  useEffect(() => {
    const mouseup = () => setDragging(false);
    window.addEventListener("mouseup", mouseup);
    return () => {
      window.removeEventListener("mouseup", mouseup);
    };
  }, []);

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
      pageRef.current.focus({ preventScroll: true });
    };
    const mouseleave = () => {
      pageRef.current.blur();
    };
    if (pageRef.current) {
      pageRef.current.addEventListener("mouseenter", mouseenter);
      pageRef.current.addEventListener("mouseleave", mouseleave);
      pageRef.current.addEventListener("keydown", keydown);
      pageRef.current.addEventListener("keyup", keyup);
    }
    return () => {
      pageRef.current.removeEventListener("mouseenter", mouseenter);
      pageRef.current.removeEventListener("mouseleave", mouseleave);
      pageRef.current.removeEventListener("keydown", keydown);
      pageRef.current.removeEventListener("keyup", keyup);
    };
  }, []);

  useEffect(() => {
    const zoomOnWheel = (e) => {
      let mouseUser = GetMouseUser(e);
      if ((mouseUser === "mouse" && allowZoom) || mouseUser === "trackpad") {
        if (e.deltaY !== 0) {
          e.preventDefault();
          let direction = e.deltaY < 0 ? "in" : "out";
          onZoom(e.clientX, direction);
        }
      }
    };
    zoomableContainer.current.addEventListener("wheel", zoomOnWheel, {
      passive: false,
    });

    return () => {
      zoomableContainer.current.removeEventListener("wheel", zoomOnWheel);
    };
  }, [allowZoom, size]);

  useEffect(() => {
    const onTouchEndModified = (e) => {
      onTouchEnd(e, onZoom);
    };
    zoomableContainer.current.addEventListener("touchstart", onTouchStart);
    zoomableContainer.current.addEventListener("touchmove", onTouchMove);
    zoomableContainer.current.addEventListener("touchend", onTouchEndModified);
    return () => {
      zoomableContainer.current.removeEventListener("touchstart", onTouchStart);
      zoomableContainer.current.removeEventListener("touchmove", onTouchMove);
      zoomableContainer.current.removeEventListener("touchend", onTouchEndModified);
    };
  }, [size]); // We need to have real value of size in onZoom method

  return (
    <div
      tabIndex={1}
      className="w-100 d-flex flex-center user-select-none focus-outline-0"
      style={{ fontSize: "14px" }}
      ref={pageRef}
    >
      <div className="p-4 w-100" style={{ overflowX: "auto" }}>
        <div
          className="d-flex justify-content-end mb-3"
          style={{ opacity: !selectedItems.length ? 0 : 1 }}
        >
          <FormButton style={{ fontSize: "14px", padding: "4px 40px" }} onClick={onDelete}>
            Delete
          </FormButton>
        </div>
        <div className="d-flex">
          <div style={{ marginRight: `-${leftPadding}px` }}>
            <div
              style={{ height: "75px", textAlign: "center", fontWeight: "700", color: "#2d2d61" }}
            >
              {/* <div>TIME</div>
              <div style={{ fontSize: "12px" }}>{zoomOptions[zoomOption].name} interval</div> */}
            </div>
            {moment.weekdays().map((x, i) => (
              <div
                key={`day-name-${i}`}
                className="d-flex"
                style={{ marginBottom: "30px", height: cellHeight }}
              >
                <div
                  style={{
                    width: "150px",
                    borderRadius: "37px 0 0 37px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    fontWeight: "800",
                    fontSize: "20px",
                    textTransform: "uppercase",
                    color: "white",
                    background: "#2d2d61",
                  }}
                >
                  {x}
                </div>
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
            onMouseLeave={() => {
              setScrollLeftSpeed(0);
              setScrollRightSpeed(0);
            }}
            onMouseMove={(e) => {
              if (dragging) {
                const bounds = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - bounds.left;
                const maxScroll =
                  scrollableContainer.current.scrollWidth - scrollableContainer.current.clientWidth;
                const currentScrollLeft = scrollableContainer.current.scrollLeft;
                //prevent scrolling when user draw timeslot starting from schedular edge
                if (maxScroll !== currentScrollLeft) {
                  if (e.currentTarget.offsetWidth - x < 120) {
                    if (e.currentTarget.offsetWidth - x < 50) {
                      setScrollRightSpeed(2);
                    } else {
                      setScrollRightSpeed(1.5);
                    }
                  } else {
                    setScrollRightSpeed(0);
                  }
                }

                if (currentScrollLeft !== 0) {
                  if (x < 120) {
                    if (x < 50) {
                      setScrollLeftSpeed(1.8);
                    } else {
                      setScrollLeftSpeed(1.3);
                    }
                  } else {
                    setScrollLeftSpeed(0);
                  }
                }
              } else {
                setScrollRightSpeed(0);
                setScrollLeftSpeed(0);
              }
            }}
          >
            <div
              ref={scrollableContainer}
              className="pb-3"
              style={{
                height: 8 * cellHeight + 7 * 30 + 10,
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                paddingLeft: leftPadding,
              }}
            >
              <Times
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
                  <div
                    className="d-flex align-items-end position-relative"
                    style={{
                      marginBottom: "5px",
                    }}
                  >
                    {new Array(totalMinutes / (showLines ? step : interval)).fill(0).map((x, i) => (
                      <div
                        key={`step-${i}`}
                        style={{
                          height: "36px",
                          borderLeft: `${
                            i % (interval / step) === 0 ? "2px solid rgba(2,26,83, 0.2)" : "none"
                          }`,
                          width: showLines ? cellWidth / (interval / step) : cellWidth,
                        }}
                      ></div>
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
                    <div
                      className="d-flex"
                      key={`grid-row-${i}`}
                      style={{
                        height: cellHeight,
                        marginBottom: "30px",
                        position: "relative",
                      }}
                    >
                      {new Array(totalMinutes / (showLines ? step : interval))
                        .fill(0)
                        .map((_, j) => (
                          <div
                            key={`row-${i}-cell-${j}`}
                            style={{
                              borderLeft: `${
                                j % (interval / step) === 0 ? 2 : 0.5
                              }px solid #021A53`,
                              borderBottom: "0.5px solid rgba(0,25,74,0.2)",
                              borderTop: "0.5px solid rgba(0,25,74,0.2)",
                              width: showLines ? cellWidth / (interval / step) : cellWidth,
                            }}
                          ></div>
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
                    </div>
                  ))}
                </div>
                <div
                  onClick={(e) => {
                    if (!e.shiftKey) {
                      setSelectedItems((prev) => prev.filter((_, i) => i < 0));
                    }
                  }}
                  onMouseUp={() => setDragging(false)}
                  onMouseDown={() => setDragging(true)}
                  ref={zoomableContainer}
                  style={{
                    position: "absolute",
                    width: size,
                    top: 0,
                    left: 0,
                    paddingTop: "41px",
                  }}
                >
                  {currentSchedule.map((x, i) => (
                    <DayTimeline
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
                      dayName={moment.weekdays()[i]}
                    ></DayTimeline>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekScheduler;
