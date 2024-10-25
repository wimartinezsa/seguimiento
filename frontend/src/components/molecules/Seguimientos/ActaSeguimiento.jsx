import React, { useEffect, useState } from 'react';
import PDFUploader from './Pdf.jsx';
import ButtonEnviar from '../../atoms/ButtonEnviar.jsx';
import { Chip } from '@nextui-org/react';
import Icons from '../../../styles/Variables.jsx';
import axiosClient from "../../../configs/axiosClient.jsx";
import ButtonDescargar from '../../atoms/ButtonDescargar.jsx';
import Swal from 'sweetalert2';
import ButtonAprobado from '../../atoms/ButtonAprobado.jsx';
import ButtonNoAprobado from '../../atoms/ButtonNoAprobado.jsx';

function ActaSeguimiento({ handleSubmit, id_seguimiento, onIdSend, onSuccess, buttonState, setButtonState, onReject }) {
  const [seguimiento, setSeguimiento] = useState([]);
  const [estadoActaVisible, setEstadoActaVisible] = useState(false);
  const [fecha, setFecha] = useState("");
  const [seguimientoPdf, setSeguimientoPdf] = useState(null);
  const [idPersona, setIdPersona] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [estado, setEstado] = useState(null);
  const [pdfName, setPdfName] = useState(null);


  const seguimientoNumeros = {
    1: 1,
    2: 2,
    3: 3,
  };

  useEffect(() => {
    const currentDate = new Date().toISOString().slice(0, 10);
    setFecha(currentDate);
    const userJson = localStorage.getItem("user");
    if (userJson && userJson !== "undefined" && userJson !== "null" && userJson !== "") {
      try {
        const user = JSON.parse(userJson);
        if (user && user.id_persona) {
          setIdPersona(user.id_persona);
          console.log("ID de persona asignado:", user.id_persona);
        } else {
          console.warn("No se encontró un 'id_persona' válido en el usuario.");
        }
      } catch (error) {
        console.error("Error al parsear el JSON del usuario:", error);
      }
    } else {
      console.warn("No se encontró un valor válido para 'user' en localStorage.");
      setIdPersona(null);
    }

    if (onIdSend && id_seguimiento) {
      onIdSend(id_seguimiento);
    }
  }, [id_seguimiento, onIdSend]);

  useEffect(() => {
    if (id_seguimiento) {
      axiosClient.get(`/seguimientos/listarEstado/${id_seguimiento}`)
        .then(response => {
          setEstado(response.data.estado);
          setPdfName(response.data.pdf);
        })
        .catch(error => {
          console.error('Error al obtener el estado del seguimiento:', error);
        });
    }
  }, [id_seguimiento]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.cargo);
      } catch (error) {
        console.error("Error al parsear el JSON del usuario:", error);
      }
    }
  }, []);

  const handleActaPdfSubmit = (file) => {
    setSeguimientoPdf(file);
    setEstadoActaVisible(true);
  };

  const handleSubmitActa = async () => {
    if (!seguimientoPdf) {
      await Swal.fire({
        title: "Error",
        text: "Debes cargar un archivo PDF para poder enviarlo",
        icon: "error",
        confirmButtonText: "Entendido",
        customClass: {
          confirmButton: 'bg-[#6fb12d] text-white px-4 py-2 rounded-md text-lg hover:bg-[#5a9b25] mr-5',
        },
        buttonsStyling: false,
      });
      return;
    }

    if (pdfName) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Ya existe un PDF cargado, ¿quieres reemplazarlo?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, reemplazar",
        cancelButtonText: "Cancelar",
        customClass: {
          confirmButton: 'bg-[#6fb12d] text-white px-4 py-2 rounded-md text-lg hover:bg-[#5a9b25] mr-5',
          cancelButton: 'bg-[#f53a7b] text-white px-4 py-2 rounded-md text-lg hover:bg-[#d6306e]'
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    if (!id_seguimiento) {
      console.error("ID de seguimiento no definido");
      Swal.fire({
        title: "Error",
        text: "ID de seguimiento no definido",
        icon: "error",
      });
      return;
    }

    const formData = new FormData();
    if (seguimientoPdf) {
      formData.append("seguimientoPdf", seguimientoPdf);
    }

    try {
      const response = await axiosClient.post(
        `/seguimientos/cargarPDF/${id_seguimiento}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: "Éxito",
          text: "Acta enviada correctamente",
          icon: "success",
        });
        if (handleSubmit) handleSubmit();
      } else {
        Swal.fire({
          title: "Error",
          text: "Error al enviar el Acta.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error del servidor:", error);
      Swal.fire({
        title: "Error del servidor",
        text: error.message,
        icon: "error",
      });
    }
  };

  const updateEstado = (nuevoEstado) => {
    setEstado(nuevoEstado); // Actualiza el estado local con el nuevo valor
  };


  const handleAprobar = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres aprobar esta Acta?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Aprobar",
      cancelButtonText: "No, cancelar",
      customClass: {
        confirmButton: "bg-[#90d12c] text-white hover:bg-green-600 border-green-500",
        cancelButton: "bg-[#f31260] text-white hover:bg-red-600 border-red-500",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axiosClient.put(`/seguimientos/aprobar/${id_seguimiento}`);
      if (response.status === 200) {
        Swal.fire("Aprobado", "El acta ha sido aprobada correctamente", "success");
        updateEstado("aprobado");
        setButtonState("aprobado");
        onSuccess();
      } else {
        throw new Error("Error inesperado durante la aprobación.");
      }
    } catch (error) {
      console.error("Error al aprobar el acta:", error);
      Swal.fire("Error", "No se pudo aprobar el acta.", "error");
    }
  };

  const handleNoAprobar = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres rechazar esta Acta?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Rechazar",
      cancelButtonText: "No, cancelar",
      customClass: {
        confirmButton: "bg-[#90d12c] text-white hover:bg-green-600 border-green-500",
        cancelButton: "bg-[#f31260] text-white hover:bg-red-600 border-red-500",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axiosClient.put(`/seguimientos/rechazar/${id_seguimiento}`);
      if (response.status === 200) {
        Swal.fire("Rechazada", "El acta ha sido rechazada correctamente", "success");
        updateEstado("no aprobado");  // Cambiar 'no aprobado' a 'noAprobado'
        setButtonState("no aprobado");
        onReject();
      } else {
        throw new Error("Error inesperado durante la aprobación.");
      }
    } catch (error) {
      console.error("Error al rechazar el acta:", error);
      Swal.fire("Error", "No se pudo rechazar el acta.", "error");
    }
  };


  const downloadFile = async (id_seguimiento) => {
    console.log("ID de seguimiento:", id_seguimiento); // Verifica el valor aquí
    try {
      const response = await axiosClient.get(`/seguimientos/descargarPdf/${id_seguimiento}`, {
        responseType: 'blob',
      });

      if (response.headers['content-type'] === 'application/json') {
        const errorData = await response.data.text();
        console.error('Error del servidor:', errorData);
        Swal.fire({
          title: "Error",
          text: "No se pudo descargar el archivo.",
          icon: "error",
        });
        return;
      }

      const fileURL = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `acta_seguimiento_${id_seguimiento}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo descargar el archivo.",
        icon: "error",
      });
    }
  };




  const estadoConfig = {
    aprobado: {
      color: "success",
      icon: Icons.aprobado,
    },
    noAprobado: {
      color: "error",
      icon: Icons.noAprobado,
    },
    solicitud: {
      color: "warning",
      icon: Icons.solicitud,
    },
  };

  const { color, icon } = estadoConfig[estado] || {};

  const DimensionsActa = (userRole === 'Administrativo' || userRole === 'Coordinador')
    ? { width: 'w-[690px]', height: 'h-28' }
    : { width: 'w-[750px]', height: 'h-40' };

  return (
    <>
      <h1 className="font-semibold text-xl mb-4">Acta:</h1>
      <div className={`border shadow-medium rounded-2xl p-4 flex flex-col relative ${DimensionsActa.height}  ${DimensionsActa.width}`}>
        <h2 className="font-semibold text-lg mb-2">
          Acta N° {seguimientoNumeros[id_seguimiento] || 1}:
        </h2>

        <div className="flex flex-col items-center gap-2 mb-4 ">
          {pdfName && (
            <p className="font-semibold text-gray-500 text-sm">
              {pdfName}
            </p>
          )}

          <div className="flex items-center">
            {estado !== 'aprobado' && (userRole !== 'Administrativo' && userRole !== 'Aprendiz' && userRole !== 'Coordinador') && (
              <PDFUploader onFileSelect={handleActaPdfSubmit} />
            )}

            <div>
              {pdfName ? (
                // Si hay un PDF cargado, muestra el botón de descarga
                <ButtonDescargar onClick={() => downloadFile(id_seguimiento)} />
              ) : (
                // Si no hay PDF cargado, muestra el mensaje
                <p className=" text-gray-500 text-lg">
                  No se a cargado un archivo aún
                </p>
              )}
            </div>
            <div className='flex justify-between'>
              {(userRole !== 'Instructor' && userRole !== 'Aprendiz') && (
                <ButtonAprobado onClick={() => handleAprobar(id_seguimiento)} />
              )}
              {(userRole !== 'Instructor' && userRole !== 'Aprendiz') && (
                <ButtonNoAprobado onClick={() => handleNoAprobar(id_seguimiento)} />
              )}
            </div>

            {estado !== 'aprobado' && (userRole !== 'Administrativo' && userRole !== 'Aprendiz' && userRole !== 'Coordinador') && (
              <ButtonEnviar onClick={handleSubmitActa} />
            )}
          </div>
        </div>

        {pdfName && (
          <>
            {estado && (
              <div className="absolute top-4 left-28 flex items-center gap-2">
                <Chip
                  endContent={icon && React.createElement(icon, { size: 20 })}
                  variant="flat"
                  color={color}
                  className="w-10"
                >
                  {estado}
                </Chip>
              </div>
            )}
            {fecha && (
              <p className="absolute bottom-4 right-4 text-gray-500 text-sm">
                {fecha}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ActaSeguimiento;
