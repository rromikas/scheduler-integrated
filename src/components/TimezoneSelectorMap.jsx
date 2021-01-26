/* global process */
import React from "react";
import PropTypes from "prop-types";
import { Paper, Box, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { SizeMe } from "react-sizeme";
import TextField from "@material-ui/core/TextField";
import TimezoneMapGL, { Provider } from "./ReactTimezoneMapGL";
import timezoneTopo from "./ReactTimezoneMapGL/data/timezoneTopo.json";

import "mapbox-gl/dist/mapbox-gl.css";

const styles = (theme) => ({
  root: {
    width: "80%",
  },
  heading: {
    color: "#2d2d61",
    fontSize: 22,
  },
  paper: {
    margin: "auto",
    marginTop: theme.spacing(1),
    width: "100%",
    borderRadius: 4,
  },
  name: {
    marginBottom: "10px",
    fontSize: 100,
  },
});

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

class TimezoneSelectorMap extends React.Component {
  state = {
    selectTimezone: this.props.scheduleTimezone || {
      label: Intl.DateTimeFormat().resolvedOptions().timeZone,
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    name: this.props.scheduleName,
  };

  componentWillUnmount() {
    this.props.setScheduleName(this.state.name);
    this.props.setTimezone(this.state.selectTimezone);
  }

  handleChange = (value) => this.setState({ selectTimezone: value });

  handleTimezoneClick = (event, timezoneName) => {
    this.setState({
      selectTimezone: {
        label: timezoneName,
        value: timezoneName,
      },
    });
  };

  handleNameChange = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  render() {
    const { classes } = this.props;
    const { selectTimezone } = this.state;

    return (
      <SizeMe>
        {({ size }) => {
          return (
            <Box className={classes.root}>
              <Box>
                <TextField
                  id="schedule-name"
                  label="Name"
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={this.state.name}
                  className={classes.name}
                  onChange={this.handleNameChange}
                />
                {/* <TimezoneSelect value={selectTimezone} onChange={this.handleChange} /> */}
                <Box mt={2}>
                  <Typography className={classes.heading}>Select Timezone</Typography>
                </Box>
                <Paper className={classes.paper}>
                  <Provider value={timezoneTopo}>
                    <TimezoneMapGL
                      timezone={selectTimezone?.value}
                      mapboxApiAccessToken={MAPBOX_TOKEN}
                      onTimezoneClick={this.handleTimezoneClick}
                      defaultViewport={{
                        width: size.width,
                        height: size.width * 0.45 < 500 ? 500 : size.width * 0.45,
                        zoom: 1.8,
                      }}
                    />
                  </Provider>
                </Paper>
              </Box>
            </Box>
          );
        }}
      </SizeMe>
    );
  }
}

TimezoneSelectorMap.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TimezoneSelectorMap);
