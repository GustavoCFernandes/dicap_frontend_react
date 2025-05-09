const urlScriptSheets = process.env.REACT_APP_API_GOOGLE_SHEETS_URL_SCRIPT as string;

export async function sendDataGoogleSheets(event: string) {
  const headers = new Headers();
  headers.append('Content-Type', 'text/plain;charset=utf-8');
  headers.append('Access-Control-Allow-Origin', '*');

  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify({ evento: event }),
  };

  return fetch(urlScriptSheets, options)
    .then((response) => {
      if (!response.ok) throw new Error('Erro ao enviar');
      return response.text();
    })
    .catch((err) => {
      console.error('Erro:', err);
      throw err;
    });
}
