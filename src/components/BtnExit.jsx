import React from 'react';
import { useNavigate } from 'react-router-dom';

const BtnExit = (props) => {
  const navigate = useNavigate();

  return (
    <div id='btn-exit-content' className='d-flex justify-content-end p-2'>
      <button
        onClick={() => navigate('/')}
        className='btn btn-exit btn-sm text-uppercase'
      >
        <span>Sair</span>
      </button>
    </div>
  );
};

export default BtnExit;
