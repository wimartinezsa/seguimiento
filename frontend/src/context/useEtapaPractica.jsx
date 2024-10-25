import { useState, useEffect } from 'react';
import axiosClient from '../configs/axiosClient';

const useEtapaPractica = () => {
    const [etapas, setEtapas] = useState([]);
    const [isOpenModalRegistro, setIsOpenModalRegistro] = useState(false);
    const [isOpenModalEditar, setIsOpenModalEditar] = useState(false);
    const [selectedEtapa, setSelectedEtapa] = useState(null);
    const [error, setError] = useState(null);

    const handleError = (error) => {
        console.error('Error:', error);
        setError(error.message || 'Ocurrió un error');
    };

    const obtenerEtapas = async () => {
        setError(null);
        try {
            const respuesta = await axiosClient.get('/productiva/listar');
            setEtapas(respuesta.data);
        } catch (error) {
            handleError(error);
        }
    };

    const handleSubmitRegistro = async (data) => {
        setError(null);
        try {
            await axiosClient.post('/productiva/registrar', data);
            setIsOpenModalRegistro(false);
            obtenerEtapas();
        } catch (error) {
            handleError(error);
        }
    };

    const handleSubmitEditar = async (data) => {
        setError(null);
        try {
            await axiosClient.put(`/productiva/actualizar/${data.id_productiva}`, data);
            setIsOpenModalEditar(false);
            obtenerEtapas();
        } catch (error) {
            handleError(error);
        }
    };

    useEffect(() => {
        obtenerEtapas();
    }, []);

    return {
        etapas,
        isOpenModalRegistro,
        setIsOpenModalRegistro,
        isOpenModalEditar,
        setIsOpenModalEditar,
        handleSubmitRegistro,
        handleSubmitEditar,
        selectedEtapa,
        setSelectedEtapa,
        error,
    };
};

export default useEtapaPractica;
