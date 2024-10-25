import React, { useState, useEffect, useContext } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import Swal from 'sweetalert2';
import axiosClient from "../../../configs/axiosClient";
import PersonasContext from "../../../context/PersonasContext";

function FormAprendices({ initialData }) {
  const { registrarAprendiz } = useContext(PersonasContext);
  const [identificacion, setIdentificacion] = useState("");
  const [nombres, setNombres] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [municipio, setMunicipio] = useState([]);
  const [selectedMunicipio, setSelectMunicipio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [idPersona, setIdPersona] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        const response = await axiosClient.get("/personas/listarM");
        setMunicipio(response.data);
      } catch (error) {
        console.error("Error al obtener municipios", error);
      }
    };

    fetchMunicipios();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log('Initial Data:', initialData);
      setIdentificacion(initialData.identificacion || "");
      setNombres(initialData.nombres || "");
      setCorreo(initialData.correo || "");
      setSelectMunicipio(initialData.municipio || "Selecciona");
      setIdPersona(initialData.id_persona); // Establecer el ID de la persona
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrors({});

    const formData = {
      identificacion,
      nombres,
      correo,
      telefono,
      municipio: selectedMunicipio,
    };

    /*     console.log("Campos enviados:", formData);
     */

    try {
      if (isEditing) {
        // Actualizar el usuario
        await axiosClient.put(`/personas/actualizar/${idPersona}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Usuario actualizado correctamente',
        });
      } else {
        // Registrar un nuevo usuario
        await registrarAprendiz(formData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Usuario registrado correctamente',
        });
      }

      // Puedes omitir la llamada a getPersonas ya que registrarInstructor ya actualiza la lista
    } catch (error) {
      console.error("Error del servidor:", error);
      const { response } = error;

      // Manejar errores específicos del backend
      if (response && response.data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Error desconocido',
        });

        // Aquí puedes también actualizar el estado de errores si es necesario
        setErrors(response.data.errors || {});
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error del servidor: ' + error.message,
        });
      }
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        {isEditing ? "Actualizar Aprendiz" : "Registro de Aprendices"}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className='relative py-2'>
          <Input
            type="number"
            label='Identificación'
            id='identificacion'
            name="identificacion"
            className="w-96"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            required
            helperText={errors.identificacion} // Mostrar error si existe
            status={errors.identificacion ? 'error' : 'default'}
          />
        </div>
        <div className='relative py-2'>
          <Input
            type="text"
            label='Nombres Completos'
            id='nombres'
            name="nombres"
            className="w-96"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            required
            helperText={errors.nombres} // Mostrar error si existe
            status={errors.nombres ? 'error' : 'default'}
          />
        </div>
        <div className='relative py-2'>
          <Input
            type="email"
            label='Correo Electrónico'
            id='correo'
            name="correo"
            className="w-96"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            helperText={errors.correo} // Mostrar error si existe
            status={errors.correo ? 'error' : 'default'}
          />
        </div>
        <div className='relative py-2'>
          <Input
            type="number"
            label='Teléfono'
            id='telefono'
            name="telefono"
            className="w-96"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            helperText={errors.telefono} // Mostrar error si existe
            status={errors.telefono ? 'error' : 'default'}
          />
        </div>
        <Select
          id="municipios"
          name="Municipio"
          value={selectedMunicipio}
          onChange={(e) => setSelectMunicipio(e.target.value)}
          placeholder="Seleccione un Municipio"
          required
          className="max-w-2xl py-2"
        >
          <SelectItem value="">Selecciona un Municipio</SelectItem>
          {municipio.map((municipio) => (
            <SelectItem key={municipio.id_municipio} value={municipio.id_municipio}>
              {municipio.nombre_mpio}
            </SelectItem>
          ))}
        </Select>
        <div className="flex justify-end gap-5 mt-5">
          <Button className="bg-[#0d324c] text-white" type="submit" color="success">
            {isEditing ? "Actualizar" : "Registrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default FormAprendices;
