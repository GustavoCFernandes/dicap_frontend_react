import React, { useState } from 'react';
import { DateTime } from 'luxon';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';
import {
  graphCalendar,
  graphCreateEvent,
  graphDeleteEvent,
} from '../../services/graph';
import { useStore } from '../../stores/index';
import HeaderCalendar from '../Calendar/HeaderCalendar.jsx';
import {
  updatePointsStudent,
  updateNumberAppointmentsStudent,
} from '../../services/students';
import Swal from 'sweetalert2';
import { sendMessageWhatsapp } from '../../services/whatsapp';
import { sendDataGoogleSheets } from '../../services/googleSheets.ts';
import { modalOverlayStyle, modalStyle } from './styles.ts';
import { showEventTooltip } from '../../utils/showEventTooltip.ts';
import {
  messageCreateNewEvent,
  messageDeleteEvent,
  ErrorAlert,
} from '../../utils/messageEvent.ts';
import Loader from '../../components/Loader.jsx';
import TimeSelector from './components/TimeSelector.jsx';
import useCalendarPolling from '../../hooks/useCalendarPolling';
import { FilterEventsCalendar } from '../../utils/filterEventsCalendar.ts';
import {
  pickTeacherByPreference,
  filterByName,
} from '../../utils/pickTeacherByPreference.ts';
import {
  fetchAllUnavailableTimes,
  fetchAllUnavailableTimesByName,
} from '../../utils/filterTeachersUnavailableTimes.ts';

const Calendar = () => {
  const teacherId = process.env.REACT_APP_ID_MICROSFOT_AZURE;
  let stutentName = 'Estudante';
  let enterprise = 'Empresa';
  let fullNameEvent = '';
  const { user, setUser, teacherUnavailableTimes } = useStore();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');
  const [actionType, setActionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
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

  const fetchEvents = React.useCallback(async () => {
    try {
      const events = await graphCalendar(teacherId);

      const normalize = (str) => str?.trim().toLowerCase();

      const formatted = events.value.map((event) => {
        const isUnavailable =
          normalize(event.subject) !== normalize(fullNameEvent);

        return {
          id: event.id,
          //title: isUnavailable ? 'Indisponível' : event.subject,
          title: isUnavailable ? event.subject : event.subject,
          start: DateTime.fromISO(event.start.dateTime, { zone: 'utc' })
            .setZone('America/Sao_Paulo')
            .toISO(),
          end: DateTime.fromISO(event.end.dateTime, { zone: 'utc' })
            .setZone('America/Sao_Paulo')
            .toISO(),
        };
      });

      const unavailableTimes = await fetchAllUnavailableTimes();
      const combinedBusySchedule = [...unavailableTimes, ...formatted];

      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('tipo'); // ex: ?tipo=teams
      const filtered = FilterEventsCalendar(combinedBusySchedule);

      //setEvents(filtered);
      //setEvents(formatted); // agenda teams todos professores sem horários indisponíveis
      //setEvents(unavailableTimes); // horários indisponíveis de todos professores
      //setEvents(combinedBusySchedule); // agenda teams todos professores + horários indisponíveis de todos professores
      switch (typeParam) {
        case 'teams':
          setEvents(formatted);
          break;
        case 'indisponivel':
          setEvents(unavailableTimes);
          break;
        case 'teamsEindisponivel':
          setEvents(combinedBusySchedule);
          break;
        default:
          setEvents(filtered); // Sem parâmetro ou valor desconhecido
      }

      setShowCalendar(true);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    }
  }, [teacherId, fullNameEvent]);

  useCalendarPolling(fetchEvents, 3000, [teacherId]);

  const handleCreateEvent = async () => {
    setIsSubmitting(true);
    try {
      const now = DateTime.local().plus({ hours: 2 });
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
          'O horário do evento deve ser agendado com pelo menos 2 horas de antecedência.'
        );
        return;
      }

      const isConflictWithBusySchedule = events.some((e) => {
        const existingStart = DateTime.fromISO(e.start, { zone: 'utc' });
        const existingEnd = DateTime.fromISO(e.end, { zone: 'utc' });
        const newStartLocal = DateTime.fromISO(newEvent.start, { zone: 'utc' });
        const newEndLocal = DateTime.fromISO(newEvent.end, { zone: 'utc' });

        //console.log('newStart:', newStartLocal.toISO());
        //console.log('newEnd:', newEndLocal.toISO());
        //console.log('existingStart:', existingStart.toISO());
        //console.log('existingEnd:', existingEnd.toISO());

        return (
          (newStartLocal >= existingStart && newStartLocal < existingEnd) ||
          (newEndLocal > existingStart && newEndLocal <= existingEnd) ||
          (newStartLocal < existingEnd && newEndLocal > existingStart)
        );
      });

      const unavailableTimesByNames = await fetchAllUnavailableTimesByName();

      const teachersPick = [
        { name: 'Jurandir Ferreira', preference: 5 },
        { name: 'Renêe Sato', preference: 2 },
        { name: 'Marlon Fernandes', preference: 1 },
      ];

      const chosenTeacher = pickTeacherByPreference(teachersPick);

      const teacherUnavailabilitySchedule = filterByName(
        unavailableTimesByNames,
        chosenTeacher
      );
      console.log(
        'teacherUnavailabilitySchedule:',
        teacherUnavailabilitySchedule
      );

      if (isConflictWithBusySchedule) {
        ErrorAlert('Este horário já está ocupado.');
        return;
      }

      if (true) return;

      // Verifica se o horário conflita com os horários indisponíveis do professor
      const isUnavailable = teacherUnavailableTimes?.some((time) => {
        const unavailableStart = DateTime.fromISO(time.start).toISO();
        const unavailableEnd = DateTime.fromISO(time.end).toISO();

        return (
          (newStart.toISO() >= unavailableStart &&
            newStart.toISO() < unavailableEnd) ||
          (newEnd.toISO() > unavailableStart &&
            newEnd.toISO() <= unavailableEnd) ||
          (newStart.toISO() <= unavailableStart &&
            newEnd.toISO() >= unavailableEnd)
        );
      });

      if (isUnavailable) {
        ErrorAlert('Este horário não está disponível para agendamento.');
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
        attendees: [
          {
            emailAddress: {
              address: user.email,
            },
            type: 'required',
          },
        ],
        location: {
          displayName: 'Microsoft Teams',
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
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
        await sendMessageWhatsapp(messageNewEvent, user.id_group_whatsapp);
        try {
          await sendDataGoogleSheets(messageNewEvent);
        } catch (err) {
          console.warn('Erro ao enviar para o Google Sheets (ignorado):', err);
        }
      }

      const newPoints = user.points - pointsToDeduct;
      // Atualiza os pontos do estudante
      await updatePointsStudent({ userId: user.id, points: newPoints });
      // Atualiza o número de agendamentos
      const addNewNumberAppointments = user.number_appointments + 1;
      await updateNumberAppointmentsStudent({
        userId: user.id,
        number_appointments: addNewNumberAppointments,
      }).then(() => {
        user.number_appointments = addNewNumberAppointments;
      });

      // Atualiza o estado do usuário no store
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

  const handleDeleteEvent = async (eventCalendarId) => {
    try {
      //const threeHours = 300;
      const thoHours = 180;

      const matching = await graphCalendar(teacherId);
      const eventToDelete = matching.value.find(
        (event) => event.id === eventCalendarId
      );

      if (!eventToDelete) {
        ErrorAlert('Evento não encontrado.');
        return;
      }

      // Verificação de 2 horas de antecedência para deletar
      const now = DateTime.local();
      const eventStart = DateTime.fromISO(eventToDelete.start.dateTime);
      const diffInMinutes = eventStart.diff(now, 'minutes').minutes;

      if (diffInMinutes < thoHours) {
        ErrorAlert(
          'Você só pode cancelar eventos com pelo menos 2 horas de antecedência.'
        );
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

        // Atualiza o número de agendamentos
        const removeNewNumberAppointments = user.number_appointments - 1;
        await updateNumberAppointmentsStudent({
          userId: user.id,
          number_appointments: removeNewNumberAppointments,
        }).then(() => {
          setUser({
            ...user,
            number_appointments: removeNewNumberAppointments,
          });
        });

        const deleteMsg = messageDeleteEvent(eventToDelete);
        if (deleteMsg) {
          console.log('deleteMsg', deleteMsg);
          await sendMessageWhatsapp(deleteMsg, user.id_group_whatsapp);
          try {
            await sendDataGoogleSheets(deleteMsg);
          } catch (err) {
            console.warn(
              'Erro ao enviar para o Google Sheets (ignorado):',
              err
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
      ErrorAlert('Erro ao excluir evento.');
    }
  };

  return (
    <div id='calendar-content'>
      <HeaderCalendar />
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2>Novo Agendamento</h2>

            <TimeSelector
              selectedDate={newEvent.start}
              onChange={(newStart) => {
                const startDate = DateTime.fromISO(newStart);
                const endDate = DateTime.fromISO(newEvent.end);

                // Set end time to 30 minutes after start time if:
                // 1. End time is not set yet
                // 2. End time is before or equal to start time
                // 3. End time is on a different day
                const shouldAdjustEnd =
                  !newEvent.end ||
                  endDate <= startDate ||
                  endDate.toISODate() !== startDate.toISODate();

                const newEnd = shouldAdjustEnd
                  ? startDate
                      .plus({ minutes: 30 })
                      .toFormat("yyyy-MM-dd'T'HH:mm")
                  : endDate
                      .set({
                        year: startDate.year,
                        month: startDate.month,
                        day: startDate.day,
                      })
                      .toFormat("yyyy-MM-dd'T'HH:mm");

                setNewEvent({
                  ...newEvent,
                  start: newStart,
                  end: newEnd,
                });
              }}
              label='Horário de Início'
              isShowData={true}
            />

            <TimeSelector
              selectedDate={newEvent.end}
              onChange={(newEnd) => {
                const startDate = DateTime.fromISO(newEvent.start);
                const endDate = DateTime.fromISO(newEnd);

                if (endDate <= startDate) {
                  const adjustedEnd = startDate
                    .plus({ minutes: 30 })
                    .set({
                      year: startDate.year,
                      month: startDate.month,
                      day: startDate.day,
                    })
                    .toFormat("yyyy-MM-dd'T'HH:mm");

                  setNewEvent({
                    ...newEvent,
                    end: adjustedEnd,
                  });
                } else {
                  const adjustedEnd = endDate
                    .set({
                      year: startDate.year,
                      month: startDate.month,
                      day: startDate.day,
                    })
                    .toFormat("yyyy-MM-dd'T'HH:mm");

                  setNewEvent({
                    ...newEvent,
                    end: adjustedEnd,
                  });
                }
              }}
              label='Horário de Término'
            />

            {actionType === 'create' && (
              <button
                className='btn btn-primary m-3'
                onClick={handleCreateEvent}
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

      <div>
        {showCalendar ? (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='timeGridWeek'
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
            // Desabilita a seleção de datas passadas
            //validRange={{
            //  start: DateTime.now().toISODate(),
            //}}
            eventDidMount={showEventTooltip}
            nowIndicator={true}
            height='auto'
            eventColor='#ec775e'
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
            eventClick={async (info) => {
              // Verifica se o evento é do usuário
              if (info.event.title === 'Indisponível') {
                await ErrorAlert('Esse horário não está disponível.');
                setShowChoiceModal(false);
                return;
              }

              if (info.event.title !== fullNameEvent) {
                ErrorAlert('Você só pode excluir seus próprios eventos.');
                setShowChoiceModal(false);
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
                  handleDeleteEvent(info.event.id);
                }
              });
            }}
          />
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default Calendar;
