export function convertPointsToHours(points: number): string {
  const hours = points * 0.5;
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0 && minutes === 0) {
    return 'Limite de agendamento excedido no mês.';
  }

  if (minutes === 0) {
    return `${wholeHours} horas`
  }

  return `${wholeHours}:${minutes < 10 ? '0' + minutes : minutes} horas`;
}

