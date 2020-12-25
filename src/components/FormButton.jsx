import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    border: 0,
    borderRadius: 30,
    color: 'white',
    background: '#2d2d61',
    textTransform: 'none',
    fontSize: '16px',
    padding: '5px 70px',
    '&:hover': {
      backgroundColor: '#2d2d61',
      borderColor: '#2d2d61',
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#2d2d61',
      borderColor: '#2d2d61',
    },
  },
};

const FormButton = (props) => {
  const { classes, children, onClick, style } = props;
  return (
    <Button className={classes.root} onClick={onClick} style={style}>
      {children}
    </Button>
  );
};

FormButton.propTypes = {
  classes: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.string.isRequired,
};

export default withStyles(styles)(FormButton);
