import React, { useState } from 'react';
import GlobalTable from '../molecules/ComponentsGlobals/GlobalTable';
import RegistroEmpresa from '../molecules/Empresas/FormEmpresa';
import UpdateEmpresa from '../molecules/Empresas/ActualizarEmpresa';

function TableEmpresas() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRegisterSuccess = () => {
    setRefreshTrigger(prev => !prev);
  };

  const columns = [
    { key: 'id_empresa', label: 'Empresa' },
    { key: 'razon_social', label: 'Nombre' },
    { key: 'jefe_inmediato', label: 'Jefe' },
    { key: 'direccion', label: 'Direccion' },
    { key: 'correo', label: 'Correo' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'nombre_mpio', label: 'Municipio' },
    { key: 'departamento', label: 'Departamento' },
  ];

 

  return (
    <>
      <main className='w-full p-3 h-screen'>
        <div className='my-5 flex flex-col py-5'>
          <RegistroEmpresa onRegisterSuccess={handleRegisterSuccess}/>
          <GlobalTable 
            columns={columns} 
            dataEndpoint="/empresas/listar" 
            refreshTrigger={refreshTrigger}
            updateComponent={UpdateEmpresa} 
            desactivarEndpoint="/empresas/inactivar/" 
            idField="id_empresa"
          />
        </div>

      </main>
    </>
  );
};


export default TableEmpresas