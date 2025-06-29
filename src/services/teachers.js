
// services/auth.js

const urlBackend = process.env.REACT_APP_BASE_URL_BACKEND

export async function loginTeacher({ email, password }) {
  const response = await fetch(`${urlBackend}/login/teacher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer login');
  }

  return response.json();
}

export async function listScheduledEvents() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(
    `${process.env.REACT_APP_BASE_URL_BACKEND}/list/event/calendar`,
    options
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao buscar eventos');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}

export async function listTeachers() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(
    `${process.env.REACT_APP_BASE_URL_BACKEND}/teachers/list`,
    options
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao buscar lista de professores');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}

export async function listUnavailabilityTeachersService() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(
    `${process.env.REACT_APP_BASE_URL_BACKEND}/teachers/unavailability/all/list`,
    options
  )
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

export async function createUnavailabilityTeachersService(event) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify([event]),
  };

  return fetch(
    `${process.env.REACT_APP_BASE_URL_BACKEND}/teachers/unavailability/all/create`,
    options
  )
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



