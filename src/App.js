import React from "react";
import "./App.css";
import Index from "pages/Index";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({ typography: { fontFamily: "Poppins" } });

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Index />
      </ThemeProvider>
    </div>
  );
}

export default App;
