import React, { createContext, useState, useEffect } from "react";
import axiosClient from "../configs/axiosClient";

// Crear el contexto
const PersonasContext = createContext();

export const PersonasProvider = ({ children }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [error, setError] = useState(null); // Para manejar errores
  const [aprendices, setAprendices] = useState([]); // Estado para los aprendices

  // Función para obtener la lista de personas
  const getPersonas = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/personas/listarI");
      setPersonas(response.data);
    } catch (error) {
      console.error("Error al obtener personas:", error);
      setError("Error al obtener la lista de personas.");
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo instructor
  const registrarInstructor = async (formData) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/personas/registrarI", formData);
      setPersonas((prevPersonas) => [...prevPersonas, response.data]); // Actualiza el estado con el nuevo instructor
      console.log(response.data);
    } catch (error) {
      console.error("Error al registrar instructor:", error);
      setError("Error al registrar el instructor.");
      throw error; // Opcional: lanzar el error si quieres manejarlo en otro lugar
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la lista de aprendices
  const getAprendices = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/personas/listarA");
      setAprendices(response.data);
    } catch (error) {
      console.error("Error al obtener aprendices:", error);
      setError("Error al obtener la lista de aprendices.");
    } finally {
      setLoading(false);
    }
  };

  // **Función para registrar un nuevo aprendiz**
  const registrarAprendiz = async (formData) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/personas/registrarA", formData);
      setAprendices((prevAprendices) => [...prevAprendices, response.data]); // Actualiza el estado con el nuevo aprendiz
      console.log(response.data);
    } catch (error) {
      console.error("Error al registrar aprendiz:", error);
      setError("Error al registrar el aprendiz.");
      throw error; // Opcional: lanzar el error si quieres manejarlo en otro lugar
    } finally {
      setLoading(false);
    }
  };

  // Cargar las personas cuando el componente se monta
  useEffect(() => {
    getPersonas();
  }, []);

  return (
    <PersonasContext.Provider
      value={{
        personas,
        getPersonas,
        registrarInstructor,
        getAprendices,
        registrarAprendiz, // Añadir esta función al contexto
        aprendices,
        loading,
        error,
      }}
    >
      {children}
    </PersonasContext.Provider>
  );
};

export default PersonasContext;
