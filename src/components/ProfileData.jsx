import React from 'react';
import Calendar from '../pages/Calendar/Calendar';
import BtnExit from '../components/BtnExit';

const ProfileData = (props) => {
  return (
    <div id='profile-data'>
      <BtnExit />
      <h2 className='card-title'>Agenda</h2>
      <div className='w-75 mx-auto'>
        <div className='p-3'>
          <Calendar />
        </div>
      </div>
    </div>
  );
};

export default ProfileData;
