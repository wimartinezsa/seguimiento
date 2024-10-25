import React, { useState } from 'react';
import RegistroFicha from '../molecules/Fichas/FormFichas';
import GlobalTable from '../molecules/ComponentsGlobals/GlobalTable';
import ActualizarFicha from '../molecules/Fichas/ActualizarFichas';

function TableFichasPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRegisterSuccess = () => {
    setRefreshTrigger(prev => !prev);
  };

  const columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre_programa', label: 'Programa' },
    { key: 'nombre_instructor', label: 'Instructor' },
    { key: 'estado', label: 'Estado' },
    { key: 'inicio_ficha', label: 'Inicio de Ficha' },
    { key: 'fin_lectiva', label: 'Fin de Lectiva' },
    { key: 'fin_ficha', label: 'Fin de Ficha' },
    { key: 'sede', label: 'Sede' },
  ];

  return (
    <>
      <main className='w-full p-3 h-screen'>
        <div className='my-5 flex flex-col py-5'>
          <RegistroFicha onRegisterSuccess={handleRegisterSuccess} />
          <GlobalTable
            columns={columns}
            dataEndpoint="/fichas/listar"
            refreshTrigger={refreshTrigger}
            updateComponent={ActualizarFicha}
            contentName="fichas"
            desactivarEndpoint="/fichas/fin/" 
            idField="codigo"
          />

        </div>
      </main>
    </>
  );
};

export default TableFichasPage;
