import React, { useEffect, useState } from 'react';
import Grafica from '../molecules/Estadisticas/GraficaMatriculas';
import axiosClient from '../../configs/axiosClient';
import GraficaBar from '../molecules/Estadisticas/GraficaPractica';
import BasicLineChart from '../molecules/Estadisticas/GraficaBitacoras';

function HomePage() {
  const [personas, setPersonas] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axiosClient.get("/personas/listar"); 
      setPersonas(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className='m-4 sm:m-10'>
      <div className='flex flex-col sm:flex-row justify-between gap-4 sm:gap-10'>
        <div className='bg-gradient-to-b bg-[#219162] h-24 p-3 mb-2 sm:mb-10 w-full sm:w-2/3 sm:h-28 rounded-lg sm:p-5'>
          <h1 className='text-white text-lg sm:text-2xl font-semibold mb-2 sm:mb-3'>Bienvenido a TrackProductivo</h1>
          <p className='text-white text-xs sm:text-lg'>Eficiencia en Cada Paso: Monitorea, Evalúa, Mejora.</p>
        </div>
        <div className='bg-gradient-to-b bg-[#219162] h-20 mb-4 sm:mb-10 w-full sm:w-96 sm:h-28 rounded-lg pt-5 text-center'>
          <h1 className='text-white text-lg sm:text-xl font-semibold'>Más de {personas.total} personas</h1>
          <p className='text-white text-xs sm:text-lg'>usan nuestro sistema</p>
        </div>
      </div>
      <div className='flex flex-col sm:flex-row justify-between gap-4 sm:gap-4'>
        <div className='w-full sm:w-1/2 sm:mr-4'>
          <div className='bg-slate-200 h-40 sm:h-72 rounded-lg p-4 text-center mb-4'>
            <h1 className='text-gray-700 text-lg sm:text-2xl font-semibold'>Matriculas</h1>
            <Grafica />
          </div>
          <div className='bg-slate-200 h-[120px] rounded-lg text-center flex flex-row justify-start items-center'>
            <h1 className='text-gray-700 text-lg sm:text-2xl pl-4 sm:p-10 font-semibold'>Bitacoras</h1>
            <BasicLineChart />
          </div>

        </div>
        <div className='bg-slate-200 w-full sm:w-1/2 sm:h-auto h-60 rounded-lg p-5 text-center'>
          <h1 className='text-gray-700 text-lg sm:text-2xl font-semibold'>Etapas Productivas</h1>
          <GraficaBar />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
