import { TeacherPreference, NamedItem } from '../types/pickTeacherByPreference';
import { DateTime } from 'luxon';

export function filterByName(array: NamedItem[], name: string): NamedItem[] {
  return array.filter((item) => item.title === name);
}

export function pickTeacherByPreference(
  preferences: TeacherPreference[]
): string | undefined {
  const totalWeight = preferences.reduce(
    (sum, item) => sum + item.preference,
    0
  );
  const randomValue = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const item of preferences) {
    cumulativeWeight += item.preference;
    if (randomValue <= cumulativeWeight) {
      return item.name;
    }
  }

  return undefined; // in case preferences is empty
}

export function pickTeacherExcludingName(
  preferences: TeacherPreference[],
  nameToExclude: string
): string | undefined {
  // Filtra os professores que não devem ser excluídos
  const filteredPreferences = preferences.filter(
    (item) => item.name !== nameToExclude
  );

  if (filteredPreferences.length === 0) return undefined;

  const totalWeight = filteredPreferences.reduce(
    (sum, item) => sum + item.preference,
    0
  );
  const randomValue = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const item of filteredPreferences) {
    cumulativeWeight += item.preference;
    if (randomValue <= cumulativeWeight) {
      return item.name;
    }
  }

  return undefined;
}

export function hasScheduleConflict(
  newStartLocal: string,
  newEndLocal: string,
  teacherUnavailabilitySchedule: any[]
): boolean {
  const newStart = DateTime.fromISO(newStartLocal, { zone: 'utc' });
  const newEnd = DateTime.fromISO(newEndLocal, { zone: 'utc' });

  return teacherUnavailabilitySchedule.some(({ start, end }) => {
    const unavailStart = DateTime.fromISO(start, { zone: 'utc' });
    const unavailEnd = DateTime.fromISO(end, { zone: 'utc' });

    return newStart < unavailEnd && newEnd > unavailStart;
  });
}

export async function chooseAvailableTeacher(
  teachersPick: TeacherPreference[],
  newStartLocal: string,
  newEndLocal: string,
  unavailableTimesByNames: any[]
): Promise<string | undefined> {
  // Copia a lista original para não modificar o array original
  let remainingTeachers = [...teachersPick];

  while (remainingTeachers.length > 0) {
    const chosenTeacher = pickTeacherByPreference(remainingTeachers);

    if (!chosenTeacher) return undefined;

    const teacherUnavailabilitySchedule = filterByName(
      unavailableTimesByNames,
      chosenTeacher
    );

    const isConflict = hasScheduleConflict(
      newStartLocal,
      newEndLocal,
      teacherUnavailabilitySchedule
    );

    if (!isConflict) {
      return chosenTeacher; // Encontrou um professor disponível!
    }

    // Remove o professor testado e tenta o próximo
    remainingTeachers = remainingTeachers.filter(
      (item) => item.name !== chosenTeacher
    );
  }

  return undefined; // Nenhum professor disponível
}

