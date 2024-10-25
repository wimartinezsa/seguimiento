
import React, { createContext, useState } from 'react';
import axiosClient from '../configs/axiosClient';

const AmbienteContext = createContext();

export const AmbienteProvider = ({ children }) => {
    const [ambientes, setambientes] = useState([]);
    const [ambiente, setAmbiente] = useState(null); 
    const [idambiente, setambienteId] = useState(null); 

    const getAmbientes = async () => {
        try {
            const response = await axiosClient.get('/ambientes/listar');
            console.log(response.data);
            setambientes(response.data);
        } catch (error) {
            console.log('Error del servidor: ' + error);
        }
    };

    const getambiente = async (id_ambiente) => {
        try {
            const response = await axiosClient.get(`/buscar/${id_ambiente}`);
            console.log(response.data);
            setAmbiente(response.data);
        } catch (error) {
            console.log('Error: ' + error);
        }
    };

    return (
        <AmbienteContext.Provider
            value={{
                ambientes,
                ambiente,
                idambiente,
                setAmbiente,
                setambientes,
                setambienteId,
                getAmbientes,
                getambiente,
            }}
        >
            {children}
        </AmbienteContext.Provider>
    );
};

export default AmbienteContext;