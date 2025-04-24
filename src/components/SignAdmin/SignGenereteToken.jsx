import React from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { SignInButton } from './SignInButton';
import { SignOutButton } from './SignOutButton';

const SignGenerateToken = () => {
  const isAuthenticated = useIsAuthenticated();
  const showBtnSignOut = false;

  return (
    <div bg='primary' variant='dark' className='navbarStyle'>
      <a className='navbar-brand' href='/'>
        Microsoft Identity Platform
      </a>

      <h3>{isAuthenticated ? 'Logado' : 'Precisa logar novamente'}</h3>
      <a href='/agenda'>Ir para agenda</a>
      <div>{isAuthenticated ? '' : <SignInButton />}</div>

      {showBtnSignOut && (
        <div>
          <SignOutButton />
        </div>
      )}
    </div>
  );
};

export default SignGenerateToken;
