import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useStore } from '../../stores';
import ButtonExitTeacherLogin from '../../components/ButtonExitTeacherLogin'
import { listScheduledEvents } from '../../services/teachers'
import { useEffect, useState } from 'react';
import tippy from 'tippy.js'

export default function CalendarTeacher() {
  const { teacherLoginPrivate } = useStore();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const response = await listScheduledEvents();
        const allEvents = response.data;

        // Filtra apenas os eventos do responsável
        const filtered = allEvents.filter(
          (item) =>
            item.responsible === 'Jurandir Ferreira' &&
            item.type === 'create' &&
            item.event !== 'Test/Dicap Dev (SA)'
        );

        const formatted = filtered.map((item) => {
          const [day, month, year] = item.date.split('/').map(Number);

          // Função para converter hora no formato 12h com AM/PM para [hour, minute]
          const parseTime = (timeStr: string) => {
            const [time, modifier] = timeStr.trim().split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (modifier?.toLowerCase() === 'pm' && hours < 12) hours += 12;
            if (modifier?.toLowerCase() === 'am' && hours === 12) hours = 0;

            return [hours, minutes];
          };

          const [startHour, startMinute] = parseTime(item.start);
          const [endHour, endMinute] = parseTime(item.end);

          const start = new Date(2000 + year, month - 1, day, startHour, startMinute); // ano 2000 + 25 = 2025
          const end = new Date(2000 + year, month - 1, day, endHour, endMinute);

          return {
            id: item.id,
            title: item.event,
            start: start.toISOString(),
            end: end.toISOString(),
          };
        });


        setEvents(formatted);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    };

    fetchAndFilterEvents();
  }, []);

  return (
    <div id='calendar-content' style={{ margin: '70px auto', maxWidth: '80rem' }}>
      <ButtonExitTeacherLogin />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Agenda {teacherLoginPrivate?.name}
      </h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="pt-br"
        height="auto"
        events={events}
        eventDidMount={({ el, event }) => {
          tippy(el, {
            content: `
              <strong>${event.title}</strong><br/>
              Início: ${new Date(event.start!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<br/>
              Fim: ${new Date(event.end!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            `,
            allowHTML: true,
            placement: 'top',
          });
        }}
        dateClick={(info) => alert(`Você clicou em: ${info.dateStr}`)}
      />
    </div>
  );
}
