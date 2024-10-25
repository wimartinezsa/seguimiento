// src/components/GlobalAlert.js
import Swal from "sweetalert2";

const GlobalAlert = {
  success: (message) => {
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: message,
      confirmButtonText: "OK",
    });
  },

  error: (message) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonText: "OK",
    });
  },
};

export default GlobalAlert;
