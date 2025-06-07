import React, { useState } from 'react';
import { useStore } from '../../stores/index';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { updatePasswordStudent } from '../../services/students'
import { useLocation } from 'react-router-dom';
import ButtonBack from '../../components/ButtonBack'

const UpdatePassword = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <- aqui!
  const [errorValidate, setErrorValidate] = useState(false);
  const { user, setLoading } = useStore();

  const validatePasswords = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword.length < 6) {
      Swal.fire({
        title: 'Senha inválida',
        text: 'A nova senha deve ter pelo menos 6 caracteres.',
        icon: 'error',
      });
      setLoading(false);
      return false;
    }

    if (password !== newPassword) {
      setErrorValidate(true);
      setLoading(false);
      return false;
    }

    setErrorValidate(false);
    setLoading(false);

    await updatePasswordStudent({ userId: user.id, newPassword }).then((res) => {
      console.log('Resposta do servidor:', res);
      Swal.fire({
        title: 'Senha atualizada!',
        text: 'Senha atualizada com sucesso.',
        icon: 'success',
      }).then(() => {
        navigate('/agenda');
      });
      return res;
    });

    return true;
  };

  return (
    <div className='login-content'>
      {!props.toEmail && <ButtonBack />}
      <form onSubmit={validatePasswords} className='login-form'>
        <div className='mb-5'>
          <h3>Atualizar senha</h3>
        </div>

        <div>
          <input
            type={showPassword ? 'text' : 'password'}
            id='password'
            required
            placeholder='Senha'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id='newPassword'
            required
            placeholder='Senha'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

        {errorValidate && (
          <div>
            <p className='text-danger'>Senhas precisam ser iguais.</p>
          </div>
        )}

        <div className='btn-login'>
          <button type='submit'>
            <strong>Atualizar</strong>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;
