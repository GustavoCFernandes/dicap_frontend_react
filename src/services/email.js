import { createTokenSystem } from './token.js'

const urlSeviceEmail = process.env.REACT_APP_BASE_URL_SERVICE_EMAIL;
const urlFrontend = process.env.REACT_APP_BASE_URL_FRONTEND;

export async function sendEmailStudent({ to }) {
 const { token } = await createTokenSystem(to)

  let link = `${urlFrontend}/atualizar/senha/email?token=${token}`

  console.log('link:', link)

  if (!to) {
    throw new Error('Necessário passar email');
  }

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ to, link }),
  };

  return fetch(`${urlSeviceEmail}/send_refrash_password`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao enviar email');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}
