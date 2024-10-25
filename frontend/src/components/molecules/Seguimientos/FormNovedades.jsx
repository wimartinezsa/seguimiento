import React, { useState, useEffect } from "react";
import { Input, Button, SelectItem, Select } from "@nextui-org/react";
import axiosClient from "../../../configs/axiosClient";
import Swal from 'sweetalert2'; // Importar SweetAlert2

const FormNovedades = ({ onSubmit, onClose, actionLabel, mode, initialData }) => {
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || "");
  const [fecha, setFecha] = useState(initialData?.fecha || "");
  const [foto, setFoto] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(initialData?.id_seguimiento || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [instructor, setInstructor] = useState(""); // Cambia aquí

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (mode === 'update' && initialData.id_novedad) {
          await loadInitialData();
        }
        const response = await axiosClient.get("/seguimientos/listar");
        setSeguimientos(response.data);
      } catch (error) {
        console.error("Error al cargar datos", error);
        setErrorMessage("Error al cargar datos. Intenta de nuevo más tarde.");
      }
    };

    fetchInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const response = await axiosClient.get(`/novedad/listarN/${initialData.id_novedad}`);
      const novedad = response.data;

      setFecha(new Date(novedad.fecha));
      setDescripcion(novedad.descripcion);
      setSelectedSeguimiento(novedad.id_seguimiento);

      if (novedad.foto) {
        setFoto(novedad.foto);
      }
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      setErrorMessage("Error al cargar datos iniciales. Intenta de nuevo más tarde.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData();
    formData.append("descripcion", descripcion);
    formData.append("fecha", fecha);
    formData.append("instructor", instructor); // Cambia aquí para usar instructor
    formData.append("seguimiento", selectedSeguimiento);

    if (foto) {
      formData.append("foto", foto);
    }

    try {
      if (mode === 'update' && initialData?.id_novedad) {
        await axiosClient.put(`/novedad/actualizar/${initialData.id_novedad}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axiosClient.post("/novedad/registrar", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Mostrar alerta de éxito con SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Registro exitoso!',
        text: 'La novedad se ha guardado correctamente.',
        confirmButtonText: 'Aceptar'
      });

      if (onSubmit) {
        onSubmit(); // Asegúrate de que onSubmit sea una función
      }
      if (onClose) {
        onClose(); // Asegúrate de que onClose sea una función
      }
    } catch (error) {
      console.error("Error del servidor:", error);
      setErrorMessage("Error del servidor: " + error.message);
      // Mostrar alerta de error con SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar la novedad. Intenta de nuevo.',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const formattedFecha = typeof fecha === 'string' ? fecha : new Date(fecha).toISOString().split('T')[0];

  // Obtén el instructor desde el localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setInstructor(user.nombres); // Asume que el objeto de usuario tiene una propiedad 'nombre'
      } catch (error) {
        console.error("Error al parsear el JSON del usuario:", error);
      }
    }
  }, []);

  return (
    <form method="post" onSubmit={handleSubmit}>
      <h1 className="text-xl font-bold mb-4">
        Registro de Novedades
      </h1>
      <div className="ml-5 align-items-center">
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <div className="py-2">
          <Input
            type="date"
            label="Fecha"
            value={formattedFecha}
            onChange={(e) => setFecha(e.target.value)}
            readOnly={mode === 'update'}
            className="w-96 my-4"
          />
        </div>

        <div className="py-2">
          {mode === 'update' && foto && (
            <img src={foto instanceof File ? URL.createObjectURL(foto) : foto} alt="Foto actual" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          )}
          <Input
            type="file"
            className="w-96 mb-4"
            id="foto"
            name="foto"
            accept="image/*" // Permitir solo imágenes
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const fileType = file.type.split('/')[0]; // Obtener el tipo de archivo (ej. image)
                if (fileType === 'image') {
                  setFoto(file);
                } else {
                  setErrorMessage("Por favor, selecciona un archivo de imagen.");
                  setFoto(null); // Limpiar el estado de foto si no es una imagen
                }
              }
            }}
          />
        </div>

        <div className="py-2">
          <Input
            type="text"
            label="Descripción"
            id="descripcion"
            name="descripcion"
            classNames="w-96"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        <div>
          <Select
            className="my-4 w-96"
            onChange={(e) => setSelectedSeguimiento(e.target.value)}
            value={selectedSeguimiento}
            placeholder="Selecciona un Seguimiento"
            required
            id="id_seguimiento"
            name="id_seguimiento"
          >
            <SelectItem value="">Selecciona un seguimiento</SelectItem>
            {seguimientos.map((seguimiento, index) => (
              <SelectItem key={seguimiento.id_seguimiento} value={seguimiento.id_seguimiento}>
                {`${index + 1} `}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-5 mt-5">
          <Button type="submit" className="bg-[#0d324c] text-white">
            {(mode === 'update' ? 'Actualizar' : 'Registrar')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FormNovedades;
