import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <img width='200' src='/imgs/logo_positivo.svg' alt='Logo Dicap' />
      <h1 className='mt-3'>404</h1>
      <h2>Página não encontrada</h2>
      <Link className='btn btn-exit btn-sm text-uppercase mt-5' to='/'>
        Voltar para o login
      </Link>
    </div>
  );
};

export default NotFound;
