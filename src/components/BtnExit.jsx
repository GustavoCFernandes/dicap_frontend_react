import React from 'react';
import { useNavigate } from 'react-router-dom';

const BtnExit = (props) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('app-store');
    navigate('/');
  };

  return (
    <div id='btn-exit-content' className='d-flex justify-content-end p-2'>
      <button
        onClick={() => handleLogout()}
        className='btn btn-exit btn-sm text-uppercase'
      >
        <span>Sair</span>
      </button>
    </div>
  );
};

export default BtnExit;
