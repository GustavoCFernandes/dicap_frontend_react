import React, { useState } from 'react';
import { useStore } from '../../stores/index';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <- aqui!
  const [errorValidate, setErrorValidate] = useState(false);
  const { setLoading } = useStore();

  const validatePasswords = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      password,
      newPassword,
    };

    if (password !== newPassword) {
      setErrorValidate(true);
      setLoading(false);
      return false;
    }
    setErrorValidate(false);
    setLoading(false);
    console.log('formData', formData);
    Swal.fire({
      title: 'Senha atualizada!',

      text: 'Senha atualizada com sucesso.',
      icon: 'success',
    }).then(() => {
      navigate('/agenda');
    });
    return true;
  };

  return (
    <div className='login-content'>
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
