import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Chip } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import axiosClient from '../../../configs/axiosClient';
import PDFUploader from './Pdf';
import ButtonEnviar from '../../atoms/ButtonEnviar';
import ButtonDescargar from '../../atoms/ButtonDescargar';
import Icons from '../../../styles/Variables';
import Swal from 'sweetalert2';
import ButtonAprobado from '../../atoms/ButtonAprobado';
import ButtonNoAprobado from '../../atoms/ButtonNoAprobado';

function Bitacoras({
  initialData,
  mode,
  handleSubmit,
  onClose,
  actionLabel,
  id_seguimiento,
  id_bitacora,
  onIdSend,
}) {
  const [bitacoraPdf, setBitacoraPdf] = useState(null);
  const [idPersona, setIdPersona] = useState('');
  const [bitacorasPdfs, setBitacorasPdfs] = useState([]);
  const [modalBitacora, setModalBitacora] = useState(false);
  const [fecha, setFecha] = useState('');
  const [selectedPdf, setSelectedPdf] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [bitacora, setBitacora] = useState([]);
  const [estado, setEstado] = useState(null);




  useEffect(() => {
    const currentDate = new Date();

    // Obtener la fecha local en el formato YYYY-MM-DD
    const localDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

    setFecha(localDate);

    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setIdPersona(user?.id_persona || '');
      } catch (error) {
        console.error('Error al parsear el JSON del usuario:', error);
      }
    }

    if (onIdSend && id_seguimiento) {
      onIdSend(id_seguimiento);
    }
  }, [id_seguimiento, onIdSend]);


  useEffect(() => {
    if (id_seguimiento) {
      axiosClient.get(`/bitacoras/bitacorasSeguimiento/${id_seguimiento}`)
        .then((response) => setBitacorasPdfs(response.data))
        .catch(error => console.error('Error al obtener las bitácoras:', error));
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

  const handleBitacoraPdfSubmit = (file, id_bitacora) => {
    setBitacoraPdf(file);
    setSelectedPdf(prev => ({ ...prev, [id_bitacora]: file }));
  };

  const handleSubmitBitacoras = async (bitacora) => {
    if (!bitacoraPdf) {
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

    const existingPdf = bitacorasPdfs.find(b => b.id_bitacora === bitacora)?.pdf;
    if (existingPdf) {
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

    const formData = new FormData();
    formData.append('fecha', fecha);
    formData.append('bitacora', bitacora);
    formData.append('seguimiento', id_seguimiento);
    formData.append('instructor', idPersona);
    formData.append('bitacoraPdf', bitacoraPdf);

    try {
      const response = await axiosClient.post(`/bitacoras/cargarpdf/${bitacora}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        await Swal.fire({
          title: "Éxito",
          text: "Bitácora registrada correctamente",
          icon: "success",
        });
        if (handleSubmit) handleSubmit();
      } else {
        await Swal.fire({
          title: "Error",
          text: "Error al registrar la bitácora.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error('Error del servidor:', error);
      await Swal.fire({
        title: "Error del servidor",
        text: error.message,
        icon: "error",
      });
    }
  };

  const handleAprobar = async (id_bitacora) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Quieres aprobar esta Bitacora?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, Aprobar",
        cancelButtonText: "No, cancelar",
        reverseButtons: true,
        customClass: {
          confirmButton: "bg-[#90d12c] text-white hover:bg-green-600 border-green-500",
          cancelButton: "bg-[#f31260] text-white hover:bg-red-600 border-red-500",
        },
      });

      if (!result.isConfirmed) {
        return;
      }

      if (!id_bitacora) {
        console.error("ID de seguimiento no proporcionado");
        await Swal.fire({
          title: "Error",
          text: "El ID de seguimiento no está definido.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
        return;
      }

      const response = await axiosClient.put(`/bitacoras/aprobar/${id_bitacora}`); // Usa PUT si es una actualización

      if (response.status === 200) {
        Swal.fire("Aprobado", "La bitacora ha sido aprobada correctamente", "success");

        // Actualización del estado después de la aprobación
        setBitacora((prevBitacora) =>
          prevBitacora.filter((bitacora) => bitacora.id_bitacora !== id_bitacora)
        );
      } else {
        throw new Error("Error inesperado durante la aprobación.");
      }
    } catch (error) {
      console.error("Error al aprobar el acta:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo aprobar la Bitacora. Intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    }
  };


  const handleNoAprobar = async (id_bitacora) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Quieres rechazar esta Bitacora?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, Rechazar",
        cancelButtonText: "No, cancelar",
        reverseButtons: true,
        customClass: {
          confirmButton: "bg-[#90d12c] text-white hover:bg-green-600 border-green-500",
          cancelButton: "bg-[#f31260] text-white hover:bg-red-600 border-red-500",
        },
      });

      if (!result.isConfirmed) {
        return;
      }

      if (!id_bitacora) {
        console.error("ID de bitacora no proporcionado");
        await Swal.fire({
          title: "Error",
          text: "El ID de bitacora no está definido.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
        return;
      }

      const response = await axiosClient.put(`/bitacoras/rechazar/${id_bitacora}`); // Usa PUT si es una actualización

      if (response.status === 200) {
        Swal.fire("Rechazada", "La Bitacora ha sido rechazada correctamente", "success");

        // Actualización del estado después de la aprobación
        setBitacora((prevBitacora) =>
          prevBitacora.filter((bitacora) => bitacora.id_bitacora !== id_bitacora)
        );
      } else {
        throw new Error("Error inesperado durante la aprobación.");
      }
    } catch (error) {
      console.error("Error al aprobar el acta:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo aprobar el acta. Intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    }
  };



  const downloadFile = async (id_bitacora) => {
    try {
      console.log(`Solicitando descarga para el archivo con ID: ${id_bitacora}`);

      const response = await axiosClient.get(`/bitacoras/download/${id_bitacora}`, {
        responseType: 'blob',
      });

      if (response.headers['content-type'] === 'application/json') {
        const errorData = await response.data.text(); // Lee la respuesta como texto
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
      link.setAttribute('download', `bitacora_${id_bitacora}.pdf`);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

  return (
    <>
      <div className="flex gap-8">
        <div className="flex-1 min-w-[300px]">
          <h2 className="font-semibold text-xl mb-5">Bitácoras:</h2>
          <div className="grid grid-cols-2 gap-4 w-full h-auto pb-5">
            {bitacorasPdfs.length > 0 ? (
              bitacorasPdfs.map((bitacora) => {
                const { color, icon } = estadoConfig[bitacora.estado] || {};
                return (
                  <div key={bitacora.id_bitacora} className="relative border shadow-medium rounded-2xl p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg">Bitácora {bitacora.bitacora}</h2>
                        {bitacora.pdf && (
                          <Chip
                            endContent={icon && React.createElement(icon, { size: 20 })}
                            variant="flat"
                            color={color}
                            className="w-10"
                          >
                            {bitacora.estado}
                          </Chip>
                        )}
                      </div>
                      {bitacora.pdf && (
                        <p className="text-gray-500 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-xs ">{bitacora.pdf}</p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 mt-5">
                        {bitacora.estado !== 'aprobado' && (userRole !== 'Administrativo' && userRole !== 'Coordinador') && (
                          <PDFUploader onFileSelect={(file) => handleBitacoraPdfSubmit(file, bitacora.id_bitacora)} />
                        )}
                        <div className="flex gap-2">
                          <div>
                            {bitacora.pdf || selectedPdf[bitacora.id_bitacora] ? (
                              <ButtonDescargar 
                                onClick={() => {
                                  const fileToDownload = bitacora.pdf || selectedPdf[bitacora.id_bitacora]?.name;
                                  if (fileToDownload) {
                                    downloadFile(bitacora.id_bitacora);
                                  } else {
                                    Swal.fire({
                                      title: "Error",
                                      text: "No hay archivo para descargar.",
                                      icon: "error",
                                    });
                                  }
                                }}
                              />
                            ) : (
                              // Si no hay PDF cargado, muestra el mensaje
                              <p className="text-gray-500 text-base absolute top-12 left-5">
                                No se ha cargado un archivo aún
                              </p>
                            )}

                          </div>

                          <div className='flex justify-normal'>
                            {(userRole !== 'Instructor' && userRole !== 'Aprendiz') && (
                              <ButtonAprobado onClick={() => handleAprobar(bitacora.id_bitacora)} />
                            )}
                            {(userRole !== 'Instructor' && userRole !== 'Aprendiz') && (
                              <ButtonNoAprobado onClick={() => handleNoAprobar(bitacora.id_bitacora)} />
                            )}
                          </div>

                          {bitacora.estado !== 'aprobado' && (userRole !== 'Administrativo' && userRole !== 'Coordinador') && (
                            <ButtonEnviar onClick={() => handleSubmitBitacoras(bitacora.id_bitacora)} />
                          )}
                        </div>
                      </div>
                      {bitacora.pdf && (
                        <p className="absolute bottom-2 right-2 text-gray-500 text-sm">
                          {formatDate(bitacora.fecha)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No hay bitácoras disponibles.</p>
            )}
          </div>
        </div>
      </div>
      <Modal
        aria-labelledby="modal-title"
        open={modalBitacora}
        onClose={() => setModalBitacora(false)}
        width="100%"
        height="100%"
        scroll
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="font-semibold text-xl">Bitácoras</h3>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {/* Aquí puedes colocar más contenido o formularios para las bitácoras */}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="error" auto onClick={() => setModalBitacora(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Bitacoras;
