import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import fetch from "node-fetch";

import { Drawer, Container, Grid, Box, Typography, IconButton } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import Schedular from "components/Schedular";
import FormButton from "components/FormButton";
import OutlinedButton from "components/OutlinedButton";
import TimezoneSelectorMap from "components/TimezoneSelectorMap";
import ReviewAndSave from "components/ReviewAndSave";
import ScheduleThumbnail from "components/ScheduleThumbnail";
import { v4 as uuidv4 } from "uuid";

const styles = {
  titlePrimary: {
    fontStyle: "italic",
    fontWeight: 400,
    color: "#2d2d61",
  },
  titleSecondary: {
    fontWeight: 900,
    color: "#2d2d61",
  },
  drawerPaper: {
    width: "85%",
  },
};

const screens = [
  {
    buttonText: "Next",
    pageTitle: "Create Schedule",
    screenName: "timezoneScreen",
  },
  {
    buttonText: "Next",
    pageTitle: "Create Schedule",
    screenName: "scheduleScreen",
  },
  {
    buttonText: "Save",
    pageTitle: "Review and save",
    screenName: "reviewScreen",
  },
];

const Index = (props) => {
  const [state, setState] = useState({ drawerOpen: false });
  const [screenValue, setScreenValue] = useState(0);
  const [pageTitle, setPageTitle] = useState(screens[0].pageTitle);
  const [buttonText, setButtonText] = useState(screens[0].buttonText);
  const [scheduleName, setScheduleName] = useState(null);
  const [scheduleTimezone, setTimezone] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(new Array(7).fill([]));
  const [scheduleId, setScheduleId] = useState(uuidv4());
  const tableContainerRef = useRef(null);

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) return;

    setState({ drawerOpen: open });
  };

  const getCurrentScreen = () => {
    if (screenValue === 0) {
      return (
        <TimezoneSelectorMap
          scheduleName={scheduleName}
          setScheduleName={setScheduleName}
          setTimezone={setTimezone}
          scheduleTimezone={scheduleTimezone}
        />
      );
    } else if (screenValue === 1) {
      return (
        <Schedular
          ref={tableContainerRef}
          setCurrentSchedule={setCurrentSchedule}
          currentSchedule={currentSchedule}
        />
      );
    } else if (screenValue === 2) {
      return (
        <ReviewAndSave
          scheduleName={scheduleName}
          currentSchedule={currentSchedule}
          scheduleTimezone={scheduleTimezone}
        />
      );
    }
  };

  const addTimingsToCurrentSchedule = (timings) => {
    const newSchedule = {
      ...currentSchedule,
      timings,
    };
    setCurrentSchedule(newSchedule);
  };

  const handleNextButton = () => {
    if (buttonText === "Save") {
      let finalSchedule = {
        schedule_id: scheduleId,
        timings: currentSchedule,
        name: scheduleName || "Schedule " + (schedules.length + 1),
        timezone: scheduleTimezone,
      };

      setSchedules((previousSchedules) => [
        ...previousSchedules.filter(
          (schedule) => schedule.schedule_id !== finalSchedule.schedule_id
        ),
        finalSchedule,
      ]);
      resetState();
      setState({ drawerOpen: false });
    }

    if (screenValue < screens.length - 1) setScreenValue((previousValue) => previousValue + 1);
  };

  const splitHoursMinutes = (timeValue) => {
    const [hours, minutes] = timeValue.split(":");
    return [parseInt(hours) * 60, parseInt(minutes)];
  };

  const resetState = () => {
    setCurrentSchedule(new Array(7).fill([]));
    setScheduleId(uuidv4());
    setScheduleName(null);
    setTimezone(null);
    setScreenValue(0);
  };

  const handlePreviousButton = () => {
    if (screenValue > 0) setScreenValue((previousValue) => previousValue - 1);
    if (screenValue === 0) {
      resetState();
      setState({ drawerOpen: false });
    }
  };

  useEffect(() => {
    setPageTitle(screens[screenValue].pageTitle);
    setButtonText(screens[screenValue].buttonText);
  }, [screenValue]);

  const handleScheduleThumbnailClick = (schedule_id) => {
    const theSchedule = schedules.filter((schedule) => schedule.schedule_id === schedule_id)[0];
    setCurrentSchedule(theSchedule.timings);
    setScheduleId(theSchedule.schedule_id);
    setScheduleName(theSchedule.name);
    setTimezone(theSchedule.timezone);
    setState({ drawerOpen: true });
  };

  const handleDeleteClick = (schedule_id) => {
    const theSchedule = schedules.filter((schedule) => schedule.schedule_id !== schedule_id);
    setSchedules(theSchedule);
  };

  return (
    <>
      <Container style={{ backgroundColor: "#efefef" }} maxWidth="xl">
        <Box pt={3}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography className={props.classes.titlePrimary} align="left">
                Second
              </Typography>
              <Typography className={props.classes.titleSecondary} align="left">
                SCHEDULE MANAGER
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center">
              <OutlinedButton onClick={toggleDrawer(true)}>Add Schedule</OutlinedButton>
            </Box>
          </Box>
        </Box>
        <Box mt={5}>
          <Grid container justify="flex-start" spacing={2}>
            {schedules
              ? schedules.map((schedule, index) => (
                  <Grid key={index} item>
                    <ScheduleThumbnail
                      schedule={schedule}
                      deleteScd={() => {
                        handleDeleteClick(schedule.schedule_id);
                      }}
                      onClick={() => {
                        setScreenValue(1);
                        handleScheduleThumbnailClick(schedule.schedule_id);
                      }}
                    />
                  </Grid>
                ))
              : null}
          </Grid>
        </Box>
      </Container>
      <Drawer
        classes={{
          paper: props.classes.drawerPaper,
        }}
        anchor={"right"}
        open={state.drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box display="flex" alignItems="center">
          <IconButton aria-label="goback" onClick={handlePreviousButton}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Box component="span" className="schedule-title">
            {pageTitle}
          </Box>
        </Box>
        {/* <Box ref={tableContainerRef} overflow="scroll" height='100%' display='flex' flexDirection='column'> */}
        <Container maxWidth={screenValue === 1 ? false : "xl"} disableGutters={screenValue === 1}>
          <Box pt={1}>{getCurrentScreen()}</Box>
          <Box ml={screenValue === 1 ? 3 : 0} pb={2} mt={3}>
            <FormButton onClick={handleNextButton}>{buttonText}</FormButton>
          </Box>
        </Container>
        {/* </Box> */}
      </Drawer>
    </>
  );
};

export default withStyles(styles)(Index);
