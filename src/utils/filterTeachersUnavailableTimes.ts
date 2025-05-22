import { listTeachers } from '../services/teachers';
import { Teacher } from '../types/teachers';

export const fetchActiveTeacherById = async (
  id: string
): Promise<Teacher | null> => {
  try {
    const response = await listTeachers();
    const teacher = response.data.find(
      (t: Teacher) => t.id_object_azure_microsoft === id && t.active_account
    );
    if (!teacher) {
      console.warn(`Professor ativo com ID ${id} não encontrado.`);
      return null;
    }

    const unavailableTimesWithProps = (teacher.unavailable_times || []).map(
      (time, index) => ({
        id: index,
        title: 'Indisponível',
        start: time.start,
        end: time.end,
      })
    );

    return unavailableTimesWithProps;
  } catch (error) {
    console.error(`Erro ao buscar professor ativo com ID ${id}:`, error);
    return null;
  }
};

export const fetchAllUnavailableTimes = async (): Promise<
  { id: number; title: string; start: string; end: string }[]
> => {
  try {
    const teachers = await listTeachers();

    // Filtra só os professores ativos
    const activeTeachers = teachers.data.filter(
      (t: Teacher) => t.active_account
    );

    // Junta todos os unavailable_times em um só array com propriedades extras
    let allUnavailableTimes: {
      id: number;
      title: string;
      start: string;
      end: string;
    }[] = [];
    let idCounter = 0;

    activeTeachers.forEach((teacher) => {
      const times = teacher.unavailable_times || [];
      times.forEach((time) => {
        allUnavailableTimes.push({
          id: idCounter++,
          title: 'Indisponível',
          start: time.start,
          end: time.end,
        });
      });
    });

    return allUnavailableTimes;
  } catch (error) {
    console.error(
      'Erro ao buscar unavailable times de todos os professores:',
      error
    );
    return [];
  }
};

export const fetchAllUnavailableTimesByName = async (): Promise<
  { title: string; start: string; end: string }[]
> => {
  try {
    const response = await listTeachers();

    // Filtra só os professores ativos
    const activeTeachers = response.data.filter(
      (t: Teacher) => t.active_account
    );

    let allUnavailableTimesByName: {
      title: string;
      start: string;
      end: string;
    }[] = [];

    activeTeachers.forEach((teacher) => {
      const times = teacher.unavailable_times || [];
      times.forEach((time) => {
        allUnavailableTimesByName.push({
          title: teacher.name,
          start: time.start,
          end: time.end,
        });
      });
    });

    return allUnavailableTimesByName;
  } catch (error) {
    console.error(
      'Erro ao buscar unavailable times de todos os professores por nome:',
      error
    );
    return [];
  }
};
