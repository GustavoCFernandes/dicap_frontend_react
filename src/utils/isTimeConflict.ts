import { DateTime } from 'luxon';

export function isTimeConflict(newStartISO, newEndISO, unavailableTimes) {
  const newStart = DateTime.fromISO(newStartISO);
  const newEnd = DateTime.fromISO(newEndISO);

  return unavailableTimes.some((time) => {
    const unavailableStart = DateTime.fromISO(time.start);
    const unavailableEnd = DateTime.fromISO(time.end);

    return (
      (newStart >= unavailableStart && newStart < unavailableEnd) ||
      (newEnd > unavailableStart && newEnd <= unavailableEnd) ||
      (newStart <= unavailableStart && newEnd >= unavailableEnd)
    );
  });
}
