import WeekScheduler from "./WeekScheduler";
import { ThemeProvider } from "styled-components";
import React from "react";

const ThemedScheduler = (props) => {
  const theme = {
    primary: "#021A53",
    secondary: "#FF5E00",
    tertiary: "#E3FFF8",
  };
  return (
    <ThemeProvider theme={theme}>
      <WeekScheduler {...props}></WeekScheduler>
    </ThemeProvider>
  );
};

export default ThemedScheduler;
