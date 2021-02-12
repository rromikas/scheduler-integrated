import React from "react";
import SettingsIcon from "./icons/settings.svg";
import { withStyles } from "@material-ui/core/styles";
import ButtonBase from "@material-ui/core/ButtonBase";

const styles = {
  root: {
    height: 38,
    fontWeight: 800,
  },

  selected: {
    background: "#001D53",
    color: "white",
  },
  outlined: {
    color: "#001D53",
    border: "1px solid #001D53",
  },

  title: {
    color: "#021A53",
  },
};

const SettingsPanel = ({
  classes,
  hourFormat,
  setHourFormat,
  weekStart,
  setWeekStart,
  timeInterval,
  setTimeInterval,
  onClose,
}) => {
  const VariantButton = ({ selected, children, position, ...rest }) => {
    return (
      <ButtonBase
        {...rest}
        style={{
          borderRadius:
            position === "left" ? "50px 0 0 50px" : position === "right" ? "0 50px 50px 0" : 0,
        }}
        className={`${classes.root} ${
          selected ? classes.selected : classes.outlined
        } col text-uppercase`}
      >
        {children}
      </ButtonBase>
    );
  };

  return (
    <div style={{ fontWeight: 700 }}>
      <div className="pb-4 mb-4">
        <div className="d-flex align-items-center" style={{ height: 59 }}>
          <img
            alt="settings-alt"
            src={SettingsIcon}
            className="mr-3 icon-btn"
            onClick={onClose}
          ></img>
          <div style={{ fontSize: 30, fontWeight: 500 }} className={classes.title}>
            Settings
          </div>
        </div>
      </div>
      <div>
        <div>TIME FORMAT</div>
        <div className="d-flex mb-4">
          <VariantButton
            position="left"
            selected={hourFormat === 24}
            onClick={() => setHourFormat(24)}
          >
            24 hour
          </VariantButton>
          <VariantButton
            position="right"
            selected={hourFormat === 12}
            onClick={() => setHourFormat(12)}
          >
            12 hours
          </VariantButton>
        </div>
      </div>
      <div>
        <div>WEEK START</div>
        <div className="d-flex mb-4">
          <VariantButton position="left" selected={weekStart === 1} onClick={() => setWeekStart(1)}>
            Monday
          </VariantButton>
          <VariantButton
            position="right"
            selected={weekStart === 0}
            onClick={() => setWeekStart(0)}
          >
            Sunday
          </VariantButton>
        </div>
      </div>
      <div>
        <div>TIME INTERVAL</div>
        <div className="d-flex">
          <VariantButton
            position="left"
            selected={timeInterval === 15}
            onClick={() => setTimeInterval(15)}
          >
            15
          </VariantButton>
          <VariantButton
            position="center"
            selected={timeInterval === 30}
            onClick={() => setTimeInterval(30)}
          >
            30
          </VariantButton>
          <VariantButton
            position="right"
            selected={timeInterval === 60}
            onClick={() => setTimeInterval(60)}
          >
            60
          </VariantButton>
        </div>
      </div>
    </div>
  );
};

export default withStyles(styles)(SettingsPanel);
