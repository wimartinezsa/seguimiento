import React, { useState, useEffect } from 'react';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import axiosClient from '../../../configs/axiosClient';
import GlobalAlert from '../ComponentsGlobals/GlobalAlert';
import GlobalModal from '../ComponentsGlobals/GlobalModal';

const UpdateEmpresa = ({ item, onClose, refreshData }) => {
  const [datosEmpresa, setDatosEmpresa] = useState({
    id_empresa: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    correo: '',
    municipio: '',
    jefe_inmediato: '',
  });
  const [municipios, setMunicipios] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setDatosEmpresa({
        id_empresa: item.id_empresa.toString(),
        razon_social: item.razon_social || '',
        direccion: item.direccion || '',
        telefono: item.telefono || '',
        correo: item.correo || '',
        municipio: item.municipio ? item.municipio.toString() : '',
        jefe_inmediato: item.jefe_inmediato || '',
      });
    }
    obtenerMunicipios();
  }, [item]);

  const obtenerMunicipios = async () => {
    try {
      const response = await axiosClient.get('/municipios/listar');
      setMunicipios(response.data);
    } catch (error) {
      console.error('Error al obtener los municipios:', error);
      GlobalAlert.error('Hubo un error al obtener los municipios.');
    }
  };

  const manejarCambioDeEntrada = (e) => {
    const { name, value } = e.target;
    setDatosEmpresa((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError('');
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();
    console.log('Iniciando actualización de empresa. Datos actuales:', datosEmpresa);

    if (
      !datosEmpresa.razon_social ||
      !datosEmpresa.direccion ||
      !datosEmpresa.telefono ||
      !datosEmpresa.correo ||
      !datosEmpresa.municipio ||
      !datosEmpresa.jefe_inmediato
    ) {
      setError('Todos los campos son obligatorios');
      console.error('Error de validación: Campos incompletos', datosEmpresa);
      return;
    }

    try {
      console.log(`Actualizando empresa con ID: ${datosEmpresa.id_empresa}`);
      const datosAEnviar = {
        id_empresa: parseInt(datosEmpresa.id_empresa),
        razon_social: datosEmpresa.razon_social,
        direccion: datosEmpresa.direccion,
        telefono: datosEmpresa.telefono,
        correo: datosEmpresa.correo,
        municipio: parseInt(datosEmpresa.municipio),
        jefe_inmediato: datosEmpresa.jefe_inmediato,
      };
      console.log('Datos a enviar:', datosAEnviar);

      const response = await axiosClient.put(`/empresas/actualizar/${datosEmpresa.id_empresa}`, datosAEnviar);
      console.log('Respuesta del servidor:', response.data);
      GlobalAlert.success('Empresa actualizada correctamente.');
      refreshData();
      onClose();
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      console.error('Headers de la respuesta:', error.response?.headers);
      const mensajeDeError = error.response?.data?.message || error.message || 'Error desconocido';
      GlobalAlert.error(`Error al actualizar la empresa: ${mensajeDeError}`);
    }
  };

  return (
    <GlobalModal
      isOpen={true}
      onOpenChange={onClose}
      title="Actualizar Empresa"
    >
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <Input
          label="Razón Social"
          name="razon_social"
          value={datosEmpresa.razon_social}
          onChange={manejarCambioDeEntrada}
          required
        />
        <Input
          label="Dirección"
          name="direccion"
          value={datosEmpresa.direccion}
          onChange={manejarCambioDeEntrada}
          required
        />
        <Input
          label="Teléfono"
          name="telefono"
          value={datosEmpresa.telefono}
          onChange={manejarCambioDeEntrada}
          required
        />
        <Input
          label="Correo"
          name="correo"
          value={datosEmpresa.correo}
          onChange={manejarCambioDeEntrada}
          required
        />
        <Select
          label="Municipio"
          name="municipio"
          selectedKeys={datosEmpresa.municipio ? [datosEmpresa.municipio] : []}
          onChange={(e) => manejarCambioDeEntrada({ target: { name: 'municipio', value: e.target.value } })}
          required
        >
          {municipios.map((municipio) => (
            <SelectItem key={municipio.id_municipio.toString()} value={municipio.id_municipio.toString()}>
              {municipio.nombre_mpio}
            </SelectItem>
          ))}
        </Select>
        <Input
          label="Jefe Inmediato"
          name="jefe_inmediato"
          value={datosEmpresa.jefe_inmediato}
          onChange={manejarCambioDeEntrada}
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end gap-5 mr-5 my-5">
              <Button className="bg-[#0d324c] text-white" type="submit" color="success">
                Actualizar
              </Button>
            </div>
      </form>
    </GlobalModal>
  );
};

export default UpdateEmpresa;