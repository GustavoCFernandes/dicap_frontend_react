export async function sendMessageWhatsapp(message, phoneNumber) {
  const baseUrl = process.env.REACT_APP_BASE_URL_SERVICE_WHATSAPP;
  const instance = process.env.REACT_APP_INSTANCE_WHATSAPP;
  const apikey = process.env.REACT_APP_API_KEY_WHATSAPP;

  if (!baseUrl || !instance) {
    throw new Error(
      'URL base ou instância do WhatsApp não estão configuradas corretamente.'
    );
  }

  if (!phoneNumber || !message) {
    throw new Error('O número de telefone e a mensagem são obrigatórios.');
  }

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('apikey', apikey);

  const body = {
    number: phoneNumber,
    textMessage: {
      text: message,
    },
  };

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  };

  try {
    const response = await fetch(
      `${baseUrl}/message/sendText/${instance}`,
      options
    );

    if (!response.ok) {
      throw new Error('Erro ao enviar a mensagem');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}
