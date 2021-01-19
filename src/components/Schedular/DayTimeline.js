import React, { useState, useRef, useEffect } from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "./styles/style.css";

function isBetween(x, min, max, strict = false) {
  return !strict ? x >= min && x <= max : x > min && x < max;
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
  cellHeight,
  ranges,
  setRanges,
  showLines,
  allRanges,
  animation,
  pageRef,
}) => {
  const [active, setActive] = useState(-2);
  const [newRange, setNewRange] = useState([]);
  const [rangeCandidate, setRangeCandidate] = useState([]);
  const maxValue = totalMinutes / step;

  const styleOfInputHandler = (activeState, value) => {
    return {
      height: cellHeight,
      borderRadius: 0,
      width: step,
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

  const baseTrackStyle = {
    backgroundColor: "rgba(45,45,97,0.7)",
    borderRadius: 0,
    height: "72px",
    cursor: "grab",
    top: 0,
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{ height: cellHeight, marginBottom: "30px" }}
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
      <div className="position-absolute w-100" style={{ top: 0, left: 0, zIndex: 0 }}>
        <Range
          value={rangeCandidate}
          step={1}
          max={maxValue}
          min={0}
          trackStyle={[baseTrackStyle]}
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
            style={{ top: 0, left: 0, zIndex: active === i ? 15 : 0 }}
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
                { opacity: 0, outline: 0, width: "30px", height: cellHeight, cursor: "col-resize" },
                { opacity: 0, outline: 0, width: "30px", height: cellHeight, cursor: "col-resize" },
              ]}
              trackStyle={[
                Object.assign({}, baseTrackStyle, {
                  backgroundColor: selectedItems.includes(day + "-" + i) ? "#336fe8" : "#2d2d61",
                }),
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
          trackStyle={[baseTrackStyle]}
          railStyle={{ backgroundColor: "rgba(233,233,233 ,0)" }}
        />
      </div>
    </div>
  );
};

export default DayTimeline;
