import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { DateTime } from 'luxon';

export function showEventTooltip(info) {
  const { title, startStr, endStr } = info.event;

  const startFormatted = DateTime.fromISO(startStr)
    .setZone('America/Sao_Paulo')
    .toFormat('dd/MM/yyyy HH:mm');

  const endFormatted = DateTime.fromISO(endStr)
    .setZone('America/Sao_Paulo')
    .toFormat('dd/MM/yyyy HH:mm');

  if (title === 'Indisponível') {
    info.el.style.backgroundColor = '#ff4d4f'; // vermelho
    info.el.style.borderColor = '#ff4d4f';
  }
  //else if (title === fullNameEvent) {
  //  info.el.style.backgroundColor = '#1890ff'; // azul
  //  info.el.style.borderColor = '#1890ff';
  //}

  tippy(info.el, {
    content: `
      <strong>${title}</strong><br/>
      Início: ${startFormatted}<br/>
      Fim: ${endFormatted}
    `,
    allowHTML: true,
    placement: 'top',
    animation: 'scale',
  });
}
