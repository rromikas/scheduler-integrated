import React from "react";
import InfoIcon from "./icons/info.svg";
import { Typography, Box, List, ListItem } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { convertMinsToHrsMins } from "./scripts/helpers";
import moment from "moment";

const styles = {
  root: {
    textAlign: "left",
    color: "#2d2d61",
    maxWidth: 350,
  },
  listItem: {
    border: "1px solid #031142",
    borderRadius: 4,
    marginBottom: 6,
  },
  heading: {
    color: "#2d2d61",
    fontSize: 30,
  },
  subHeading: {
    color: "#2d2d61",
    fontSize: 18,
    fontWeight: "bold",
  },
  listItemText: {
    textTransform: "uppercase",
    fontSize: 18,
    fontWeight: "bold",
    margin: "auto",
  },
};

const InfoPanel = ({ classes, currentSchedule, onClose, schedulerHeight, shouldOverflow }) => {
  const days = moment.weekdaysShort(true);
  return (
    <Box className={classes.root}>
      <div className="mb-4 pb-4">
        <Box display="flex" alignItems="center" style={{ height: 59 }}>
          <img alt="info-alt" src={InfoIcon} onClick={onClose} className="mr-3 icon-btn"></img>
          <Typography className={classes.heading}>Info</Typography>
        </Box>
      </div>

      <List
        style={{
          maxHeight: schedulerHeight,
          overflowY: "auto",
          padding: "0 10px",
        }}
      >
        {currentSchedule.map((d, index) =>
          d.map((r) => (
            <ListItem key={index} className={classes.listItem}>
              <Typography className={classes.listItemText}>
                {convertMinsToHrsMins((r.range[0] / r.from) * 24 * 60)} {days[index]} -{" "}
                {convertMinsToHrsMins((r.range[1] / r.from) * 24 * 60)} {days[index]}
              </Typography>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default withStyles(styles)(InfoPanel);
