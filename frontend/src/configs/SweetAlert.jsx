import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const SweetAlert = ({ isSuccess, text }) => {
  useEffect(() => {
    if (isSuccess !== null) {
      if (isSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Operación exitosa',
          text: text || 'La operación se completó con éxito.', // Usamos el texto proporcionado o un texto predeterminado
          timer: 3000, // Auto-cerrar después de 2 segundos
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: text || 'Hubo un error al procesar la operación.', // Usamos el texto proporcionado o un texto predeterminado
          timer: 3000, // Auto-cerrar después de 2 segundos
          timerProgressBar: true,
        });
      }
    }
  }, [isSuccess, text]); // Actualiza el efecto cuando cambian isSuccess o text

  return null; // No renderiza nada en el DOM, ya que SweetAlert maneja la visualización
};

export default SweetAlert;