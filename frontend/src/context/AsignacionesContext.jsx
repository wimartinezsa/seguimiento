import React, { createContext, useState } from 'react';
import axiosClient from '../configs/axiosClient';

const AsignacionContext = createContext();

export const AsignacionProvider = ({ children }) => {
    const [asignaciones, setAsignaciones] = useState([]);
    const [asignacion, setAsignacion] = useState(null); // Cambiado a null
    const [idAsignacion, setAsignacionId] = useState(null); // Cambiado a null

    const getAsignaciones = async () => {
        try {
            const response = await axiosClient.get('/listar');
            console.log(response.data);
            setAsignaciones(response.data);
        } catch (error) {
            console.log('Error del servidor: ' + error);
        }
    };

    const getAsignacion = async (id_asignacion) => {
        try {
            const response = await axiosClient.get(`/buscar/${id_asignacion}`);
            console.log(response.data);
            setAsignacion(response.data);
        } catch (error) {
            console.log('Error: ' + error);
        }
    };

    return (
        <AsignacionContext.Provider
            value={{
                asignaciones,
                asignacion,
                idAsignacion,
                setAsignaciones,
                setAsignacion,
                setAsignacionId,
                getAsignaciones,
                getAsignacion,
            }}
        >
            {children}
        </AsignacionContext.Provider>
    );
};

export default AsignacionContext;