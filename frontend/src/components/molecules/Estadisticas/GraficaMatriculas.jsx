import React, { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Tooltip } from '@nextui-org/react';
import axiosClient from '../../../configs/axiosClient';

function Grafica() {
  const [data, setData] = useState({
    Formacion: 0,
    Induccion: 0,
    Condicionado: 0,
    Cancelado: 0,
    RetiroVoluntario: 0,
    Certificado: 0,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Función para obtener los datos del backend
    const fetchData = async () => {
      try {
        const response = await axiosClient.get('matriculas/listarEstados');
        const fetchedData = response.data;

        const total = Object.values(fetchedData).reduce((acc, value) => acc + value, 0);

        setTotal(total);
        setData(fetchedData);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  // Calcular los datos para el gráfico de pastel
  const pieData = [
    { id: 0, value: total ? (data.Induccion / total) * 100 : 0, label: 'Inducción' },
    { id: 1, value: total ? (data.Formacion / total) * 100 : 0, label: 'Formación' },
    { id: 2, value: total ? (data.Condicionado / total) * 100 : 0, label: 'Condicionado' },
    { id: 3, value: total ? (data.Cancelado / total) * 100 : 0, label: 'Cancelado' },
    { id: 4, value: total ? (data.RetiroVoluntario / total) * 100 : 0, label: 'Retiro Voluntario' },
    { id: 5, value: total ? (data.PorCertificar / total) * 100 : 0, label: 'Por Certificar' },
    { id: 6, value: total ? (data.Certificado / total) * 100 : 0, label: 'Certificado' },
  ];

  // Filtrar los valores que son 0 para mostrar solo los que tienen información
  const filteredPieData = pieData.filter(item => item.value > 0);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
      {/* Gráfica de pastel */}
      <PieChart
        series={[{
          data: filteredPieData,
          innerRadius: 20,  // Ajustado para ser más pequeño
          outerRadius: 80,  // Ajustado para ser más pequeño
          paddingAngle: 5,
          cornerRadius: 5,
          startAngle: -90,
          cx: 150,
          cy: 150,
        }]}
        width={450}  // Ancho reducido
        height={350} // Alto reducido
        colors={['#359d61', '#33FF57', '#aee18e', '#0d324c', '#6e9493', '#108953', '#abd7b6']}
      >
        <Tooltip 
          render={({ datum }) => (
            <div style={{  background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}>
              <strong>{datum.label}</strong>: {Math.round(datum.value)}%
            </div>
          )}
        />
      </PieChart>
    </div>
  );
}

export default Grafica;
