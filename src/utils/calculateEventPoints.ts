import { DateTime } from 'luxon';

export function calculateEventPoints(event) {
  if (!event?.start?.dateTime || !event?.end?.dateTime) return 0;

  const start = DateTime.fromISO(event.start.dateTime);
  const end = DateTime.fromISO(event.end.dateTime);

  const durationInMinutes = end.diff(start, 'minutes').minutes;

  const points = Math.floor(durationInMinutes / 30); // 1 point per 30 minutes
  return points;
}
