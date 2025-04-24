import React from 'react';
import { useNavigate } from 'react-router-dom';

const BtnExit = (props) => {
  const navigate = useNavigate();

  return (
    <div
      id='btn-back-choice-techaer-content'
      className='d-flex justify-content-end p-2'
    >
      <button
        onClick={() => navigate('/escolha/professor')}
        className='btn btn-exit btn-sm text-uppercase'
      >
        <span className='p-3'>Escolher outro Professor</span>
      </button>
    </div>
  );
};

export default BtnExit;
