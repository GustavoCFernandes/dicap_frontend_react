import React from 'react';
import { useNavigate } from 'react-router-dom';
import { convertPointsToHours } from '../../utils/convertPointsToHours.ts';
import { useStore } from '../../stores/index';

const HeaderCalendar = (props) => {
  const navigate = useNavigate();
  const { user } = useStore();

  return (
    <div
      id='btn-back-choice-techaer-content'
      className='d-flex justify-content-between mt-1 p-2 w-75 flex-wrap'
    >
      <button
        onClick={() => navigate('/escolha/professor')}
        className='btn btn-exit btn-sm text-uppercase'
      >
        <span id='btn-choice-teacher' className='p-3'>
          Escolher outro Professor
        </span>
      </button>
      <div className='text-white px-5 text-hide-sm'>
        <span className='p-2'>Horas restantes para agendamento:</span>
        <strong>{convertPointsToHours(user.points)}</strong>
      </div>
    </div>
  );
};

export default HeaderCalendar;
