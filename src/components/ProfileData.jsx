import React from 'react';
import Calendar from '../pages/Calendar/Calendar';
import BtnExit from '../components/BtnExit';
/**
 * Renders information about the user obtained from MS Graph
 * @param props
 */
const ProfileData = (props) => {
  return (
    <div id='profile-data'>
      <BtnExit />
      <h2 className='card-title'>Agenda {props.graphData.displayName}</h2>
      <p> Email: {props.graphData.userPrincipalName} </p>
      <div className='w-75 mx-auto'>
        <div className='p-3'>
          <Calendar />
        </div>
      </div>
    </div>
  );
};

export default ProfileData;
