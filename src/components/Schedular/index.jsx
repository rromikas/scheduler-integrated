import React, { useState, useRef, useEffect } from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import moment from "moment";
import settings from "./settings";
import FormButton from "components/FormButton";

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

  const doesRangeCandidateFit = (values) => {
    let fits = true,
      it = 0;
    while (fits && it < ranges.length) {
      if (
        isBetween(values[0], ranges[it].range[0], ranges[it].range[1], true) ||
        isBetween(values[1], ranges[it].range[0], ranges[it].range[1], true)
      ) {
        fits = false;
      }
      it++;
    }
    return fits;
  };

  const addNewRange = (values) => {
    let rangeIndex = -1;
    if (values[0] !== values[1]) {
      //inserting range at correct position. Ranges are ordered in ascending order.
      setRanges((prev) => {
        let arr = [...prev];
        let it = 0;
        while (rangeIndex === -1 && it < arr.length) {
          if (arr[it].range[0] >= values[1]) {
            rangeIndex = it;
            arr.splice(it, 0, { range: values, from: maxValue });
          }
          it++;
        }

        if (rangeIndex === -1) {
          rangeIndex = it;
          arr = arr.concat([{ range: values, from: maxValue }]);
        }
        return arr;
      });
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{ height: "30px", marginBottom: "20px" }}
      className="w-100 position-relative"
      onMouseUp={() => {
        if (doesRangeCandidateFit(rangeCandidate)) {
          addNewRange(rangeCandidate);
          setRangeCandidate([]);
          setRangeFit(true);
        }
      }}
      onMouseMove={(e) => {
        let { rangeIndex, x } = parseMouseEvent(e);
        setActive(rangeIndex);
        if (!dragging && !isBetween(x, newRange[0], newRange[1])) {
          setNewRange([x, x]);
        }
      }}
      onMouseEnter={() => {
        if (dragging && selectedItems.length === 1 && +selectedItems[0].split("-")[0] !== day) {
          let parts = selectedItems[0].split("-").map((x) => parseInt(x));
          setRangeCandidate(allRanges[parts[0]][parts[1]].range);
          if (doesRangeCandidateFit(allRanges[parts[0]][parts[1]].range)) {
            setRangeFit(true);
          }
        }
      }}
      onMouseLeave={() => {
        setActive(-2);
        setRangeCandidate([]);
        setRangeFit(false);
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
              backgroundColor: rangeFit ? "rgba(45,45,97,0.7)" : "rgba(255,0,0,0.49)",
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
                  if (e.ctrlKey) {
                    arr.splice(index, 1);
                  } else {
                    arr = [newSelected];
                  }
                } else {
                  if (e.ctrlKey) {
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
        className="position-absolute w-100"
        style={{ top: 0, left: 0, zIndex: active === -1 ? 15 : 0, paddingTop: "7px" }}
      >
        <Range
          value={newRange}
          onChange={(val) => {
            let found = false,
              it = 0,
              finalValue = val;
            //forcing input not to have value within neighbours ranges
            while (!found && it < ranges.length) {
              let left = (ranges[it].range[0] / ranges[it].from) * maxValue;
              let right = (ranges[it].range[1] / ranges[it].from) * maxValue;
              if (val[0] <= left && left < val[1]) {
                finalValue[1] = ranges[it].range[0];
                found = true;
              } else if (val[0] < right && right <= val[1]) {
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
  const { totalMinutes, zoomOptions, cellHeight, showLines } = settings;

  const scrollableContainer = useRef(null);
  const zoomableContainer = useRef(null);
  const [zoomableContainerReady, setZoomableContainerReady] = useState(false);

  const zooming = useRef(false);
  const [zoomOption, setZoomOption] = useState(1);
  const [dragging, setDragging] = useState(false);
  const scrollInterval = useRef(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const cellWidth = zoomOptions[zoomOption].cellWidth;
  const interval = zoomOptions[zoomOption].interval;
  const step = zoomOptions[zoomOption].step;
  const size = (totalMinutes / interval) * cellWidth;

  const [scrollRightSpeed, setScrollRightSpeed] = useState(0);
  const [scrollLeftSpeed, setScrollLeftSpeed] = useState(0);

  useEffect(() => {
    window.addEventListener("mouseup", () => {
      setDragging(false);
    });
  });

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

  const onGroup = () => {
    let si = [...selectedItems];
    let begin = si[0].split("-").map((x) => parseInt(x));
    let end = si[1].split("-").map((x) => parseInt(x));
    if (begin[0] !== end[0]) {
      //days differs
    }
    for (let i = +si[0].split("-")[0]; i < +si[si.length - 1].split("-")[0]; i++) {}
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
          style={{ opacity: !selectedItems.length ? 0 : 1 }}
        >
          {/* {selectedItems.length >= 2 && (
            <FormButton
              onClick={onGroup}
              style={{ marginRight: "20px", fontSize: "14px", padding: "4px 40px" }}
            >
              Group
            </FormButton>
          )} */}

          <FormButton style={{ fontSize: "14px", padding: "4px 40px" }} onClick={onDelete}>
            Delete
          </FormButton>
        </div>
        <div className="d-flex" style={{ maxWidth: "1000px" }}>
          <div className="pr-3">
            <div
              style={{ height: "68px", textAlign: "center", fontWeight: "700", color: "#2d2d61" }}
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
                  onClick={() => setSelectedItems((prev) => prev.filter((_, i) => i < 0))}
                  onMouseUp={() => setDragging(false)}
                  onMouseDown={() => setDragging(true)}
                  ref={(el) => {
                    if (el) {
                      zoomableContainer.current = el;
                      setZoomableContainerReady(true);
                    }
                  }}
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
