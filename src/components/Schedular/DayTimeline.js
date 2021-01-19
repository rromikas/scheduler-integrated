import React, { useState, useRef, useEffect } from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "./styles/style.css";

/* Range inputs structure:
<Relative container>
  <Candidate range input>
  <Already set timeslots>
    <Many divs that respresent aleready set values>
    <Many transparent input ranges that are above divs and can change timeslots value>
  <Already set timeslots>
  <New Range Zone>
    <Range input for new timeslots>
    <Outer tooltip zone>
    <Div that represents new range input value with text inside>
  <New Range Zone>
<Relative container>
*/

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
  dayName,
  totalMinutes,
  step,
  dragging,
  setDragging,
  interval,
  selectedItems,
  setSelectedItems,
  cellHeight,
  cellWidth,
  ranges,
  setRanges,
  showLines,
  allRanges,
  animation,
  pageRef,
}) => {
  const [active, setActive] = useState(-2); // which range of the day mouse is currently over.
  const [newRange, setNewRange] = useState([]);
  const [rangeCandidate, setRangeCandidate] = useState([]); // range candidate is used for copying ranges
  const maxValue = totalMinutes / step; // max range input value
  const rangeStepWidth = cellWidth / (interval / step); // how much pixels is equal to 1 unit of range input
  const [innerTooltipPosition, setInnerTooltipPosition] = useState("end"); // there are two types of tooltip: inner and outer.
  const strictBetween = true; // tells whether to join two timestamps that are tight neighbours.
  const handlePushConstant = 10; // this constant helps to position range input handle to follow the mouse tighter
  const initialNewRangeValue = useRef({ captured: false, value: [], tried: 0 }); // Helps to correctly increment right side of range, when user draw timeslot from right to left
  const tooltipWidth = 284; // static tooltip width, can not be changed. Helps to position tooltip correctly

  const newRangeWidth = rangeStepWidth * (newRange[1] - newRange[0]);

  //setting tooltip position left based on new range width and protecting it not to go behind container
  let tooltipPositionLeft = rangeStepWidth * newRange[0] + newRangeWidth / 2 - tooltipWidth / 2;
  tooltipPositionLeft =
    tooltipPositionLeft < size.width - tooltipWidth
      ? tooltipPositionLeft >= 0
        ? tooltipPositionLeft
        : 0
      : size.width - tooltipWidth;

  const baseTrackStyle = {
    backgroundColor: "rgba(45,45,97,0.7)",
    borderRadius: 0,
    height: "72px",
    cursor: "grab",
    top: 0,
  };

  //new range input handler style
  const styleOfInputHandler = (activeState, value) => {
    return {
      height: cellHeight,
      borderRadius: 0,
      width: rangeStepWidth,
      backgroundPosition: "center",
      zIndex: 2,
      backgroundColor: "rgba(255,94,9,0.2)",
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

  // gets rangeIndex mouse is currently over (and other props)
  const parseMouseEvent = (e) => {
    var bounds = e.currentTarget.getBoundingClientRect();
    var x = Math.round(+(((e.clientX - bounds.left - rangeStepWidth / 2) / size.width) * maxValue));
    var mouseY = e.clientY - bounds.top;
    let rangeIndex = -1;
    let it = 0;
    while (rangeIndex === -1 && it < ranges.length) {
      if (isBetween(x, ranges[it].range[0], ranges[it].range[1] - 1)) {
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
              isBetween(arr[i].range[0], values[0], values[1], strictBetween) ||
              isBetween(arr[i].range[1], values[0], values[1], strictBetween) ||
              isBetween(values[0], arr[i].range[0], arr[i].range[1], strictBetween) ||
              isBetween(values[1], arr[i].range[0], arr[i].range[1], strictBetween)
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

  //outer and inner tooltip content is the same. Here it is:
  const Tooltip = () => (
    <div
      style={{
        height: "100%",
        padding: "4px 20px",
        width: tooltipWidth,
        borderRadius: "29px",
        background: "#021A53",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 700,
      }}
    >
      <div style={{ color: "white" }}>
        <div style={{ fontSize: "15px", lineHeight: "15px" }}>{dayName}</div>
        <div style={{ fontSize: "25px", lineHeight: "25px" }}>
          {convertMinsToHrsMins((newRange[0] / maxValue) * 24 * 60)}
        </div>
      </div>
      <div style={{ color: "#FF5E00" }}>
        <div style={{ fontSize: "15px", lineHeight: "15px" }}>{dayName}</div>
        <div style={{ fontSize: "25px", lineHeight: "25px" }}>
          {convertMinsToHrsMins((newRange[1] / maxValue) * 24 * 60)}
        </div>
      </div>
    </div>
  );

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
        const isSelected = selectedItems.includes(day + "-" + i);
        return (
          <React.Fragment key={`day-${day}-range-${i}`}>
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
              className="position-absolute w-100"
              style={{
                top: 0,
                left: -handlePushConstant / 1.3,
                zIndex: isSelected ? 50 : active === i ? 25 : 0,
              }}
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
                        let x1 = arr[ind].range[0],
                          x2 = arr[ind].range[1];

                        //if edited range is compared to itself - comparing must be not strict
                        //two ranges intersect if x1 <= y2 && y1 <= x2, where ranges are (x1:x2) and (y1:y2)
                        if (ind === i ? x1 <= val[1] && val[0] <= x2 : x1 < val[1] && val[0] < x2) {
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
                  {
                    opacity: 0,
                    outline: 0,
                    width: "30px",
                    height: cellHeight,
                    cursor: "col-resize",
                  },
                  {
                    opacity: 0,
                    outline: 0,
                    width: "30px",
                    height: cellHeight,
                    cursor: "col-resize",
                  },
                ]}
                trackStyle={[Object.assign({}, baseTrackStyle, { opacity: 0 })]}
                railStyle={{ backgroundColor: "rgba(233,233,233, 0)" }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                height: cellHeight,
                zIndex: isSelected ? 45 : 20,
                left: rangeStepWidth * (x.range[0] / x.from) * maxValue,
                width: ((rangeStepWidth * (x.range[1] - x.range[0])) / x.from) * maxValue,
                background: "#021A53",
                border: isSelected || active === i ? "3px solid #FF5E00" : "3px solid #021A53",
              }}
            >
              <div className="position-relative h-100">
                <div
                  style={{
                    transition: "transform 0.2s",
                    position: "absolute",
                    top: 0,
                    left: 15,
                    transform: isSelected
                      ? `translateY(-16px)`
                      : `translateY(${(cellHeight - 38) / 2}px)`,
                    height: "32px",
                    width: "196px",
                    borderRadius: "36px",
                    background: isSelected ? "#FF5E00" : "#E3FFF8",
                    color: "#021A53",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                  className="d-flex align-items-center justify-content-center"
                >
                  {dayName.substring(0, 3) +
                    " " +
                    convertMinsToHrsMins((x.range[0] / maxValue) * 24 * 60) +
                    "-" +
                    convertMinsToHrsMins((x.range[1] / maxValue) * 24 * 60)}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div
        onMouseDown={(e) => {
          if (!e.shiftKey) {
            setSelectedItems([]);
          }
        }}
        className="position-absolute"
        style={{
          top: 0,
          width: size.width,
          left: rangeStepWidth / 2 - handlePushConstant,
          zIndex: active === -1 ? 15 : 0,
        }}
      >
        <div>
          <Range
            onBeforeChange={(val) => {
              initialNewRangeValue.current = { captured: false, value: val, tried: 0 };
            }}
            value={newRange}
            onChange={(val) => {
              let finalValue = val;
              let { captured, tried } = initialNewRangeValue.current;
              if (!captured && tried < 4) {
                if (initialNewRangeValue.current.value[0] > finalValue[0]) {
                  finalValue[1]++;
                  initialNewRangeValue.current.captured = true;
                }
                initialNewRangeValue.current.tried++;
              }

              setInnerTooltipPosition(finalValue[0] !== newRange[0] ? "start" : "end");

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
            trackStyle={[{ opacity: 0 }]}
            railStyle={{ backgroundColor: "rgba(233,233,233 ,0)" }}
          />
        </div>
      </div>
      {newRange.length === 2 && newRange[0] !== newRange[1] && (
        <React.Fragment>
          {newRangeWidth <= 254 && (
            <div
              style={{
                position: "absolute",
                zIndex: 14,
                top: `-${cellHeight + 10}px`,
                width: tooltipWidth,
                left: tooltipPositionLeft,
              }}
            >
              <div style={{ height: cellHeight - 12 }}>
                <Tooltip></Tooltip>
              </div>
              <div className="triangle-down mx-auto"></div>
            </div>
          )}
          <div
            className="position-absolute"
            style={{
              top: 0,
              zIndex: active === -1 ? 14 : 0,
            }}
          >
            <div className="position-relative">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  padding: "6px",
                  left: rangeStepWidth * newRange[0],
                  height: cellHeight,
                  background: "#FF5E00",
                  width: newRangeWidth,
                  pointerEvents: "none",
                }}
              >
                <div
                  className={`w-100 d-flex justify-content-${innerTooltipPosition} h-100`}
                  style={{ zIndex: 0 }}
                >
                  {newRangeWidth > 254 && <Tooltip></Tooltip>}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default DayTimeline;
