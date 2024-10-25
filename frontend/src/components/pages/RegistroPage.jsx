import React, { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import axiosClient from "../../configs/axiosClient";
import { EyeFilledIcon } from "../NextIU/EyeFilledIcon.jsx";
import { EyeSlashFilledIcon } from "../NextIU/EyeSlashFilledIcon.jsx";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

function Registro({ initialData }) {
  const [identificacion, setIdentificacion] = useState("");
  const [nombres, setNombres] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargo, setCargo] = useState("Selecciona");
  const [sede, setSede] = useState("Selecciona");
  const [telefono, setTelefono] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [idPersona, setIdPersona] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Usar navigate para redirección

  useEffect(() => {
    if (initialData) {
      console.log('Initial Data:', initialData);
      setIdentificacion(initialData.identificacion || "");
      setNombres(initialData.nombres || "");
      setCorreo(initialData.correo || "");
      setPassword(initialData.password || "");
      setTelefono(initialData.telefono || "");
      setCargo(initialData.cargo || "Selecciona");
      setSede(initialData.sede || "Selecciona");
      setIdPersona(initialData.id_persona);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({}); // Limpiar errores previos

    const formData = {
      identificacion,
      nombres,
      correo,
      password,
      cargo,
      telefono,
      sede,
    };

    try {
      const response = await axiosClient.post('/personas/registrares', formData);
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario registrado correctamente',
          showConfirmButton: false,
          timer: 1500
        });

        navigate('/'); // Redirigir a la ruta de login
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar usuario',
          text: 'Por favor, intenta nuevamente.',
        });
      }
    } catch (error) {
      console.error("Error del servidor:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error del servidor',
        text: error.message,
      });
    }
  };

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="relative flex flex-col bg-white shadow-2xl rounded-2xl p-3 md:w-auto md:flex-row transition-transform duration-500 hover:scale-105">
        <div className="flex flex-col p-5 space-y-4">
          <h1 className="text-2xl font-bold text-center mb-6">Registro de Usuario</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className='relative'>
              <Input
                type="number"
                label='Identificación'
                id='identificacion'
                name="identificacion"
                className="w-96"
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                required
                helperText={errors.identificacion}
                status={errors.identificacion ? 'error' : 'default'}
              />
            </div>
            <div className='relative'>
              <Input
                type="text"
                label='Nombres Completos'
                id='nombres'
                name="nombres"
                className="w-96"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
                helperText={errors.nombres}
                status={errors.nombres ? 'error' : 'default'}
              />
            </div>
            <div className='relative'>
              <Input
                type="email"
                label='Correo Electrónico'
                id='correo'
                name="correo"
                className="w-96"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                helperText={errors.correo}
                status={errors.correo ? 'error' : 'default'}
              />
            </div>
            <div className='relative'>
              <Input
                label="Password"
                className="w-96"
                name='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endContent={
                  <button type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-gray-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-gray-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
              />
            </div>
            <div className='relative'>
              <Input
                type="number"
                label='Teléfono'
                id='telefono'
                name="telefono"
                className="w-96"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                helperText={errors.telefono}
                status={errors.telefono ? 'error' : 'default'}
              />
            </div>

            <div className="relative">
              <select
                name="cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className={`w-96 h-14 rounded-lg bg-gray-100 p-3 ${errors.cargo ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="Selecciona">Selecciona un Cargo</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Coordinador">Coordinador</option>
              </select>
              {errors.cargo && <p className="text-red-500 text-sm">{errors.cargo}</p>}
            </div>

            <div className="relative">
              <select
                name="sede"
                value={sede}
                onChange={(e) => setSede(e.target.value)}
                className={`w-96 h-14 rounded-lg bg-gray-100 p-3 ${errors.sede ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="Selecciona">Selecciona una Sede</option>
                <option value="Yamboro">Yamboro</option>
                <option value="Centro">Centro</option>
              </select>
              {errors.sede && <p className="text-red-500 text-sm">{errors.sede}</p>}
            </div>

            <div className="flex justify-end mt-6">
              <Button className="bg-[#84cc16] hover:bg-[#70b22d] text-white w-96 rounded-lg" type="submit">
                Registrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registro;