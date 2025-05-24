import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
//import { DateTime } from 'luxon';

export function showEventTooltip(info) {
  //console.log('info:', info)
  //const { title, startStr, endStr } = info.event;
  const { title } = info.event;
  const unavailableColor = '#ec775e';

  //const startFormatted = DateTime.fromISO(startStr)
  //  .setZone('America/Sao_Paulo')
  //  .toFormat('dd/MM/yyyy HH:mm');

  //const endFormatted = DateTime.fromISO(endStr)
  //  .setZone('America/Sao_Paulo')
  //  .toFormat('dd/MM/yyyy HH:mm');

  if (title === 'Indisponível') {
    info.el.style.backgroundColor = unavailableColor; // vermelho
    info.el.style.borderColor = unavailableColor;
  }
  //else if (title === fullNameEvent) {
  //  info.el.style.backgroundColor = '#1890ff'; // azul
  //  info.el.style.borderColor = '#1890ff';
  //}

  tippy(info.el, {
    //content: `
    //  <strong>${title}</strong><br/>
    //  Início: ${startFormatted}<br/>
    //  Fim: ${endFormatted}<br/>
    //  ${info.timeText}
    //`,
    content: `
      <strong>${title}</strong><br/>
      ${info.timeText}
    `,
    allowHTML: true,
    placement: 'top',
    animation: 'scale',
  });
}
