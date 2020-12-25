import React from 'react';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import timezoneMeta from 'moment-timezone/data/meta/latest.json';
import Select from 'react-select';

const styles = {
  root: {
    fontSize: '24px',
    margin: 'auto',
    width: '100%',

  },
};

const zoneKeys = Object.keys(timezoneMeta.zones).sort();

const timezoneOptions = zoneKeys.map((zoneKey) => {
  const timezone = timezoneMeta.zones[zoneKey].name;
  return {
    label: timezone,
    value: timezone,
  };
});

class TimezoneSelect extends React.Component {
  itemRenderer = ({ index, styles }) => {
    const zone = timezoneMeta.zones[zoneKeys[index]];
    return (
      <MenuItem key={zone.name} value={zone.name}>
        {zone.name}
      </MenuItem>
    );
  };

  render() {
    const { classes, onChange, value } = this.props;

    return <Select className={classes.root} onChange={onChange} value={value} options={timezoneOptions} />;
  }
}

TimezoneSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(withStyles(styles))(TimezoneSelect);
