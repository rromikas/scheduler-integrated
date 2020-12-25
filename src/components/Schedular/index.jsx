import React, { useState, useRef, useEffect } from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";

function isBetween(x, min, max) {
  return x >= min && x <= max;
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
  selectedItem,
  setSelectedItem,
  ranges,
  setRanges,
}) => {
  // const [ranges, setRanges] = useState([]);
  const [active, setActive] = useState(-2);
  const [newRange, setNewRange] = useState([]);
  const maxValue = totalMinutes / step;

  const styleOfInputHandler = (activeState, value) => {
    return {
      height: "30px",
      top: "-3px",
      width: "30px",
      borderRadius: "50%",
      backgroundColor:
        activeState === -2 || (value.toFixed(0) * step) % interval !== 0
          ? "transparent"
          : "#fb4708",
      border: "none",
      outline: 0,
      boxShadow: "none",
    };
  };

  const parseMouseEvent = (e) => {
    var bounds = e.currentTarget.getBoundingClientRect();
    var x = +(((e.clientX - bounds.left) / size.width) * maxValue);
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

  return (
    <div
      style={{ height: "50px" }}
      className="w-100 position-relative"
      onMouseDown={(e) => {
        let { rangeIndex, mouseY } = parseMouseEvent(e);
        if (rangeIndex === -1 || mouseY > 23 || mouseY < -7) {
          setSelectedItem((prev) => Object.assign({}, prev, { day: -1, rangeIndex: -1 }));
        }
      }}
      onMouseMove={(e) => {
        let { rangeIndex, x } = parseMouseEvent(e);
        setActive(rangeIndex);
        if (!dragging && !isBetween(x, newRange[0], newRange[1])) {
          setNewRange([x, x]);
        }
      }}
      onMouseLeave={() => {
        setActive(-2);
      }}
    >
      {ranges.map((x, i) => {
        return (
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging(true);
              var bounds = e.currentTarget.getBoundingClientRect();
              var x = e.clientX - bounds.left;
              setSelectedItem((prev) =>
                Object.assign({}, prev, {
                  day: day,
                  rangeIndex: i,
                  mouseX: x,
                })
              );
            }}
            onMouseUp={() => setDragging(false)}
            key={`day-${day}-range-${i}`}
            className="position-absolute w-100"
            style={{ top: 0, left: 0, zIndex: active === i ? 15 : 0 }}
          >
            <Range
              value={x.range.map((b) => (b / x.from) * maxValue)}
              onChange={(val) => {
                let finalValue = val;
                //forcing input not to have value within neighbours ranges
                if (i > 0) {
                  let leftNeighbour = (ranges[i - 1].range[1] / ranges[i - 1].from) * maxValue;
                  if (val[0] < leftNeighbour) {
                    //if new range is equal to old range - track dragging,
                    if (x.range[1] - x.range[0] === val[1] - val[0]) {
                      finalValue[1] = finalValue[1] + (leftNeighbour - finalValue[0]);
                    }
                    finalValue[0] = leftNeighbour;
                  }
                }

                if (i < ranges.length - 1) {
                  let rightNeighbour = (ranges[i + 1].range[0] / ranges[i + 1].from) * maxValue;
                  if (val[1] > rightNeighbour) {
                    if (x.range[1] - x.range[0] === val[1] - val[0]) {
                      finalValue[0] = finalValue[0] - (finalValue[1] - rightNeighbour);
                    }
                    finalValue[1] = rightNeighbour;
                  }
                }
                setRanges((prev) => {
                  let arr = [...prev];
                  arr[i].range = finalValue;
                  arr[i].from = maxValue;
                  return arr;
                });
              }}
              onAfterChange={(val) => {
                if (val[0] === val[1]) {
                  setRanges((prev) => {
                    let arr = [...prev];
                    arr.splice(i, 1);
                    return arr;
                  });
                  if (selectedItem.day === day && selectedItem.rangeIndex === i) {
                    setSelectedItem((prev) => Object.assign({}, prev, { day: -1, rangeIndex: -1 }));
                  }
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
                  backgroundColor:
                    selectedItem.day === day && selectedItem.rangeIndex === i
                      ? "#336fe8"
                      : "#2d2d61",
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
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => {
          setDragging(false);
        }}
        className="position-absolute w-100"
        style={{ top: 0, left: 0, zIndex: active === -1 ? 15 : 0 }}
      >
        <Range
          value={newRange}
          onChange={(val) => {
            let found = false,
              it = 0,
              finalValue = val;
            //forcing input not to have value within neighbours ranges
            while (!found && it < ranges.length) {
              if (isBetween((ranges[it].range[0] / ranges[it].from) * maxValue, val[0], val[1])) {
                finalValue[1] = ranges[it].range[0];
                found = true;
              } else if (
                isBetween((ranges[it].range[1] / ranges[it].from) * maxValue, val[0], val[1])
              ) {
                finalValue[0] = ranges[it].range[1];
                found = true;
              }
              it++;
            }
            if (val[1] !== undefined) {
              setNewRange(newRange.length ? finalValue : [val[1], val[1]]);
            }
          }}
          onAfterChange={() => {
            setDragging(false);
            let rangeIndex = -1;
            if (newRange[0] !== newRange[1]) {
              //inserting range at correct position. Ranges are ordered in ascending order.
              setRanges((prev) => {
                let arr = [...prev];
                let it = 0;
                while (rangeIndex === -1 && it < arr.length) {
                  if (arr[it].range[0] >= newRange[1]) {
                    rangeIndex = it;
                    arr.splice(it, 0, { range: newRange, from: maxValue });
                  }
                  it++;
                }

                if (rangeIndex === -1) {
                  rangeIndex = it;
                  arr = arr.concat([{ range: newRange, from: maxValue }]);
                }
                return arr;
              });
              setSelectedItem((prev) =>
                Object.assign({}, prev, { day: day, rangeIndex: rangeIndex })
              );
            }

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

const useStyles = makeStyles({
  steps: {
    // borderBottom: "1px solid #f9dea5",
    position: "relative",
    "&::after": {
      height: "10px",
      position: "absolute",
      top: 0,
      right: 0,
      content: '""',
      borderRight: "1px solid #f9dea5",
    },
  },

  bigStep: {
    height: "10px",
  },

  smallStep: {
    height: "5px",
  },

  step: {
    borderLeft: "1px solid #f9dea5",
  },
});

const Steps = ({ totalMinutes, step, interval, cellWidth }) => {
  const stepWidth = cellWidth / (interval / step);
  const stepsAmount = totalMinutes / step;

  const classes = useStyles();
  return (
    <div
      className={`d-flex align-items-end ${classes.steps}`}
      style={{
        width: cellWidth * (totalMinutes / interval),
      }}
    >
      {new Array(stepsAmount).fill(0).map((x, i) => (
        <div
          key={`step-${i}`}
          className={
            classes.step + " " + ((i * step) % interval === 0 ? classes.bigStep : classes.smallStep)
          }
          style={{
            width: stepWidth,
          }}
        ></div>
      ))}
    </div>
  );
};

const WeekScheduler = ({ currentSchedule, setCurrentSchedule }) => {
  const totalMinutes = 24 * 60;
  const leftPadding = 17;
  const cellHeight = 50;

  const zoomOptions = [
    { interval: 120, name: "2h", cellWidth: 70, step: 15 },
    { interval: 60, name: "1h", cellWidth: 72, step: 15 },
    { interval: 30, name: "30m", cellWidth: 74, step: 15 },
    { interval: 15, name: "15m", cellWidth: 76, step: 15 },
  ];

  const scrollableContainer = useRef(null);
  const zoomableContainer = useRef(null);
  const [zoomableContainerReady, setZoomableContainerReady] = useState(false);

  const zooming = useRef(false);
  const [zoomOption, setZoomOption] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [draggingPaused, setDraggingPaused] = useState(false);
  const scrollInterval = useRef(null);
  const [selectedItem, setSelectedItem] = useState({ day: -1, rangeIndex: -1, mouseX: -1 });

  const cellWidth = zoomOptions[zoomOption].cellWidth;
  const interval = zoomOptions[zoomOption].interval;
  const step = zoomOptions[zoomOption].step;
  const size = (totalMinutes / interval) * cellWidth;

  const [scrollRightSpeed, setScrollRightSpeed] = useState(0);
  const [scrollLeftSpeed, setScrollLeftSpeed] = useState(0);

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

  const onZoom = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (!zooming.current) {
        zooming.current = true;
        var bounds = scrollableContainer.current.getBoundingClientRect();
        var x = e.clientX - bounds.left;
        const oldSize = size;
        const oldScrollLeft = scrollableContainer.current.scrollLeft;

        const focusOnPoint = (newTimelineSize) => {
          let percentsOfTimeline = (x + oldScrollLeft - leftPadding) / oldSize;
          let a = newTimelineSize * percentsOfTimeline;
          let target = a + leftPadding - x;
          target = target >= 0 ? target : 0;
          if (scrollInterval.current) {
            clearInterval(scrollInterval.current);
          }

          scrollInterval.current = setInterval(() => {
            let diff = target - scrollableContainer.current.scrollLeft;
            if (isBetween(scrollableContainer.current.scrollLeft, target - 1, target + 1)) {
              clearInterval(scrollInterval.current);
            } else {
              scrollableContainer.current.scrollLeft += diff;
            }
          }, 1);
        };

        if (e.deltaY < 0) {
          let zoomOpt = zoomOption < zoomOptions.length - 1 ? zoomOption + 1 : zoomOption;
          focusOnPoint(
            (totalMinutes / zoomOptions[zoomOpt].interval) * zoomOptions[zoomOpt].cellWidth
          );
          setZoomOption(zoomOpt);
        } else if (e.deltaY > 0) {
          let zoomOpt = zoomOption > 0 ? zoomOption - 1 : zoomOption;
          focusOnPoint(
            (totalMinutes / zoomOptions[zoomOpt].interval) * zoomOptions[zoomOpt].cellWidth
          );
          setZoomOption(zoomOpt);
        }
        setTimeout(() => {
          zooming.current = false;
        }, 20);
      }
    }
  };

  useEffect(() => {
    if (zoomableContainer) {
      zoomableContainer.current.addEventListener("wheel", onZoom, {
        passive: false,
      });
    }
    return () => {
      zoomableContainer.current.removeEventListener("wheel", onZoom);
    };
  }, [zoomableContainerReady, onZoom, size]);

  return (
    <div className="w-100 d-flex flex-center" style={{ fontSize: "14px" }}>
      <div className="p-4 w-100" style={{ background: "rgb(255, 249, 241)", overflowX: "auto" }}>
        <div
          className="d-flex justify-content-end mb-3"
          style={{ opacity: selectedItem.day === -1 ? 0 : 1 }}
        >
          <div
            className="px-4"
            style={{
              height: "30px",
              borderRadius: "30px",
              background: "#2d2d61",
              color: "white",
              lineHeight: "30px",
              cursor: "pointer",
            }}
            onClick={() => {
              if (selectedItem.day !== -1) {
                setCurrentSchedule((prev) => {
                  let arr = [...prev];
                  arr[selectedItem.day].splice(selectedItem.rangeIndex, 1);
                  return arr;
                });
                setSelectedItem((prev) => Object.assign({}, prev, { day: -1, rangeIndex: -1 }));
              }
            }}
            variant="contained"
            color="secondary"
          >
            Delete
          </div>
        </div>
        <div className="d-flex" style={{ maxWidth: "1000px" }}>
          <div className="pr-3">
            <div
              style={{ height: "60px", textAlign: "center", fontWeight: "700", color: "#2d2d61" }}
            >
              TIME
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
              if (dragging && !draggingPaused) {
                var bounds = e.currentTarget.getBoundingClientRect();
                var x = e.clientX - bounds.left;

                if (e.currentTarget.offsetWidth - x < 120) {
                  setScrollRightSpeed(1.5);
                } else {
                  setScrollRightSpeed(0);
                }

                if (x < 120) {
                  setScrollLeftSpeed(1.3);
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
              <Steps
                interval={interval}
                step={step}
                cellWidth={cellWidth}
                totalMinutes={totalMinutes}
              ></Steps>
              <div className="position-relative">
                <div>
                  <table
                    style={{ width: `${size}px` }}
                    onClick={() =>
                      setSelectedItem((prev) =>
                        Object.assign({}, prev, { day: -1, rangeIndex: -1 })
                      )
                    }
                  >
                    <tbody>
                      {new Array(8).fill(0).map((x, i) => (
                        <tr key={`grid-row-${i}`}>
                          {new Array(totalMinutes / interval).fill(0).map((_, j) => (
                            <td
                              key={`row-${i}-cell-${j}`}
                              style={{
                                height: cellHeight,
                                width: cellWidth,
                              }}
                            ></td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div
                  onMouseEnter={() => setDraggingPaused(false)}
                  onMouseLeave={() => setDraggingPaused(true)}
                  ref={(el) => {
                    if (el) {
                      zoomableContainer.current = el;
                      setZoomableContainerReady(true);
                    }
                  }}
                  style={{
                    position: "absolute",
                    width: `${size}px`,
                    top: "43px",
                  }}
                >
                  {currentSchedule.map((x, i) => (
                    <DayTimeline
                      draggingPaused={draggingPaused}
                      ranges={x}
                      setRanges={(fn) => {
                        let newValue = fn(currentSchedule[i]);
                        setCurrentSchedule((prev) => {
                          let arr = [...prev];
                          arr[i] = newValue;
                          return arr;
                        });
                      }}
                      setSelectedItem={setSelectedItem}
                      selectedItem={selectedItem}
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
