import React, { useState } from 'react';
import { loginStudent } from '../../services/students';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../stores/index';
import { ModalSendRefreshPassword } from './components/ModalSendRefreshPassword.tsx';
import { validateEmail } from '../../utils/validateEmail.ts';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState(false);
  const { setLoading, setUser } = useStore();

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      email,
      password,
    };

    if (!validateEmail(email)) {
      setErrorLogin(true);
      setLoading(false);
      return;
    }

    loginStudent(formData)
      .then((response) => {
        if (response.user) {
          setUser(response.user);
          localStorage.setItem('token', response.token);
        }

        if (response.auth) {
          navigate('/agenda');
        }
      })
      .catch((error) => {
        console.error('Login failed:', error);
        setErrorLogin(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className='login-content'>
      <form onSubmit={handleLogin} className='login-form'>
        <div className='mb-5'>
          <img width='200' src='/imgs/logo_positivo.svg' alt='Logo Dicap' />
          <h3>Login do Aluno</h3>
        </div>

        <div>
          <input
            type='text'
            id='email'
            required
            placeholder='E-mail de usuário'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id='password'
            required
            placeholder='Senha'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: 'absolute',
              border: '1px solid #ccc',
              background: 'none',
              right: '0',
              top: '0',
              width: '40px',
              height: '100%',
              cursor: 'pointer',
            }}
          >
            {showPassword ? (
              <img
                src='/imgs/icons/password/hide.png'
                className='card-img-top'
                alt='Icone'
              ></img>
            ) : (
              <img
                src='/imgs/icons/password/show.png'
                className='card-img-top'
                alt='Icone'
              ></img>
            )}
          </button>
        </div>

        {errorLogin && (
          <div>
            <p className='text-danger'>Login e senha inválidos.</p>
          </div>
        )}

        <div className='btn-login'>
          <button type='submit'>
            <strong>Entrar</strong>
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button
            type='button'
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
            onClick={() => setShowForgotPassword(true)}
          >
            Esqueci minha senha
          </button>
        </div>

      </form>

      {showForgotPassword && (<ModalSendRefreshPassword onClose={() => setShowForgotPassword(false)} />)}

    </div>
  );
};

export default Login;
