import React, { useState, useRef, useEffect } from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";
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

const DayTimeline = ({
  size,
  day,
  totalMinutes,
  step,
  dragging,
  setDragging,
  interval,
  selectedItems,
  setSelectedItems,
  ranges,
  setRanges,
  showLines,
  allRanges,
  animation,
  pageRef,
}) => {
  // const [ranges, setRanges] = useState([]);
  const [active, setActive] = useState(-2);
  const [newRange, setNewRange] = useState([]);
  const [rangeCandidate, setRangeCandidate] = useState([]);
  const [rangeFit, setRangeFit] = useState(false);
  const maxValue = totalMinutes / step;

  const styleOfInputHandler = (activeState, value) => {
    return {
      height: "30px",
      top: "-2px",
      width: "30px",
      borderRadius: "50%",
      backgroundPosition: "center",
      zIndex: 2,
      backgroundColor: "#FB4708",
      opacity: !dragging
        ? showLines
          ? activeState === -2
            ? 0
            : 1
          : activeState === -2 || (value.toFixed(0) * step) % interval !== 0
          ? 0
          : 1
        : 0,
      outline: 0,
      border: "none",
      boxShadow: "none",
    };
  };

  const parseMouseEvent = (e) => {
    var bounds = e.currentTarget.getBoundingClientRect();
    var x = Math.round(+(((e.clientX - bounds.left) / size.width) * maxValue));
    var mouseY = e.clientY - bounds.top;
    let rangeIndex = -1;
    let it = 0;
    while (rangeIndex === -1 && it < ranges.length) {
      if (isBetween(x, ranges[it].range[0], ranges[it].range[1])) {
        rangeIndex = it;
      }
      it = it + 1;
    }
    return { rangeIndex, x, mouseY };
  };

  const addNewRange = (values) => {
    if (values[0] !== values[1]) {
      let finalValue = values;
      let whereToInsert = 0;

      setRanges((prev) => {
        let arr = [...prev];
        if (arr.length) {
          let finished = false,
            i = arr.length - 1;
          while (!finished && i >= 0) {
            if (
              isBetween(arr[i].range[0], values[0], values[1]) ||
              isBetween(arr[i].range[1], values[0], values[1]) ||
              isBetween(values[0], arr[i].range[0], arr[i].range[1]) ||
              isBetween(values[1], arr[i].range[0], arr[i].range[1])
            ) {
              whereToInsert = i;
              finalValue[0] = Math.min(finalValue[0], arr[i].range[0]);
              finalValue[1] = Math.max(finalValue[1], arr[i].range[1]);
              arr.splice(i, 1);
            } else if (values[0] > arr[i].range[1]) {
              finished = true;
              whereToInsert = i + 1;
            }
            i--;
          }
          arr.splice(whereToInsert, 0, {
            range: finalValue,
            from: maxValue,
          });
        } else {
          arr = [
            {
              range: finalValue,
              from: maxValue,
            },
          ];
        }

        return arr;
      });
      setSelectedItems([]);
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{ height: "30px", marginBottom: "20px" }}
      className={`w-100 position-relative ${animation === "started" ? "opacity-0" : "appear"}`}
      onMouseUp={() => {
        addNewRange(rangeCandidate);
        setRangeCandidate([]);
      }}
      onMouseMove={(e) => {
        let { rangeIndex, x } = parseMouseEvent(e);
        setActive(rangeIndex);
        if (!dragging) {
          rangeIndex === -1 ? setNewRange([x, x]) : setNewRange([]);
        }
      }}
      onMouseEnter={() => {
        if (dragging && selectedItems.length === 1 && +selectedItems[0].split("-")[0] !== day) {
          let parts = selectedItems[0].split("-").map((x) => parseInt(x));
          let rc = JSON.parse(JSON.stringify(allRanges[parts[0]][parts[1]].range));
          setRangeCandidate(rc);
        }
      }}
      onMouseLeave={() => {
        setActive(-2);
        setRangeCandidate([]);
      }}
    >
      <div
        className="position-absolute w-100"
        style={{ top: 0, left: 0, zIndex: 0, paddingTop: "7px" }}
      >
        <Range
          value={rangeCandidate}
          step={1}
          max={maxValue}
          min={0}
          trackStyle={[
            {
              borderRadius: "30px",
              backgroundColor: "rgba(45,45,97,0.7)",
              height: "30px",
              top: "-7px",
              cursor: "grab",
            },
          ]}
          handleStyle={[{ opacity: 0 }, { opacity: 0 }]}
          railStyle={{ opacity: 0 }}
        ></Range>
      </div>
      {ranges.map((x, i) => {
        return (
          <div
            onMouseDown={(e) => {
              e.persist();
              e.stopPropagation();
              setDragging(true);
              let newSelected = day + "-" + i;
              let index = -1;
              let whereToInsert = -1;
              for (let it = 0; it < selectedItems.length; it++) {
                if (selectedItems[it] === newSelected) {
                  index = it;
                }
                let parts = selectedItems[it].split("-").map((x) => parseInt(x));
                if (whereToInsert === -1) {
                  if (parts[0] > day) {
                    whereToInsert = it;
                  } else if (parts[0] === day) {
                    if (parts[1] > i) {
                      whereToInsert = it;
                    }
                  }
                }
              }

              setSelectedItems((prev) => {
                let arr = [...prev];
                if (index !== -1) {
                  if (e.shiftKey) {
                    arr.splice(index, 1);
                  } else {
                    arr = [newSelected];
                  }
                } else {
                  if (e.shiftKey) {
                    if (whereToInsert !== -1) {
                      arr.splice(whereToInsert, 0, newSelected);
                    } else {
                      arr = arr.concat([newSelected]);
                    }
                  } else {
                    arr = [newSelected];
                  }
                }

                return arr;
              });
            }}
            key={`day-${day}-range-${i}`}
            className="position-absolute w-100"
            style={{ top: 0, left: 0, zIndex: active === i ? 15 : 0, paddingTop: "7px" }}
          >
            <Range
              value={x.range.map((b) => (b / x.from) * maxValue)}
              onChange={(val) => {
                setRanges((prev) => {
                  let arr = [...prev];
                  arr[i].range = val;
                  arr[i].from = maxValue;
                  return arr;
                });
              }}
              onAfterChange={(val) => {
                pageRef.current.focus({ preventScroll: true }); // this is necesary for zooming funcionality, page ref has keydown listener.
                if (val[0] === val[1]) {
                  setRanges((prev) => {
                    let arr = [...prev];
                    arr.splice(i, 1);
                    return arr;
                  });
                } else {
                  let finalValue = val;

                  setRanges((prev) => {
                    let arr = [...prev];
                    let whereToInsert = 0;
                    for (let ind = arr.length - 1; ind >= 0; ind--) {
                      if (
                        isBetween(arr[ind].range[0], val[0], val[1]) ||
                        isBetween(arr[ind].range[1], val[0], val[1]) ||
                        isBetween(val[0], arr[ind].range[0], arr[ind].range[1]) ||
                        isBetween(val[1], arr[ind].range[0], arr[ind].range[1])
                      ) {
                        whereToInsert = ind;
                        finalValue[0] = Math.min(finalValue[0], arr[ind].range[0]);
                        finalValue[1] = Math.max(finalValue[1], arr[ind].range[1]);
                        arr.splice(ind, 1);
                        if (ind !== i) {
                          setSelectedItems([]);
                        }
                      }
                    }
                    arr.splice(whereToInsert, 0, {
                      range: finalValue,
                      from: maxValue,
                    });
                    return arr;
                  });
                }
              }}
              step={1}
              max={maxValue}
              min={0}
              draggableTrack
              allowCross
              handleStyle={[
                { opacity: 0, outline: 0, width: "30px", height: "30px", cursor: "col-resize" },
                { opacity: 0, outline: 0, width: "30px", height: "30px", cursor: "col-resize" },
              ]}
              trackStyle={[
                {
                  borderRadius: "30px",
                  backgroundColor: selectedItems.includes(day + "-" + i) ? "#336fe8" : "#2d2d61",
                  height: "30px",
                  top: "-7px",
                  cursor: "grab",
                },
              ]}
              railStyle={{ backgroundColor: "rgba(233,233,233, 0)" }}
            />
          </div>
        );
      })}
      <div
        onMouseDown={(e) => {
          if (!e.shiftKey) {
            setSelectedItems([]);
          }
        }}
        className="position-absolute w-100"
        style={{
          top: 0,
          left: 0,
          zIndex: active === -1 ? 15 : 0,
          paddingTop: "7px",
          paddingBottom: "9px",
        }}
      >
        <Range
          value={newRange}
          onChange={(val) => {
            let finalValue = val;
            if (val[1] !== undefined) {
              setNewRange(newRange.length ? finalValue : [val[1], val[1]]);
            }
          }}
          onAfterChange={() => {
            pageRef.current.focus({ preventScroll: true }); // this is necesary for zooming funcionality, page ref has keydown listener.
            addNewRange(newRange);
            setNewRange([]);
          }}
          step={1}
          max={maxValue}
          draggableTrack
          allowCross
          handleStyle={newRange.map((x) => styleOfInputHandler(active, x))}
          trackStyle={[
            {
              borderRadius: "30px",
              backgroundColor: "#2d2d61",
              height: "30px",
              top: "-7px",
            },
          ]}
          railStyle={{ backgroundColor: "rgba(233,233,233 ,0)" }}
        />
      </div>
    </div>
  );
};

const Times = ({ size, cellWidth, interval, totalMinutes }) => {
  return (
    <div className="pb-1" style={{ width: `${size}px`, color: "#2d2d61", fontWeight: "700" }}>
      <div className="d-flex w-100 position-relative" style={{ transform: "translateX(-17px)" }}>
        {new Array(totalMinutes / interval).fill(0).map((_, i) => (
          <div key={`time-${i}`} style={{ width: cellWidth }}>
            {convertMinsToHrsMins(i * interval)}
          </div>
        ))}
        <div className="position-absolute" style={{ top: 0, right: "-33px" }}>
          {convertMinsToHrsMins(totalMinutes)}
        </div>
      </div>
    </div>
  );
};

const WeekScheduler = ({ currentSchedule, setCurrentSchedule }) => {
  const leftPadding = 17;
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
        e.preventDefault();
        let direction = e.deltaY < 0 ? "in" : e.deltaY > 0 ? "out" : "none";
        onZoom(e.clientX, direction);
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
      <div className="p-4 w-100" style={{ background: "rgb(255, 249, 241)", overflowX: "auto" }}>
        <div
          className="d-flex justify-content-end mb-3"
          style={{ opacity: !selectedItems.length ? 0 : 1 }}
        >
          <FormButton style={{ fontSize: "14px", padding: "4px 40px" }} onClick={onDelete}>
            Delete
          </FormButton>
        </div>
        <div className="d-flex">
          <div className="pr-3">
            <div
              style={{ height: "69px", textAlign: "center", fontWeight: "700", color: "#2d2d61" }}
            >
              <div>TIME</div>
              <div style={{ fontSize: "12px" }}>{zoomOptions[zoomOption].name} interval</div>
            </div>
            {moment.weekdays().map((x, i) => (
              <div key={`day-name-${i}`} style={{ height: cellHeight }}>
                <div
                  style={{
                    padding: "5px 8px",
                    width: "100%",
                    textAlign: "center",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    borderRadius: "5px",
                    color: "white",
                    background: "#2d2d61",
                  }}
                >
                  {x}
                </div>
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
                var bounds = e.currentTarget.getBoundingClientRect();
                var x = e.clientX - bounds.left;

                if (e.currentTarget.offsetWidth - x < 120) {
                  if (e.currentTarget.offsetWidth - x < 50) {
                    setScrollRightSpeed(2);
                  } else {
                    setScrollRightSpeed(1.5);
                  }
                } else {
                  setScrollRightSpeed(0);
                }

                if (x < 120) {
                  if (x < 50) {
                    setScrollLeftSpeed(1.8);
                  } else {
                    setScrollLeftSpeed(1.3);
                  }
                } else {
                  setScrollLeftSpeed(0);
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
                height: 9 * 50 + 10,
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                paddingLeft: leftPadding,
                background: "rgb(255, 249, 241)",
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
                    className="d-flex align-items-end"
                    style={{
                      height: "11px",
                      borderBottom: "1px solid #f9dea5",
                      borderRight: "1.5px solid #f9dea5",
                    }}
                  >
                    {new Array(totalMinutes / (showLines ? step : interval)).fill(0).map((x, i) => (
                      <div
                        key={`step-${i}`}
                        style={{
                          height: (i * step) % interval === 0 ? "10px" : "5px",
                          borderLeft: `${i % (interval / step) === 0 ? 1.5 : 1}px solid #f9dea5`,
                          width: showLines ? cellWidth / (interval / step) : cellWidth,
                        }}
                      ></div>
                    ))}
                  </div>
                  {new Array(8).fill(0).map((x, i) => (
                    <div
                      className="d-flex"
                      key={`grid-row-${i}`}
                      style={{ height: cellHeight, borderRight: "1.5px solid #f9dea5" }}
                    >
                      {new Array(totalMinutes / (showLines ? step : interval))
                        .fill(0)
                        .map((_, j) => (
                          <div
                            key={`row-${i}-cell-${j}`}
                            style={{
                              borderLeft: `${
                                j % (interval / step) === 0 ? 1.5 : 1
                              }px solid #f9dea5`,
                              borderBottom: "1px solid #f9dea5",
                              width: showLines ? cellWidth / (interval / step) : cellWidth,
                            }}
                          ></div>
                        ))}
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
                    paddingTop: "45px",
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
