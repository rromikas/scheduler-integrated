import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  root: {
    borderColor: "#2d2d61",
    textTransform: "none",
    borderRadius: 30,
    color: "#2d2d61",
    fontSize: "18px",
    padding: "0px 20px",
    "&:hover": {
      backgroundColor: "#2d2d61",
      color: "white",
      boxShadow: "none",
    },
    "&:active": {
      backgroundColor: "#2d2d61",
      border: "1px solid #2d2d61",
    },
  },
};

const OutlinedButton = (props) => {
  const { classes, children, onClick, style } = props;
  return (
    <Button variant="outlined" className={classes.root} onClick={onClick} style={style}>
      {children}
    </Button>
  );
};

OutlinedButton.propTypes = {
  classes: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.string.isRequired,
};

export default withStyles(styles)(OutlinedButton);
