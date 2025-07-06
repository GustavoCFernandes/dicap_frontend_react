import { graphApplicationConfig } from '../authConfig';

function getToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Access token não encontrado');
  return token;
}

function getParamsGraphCalendar() {
  const today = new Date();
  const daysDisplayed = 30

  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endDate = new Date(startOfWeek);
  endDate.setDate(startOfWeek.getDate() + daysDisplayed);
  endDate.setHours(23, 59, 59, 999);

  function toISOStringNoMs(date) {
    return date.toISOString().slice(0, 19) + 'Z';
  }

  const startDateTime = toISOStringNoMs(startOfWeek);
  const endDateTime = toISOStringNoMs(endDate);

  return `?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$filter=isCancelled eq false&$top=1000&$expand=singleValueExtendedProperties($filter=(id eq 'String {01234567-89ab-cdef-0123-456789abcdef} Name ProfessorEscolhido'))`;
}

export async function generetedAccessTokenGraphToBakend() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'POST',
    headers: headers,
  };

  return fetch(
    `${process.env.REACT_APP_BASE_URL_BACKEND}/microsoft/graph/token`,
    options
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao gerar token de acesso');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Erro na requisição:', error);
      throw error;
    });
}

export async function callMsGraph(accessToken, userId) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphApplicationConfig.user(userId), options)
      .then((response) => response.json())
      .catch((error) => console.log(error));
}

export async function graphCalendar(teacherId) {
  const accessToken = getToken();

  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;
  const params = getParamsGraphCalendar();

  headers.append('Authorization', bearer);

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(graphApplicationConfig.calendarView(teacherId) + params, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function graphCreateEvent(eventCalendar, teacherId) {
  console.log('eventCalendar:', eventCalendar)
  const accessToken = getToken();

  const response = await fetch(
    graphApplicationConfig.calendarEvents(teacherId),
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`, // ajuste conforme seu auth
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventCalendar),
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao criar evento');
  }

  return await response.json();
}

export async function graphDeleteEvent(teacherId, eventCalendarId) {
 const accessToken = getToken();

  const response = await fetch(
    graphApplicationConfig.eventCalendar(teacherId, eventCalendarId),
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao excluir evento');
  }

  return true;
}


