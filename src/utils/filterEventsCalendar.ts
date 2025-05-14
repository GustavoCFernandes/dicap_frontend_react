import { CalendarEventFormat } from '../types/calendarEvent';

export function FilterEventsCalendar(
  events: CalendarEventFormat[],
  count = 4
): CalendarEventFormat[] {
  const timePoints: { time: number; type: 'start' | 'end' }[] = [];

  // Etapa 1: transformar eventos em pontos de tempo
  for (const event of events) {
    timePoints.push({ time: new Date(event.start).getTime(), type: 'start' });
    timePoints.push({ time: new Date(event.end).getTime(), type: 'end' });
  }

  // Etapa 2: ordenar os pontos de tempo
  timePoints.sort((a, b) => {
    if (a.time === b.time) {
      // Prioriza fim antes de início no mesmo instante
      return a.type === 'end' ? -1 : 1;
    }
    return a.time - b.time;
  });

  const unavailableIntervals: { start: number; end: number }[] = [];
  let activeCount = 0;
  let intervalStart: number | null = null;

  // Etapa 3: percorrer os pontos e identificar intervalos com 4+ eventos simultâneos
  for (const point of timePoints) {
    if (point.type === 'start') {
      activeCount++;
      if (activeCount === count) {
        intervalStart = point.time;
      }
    } else {
      if (activeCount === count) {
        if (intervalStart !== null) {
          unavailableIntervals.push({ start: intervalStart, end: point.time });
          intervalStart = null;
        }
      }
      activeCount--;
    }
  }

  // Etapa 4: criar eventos "Indisponível"
  const unavailableEvents: CalendarEventFormat[] = unavailableIntervals.map(
    (interval, index) => ({
      id: `unavailable-${index}`,
      title: 'Indisponível',
      start: new Date(
        interval.start - new Date().getTimezoneOffset() * 60000
      ).toISOString(),
      end: new Date(
        interval.end - new Date().getTimezoneOffset() * 60000
      ).toISOString(),
    })
  );

  return unavailableEvents;
}
