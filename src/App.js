import React, { useEffect, useRef } from "react";
import "./App.css";
import Index from "pages/Index";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({ typography: { fontFamily: "Poppins" } });

function App() {
  const app = useRef(null);

  useEffect(() => {
    const preventGoBack = (e) => {
      if (!e.pageX || e.pageX > 50) {
        return;
      }
      e.preventDefault();
    };

    const appRef = app.current;
    appRef.addEventListener("touchstart", preventGoBack);

    return () => {
      appRef.removeEventListener("touchstart", preventGoBack);
    };
  }, []);

  return (
    <div className="App" ref={app}>
      <ThemeProvider theme={theme}>
        <Index />
      </ThemeProvider>
    </div>
  );
}

export default App;
