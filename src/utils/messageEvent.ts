import { DateTime } from 'luxon';
import Swal from 'sweetalert2';

export function messageCreateNewEvent(newStart, newEnd, fullNameEvent) {
  return `${fullNameEvent} agendou uma nova aula no dia ${newStart.toFormat(
    'dd/LL/yy'
  )} das ${newStart.toLocaleString(
    DateTime.TIME_SIMPLE
  )} às ${newEnd.toLocaleString(DateTime.TIME_SIMPLE)}.`;
}

export function messageDeleteEvent(event) {
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

export function ErrorAlert(msg) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: msg,
    });
  }
