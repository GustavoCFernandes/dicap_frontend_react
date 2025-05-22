import Swal, { SweetAlertResult } from 'sweetalert2';

export function showAutoCloseAlert(): void {
  let timerInterval: number;

  Swal.fire({
    title: 'Deletando agendamento, aguarde por favor!',
    timer: 30000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const popup = Swal.getPopup();
      const timerEl = popup?.querySelector('b');
      timerInterval = window.setInterval(() => {
        if (timerEl) {
          timerEl.textContent = `${Swal.getTimerLeft()}`;
        }
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result: SweetAlertResult) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log('I was closed by the timer');
    }
  });
}
