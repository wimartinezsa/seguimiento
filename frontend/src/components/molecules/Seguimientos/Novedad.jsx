import React, { useEffect, useState } from 'react';
import axiosClient from '../../../configs/axiosClient';
import ModalAcciones from '../ComponentsGlobals/ModalAcciones';
import FormNovedades from './FormNovedades';
import ButtonRegistrarActividad from '../../atoms/ButtonRegistrarActividad';
import ButtonDesactivar from '../../atoms/ButtonDesactivar';
import Swal from 'sweetalert2';
import { Select, SelectItem } from '@nextui-org/react';

const Novedades = () => {
    const [novedades, setNovedades] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bodyContent, setBodyContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNovedad, setSelectedNovedad] = useState(null);
    const [selectedSeguimientos, setSelectedSeguimientos] = useState('');
    const [seguimientos, setSeguimientos] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [noNovedadesMessage, setNoNovedadesMessage] = useState('');

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

    const listarN = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get(`/novedades/listarN`);
            setNovedades(response.data || []);
        } catch (error) {
            console.error('Error al obtener las novedades:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchData = async () => {
        if (!selectedSeguimientos) return; // No hacer nada si no hay seguimiento seleccionado
        setIsLoading(true);
        try {
            const response = await axiosClient.get(`/novedades/listar/${selectedSeguimientos}`);
            if (response.data && response.data.length > 0) {
                setNovedades(response.data);
                setNoNovedadesMessage('');
            } else {
                setNovedades([]); // Limpia el estado si no hay novedades
                setNoNovedadesMessage('No hay novedades registradas para este seguimiento.');
                console.log('No hay novedades registradas.'); // Log para ver si se ejecuta
            }
        } catch (error) {
            console.error('Error al obtener las novedades:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        listarN(); // Cargar todas las novedades al inicio
        fetchSeguimientos(); // Obtener seguimientos al inicio
    }, []);

    useEffect(() => {
        if (selectedSeguimientos) {
            fetchData(); // Solo llamarlo si hay un seguimiento seleccionado
        }
    }, [selectedSeguimientos]);

    const fetchSeguimientos = async () => {
        try {
            const response = await axiosClient.get("/seguimientos/listar");
            setSeguimientos(response.data);
        } catch (error) {
            console.error("Error al obtener seguimientos", error);
        }
    };

    const handleOpenModal = (formType, novedad = null) => {
        if (formType === 'formNovedades') {
            setBodyContent(
                <FormNovedades
                    initialData={novedad}
                    id_seguimiento={selectedSeguimientos}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    mode={novedad ? 'edit' : 'create'} // Cambia el modo si editas
                    actionLabel={novedad ? 'Actualizar Novedad' : 'Registrar Novedad'}
                />
            );
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNovedad(null);
        listarN(); // Refrescar las novedades después de cerrar el modal
    };

    const handleSubmit = async (novedadData) => {
        try {
            if (selectedNovedad) {
                // Lógica para editar la novedad
                await axiosClient.put(`/novedades/actualizar/${selectedNovedad.id_novedad}`, novedadData);
            } else {
                // Lógica para registrar nueva novedad
                await axiosClient.post(`/novedades/crear`, { ...novedadData, id_seguimiento: selectedSeguimientos });
            }
            listarN(); // Refrescar las novedades después de la acción
            handleCloseModal();
        } catch (error) {
            console.error('Error al guardar la novedad:', error);
        }
    };

    const handleSeguimientoChange = (event) => {
        setSelectedSeguimientos(event.target.value);
        console.log(event.target.value); // Agrega este log para verificar el valor
    };


    const desactivarNovedad = async (id_novedad) => {
        try {
            const response = await axiosClient.delete(`/novedades/eliminar/${id_novedad}`);
            if (response.status === 200) {
                setNovedades(novedades.filter((novedad) => novedad.id_novedad !== id_novedad));
                Swal.fire('Eliminado!', 'La novedad ha sido eliminada exitosamente.', 'success');
            } else {
                Swal.fire('Error!', 'Hubo un problema al eliminar la novedad.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'Error al intentar eliminar la novedad.', 'error');
            console.error(error);
        }
    };



    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Novedades</h3>
            </div>

            {/* Filtro por seguimiento */}
            <div className="mb-6 flex justify-between">
                <Select
                    className="w-60 mt-5"
                    id="seguimientos"
                    name="Seguimiento"
                    value={selectedSeguimientos}
                    placeholder='Selecciona un Seguimiento'
                    onChange={handleSeguimientoChange}
                    required
                >
                    <SelectItem value="">Selecciona un Seguimiento</SelectItem>
                    {seguimientos.slice(0, 3).map((seguimiento, index) => (
                        <SelectItem key={seguimiento.id_seguimiento} value={seguimiento.id_seguimiento}>
                            {index + 1} {/* Esto mostrará 1, 2, 3 */}
                        </SelectItem>
                    ))}
                </Select>


                {(userRole !== 'Aprendiz') && (
                    <ButtonRegistrarActividad
                        onClick={() => handleOpenModal('formNovedades')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {novedades.length > 0 ? (
                    novedades.map((novedad) => (
                        <div key={novedad.id_novedad} className="bg-white shadow-md rounded-lg p-4 w-60 relative">
                            <h4 className="text-xl font-semibold mb-2">{novedad.instructor}</h4>
                            <p className="text-sm text-gray-600">Descripción: {novedad.descripcion}</p>
                            <p className="text-sm text-gray-600">Seguimiento: {novedad.seguimiento}</p>

                            {novedad.foto && (
                                <img
                                    src={`${axiosClient.defaults.baseURL}/novedad/${novedad.foto}`}
                                    alt={`Foto de ${novedad.instructor}`}
                                    className="my-6 rounded-xl w-full max-h-40 object-cover"
                                />
                            )}
                            <p className="text-sm text-gray-600 absolute bottom-4 right-4 ">
                                {new Date(novedad.fecha).toLocaleDateString('es-CO', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                }).replace(/\//g, '-')}
                            </p>

                            <div className="absolute top-2 right-2">
                                {(userRole !== 'Aprendiz') && (
                                    <ButtonDesactivar onClick={() => desactivarNovedad(novedad.id_novedad)} />
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-red-500">{noNovedadesMessage}</p> // Mensaje cuando no hay novedades
                )}
            </div>


            <ModalAcciones isOpen={isModalOpen} onClose={handleCloseModal} bodyContent={bodyContent} />
        </div>
    );
};

export default Novedades;
