import React, { createContext, useState } from 'react'
import axiosClient from '../configs/axiosClient'


const NovedadesContext = createContext()

export const NovedadesProvider = ({ children }) => {

    const [novedades, setNovedades] = useState([])
    const [novedad, setNovedad] = useState([])
    const [idNovedad, setNovedadId] = useState([])

    const getNovedades = () => {
        try {
            axiosClient.get('/novedad/listar').then((response) => {
                console.log(response.data)
                setNovedades(response.data)
            })
        } catch (error) {
            console.log('Error del servidor' + error);
        }
    }

    const getNovedad = (id) => {
        try {
            axiosClient.get(`/novedad/buscar/${id}`).then((response) => {
                console.log(response.data)
                setNovedad(response.data)
            })
        } catch (error) {
            console.log('Error' + error) ;
        }
    }
  return (
    <NovedadesContext.Provider
        value={{
            novedades,
            novedad,
            idNovedad,
            setNovedades,
            setNovedad,
            setNovedadId,
            getNovedades,
            getNovedad
        }}
    >
        {children}
    </NovedadesContext.Provider>
  )
}

export default NovedadesContext
