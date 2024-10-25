import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import { PieChart } from '@mui/x-charts/PieChart';
import { Tooltip } from '@nextui-org/react';
import axiosClient from '../../../configs/axiosClient';

function BasicLineChart() {
  const [data, setData] = useState({
    solicitud: 0,
    aprobado: 0,
    noaprobado: 0,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get('bitacoras/listarEstados');
        const conteos = {
          solicitud: 0,
          aprobado: 0,
          noaprobado: 0,
        };

        response.data.forEach(item => {
          if (item.estado === 'solicitud') {
            conteos.solicitud = item.total;
          } else if (item.estado === 'aprobado') {
            conteos.aprobado = item.total;
          } else if (item.estado === 'noaprobado') {
            conteos.noaprobado = item.total;
          }
        });

        setData(conteos);
        
        const totalCount = conteos.solicitud + conteos.aprobado + conteos.noaprobado;
        setTotal(totalCount);

      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  const pieData = [
    { label: 'Solicitud', value: total ? (data.solicitud / total) * 100 : 0 },
    { label: 'Aprobado', value: total ? (data.aprobado / total) * 100 : 0 },
    { label: 'No Aprobado', value: total ? (data.noaprobado / total) * 100 : 0 },
  ];

  const filteredPieData = pieData.filter(item => item.value > 0);

  return (
    <Stack direction="row" justifyContent="center" alignItems="center" width="100%" height="100%">
      <PieChart
        series={[{
          startAngle: -90,
          endAngle: 90,
          paddingAngle: 5,
          innerRadius: 60,
          outerRadius: 80,
          data: filteredPieData,
        }]}
        width={260}
        height={200}
        colors={['#ffa500', '#33FF57', '#ff0000']}
        margin={{ top: 80, left: 50}}
        slotProps={{
          legend: { hidden: true },
        }}
      >
        <Tooltip 
          render={({ datum }) => (
            <div style={{ padding: '8px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}>
              <strong>{datum.label}</strong>: {Math.round(datum.value)}%
            </div>
          )}
        />
      </PieChart>
    </Stack>
  );
}

export default BasicLineChart;
