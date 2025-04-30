import React from 'react';
import Calendar from '../pages/Calendar/Calendar';
import BtnExit from '../components/BtnExit';
import { useStore } from '../stores/index';

const ProfileData = (props) => {
  const { teacherName } = useStore();
  return (
    <div id='profile-data'>
      <BtnExit />
      <h2 className='card-title'>Agenda {teacherName}</h2>
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
