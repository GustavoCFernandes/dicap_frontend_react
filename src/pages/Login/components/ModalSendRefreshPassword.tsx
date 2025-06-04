import React, { useState } from 'react';
import { useStore } from '../../../stores/index';
import Swal from 'sweetalert2'
import { validateEmail } from '../../../utils/validateEmail.ts'

export const ModalSendRefreshPassword = ({ onClose }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [email, setEmail] = useState('');
  const { setLoading } = useStore();


  const handleSend = async () => {

    if (!validateEmail(email)) {
      Swal.fire({
        title: 'E-mail inválido!',
        text: 'Por favor, insira um e-mail válido. Colque um e-mail no formato correto algo como: exemplo@exemplo.com',
        icon: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      // await forgotPassword({ email: resetEmail }); // Aqui você faz o envio real
      Swal.fire({
        title: 'E-mail enviado com sucesso!',
        text: 'E-mail enviado com sucesso, verifique em sua caixa de entrada.',
        icon: 'success',
    })
    } catch (err) {
        Swal.fire({
            title: 'Erro ao enviar E-mail!',
            text: 'Ocorreu um erro ao enviar o e-mail de redefinição. Por favor, tente novamente mais tarde.',
            icon: 'error',
        })
    } finally {
      setLoading(false);
    }
  };

    function setResetSent (arg0: boolean) {
        throw new Error('Function not implemented.')
    }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div>
         <img width='200' src='/imgs/logo_positivo.svg' alt='Logo Dicap' />
        </div>
        <h4 className='text-black mt-4'>Redefinir senha</h4>
        <div className='text-black px-5 py-2'>
         <p className='text-black'>Informe seu e-mail para receber instruções de redefinição.</p>
        </div>
        <div>
            <input
                className='p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                type='text'
                id='email'
                required
                placeholder='E-mail de usuário'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className='btn btn-first' type="button" onClick={handleSend}>
            Enviar
          </button>
          <button
            className='btn btn-second'
            type="button"
            onClick={() => {
              onClose();
              setResetEmail('');
              setResetSent(false);
            }}
            style={{ marginLeft: '1rem' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
