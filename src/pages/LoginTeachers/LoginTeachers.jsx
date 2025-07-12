import { useMutation } from '@tanstack/react-query';
import { loginTeacher } from '../../services/teachers';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../stores';
import {
  callMsGraph,
  generetedAccessTokenGraphToBakend,
} from '../../services/graph';
import { useEffect, useState } from 'react';
//import { validateEmail } from '../../utils/validateEmail';

const LoginTeachers = () => {
  const teacherId = process.env.REACT_APP_ID_MICROSFOT_AZURE;
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const { setTeacherLoginPrivate, setLoading } = useStore();

  function RequestProfileData() {
    setLoading(true);
    generetedAccessTokenGraphToBakend()
      .then((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        callMsGraph(response.accessToken, teacherId).then((response) => {
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error('Erro ao obter token:', error);
      });
  }

  useEffect(() => {
    RequestProfileData();
  }, []);

  const loginMutation = useMutation({
    mutationFn: loginTeacher,
    onSuccess: (response) => {
      if (response?.user) {
        localStorage.setItem('token-teacher-login', response.token);
        setTeacherLoginPrivate(response?.user);
      }

      if (response?.auth) {
        navigate('/agenda/professor/privado');
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    setEmailError(false);

    //if (!validateEmail(email)) {
    //  setEmailError(true);
    //  return;
    //}

    loginMutation.mutate({ email, password });
  };

  return (
    <div className='login-content-teachers'>
      <form onSubmit={handleSubmit} className='login-form'>
        <div className='mb-5'>
          <img width='200' src='/imgs/logo_positivo.svg' alt='Logo Dicap' />
          <h3>Login do Professor</h3>
        </div>

        <div>
          <input
            type='text'
            placeholder='E-mail de usuário'
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
          />
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Senha'
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
            required
          />
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: 'absolute',
              right: '0',
              top: '0',
              width: '40px',
              height: '100%',
              background: 'none',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
            <img
              src={`/imgs/icons/password/${showPassword ? 'hide' : 'show'}.png`}
              className='card-img-top'
              alt='Icone'
            />
          </button>
        </div>

        {emailError && <p className='text-danger'>Digite um e-mail válido.</p>}

        {loginMutation.isError && (
          <p className='text-danger'>Login e senha inválidos.</p>
        )}

        <div className='btn-login'>
          <button type='submit' disabled={loginMutation.isPending}>
            <strong>
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </strong>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginTeachers;
