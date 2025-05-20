import { TeacherPreference, NamedItem } from '../types/pickTeacherByPreference';

export function filterByName(array: NamedItem[], name: string): NamedItem[] {
  console.log('name:', name)
  console.log('array:', array)
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

//const teachers = [
//  { teacher: 'Jurandir', preference: 5 },
//  { teacher: 'Reenê', preference: 2 },
//  { teacher: 'Marcelo', preference: 1 },
//];
//
//const selectedTeacher = pickTeacherByPreference(teachers);
//console.log(selectedTeacher);
