import {
  UnavailableTime,
  EventConfig,
  CalendarEvent,
} from '../types/calendarEvent';

export function formatUnavailableEvents(
  unavailableTimes: UnavailableTime[],
  config: Required<EventConfig> = {
    title: 'Indisponível',
    display: 'background',
    color: '#ec775e',
    overlap: false,
  }
): CalendarEvent[] {
  if (!unavailableTimes || unavailableTimes.length === 0) {
    return [];
  }

  return unavailableTimes.map((time) => ({
    ...config,
    ...time,
  }));
}
