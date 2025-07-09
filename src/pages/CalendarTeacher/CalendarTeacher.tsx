import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useStore } from '../../stores';
import ButtonExitTeacherLogin from '../../components/ButtonExitTeacherLogin';
import { useEffect, useState } from 'react';
import tippy from 'tippy.js';
import { graphCalendar } from '../../services/graph';
import React from 'react';
import { DateTime } from 'luxon';
import Loader from '../../components/Loader';

export default function CalendarTeacher() {
  const teacherId = process.env.REACT_APP_ID_MICROSFOT_AZURE;
  const { teacherLoginPrivate } = useStore();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await graphCalendar(teacherId);

      const filteredEvents = result.value.filter((event) =>
        event.singleValueExtendedProperties?.some(
          (prop) => prop.value === teacherLoginPrivate?.name
        )
      );

      const mappedEvents = filteredEvents.map((event) => ({
        title: event.subject,
        start: DateTime.fromISO(event.start!.dateTime, { zone: 'utc' })
          .toLocal()
          .toISO(),
        end: DateTime.fromISO(event.end!.dateTime, { zone: 'utc' })
          .toLocal()
          .toISO(),
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId, teacherLoginPrivate?.name]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div
      id='calendar-content'
      style={{ margin: '70px auto', maxWidth: '80rem' }}
    >
      <ButtonExitTeacherLogin />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Agenda {teacherLoginPrivate?.name}
      </h2>

      {loading ? (
        <Loader />
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView='timeGridWeek'
          locale='pt-br'
          height='auto'
          events={events}
          eventDidMount={({ el, event }) => {
            tippy(el, {
              content: `
              <strong>${event.title}</strong><br/>
              Início: ${new Date(event.start!).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}<br/>
              Fim: ${new Date(event.end!).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            `,
              allowHTML: true,
              placement: 'top',
            });
          }}
        />
      )}
    </div>
  );
}
