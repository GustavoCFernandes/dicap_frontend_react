import { CalendarEventFormat } from '../types/calendarEvent';

export function FilterEventsCalendar(
  events: CalendarEventFormat[],
  fullNameEvent: string
): CalendarEventFormat[] {
  const ruleNumberUnavailableTeachers = 4;
  const timePoints: { time: number; type: 'start' | 'end' }[] = [];

  // 1. Encontrar o evento com o nome correspondente
  const highlightedEvent = events.filter(
    (event) => event.title === fullNameEvent
  );

  // 2. Remover o evento do cálculo de indisponibilidade
  const filteredEvents = events.filter(
    (event) => event.title !== fullNameEvent
  );

  for (const event of filteredEvents) {
    timePoints.push({ time: new Date(event.start).getTime(), type: 'start' });
    timePoints.push({ time: new Date(event.end).getTime(), type: 'end' });
  }

  timePoints.sort((a, b) => {
    if (a.time === b.time) {
      return a.type === 'end' ? -1 : 1;
    }
    return a.time - b.time;
  });

  const unavailableIntervals: { start: number; end: number }[] = [];
  let activeCount = 0;
  let intervalStart: number | null = null;

  for (const point of timePoints) {
    if (point.type === 'start') {
      activeCount++;
      if (activeCount === ruleNumberUnavailableTeachers) {
        intervalStart = point.time;
      }
    } else {
      if (activeCount === ruleNumberUnavailableTeachers) {
        if (intervalStart !== null) {
          unavailableIntervals.push({ start: intervalStart, end: point.time });
          intervalStart = null;
        }
      }
      activeCount--;
    }
  }

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

  // 3. Adicionar o evento real com ajuste de fuso horário
  const result: CalendarEventFormat[] = [...unavailableEvents];

  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  for (const event of highlightedEvent) {
    result.push({
      id: event.id,
      title: event.title,
      start: new Date(
        new Date(event.start).getTime() - timezoneOffset
      ).toISOString(),
      end: new Date(
        new Date(event.end).getTime() - timezoneOffset
      ).toISOString(),
    });
  }

  return result;
}


