import React, { useEffect, useState } from 'react';
import axiosClient from '../../../configs/axiosClient';
import ModalAcciones from '../ComponentsGlobals/ModalAcciones';
import FormActividades from './FormActividades';
import ButtonRegistrarActividad from '../../atoms/ButtonRegistrarActividad';
import ButtonDesactivar from '../../atoms/ButtonDesactivar';
import { Chip } from '@nextui-org/react';


const ListActividad = ({ selectedInstructor, item }) => {
  const [instructor, setInstructor] = useState("");
  const [actividades, setActividades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bodyContent, setBodyContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(null);

  const handleOpenModal = (formType, data = null) => {
    if (formType === "formActividades") {
      setBodyContent(
        <FormActividades
          selectedInstructor={selectedInstructor}  // Asegúrate de pasar el instructor aquí
          actividadSeleccionada={data}
          onClose={handleCloseModal}
        />
      );
    } 
    setIsModalOpen(true);  // Muestra el modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);  // Oculta el modal
  };

  useEffect(() => {
    if (selectedInstructor) {
      setInstructor(selectedInstructor.id_persona);
      fetchData(selectedInstructor.id_persona);  // Llama a fetchData con el ID del instructor
    }
  }, [selectedInstructor]);

  const fetchData = async (id_persona) => {
    setIsLoading(true); 
    setHasError(null); 
    try {
        const response = await axiosClient.get(`/actividades/listar/${id_persona}`);
        setActividades(response.data);
    } catch (error) {
        setHasError('Error fetching activities');
        console.log("Error al listar las actividades", error);
    } finally {
        setIsLoading(false);
    }
  };

  const desactivarActividad = async (id_actividad) => {
    try {
      const response = await axiosClient.put(`/actividades/desactivar/${id_actividad}`);
      if (response.status === 200) {
        alert('La actividad ha sido desactivada exitosamente.');
  
        // Filtrar la actividad desactivada de la lista de actividades en el estado
        setActividades((prevActividades) => prevActividades.filter((actividad) => actividad.id_actividad !== id_actividad));
      } else {
        alert('Hubo un problema al desactivar la actividad.');
      }
    } catch (error) {
      alert('Error al intentar desactivar la actividad.');
      console.log(error);
    }
  };
  

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Lista de Actividades</h3>
        <ButtonRegistrarActividad
          onClick={() => handleOpenModal("formActividades", item)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actividades.map((actividad) => (
          <div key={actividad.id_actividad} className="bg-white shadow-md rounded-lg p-4 relative">
            <h4 className="text-lg font-semibold mb-2">Actividad: {actividad.id_actividad}</h4>
            <div className="absolute top-2 right-2">
              <ButtonDesactivar onClick={() => desactivarActividad(actividad.id_actividad)} />  
            </div>
            <div className="absolute top-4 left-32 flex items-center gap-2">
                <Chip
                  variant="flat"
                  className="w-10 bg-green-500 bg-opacity-30"
                >
                  {actividad.estado}
                </Chip>
              </div>
            <p className="text-sm text-black"><strong>Fecha de inicio: </strong>{formatFecha(actividad.fecha_inicio)}</p>
            <p className="text-sm text-black"><strong>Fecha de fin: </strong>{formatFecha(actividad.fecha_fin)}</p>
            <p className="text-sm text-black"><strong>Horario: </strong>{actividad.horario_inicio} - {actividad.horario_fin}</p>
            <p className="text-sm text-black"><strong>Ficha: </strong> {actividad.horario_ficha} </p>
            <p className="text-sm text-black"><strong>Día: </strong> {actividad.horario_dia} </p>
          </div>
        ))}
      </div>

      <ModalAcciones
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bodyContent={bodyContent}
      />
    </div>
  );
};

export default ListActividad;
