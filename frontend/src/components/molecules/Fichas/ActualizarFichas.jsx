import React, { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import axiosClient from "../../../configs/axiosClient";
import GlobalAlert from "../ComponentsGlobals/GlobalAlert";
import GlobalModal from "../ComponentsGlobals/GlobalModal";

const ActualizarFicha = ({ item, onClose, refreshData }) => {
  const [fichaData, setFichaData] = useState({
    codigo: "",
    inicio_ficha: "",
    fin_lectiva: "",
    fin_ficha: "",
    programa: "",
    sede: "",
    estado: ""
  });
  const [programas, setProgramas] = useState([]);
  const [personas, setLideres] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      console.log("Item recibido:", item);
      const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : "";

      setFichaData({
        codigo: item.codigo ? item.codigo.toString() : "",
        instructor_lider: item.instructor_lider ? item.instructor_lider.toString() : "",
        inicio_ficha: formatDate(item.inicio_ficha),
        fin_lectiva: formatDate(item.fin_lectiva),
        fin_ficha: formatDate(item.fin_ficha),
        programa: item.programa ? item.programa.toString() : "",
        sede: item.sede || "",
        estado: item.estado || ""
      });
    }
    fetchProgramas();
    fetchLideres();
  }, [item]);

  const fetchProgramas = async () => {
    try {
      const response = await axiosClient.get("/programa/listar");
      setProgramas(response.data);
    } catch (error) {
      console.error("Error al obtener los programas:", error);
      GlobalAlert.error("Hubo un error al obtener los programas.");
    }
  };

  const fetchLideres = async () => {
    try {
      const response = await axiosClient.get("/personas/listarL");
      setLideres(response.data);
    } catch (error) {
      console.error("Error al obtener los lideres:", error);
      GlobalAlert.error("Hubo un error al obtener los lideres.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFichaData(prevData => {
      const newData = { ...prevData, [name]: value };
      console.log("Datos actualizados:", newData);
      return newData;
    });
    setError("");
  };

  const validateDates = () => {
    const inicio = new Date(fichaData.inicio_ficha);
    const finLectiva = new Date(fichaData.fin_lectiva);
    const finFicha = fichaData.fin_ficha ? new Date(fichaData.fin_ficha) : null;

    if (finLectiva <= inicio) {
      setError("La fecha de fin lectiva debe ser posterior a la fecha de inicio.");
      return false;
    }

    if (finFicha && finFicha <= finLectiva) {
      setError("La fecha de fin de ficha debe ser posterior a la fecha de fin lectiva.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Iniciando actualización de ficha. Datos actuales:", fichaData);

    if (!fichaData.codigo || !fichaData.instructor_lider || !fichaData.inicio_ficha || !fichaData.fin_lectiva || !fichaData.programa || !fichaData.sede || !fichaData.estado) {
      setError("Todos los campos son obligatorios excepto Fin de Ficha");
      console.error("Error de validación: Campos incompletos", fichaData);
      return;
    }

    if (!validateDates()) {
      console.error("Error de validación: Fechas inválidas", fichaData);
      return;
    }

    try {
      console.log(`Actualizando ficha con código: ${fichaData.codigo}`);
      const dataToSend = {
        codigo: fichaData.codigo,
        instructor_lider: parseInt(fichaData.instructor_lider),
        inicio_ficha: fichaData.inicio_ficha,
        fin_lectiva: fichaData.fin_lectiva,
        fin_ficha: fichaData.fin_ficha || null,
        programa: parseInt(fichaData.programa),
        sede: fichaData.sede,
        estado: fichaData.estado
      };
      console.log("Datos a enviar:", dataToSend);

      const response = await axiosClient.put(`/fichas/actualizar/${fichaData.codigo}`, dataToSend);

      console.log("Respuesta del servidor:", response.data);
      GlobalAlert.success("Ficha actualizada correctamente.");
      refreshData();
      onClose();
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      console.error("Estado de la respuesta:", error.response?.status);
      console.error("Headers de la respuesta:", error.response?.headers);
      const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
      GlobalAlert.error(`Error al actualizar la ficha: ${errorMessage}`);
    }
  };

  return (
    <GlobalModal
      isOpen={true}
      onOpenChange={onClose}
      title="Actualizar Ficha"
      children={
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Código de Ficha"
            value={fichaData.codigo}
            onChange={(e) => handleInputChange({ target: { name: 'codigo', value: e.target.value } })}
            required
          />
           <Select
            label="Instructor"
            placeholder="Seleccione un Instructor Lider"
            name="instructor_lider"
            selectedKeys={fichaData.instructor_lider ? [fichaData.instructor_lider] : []}
            onChange={(e) => handleInputChange({ target: { name: 'instructor_lider', value: e.target.value } })}
            required
          >
            {personas.map((instructor_lider) => (
              <SelectItem key={instructor_lider.id_persona.toString()} value={instructor_lider.id_persona.toString()}>
                {instructor_lider.nombres}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="Inicio de Ficha"
            type="date"
            name="inicio_ficha"
            value={fichaData.inicio_ficha}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Fin Lectiva"
            type="date"
            name="fin_lectiva"
            value={fichaData.fin_lectiva}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Fin de Ficha"
            type="date"
            name="fin_ficha"
            value={fichaData.fin_ficha}
            onChange={handleInputChange}
          />
          <Select
            label="Programa"
            placeholder="Seleccione un programa"
            name="programa"
            selectedKeys={fichaData.programa ? [fichaData.programa] : []}
            onChange={(e) => handleInputChange({ target: { name: 'programa', value: e.target.value } })}
            required
          >
            {programas.map((programa) => (
              <SelectItem key={programa.id_programa.toString()} value={programa.id_programa.toString()}>
                {programa.nombre_programa}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Sede"
            placeholder="Seleccione una sede"
            name="sede"
            selectedKeys={fichaData.sede ? [fichaData.sede] : []}
            onChange={(e) => handleInputChange({ target: { name: 'sede', value: e.target.value } })}
            required
          >
            <SelectItem key="centro" value="centro">Centro</SelectItem>
            <SelectItem key="yamboro" value="yamboro">Yamboro</SelectItem>
          </Select>
          <Select
            label="Estado"
            placeholder="Seleccione el estado"
            name="estado"
            selectedKeys={fichaData.estado ? [fichaData.estado] : []}
            onChange={(e) => handleInputChange({ target: { name: 'estado', value: e.target.value } })}
            required
          >
            <SelectItem key="Lecttiva" value="Lecttiva">Lecttiva</SelectItem>
            <SelectItem key="Electiva" value="Electiva">Electiva</SelectItem>
            <SelectItem key="Finalizado" value="Finalizado">Finalizado</SelectItem>
          </Select>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end gap-5 mr-5 my-5">
            <Button className="bg-[#0d324c] text-white" type="submit" color="success">
              Actualizar
            </Button>
          </div>
        </form>
      }
    />
  );
};

export default ActualizarFicha;