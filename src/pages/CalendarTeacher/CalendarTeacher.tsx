import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useStore } from '../../stores';
import ButtonExitTeacherLogin from '../../components/ButtonExitTeacherLogin'

export default function CalendarTeacher() {
  const { teacherLoginPrivate } = useStore();

  const events = [
    { title: 'Aula com João', date: '2025-06-20' },
    { title: 'Reunião', date: '2025-06-22' },
  ]

  return (
    <div style={{ margin: '40px auto', maxWidth: '900px' }}>
      <ButtonExitTeacherLogin />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Agenda {teacherLoginPrivate.name}</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="pt-br"
        height="auto"
        events={events}
        dateClick={(info) => alert(`Você clicou em: ${info.dateStr}`)}
      />
    </div>
  );
}
