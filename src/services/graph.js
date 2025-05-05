import { graphApplicationConfig } from '../authConfig';
/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken
 */

function getToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Access token não encontrado');
  return token;
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
  const params = `?startDateTime=2025-05-05T00:00:00Z
        &endDateTime=2025-05-11T23:59:59Z
        &$filter=isCancelled eq false
        &$orderby=start/dateTime desc
        &$top=500`;

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


