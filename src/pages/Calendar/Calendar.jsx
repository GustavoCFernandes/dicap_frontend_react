// React e bibliotecas de terceiros
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import Swal from 'sweetalert2';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';

// Componentes do projeto
import HeaderCalendar from '../Calendar/HeaderCalendar.jsx';
import Loader from '../../components/Loader.jsx';
import TimeSelector from './components/TimeSelector.jsx';

// Hooks
import useCalendarPolling from '../../hooks/useCalendarPolling';

// Stores
import { useStore } from '../../stores/index';

// Services
import {
  graphCalendar,
  graphCreateEvent,
  graphDeleteEvent,
} from '../../services/graph';
import { addEventCalendar } from '../../services/eventsCalendar.js';
import {
  listUnavailabilityTeachersService,
  createUnavailabilityTeachersService,
} from '../../services/teachers.js';
import {
  updatePointsStudent,
  updateNumberAppointmentsStudent,
} from '../../services/students';
import { sendMessageWhatsapp } from '../../services/whatsapp';
import { sendDataGoogleSheets } from '../../services/googleSheets.ts';

// Utils
import { modalOverlayStyle, modalStyle } from './styles.ts';
import { showEventTooltip } from '../../utils/showEventTooltip.ts';
import { showLoadAlert, hideLoadAlert } from '../../utils/showLoadAlert.ts';
import { FilterEventsCalendar } from '../../utils/filterEventsCalendar.ts';
import { chooseAvailableTeacher } from '../../utils/pickTeacherByPreference.ts';
import {
  extractEventDateTime,
  extractEventTimeDelete,
  messageCreateNewEvent,
  messageDeleteEvent,
  ErrorAlert,
} from '../../utils/messageEvent.ts';
import {
  fetchAllUnavailableTimes,
  fetchAllUnavailableTimesByName,
} from '../../utils/filterTeachersUnavailableTimes.ts';
import { isTimeConflict } from '../../utils/isTimeConflict.ts';
import { calculateEventPoints } from '../../utils/calculateEventPoints.ts';

const Calendar = () => {
  const teacherId = process.env.REACT_APP_ID_MICROSFOT_AZURE;
  const indisponibilidadeJurandir =
    process.env.REACT_APP_INDISPONIBILIDADE_JURANDIR_MANUAL;
  let stutentName = 'Estudante';
  let enterprise = 'Empresa';
  let fullNameEvent = '';
  const { user, setUser, teacherUnavailableTimes } = useStore();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');
  const [actionType, setActionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [horariosIndisponiveisJurandir, setHorariosIndisponiveisJurandir] =
    useState([]);

  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    subject: '',
    start: '',
    end: '',
  });
  const [forceUpdate, setForceUpdate] = useState(false);

  function alertInit() {
    Swal.fire({
      title: 'Olá, aluno!',
      text: 'Antes de iniciar o agendamento, é importante lembrar que só é possível criar ou excluir um agendamento com pelo menos 3 horas de antecedência.',
      icon: 'info',
    });
  }

  useEffect(() => {
    alertInit()
    async function fetchListUnavailabilityTeachersService() {
      const { data } = await listUnavailabilityTeachersService();
      setHorariosIndisponiveisJurandir(data);
    }

    fetchListUnavailabilityTeachersService();
  }, []);

  let additionalEvents = [...horariosIndisponiveisJurandir];

  if (indisponibilidadeJurandir !== 'true') {
    additionalEvents = [];
  }

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

      // Remove eventos temporários quando os dados reais chegarem
      const currentEvents = Array.isArray(events) ? events.filter(event => !event.id.startsWith('temp-')) : [];

      const unavailableTimes = await fetchAllUnavailableTimes();
      const combinedBusySchedule = [...unavailableTimes, ...formatted];

      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('tipo'); // ex: ?tipo=teams
      const filtered = FilterEventsCalendar(
        combinedBusySchedule,
        fullNameEvent
      );

      //setEvents(filtered);
      //setEvents(formatted); // agenda teams todos professores sem horários indisponíveis
      //setEvents(unavailableTimes); // horários indisponíveis de todos professores
      //setEvents(combinedBusySchedule); // agenda teams todos professores + horários indisponíveis de todos professores
      switch (typeParam) {
        case 'teams':
          setEvents([...formatted, ...(Array.isArray(currentEvents) ? currentEvents.filter(event => event.id.startsWith('temp-')) : [])]);
          break;
        case 'indisponivel':
          setEvents([...unavailableTimes, ...(Array.isArray(currentEvents) ? currentEvents.filter(event => event.id.startsWith('temp-')) : [])]);
          break;
        case 'teamsEindisponivel':
          setEvents([...combinedBusySchedule, ...(Array.isArray(currentEvents) ? currentEvents.filter(event => event.id.startsWith('temp-')) : [])]);
          break;
        default:
          setEvents([...filtered, ...(Array.isArray(currentEvents) ? currentEvents.filter(event => event.id.startsWith('temp-')) : [])]); // Sem parâmetro ou valor desconhecido
      }

      setShowCalendar(true);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    }
  }, [teacherId, fullNameEvent]);

  useCalendarPolling(fetchEvents, 3000, [teacherId, forceUpdate]);

  const handleCreateEvent = async () => {
    setIsSubmitting(true);
    showLoadAlert('Criando agendamento, aguarde por favor!');
    try {
      const now = DateTime.local().plus({ hours: 3 });
      const newStart = DateTime.fromISO(newEvent.start);
      const newEnd = DateTime.fromISO(newEvent.end);
      const newStartLocal = DateTime.fromISO(newEvent.start, { zone: 'utc' });
      const newEndLocal = DateTime.fromISO(newEvent.end, { zone: 'utc' });

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
          'O horário do evento deve ser agendado com pelo menos 3 horas de antecedência.'
        );
        return;
      }

      const isConflictWithBusySchedule = Array.isArray(events) && events.some((e) => {
        const existingStart = DateTime.fromISO(e.start, { zone: 'utc' });
        const existingEnd = DateTime.fromISO(e.end, { zone: 'utc' });

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

      const chosenTeacher = await chooseAvailableTeacher(
        user.teachers_preferences,
        newStartLocal,
        newEndLocal,
        unavailableTimesByNames
      );

      if (!chosenTeacher) {
        const notChosenTeacher = 'Não foi possível encontrar um professor disponível.';
        ErrorAlert(notChosenTeacher);
        console.log(notChosenTeacher);
        return;
      }

      console.log('Professor escolhido:', chosenTeacher);

      if (isConflictWithBusySchedule) {
        ErrorAlert('Este horário já está ocupado.');
        return;
      }

      // Evento padrão aceito pelo FullCalendar
      const eventDefault = {
        title: 'Indiponíveil',
        start: newStart.toISO(),
        end: newEnd.toISO(),
        color: 'red',
      };

      //testando
      /*hideLoadAlert();
      if (true) return;*/

      const createUnavailabilityTeachers =
        await createUnavailabilityTeachersService({
          ...eventDefault,
          typeEvent: 'unavailability',
        });

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

      const hasConflictWithAdditionalEvents = isTimeConflict(
        newEvent.start,
        newEvent.end,
        additionalEvents
      );

      if (hasConflictWithAdditionalEvents) {
        ErrorAlert('Este horário está indisponível para o professor Jurandir.');
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
        //emails dos participantes
        attendees: [
          {
            emailAddress: {
              address: user.email,
            },
            type: 'required',
          },
          {
            emailAddress: {
              address: user.email,
            },
            type: 'required',
          },
          {
            emailAddress: {
              address: 'agenda@dicapconsultorias.onmicrosoft.com',
            },
            type: 'required',
          },
          {
            emailAddress: {
              address: 'dicapprofessor03@dicapconsultorias.onmicrosoft.com',
            },
            type: 'required',
          },
          {
            emailAddress: {
              address: 'dicapprofessor04@dicapconsultorias.onmicrosoft.com',
            },
            type: 'required',
          },
          {
            emailAddress: {
              address: 'dicapprofessor09@dicapconsultorias.onmicrosoft.com',
            },
            type: 'required',
          },
        ],
        location: {
          displayName: 'Microsoft Teams',
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
        singleValueExtendedProperties: [
          {
            id: 'String 01234567-89ab-cdef-0123-456789abcdef Name ProfessorEscolhido',
            value: chosenTeacher,
          },
        ],
      };

      //Extraindo data formato dd/mm/aaaa
      const _extractEventDateTime = extractEventDateTime(newStart);

      await addEventCalendar({
        type: 'create',
        event: fullNameEvent,
        responsible: chosenTeacher,
        date: _extractEventDateTime,
        start: newStart.toLocaleString(DateTime.TIME_SIMPLE),
        end: newEnd.toLocaleString(DateTime.TIME_SIMPLE),
      });

      const eventCreate = await graphCreateEvent(eventCalendar, teacherId);
      if (eventCreate.error) {
        ErrorAlert('Erro ao criar evento.');
        return;
      } else {
        const messageNewEvent = messageCreateNewEvent(
          newStart,
          newEnd,
          fullNameEvent,
          chosenTeacher,
          eventCreate.onlineMeeting?.joinUrl
        );
        console.log(messageNewEvent);
        try {
          await sendMessageWhatsapp(messageNewEvent, user.id_group_whatsapp);
          await sendMessageWhatsapp(messageNewEvent, '120363399081666931@g.us'); // test
        } catch (err) {
          console.warn('Erro ao enviar mensagem (ignorado):', err);
        }
        //try {
        //  await sendDataGoogleSheets(messageNewEvent);
        //} catch (err) {
        //  console.warn('Erro ao enviar para o Google Sheets (ignorado):', err);
        //}
      }

      // Adiciona o evento localmente para atualização imediata
      const newEventLocal = {
        id: eventCreate.id || `temp-${Date.now()}`,
        title: fullNameEvent,
        start: newStart.toISO(),
        end: newEnd.toISO(),
        backgroundColor: '#ffd700', // Cor dourada para indicar evento temporário
        borderColor: '#ffd700',
        textColor: '#000',
      };

      // Atualiza o estado local imediatamente
      setEvents(prevEvents => [...prevEvents, newEventLocal]);

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

      // Atualização imediata dos eventos
      hideLoadAlert();
      showLoadAlert('Atualizando agenda...');

      // Aguarda um pouco para garantir que o evento foi criado no servidor
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Força atualização imediata
      await fetchEvents();

      // Reseta o forceUpdate para evitar atualizações desnecessárias
      setForceUpdate(prev => !prev);

      hideLoadAlert();

      // Mostra confirmação de sucesso
      Swal.fire({
        title: 'Agendamento criado com sucesso!',
        text: 'Seu evento foi adicionado à agenda.',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      ErrorAlert('Erro ao criar evento.');
      console.error(err);
      hideLoadAlert();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventCalendarId) => {
    showLoadAlert('Deletando agendamento, aguarde por favor!');
    try {
      //const threeHours = 300;
      const thoHours = 180;

      const matching = await graphCalendar(teacherId);
      //console.log('matching handleDeleteEvent:', matching);

      // Verifica se matching e matching.value existem
      if (!matching || !matching.value || !Array.isArray(matching.value)) {
        ErrorAlert('Erro ao buscar dados do evento.');
        return;
      }

      const eventToDelete = matching.value.find(
        (event) => event.id === eventCalendarId
      );

      if (!eventToDelete) {
        ErrorAlert('Evento não encontrado.');
        return;
      }

      const newPointsDelete = calculateEventPoints(eventToDelete);
      const userNewPointsDelete = user.points + newPointsDelete;
      await updatePointsStudent({
        userId: user.id,
        points: userNewPointsDelete,
      });

      // Verificação de 2 horas de antecedência para deletar
      const now = DateTime.local();

      // Verifica se o evento tem as propriedades necessárias
      if (!eventToDelete.start || !eventToDelete.start.dateTime) {
        ErrorAlert('Dados do evento incompletos.');
        return;
      }

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
          text: 'Evento excluído com sucesso. Aguarde enquanto atualizamos sua agenda.',
          icon: 'success',
          timer: 10000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          fetchEvents();
        });

        // Atualiza o número de agendamentos
        const removeNewNumberAppointments = user.number_appointments - 1;
        await updateNumberAppointmentsStudent({
          userId: user.id,
          number_appointments: removeNewNumberAppointments,
        })
          .then(() => {
            setUser({
              ...user,
              number_appointments: removeNewNumberAppointments,
              points: userNewPointsDelete,
            });
          })
          .catch(() => {
            setUser({ ...user, points: userNewPointsDelete });
          });

        // Verifica se o evento tem todas as propriedades necessárias para extração
        if (!eventToDelete.start?.dateTime || !eventToDelete.end?.dateTime || !eventToDelete.subject) {
          ErrorAlert('Dados do evento incompletos para processamento.');
          return;
        }

        const dataTimesFormated = extractEventTimeDelete(eventToDelete);

        const deleteMsg = messageDeleteEvent(eventToDelete);
        if (deleteMsg) {
          //console.log('deleteMsg', deleteMsg);
          await addEventCalendar({
            type: 'delete',
            event: fullNameEvent,
            responsible: 'Sem referencia na deleção de eventos',
            date: dataTimesFormated.day,
            start: dataTimesFormated.start,
            end: dataTimesFormated.end,
          });
          try {
            await sendMessageWhatsapp(deleteMsg, user.id_group_whatsapp);
            await sendMessageWhatsapp(deleteMsg, '120363399081666931@g.us'); // test
          } catch (err) {
            console.warn('Erro ao enviar mensagem (ignorado):', err);
          }
          try {
            await sendDataGoogleSheets(deleteMsg);
          } catch (err) {
            console.warn(
              'Erro ao enviar para o Google Sheets (ignorado):',
              err
            );
          }
        }

        // Força atualização imediata após deletar
        setForceUpdate(prev => !prev);
      }
    } catch (error) {
      console.error(error);
      ErrorAlert('Erro ao excluir evento, Tente novamente.');
    }
  };

  const [validRange, setValidRange] = useState(getValidRange());

  // Função que calcula o intervalo dinâmico
  function getValidRange() {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    return {
      end: endDate.toISOString().split('T')[0], // Só limita o futuro
    };
  }

  // Atualiza o validRange todo dia
  useEffect(() => {
    const interval = setInterval(() => {
      setValidRange(getValidRange());
    }, 60 * 60 * 1000); // Atualiza a cada 1 hora (você pode mudar para 24 horas)

    return () => clearInterval(interval);
  }, []);

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
                className='btn btn-first m-3'
                onClick={handleCreateEvent}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agendando...' : 'Agendar'}
              </button>
            )}

            <button
              className='btn btn-second m-3'
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
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
              className='btn btn-first m-2'
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
              className='btn btn-second  m-2'
              onClick={() => setShowChoiceModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div>
        {showCalendar ? (
          <div>
            <div className='calendar-header d-flex justify-content-between align-items-center mb-3'>
              <h2>Agenda</h2>
              <button
                className='btn btn-first'
                onClick={() => {
                  const now = DateTime.local().set({
                    second: 0,
                    millisecond: 0,
                  });
                  const start = now.toFormat("yyyy-MM-dd'T'HH:mm");
                  const end = now
                    .plus({ minutes: 30 })
                    .toFormat("yyyy-MM-dd'T'HH:mm");

                  setNewEvent({ subject: '', start, end });
                  setActionType('create');
                  setShowModal(true);
                }}
              >
                + Novo Evento
              </button>
            </div>

            <FullCalendar
              // remove vizuals de dias passados
              validRange={validRange}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView='timeGridWeek'
              events={[...events, ...additionalEvents]}
              locales={allLocales}
              locale='pt-br'
              timeZone='America/Sao_Paulo'
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay',
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
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default Calendar;
