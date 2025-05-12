// utils/formatUnavailableEvents.ts

type UnavailableTime = {
  start: string;
  end: string;
};

type EventConfig = {
  title?: string;
  display?: string;
  color?: string;
  overlap?: boolean;
};

type CalendarEvent = UnavailableTime & Required<EventConfig>;

export function formatUnavailableEvents(
  unavailableTimes: UnavailableTime[],
  config: Required<EventConfig> = {
    title: 'Indisponível',
    display: 'background',
    color: '#ec775e',
    overlap: false,
  }
): CalendarEvent[] {
  return unavailableTimes.map((time) => ({
    ...config,
    ...time,
  }));
}
