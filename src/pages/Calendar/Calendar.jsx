import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';
import { DateTime } from 'luxon';
import {
  graphCalendar,
  graphCreateEvent,
  graphDeleteEvent,
} from '../../services/graph';
import { useStore } from '../../stores/index';
import BtnBackChoiceTeacher from '../../components/BtnBackChoiceTeacher';
import { updatePointsStudent } from '../../services/students';
import Swal from 'sweetalert2';
import { sendMessageWhatsapp } from '../../services/whatsapp';

const Calendar = () => {
  let stutentName = 'Estudante';
  let enterprise = 'Empresa';
  let fullNameEvent = '';
  const { setLoading, user, setUser } = useStore();
  const teacherId = process.env.REACT_APP_TEACHER_ID_1;
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');
  const [actionType, setActionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    subject: '',
    start: '',
    end: '',
  });

  if (user) {
    stutentName = user.name;
    enterprise = user.enterprise;
    fullNameEvent = `${stutentName}/${enterprise} (SA)`;
  }

  function ErrorAlert(msg) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: msg,
    });
  }

  function messageCreateNewEvent(newStart, newEnd, fullNameEvent) {
    return `${fullNameEvent} agendou uma nova aula no dia ${newStart.toFormat(
      'dd/LL/yy'
    )} das ${newStart.toLocaleString(
      DateTime.TIME_SIMPLE
    )} às ${newEnd.toLocaleString(DateTime.TIME_SIMPLE)}.`;
  }

  function messageDeleteEvent(event) {
    const start = DateTime.fromISO(event.start.dateTime, {
      zone: 'utc',
    }).setZone('America/Sao_Paulo');
    const end = DateTime.fromISO(event.end.dateTime, { zone: 'utc' }).setZone(
      'America/Sao_Paulo'
    );

    return `${event.subject} cancelou a aula do dia ${start.toFormat(
      'dd/MM/yy'
    )} das ${start.toFormat('HH:mm')} às ${end.toFormat('HH:mm')}.`;
  }

  // Buscar eventos do Graph
  const fetchEvents = React.useCallback(async () => {
    try {
      const data = await graphCalendar(teacherId);

      const formatted = data.value.map((event) => ({
        id: event.id,
        title: event.subject,
        start: DateTime.fromISO(event.start.dateTime, { zone: 'utc' })
          .setZone('America/Sao_Paulo')
          .toISO(),
        end: DateTime.fromISO(event.end.dateTime, { zone: 'utc' })
          .setZone('America/Sao_Paulo')
          .toISO(),
      }));

      setEvents(formatted);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    }
  }, [teacherId]);

  useEffect(() => {
    setLoading(false);
    fetchEvents();
  }, [fetchEvents, setLoading]);

  // Criar evento via Graph
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const now = DateTime.local().plus({ hours: 3 });
      const newStart = DateTime.fromISO(newEvent.start);
      const newEnd = DateTime.fromISO(newEvent.end);

      const durationInMinutes = newEnd.diff(newStart, 'minutes').minutes;
      const pointsToDeduct = Math.ceil(durationInMinutes / 30);

      if (user.points < 1) {
        ErrorAlert('Você não tem mais agendamentos disponíveis esse mês.');
        return;
      }

      if (user.points < pointsToDeduct) {
        ErrorAlert('Você não tem tantas horas no pacote.');
        return;
      }

      if (newStart < now) {
        ErrorAlert(
          'O horário do evento deve ser com pelo menos 3 horas de antecedência.'
        );
        return;
      }

      const isConflict = events.some((e) => {
        const existingStart = DateTime.fromISO(e.start).toISO();
        const existingEnd = DateTime.fromISO(e.end).toISO();

        return (
          (newStart.toISO() >= existingStart &&
            newStart.toISO() < existingEnd) ||
          (newEnd.toISO() > existingStart && newEnd.toISO() <= existingEnd) ||
          (newStart.toISO() <= existingStart && newEnd.toISO() >= existingEnd)
        );
      });

      if (isConflict) {
        ErrorAlert('Já existe um evento agendado nesse horário.');
        return;
      }

      const eventCalendar = {
        subject: fullNameEvent,
        start: {
          dateTime: newStart.toUTC().toISO(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: newEnd.toUTC().toISO(),
          timeZone: 'UTC',
        },
      };

      const messageNewEvent = messageCreateNewEvent(
        newStart,
        newEnd,
        fullNameEvent
      );

      const eventCreate = await graphCreateEvent(eventCalendar, teacherId);
      if (eventCreate.error) {
        ErrorAlert('Erro ao criar evento.');
        return;
      } else {
        console.log(messageNewEvent);
        await sendMessageWhatsapp(messageNewEvent, user.phone);
      }

      console.log('eventCreate:', eventCreate);

      const newPoints = user.points - pointsToDeduct;
      await updatePointsStudent({ userId: user.id, points: newPoints });
      setUser({ ...user, points: newPoints });

      setShowModal(false);
      setNewEvent({ subject: '', start: '', end: '' });
      fetchEvents();
    } catch (err) {
      ErrorAlert('Erro ao criar evento.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventCalendarId) => {
    try {
      const matching = await graphCalendar(teacherId);
      const eventToDelete = matching.value.find(
        (event) => event.id === eventCalendarId
      );

      if (!eventToDelete) {
        ErrorAlert('Evento não encontrado.');
        return;
      }
      const result = await graphDeleteEvent(teacherId, eventCalendarId);

      if (result) {
        Swal.fire({
          title: 'Deletado!',

          text: 'Evento excluído com sucesso.',
          icon: 'success',
        }).then(() => {
          fetchEvents();
        });

        const deleteMsg = messageDeleteEvent(eventToDelete);
        await sendMessageWhatsapp(deleteMsg, user.phone);
        console.log(deleteMsg);
      }
    } catch (error) {
      console.error(error);
      ErrorAlert('Erro ao excluir evento.');
    }
  };

  return (
    <div id='calendar-content'>
      <BtnBackChoiceTeacher />
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2>Novo Agendamento</h2>
            <h5 className='my-3'>{fullNameEvent}</h5>
            <input
              className='mb-2'
              type='datetime-local'
              value={newEvent.start}
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: e.target.value })
              }
            />
            <br />
            <input
              className='mb-2'
              type='datetime-local'
              value={newEvent.end}
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: e.target.value })
              }
            />
            <br />
            {actionType === 'create' && (
              <button
                className='btn btn-primary m-3'
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agendando...' : 'Agendar'}
              </button>
            )}

            <button
              className='btn btn-danger m-3'
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {showChoiceModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle} className='d-flex flex-column'>
            <h2>Você deseja agendar uma nova aula?</h2>
            <button
              className='btn btn-primary m-2'
              onClick={() => {
                setNewEvent({
                  subject: '',
                  start: tempStart,
                  end: tempEnd,
                });
                setActionType('create');
                setShowModal(true); // Abre o modal de horário
                setShowChoiceModal(false); // Fecha o modal de escolha
              }}
            >
              Agendar aula
            </button>
            <button
              className='btn btn-danger m-2'
              onClick={() => setShowChoiceModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        events={events}
        locales={allLocales}
        locale='pt-br'
        timeZone='America/Sao_Paulo'
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        validRange={{
          start: DateTime.now().toISODate(),
        }}
        nowIndicator={true}
        height='auto'
        dateClick={(info) => {
          const start = DateTime.fromISO(info.dateStr)
            .set({ hour: 7, minute: 0 })
            .toFormat("yyyy-MM-dd'T'HH:mm");

          const end = DateTime.fromISO(info.dateStr)
            .set({ hour: 8, minute: 0 })
            .toFormat("yyyy-MM-dd'T'HH:mm");

          setTempStart(start);
          setTempEnd(end);
          setShowChoiceModal(true);
        }}
        eventClick={(info) => {
          // Verifica se o evento é do usuário
          if (info.event.title !== fullNameEvent) {
            ErrorAlert('Você só pode excluir seus próprios eventos.');
            return;
          }

          Swal.fire({
            title: `Deseja excluir o compromisso desta data?`,
            text: 'Esta ação vai excluir o evento selecionado.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir evento desta data',
          }).then((result) => {
            if (result.isConfirmed) {
              handleDelete(info.event.id);
            }
          });
        }}
      />
    </div>
  );
};

// Estilos simples do modal
const modalOverlayStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  maxWidth: '400px',
  width: '100%',
};

export default Calendar;
