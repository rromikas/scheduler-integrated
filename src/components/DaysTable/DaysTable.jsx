import React from 'react';
import moment from 'moment';

import './styles.css';

export default function DaysTable(props) {
  const generateTable = () => {
    return moment.weekdays().map((day) => {
      return (
        <React.Fragment>
          <tr key={day}>
            {/* We need one extra td in the days column and we need input range in those rows */}
            <td style={{ color: 'white' }}>&nbsp;</td>
          </tr>
          <tr key={day + '_'}>
            <td className='day'>
              <span className='day-text'>{day}</span>
            </td>
          </tr>
        </React.Fragment>
      );
    });
  };

  return (
    <table {...props}>
      <tbody>
        <th className={'time-table-head'}>Time</th>
        {generateTable()}
      </tbody>
    </table>
  );
}
