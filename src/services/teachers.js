
export async function listTeachers() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/teachers`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao fbuscar lista de professores');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}



