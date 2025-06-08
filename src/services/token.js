const urlBackend = process.env.REACT_APP_BASE_URL_BACKEND;

export async function createTokenSystem(email) {

  if (!email) {
    throw new Error('Necessário passar email');
  }

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  console.log('email:', email)

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ email }),
  };

  return fetch(`${urlBackend}/token/create`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao criar token');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}
