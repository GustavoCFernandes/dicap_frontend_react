import Swal from 'sweetalert2';

export function showLoadAlert(text: string): void {
  Swal.fire({
    title: text,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

export function hideLoadAlert(): void {
  Swal.close();
}
