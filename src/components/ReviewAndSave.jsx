import React from "react";
import PropTypes from "prop-types";
import { Typography, Box, List, ListItem } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
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
    marginTop: 6,
  },
  heading: {
    color: "#2d2d61",
    fontSize: 12,
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

function convertMinsToHrsMins(minutes) {
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  return h + ":" + m;
}

const ReviewAndSave = (props) => {
  const { classes, currentSchedule, scheduleName, scheduleTimezone } = props;

  const days = moment.weekdaysShort();
  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.heading}>Name</Typography>
        <Typography className={classes.subHeading}>{scheduleName}</Typography>
      </Box>
      <Box mt={5}>
        <Typography className={classes.heading}>Timezone</Typography>
        <Typography className={classes.subHeading}>{scheduleTimezone.label}</Typography>
      </Box>
      <Box mt={5}>
        <Typography className={classes.heading}>Slots</Typography>
        <List>
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
    </Box>
  );
};

ReviewAndSave.propTypes = {
  scheduleName: PropTypes.string.isRequired,
  scheduleTimezone: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ReviewAndSave);
