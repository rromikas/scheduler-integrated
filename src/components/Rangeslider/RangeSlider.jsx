import React, { useCallback } from "react";
import moment from "moment";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import SchedulesContext from "components/Schedular/context";
import "./styles.css";

const Input = styled.input`
  &.range-slider-hide-thumb::after {
    content: "";
    position: absolute;
    left: ${(props) => props.left}px;
    background: ${(props) => props.tailKnobColor};
    border-radius: 50%;
    width: 30px;
    height: 30px;
  }
`;

const singleCellWidth = 68; // in pixels, it reflects width in schedular.styles.css file

export default function RangeSlider({
  className,
  width,
  maxValue,
  index,
  propId,
  scrollDrawerContentToRight,
  endValue,
}) {
  const [value, setValue] = React.useState(endValue);
  const [progressValue, setProgressValue] = React.useState(0);
  const [tailKnobColor, setTailKnobColor] = React.useState("#2d2d61");
  const scheduleState = React.useContext(SchedulesContext);
  const [previouseInterval, setPreviousInterval] = React.useState(scheduleState.interval);

  const handleValue = useCallback(
    (e) => {
      const finalValue = parseInt(e.target.value, 10);
      setValue(finalValue);
      setProgressValue(finalValue * singleCellWidth);

      const { interval, amendSchedules } = scheduleState;
      const [day, hour] = propId.split(",");
      const startingMoment = moment(hour, "HH:mm");
      const endingMoment = moment(hour, "HH:mm").add(parseInt(interval) * finalValue, "minutes");

      const schedule = {
        schedule_id: uuidv4(),
        schedule_name: "Default",
        slider_id: propId,
        day: day,
        interval,
        timings: {
          begin: startingMoment.format("HH:mm"),
          end: endingMoment.format("HH:mm"),
          end_value: finalValue,
        },
      };

      amendSchedules(propId, schedule);

      if (parseInt(interval) * finalValue > 10) {
        scrollDrawerContentToRight(finalValue > value);
      }
    },
    [propId, scheduleState, scrollDrawerContentToRight, value]
  );

  React.useEffect(() => {
    const [, hour] = propId.split(",");
    const currentInterval = parseInt(scheduleState.interval);
    const adjustedValue = previouseInterval / currentInterval;
    const startingMoment = moment(hour, "HH:mm");
    const endingMoment = moment(hour, "HH:mm").add(
      parseInt(scheduleState.interval) * value * adjustedValue,
      "minutes"
    );
    const differenceInMinutes = moment.duration(endingMoment.diff(startingMoment)).asMinutes();

    const newValue = differenceInMinutes / currentInterval;

    setValue(newValue);
    setProgressValue(newValue * singleCellWidth);
    setPreviousInterval(scheduleState.interval);
  }, [previouseInterval, scheduleState.interval, propId, value]);

  const newProgressValue = progressValue - 13;

  return (
    <Input
      key={propId}
      left={newProgressValue - 18}
      className={
        `${className}` +
        (value === 0 ? " range-slider-initial-display" : " range-slider-hide-thumb")
      }
      min={0}
      max={maxValue}
      type="range"
      step={1}
      style={{
        height: "30px",
        borderRadius: "30px",
        background: `linear-gradient(90deg, rgba(45,45,97,1) ${newProgressValue}px, rgba(142,115,200,0) ${newProgressValue}px)`,
        width,
      }}
      value={value}
      onChange={handleValue}
      onMouseLeave={scheduleState.mergeSchedules}
      tailKnobColor={tailKnobColor}
      onMouseDown={() => setTailKnobColor("#fb4908")}
      onMouseUp={() => setTailKnobColor("#2d2d61")}
    />
  );
}
