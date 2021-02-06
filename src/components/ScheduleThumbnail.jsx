import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Card, CardContent, Typography, Box, Divider, IconButton } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";

const styles = {
  root: {
    width: 300,
    border: "1px solid rgb(0, 0, 0, 0.3)",
  },
  title: {
    color: "#2d2d61",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    paddingLeft: 5,
  },
  timezone: {
    color: "#2d2d61",
    fontSize: 15,
    fontWeight: 400,
    textAlign: "left",
    paddingLeft: 5,
  },
  daysContainer: {
    marginTop: 12,
    borderRadius: 4,
    backgroundColor: "#fff9f1",
    border: "1px solid rgba(0, 0, 0, 0.03)",
  },
  dayContainer: {
    display: "flex",
  },
  divider: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  dayName: {
    width: 21,
    color: "#2d2d61",
    fontWeight: 900,
    fontSize: 9,
    justifyContent: "center",
    padding: "4px 5px",
  },
  scheduleBar: {
    position: "absolute",
    height: 19,
    borderRadius: 30,
    marginTop: 1,
    marginBottom: 1,
  },
  gridBg: {
    flex: 1,
    position: "relative",
    display: "flex",
    flexFlow: "row nowrap",
    background: "linear-gradient(-90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)",
    backgroundSize: "22px 16px",
    alignItems: "center",
  },
  editIconButton: {
    border: "1px solid rgb(0, 0, 0, 0.2)",
    padding: "3px 13px",
    borderRadius: 20,
    marginRight: 5,
  },
  editIcon: {
    fontSize: "0.7rem",
    color: "rgb(0, 0, 0, 0.2)",
  },
  closeIcon: {
    fontSize: "0.7rem",
    color: "rgb(0, 0, 0, 0.2)",
  },
  table: {
    tableLayout: "fixed",
    borderCollapse: "collapse",
  },
  td: {
    border: "1px solid rgb(243 242 236)",
    textAlign: "left",
  },
};

const ScheduleThumbnail = (props) => {
  const { schedule, classes, onClick, deleteScd } = props;
  const timings = schedule.timings;
  const timezone = schedule.timezone;
  const title = schedule.name;

  return (
    <Draggable>
      <Card className={classes.root} variant="outlined">
        <CardContent style={{ padding: "10px 3px 3px 3px" }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography className={classes.title}>{title}</Typography>
              <Typography className={classes.timezone} color="textSecondary">
                {timezone.label}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center">
              <IconButton className={classes.editIconButton} aria-label="edit" onClick={onClick}>
                <FontAwesomeIcon className={classes.editIcon} icon={faEdit} />
              </IconButton>
              <IconButton onClick={deleteScd}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <div className="position-relative mt-2" style={{ background: "#fff9f1" }}>
            <div className="d-flex position-relative" style={{ zIndex: 5 }}>
              <div
                className="px-2 text-left"
                style={{ fontSize: "9px", fontWeight: "800", color: "#2d2d61" }}
              >
                {moment.weekdays().map((x, i) => (
                  <div style={{ height: "20px", lineHeight: "20px" }} key={`week-day-${i}`}>
                    {x}
                  </div>
                ))}
              </div>
              <div className="flex-grow-1" style={{ transform: "translateY(-4px)" }}>
                {timings.map((day, row) => (
                  <div
                    className="position-relative w-100"
                    key={`timelines-${row}`}
                    style={{ height: "20px" }}
                  >
                    {day.map((r, col) => (
                      <div
                        key={`timeline-${row}-${col}`}
                        className="position-absolute w-100"
                        style={{ top: 0, left: 0 }}
                      >
                        <Range
                          max={r.from}
                          value={r.range}
                          handleStyle={[
                            {
                              cursor: "default",
                              opacity: 0,
                            },
                            {
                              cursor: "default",
                              opacity: 0,
                            },
                          ]}
                          trackStyle={[
                            {
                              borderRadius: "30px",
                              backgroundColor: row % 2 === 0 ? "#021A53" : "#FF5E00",
                              height: "19px",
                              cursor: "default",
                            },
                          ]}
                          railStyle={{ backgroundColor: "transparent" }}
                        ></Range>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", top: 0, left: 0 }}>
              <table className={classes.table}>
                <tbody>
                  {new Array(7).fill(0).map((x, i) => {
                    return (
                      <tr key={`grid-row-${i}`}>
                        {new Array(15).fill(0).map((y, j) => (
                          <td
                            className={classes.td}
                            style={{ height: "20px", width: "20px", verticalAlign: "middle" }}
                            key={`grid-row-${i}-col-${j}`}
                          ></td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </Draggable>
  );
};

ScheduleThumbnail.propTypes = {
  classes: PropTypes.object.isRequired,
  schedule: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(ScheduleThumbnail);
