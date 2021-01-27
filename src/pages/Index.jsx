import React, { useEffect, useState, useRef, Suspense } from "react";
import fetch from "node-fetch";

import { Container, Grid, Box, Typography, IconButton } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import Schedular from "components/Schedular";
import FormButton from "components/FormButton";
import OutlinedButton from "components/OutlinedButton";

import ScheduleThumbnail from "components/ScheduleThumbnail";
import { v4 as uuidv4 } from "uuid";
import settings from "components/Schedular/config";
import ConfirmDialog from "components/ConfirmDialog";
import { createConfirmation } from "react-confirm";
import CustomDrawer from "components/CustomDrawer";

const TimezoneSelectorMap = React.lazy(() => import("components/TimezoneSelectorMap"));

const confirm = createConfirmation(ConfirmDialog);

const { totalMinutes } = settings;

const styles = {
  titlePrimary: {
    fontStyle: "italic",
    fontWeight: 400,
    fontFamily: "Poppins",
    color: "#2d2d61",
  },
  titleSecondary: {
    fontFamily: "Poppins",
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
    buttonText: "Save",
    pageTitle: "Create Schedule",
    screenName: "scheduleScreen",
  },
];

const Index = (props) => {
  const [state, setState] = useState({ drawerOpen: false, drawerRemoveFinished: true });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [screenValue, setScreenValue] = useState(0);
  const [pageTitle, setPageTitle] = useState(screens[0].pageTitle);
  const [buttonText, setButtonText] = useState(screens[0].buttonText);
  const [scheduleName, setScheduleName] = useState(null);
  const [scheduleTimezone, setTimezone] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(new Array(7).fill([]));
  const [scheduleId, setScheduleId] = useState(uuidv4());
  const tableContainerRef = useRef(null);
  const [weekStart, setWeekStart] = useState(0); // 0 if sunday, 1 if monday

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) return;

    setState({ drawerOpen: open, drawerRemoveFinished: false });
  };

  const getCurrentScreen = () => {
    if (screenValue === 0) {
      return (
        <Suspense fallback={<div></div>}>
          <TimezoneSelectorMap
            scheduleName={scheduleName}
            setScheduleName={setScheduleName}
            setTimezone={setTimezone}
            scheduleTimezone={scheduleTimezone}
          />
        </Suspense>
      );
    } else if (screenValue === 1) {
      return (
        <Schedular
          ref={tableContainerRef}
          setCurrentSchedule={setCurrentSchedule}
          currentSchedule={currentSchedule}
          handlePrevious={handlePreviousButton}
          weekStart={weekStart}
          setWeekStart={setWeekStart}
        />
      );
    }
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

      const jsonSchedule = generateJSON(finalSchedule);

      console.log("JSON schedule: ", jsonSchedule);

      fetch("https://google.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonSchedule),
      });

      resetState();
      setState({ drawerOpen: false });
    }

    if (screenValue < screens.length - 1) setScreenValue((previousValue) => previousValue + 1);
  };

  const generateJSON = (schedule) => {
    let json = { ...schedule };
    json.zone = json.timezone.value;
    delete json["timezone"];
    let timings = [];
    json.timings.forEach((x, i) => {
      x.forEach((y) => {
        let begin = i * totalMinutes + (y.range[0] / y.from) * totalMinutes;
        let end = i * totalMinutes + (y.range[1] / y.from) * totalMinutes;
        timings.push({ begin, end });
      });
    });
    json.timings = timings;
    return json;
  };

  const resetState = () => {
    setCurrentSchedule(new Array(7).fill([]));
    setScheduleId(uuidv4());
    setScheduleName(null);
    setTimezone(null);
    setScreenValue(0);
  };

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handlePreviousButton = async () => {
    if (screenValue > 0) setScreenValue((previousValue) => previousValue - 1);
    if (screenValue === 0) {
      resetState();
      setState((prev) => Object.assign({}, prev, { drawerOpen: false }));
      await delay(400);
      setState((prev) => Object.assign({}, prev, { drawerRemoveFinished: true }));
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
      <Container
        style={{
          backgroundColor: "#efefef",
          position: !state.drawerRemoveFinished ? "absolute" : "relative",
        }}
        maxWidth="xl"
      >
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
                      deleteScd={async () => {
                        if (
                          await confirm({ confirmation: "Do you want to delete the schedule?" })
                        ) {
                          handleDeleteClick(schedule.schedule_id);
                        }
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
      <CustomDrawer isOpen={state.drawerOpen} isRemoveFinished={state.drawerRemoveFinished}>
        {screenValue !== 1 && (
          <Box display="flex" alignItems="center" className="p-4 position-relative">
            <IconButton aria-label="goback" onClick={handlePreviousButton}>
              <ArrowBackIcon fontSize="large" />
            </IconButton>
            <Box
              component="span"
              className="schedule-title"
              style={{ fontSize: "22px", fontWeight: 600, color: "#021a53" }}
            >
              {pageTitle}
            </Box>
          </Box>
        )}
        <Container maxWidth={screenValue === 1 ? false : "xl"} disableGutters={screenValue === 1}>
          <Box pt={1}>{getCurrentScreen()}</Box>
          <Box ml={screenValue === 1 ? 3 : 0} pb={2} mt={3}>
            <FormButton onClick={handleNextButton}>{buttonText}</FormButton>
          </Box>
        </Container>
      </CustomDrawer>
    </>
  );
};

export default withStyles(styles)(Index);
