import { DateTime } from 'luxon';
import Swal from 'sweetalert2';

export function extractEventTimeDelete(event) {
  const start = DateTime.fromISO(event.start.dateTime, {
    zone: event.start.timeZone || 'utc',
  }).minus({ hours: 3 });
  const end = DateTime.fromISO(event.end.dateTime, {
    zone: event.end.timeZone || 'utc',
  }).minus({ hours: 3 });

  const day = start.toFormat('dd/LL/yy');
  const startTime = start.toLocaleString(DateTime.TIME_SIMPLE);
  const endTime = end.toLocaleString(DateTime.TIME_SIMPLE);

  return { day, start: startTime, end: endTime };
}

export function extractEventDateTime(newStart) {
  return newStart.toFormat(
    'dd/LL/yy'
  )
}

export function messageCreateNewEvent(newStart, newEnd, fullNameEvent, teacher) {
  return `${fullNameEvent} agendou uma nova aula no dia ${newStart.toFormat(
    'dd/LL/yy'
  )} das ${newStart.toLocaleString(
    DateTime.TIME_SIMPLE
  )} às ${newEnd.toLocaleString(DateTime.TIME_SIMPLE)} com ${teacher}.`;
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

export async function ErrorAlert(msg: string) {
  await Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: msg,
  });
}
