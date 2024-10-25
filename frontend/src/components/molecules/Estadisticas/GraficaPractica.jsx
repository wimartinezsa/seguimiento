import * as React from 'react';
import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import axiosClient from '../../../configs/axiosClient';
import { PieChart } from '@mui/x-charts/PieChart';

export default function GraficaBar() {
  const [data, setData] = useState({
    Inicio: 0,
    Renuncia: 0,
    Terminado: 0,
  });
  const [highlightedItem, setHighLightedItem] = React.useState(null);
  const [chartHeight, setChartHeight] = useState(350); // Altura por defecto
  const [chartWidthBar, setChartWidthBar] = useState('500%'); // Ancho por defecto
  const [chartWidthPie, setChartWidthPie] = useState('100%'); // Ancho por defecto

  useEffect(() => {
    // Función para obtener los datos del backend
    const fetchData = async () => {
      try {
        const response = await axiosClient.get('productiva/listarEstados');
        const fetchedData = response.data;

        // Asegurarse de que los valores estén en el formato correcto
        setData(fetchedData);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  // Establecer la altura y el ancho de la gráfica según el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // Pantallas pequeñas (móviles)
        setChartHeight(200);
        setChartWidthBar('500%'); // Ancho completo para móviles
        setChartWidthPie('50%'); // Ancho completo para móviles☻
      } else { // Pantallas grandes (PC)
        setChartHeight(350);
        setChartWidthBar('80%'); // Ancho por defecto para PC
        setChartWidthPie('50%'); // Ancho por defecto para PC
      }
    };

    handleResize(); // Llamar la función al montar el componente
    window.addEventListener('resize', handleResize); // Escuchar cambios de tamaño

    return () => {
      window.removeEventListener('resize', handleResize); // Limpiar el listener al desmontar
    };
  }, []);

  // Calcular el total
  const total = data.Inicio + data.Renuncia + data.Terminado;

  // Calcular los datos en porcentaje
  const chartData = [
    { estado: 'Inicio', total: total > 0 ? (data.Inicio / total) * 100 : 0 },
    { estado: 'Renuncia', total: total > 0 ? (data.Renuncia / total) * 100 : 0 },
    { estado: 'Terminado', total: total > 0 ? (data.Terminado / total) * 100 : 0 },
  ];

  // Filtrar los valores que son 0 para mostrar solo los que tienen información
  const filteredChartData = chartData.filter(item => item.total > 0);

  // Props para la gráfica de barras
  const barChartProps = {
    xAxis: [{ scaleType: 'band', data: filteredChartData.map(item => item.estado) }],
    series: [
      {
        data: filteredChartData.map(item => item.total),
        id: 'sync',
        highlightScope: { highlight: 'item', fade: 'global' }, // Resaltado
      },
    ],
    height: chartHeight, // Usar la altura dinámica
    slotProps: {
      legend: {
        hidden: true,
      },
    },
  };

  // Props para la gráfica de torta
  const pieChartProps = {
    series: [
      {
        id: 'sync',
        data: filteredChartData.map(item => ({
          value: item.total,
          label: item.estado,
          id: item.estado,
        })),
        highlightScope: { highlight: 'item', fade: 'global' }, // Resaltado
      },
    ],
    height: 250, // Ajustamos la altura de la gráfica de pastel
    slotProps: {
      legend: {
        hidden: true,
      },
    },
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }} 
      // Alineamos la gráfica de pastel en la parte superior derecha
    >
      <div style={{ width: chartWidthBar }}> {/* Gráfica de barras con ancho dinámico */}
        <BarChart
          {...barChartProps}
          highlightedItem={highlightedItem}
          onHighlightChange={setHighLightedItem}
          colors={['#33FF57']}
        />
      </div>
      <div style={{ width: chartWidthPie }}> {/* Gráfica de pastel con ancho dinámico */}
        <PieChart
          {...pieChartProps}
          highlightedItem={highlightedItem}
          onHighlightChange={setHighLightedItem}
          colors={['#0d324c', '#ff0000', '#33FF57']}
        />
      </div>
    </Stack>
  );
}
