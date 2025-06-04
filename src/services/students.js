//export async function loginStudent(accessToken) {
//    const headers = new Headers();
//    const bearer = `Bearer ${accessToken}`;
//
//    headers.append("Authorization", bearer);
//
//    const options = {
//        method: "GET",
//        headers: headers
//    };
//
//    return fetch(process.env.BASE_URL_BACKEND, options)
//      .then((response) => response.json())
//      .catch((error) => console.log(error));
//}

const urlBackend = process.env.REACT_APP_BASE_URL_BACKEND;

export async function loginStudent({ email, password }) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ email, password }),
  };

  return fetch(`${urlBackend}/login`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao fazer login');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}

export async function updatePasswordStudent({ userId, newPassword }) {

  if (!userId || !newPassword) {
    throw new Error('userId e password são obrigatórios');
  }

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ userId, newPassword }),
  };

  return fetch(`${urlBackend}/students/update/password`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar senha');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}

export async function updatePointsStudent({ userId, points }) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const pointsNumber = Number(points);

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ userId, points: pointsNumber }),
  };

  return fetch(`${urlBackend}/students/points`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar pontos');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}

export async function updateNumberAppointmentsStudent({
  userId,
  number_appointments,
}) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const _number_appointments = Number(number_appointments);

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ userId, number_appointments: _number_appointments }),
  };

  return fetch(`${urlBackend}/students/number/appointments`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar quantidade de agendamentos');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}



