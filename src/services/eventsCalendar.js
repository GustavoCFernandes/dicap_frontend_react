 const urlBackend = process.env.REACT_APP_BASE_URL_BACKEND;

 export async function addEventCalendar({
   type,
   event,
   responsible,
   date,
   start,
   end,
   chosenTeacher,
 }) {
   try {
     const response = await fetch(`${urlBackend}/create/event/calendar`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ type, event, responsible, date, start, end, chosenTeacher }),
     });

     if (!response.ok) {
       throw new Error('Erro ao criar evento do calendário no banco');
     }

     return await response.json();
   } catch (error) {
     console.error('Erro na requisição:', error);
     throw error;
   }
 }




