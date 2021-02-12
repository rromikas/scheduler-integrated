import React, { useEffect, useState } from "react";
import { Drawer, IconButton, Box } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { confirmable } from "react-confirm";
import FormButton from "components/FormButton";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  confirmDialogPaper: {
    width: "auto",
    padding: "20px",
  },
};

const Dialog = ({ show, proceed, confirmation, options, classes }) => {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setRender(true);
    }, 10);
  }, []);

  const remove = () => {
    setRender(false);
    setTimeout(() => {
      proceed(false);
    }, 200);
  };

  const confirm = () => {
    setRender(false);
    setTimeout(() => {
      proceed(true);
    }, 200);
  };

  return (
    <Drawer
      classes={{
        paper: classes.confirmDialogPaper,
        typography: classes.typography,
      }}
      anchor={"right"}
      open={render}
      onClose={remove}
    >
      <Box display="flex" flexDirection="column" height="100%">
        <Box display="flex">
          <Box>
            <IconButton aria-label="goback" onClick={remove}>
              <ArrowBackIcon fontSize="large" />
            </IconButton>
          </Box>
          <Box style={{ marginTop: "14px" }}>
            <Box
              display="block"
              className="schedule-title"
              style={{ fontSize: "22px", fontWeight: 600, color: "#021a53" }}
            >
              Confirmation
            </Box>
            <Box
              mt={1}
              display="block"
              className="schedule-title"
              style={{ fontSize: "16px", fontWeight: 400, color: "#021a53" }}
            >
              {confirmation}
            </Box>
          </Box>
        </Box>

        <Box flexGrow={1} pb={2} mt={3} display="flex" alignItems="flex-end">
          <FormButton onClick={confirm} style={{ marginRight: "20px", fontFamily: "Poppins" }}>
            Confirm
          </FormButton>
          <FormButton
            onClick={remove}
            style={{
              background: "transparent",
              color: "#021a53",
              border: "1px solid #2d2d61",
              fontFamily: "Poppins",
            }}
          >
            Cancel
          </FormButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default confirmable(withStyles(styles)(Dialog));
