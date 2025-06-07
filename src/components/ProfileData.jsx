import React from 'react';
import Calendar from '../pages/Calendar/Calendar';
import MenuDropdown from '../components/MenuDropdown';

const ProfileData = (props) => {
  return (
    <div id='profile-data'>
      <MenuDropdown />
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
