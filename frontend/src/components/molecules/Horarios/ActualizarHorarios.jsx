import React, { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import axiosClient from "../../../configs/axiosClient";
import GlobalAlert from "../ComponentsGlobals/GlobalAlert";
import GlobalModal from "../ComponentsGlobals/GlobalModal";

const ActualizarHorario = ({ item, onClose, refreshData }) => {
  const [horarioData, setHorarioData] = useState({
    id_horario: "",
    hora_inicio: "",
    hora_fin: "",
    dia: "",
    horas: "",
    ficha: "",
    ambiente: ""
    });
  const [fichas, setFichas] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      console.log("Item recibido:", item);
      setHorarioData({
        id_horario: item.id_horario ? item.id_horario.toString() : "",
        hora_inicio: item.hora_inicio || "",
        hora_fin: item.hora_fin || "",
        dia: item.dia || "",
        horas: item.horas ? item.horas.toString() : "",
        ficha: item.ficha ? item.ficha.toString() : "",
        ambiente: item.ambiente ? item.ambiente.toString() : ""
            });
    }
    fetchFichas();
    fetchAmbientes();
  }, [item]);

  const fetchFichas = async () => {
    try {
      const response = await axiosClient.get("/fichas/listar");
      setFichas(response.data);
    } catch (error) {
      console.error("Error al obtener las fichas:", error);
      GlobalAlert.error("Hubo un error al obtener las fichas.");
    }
  };

  const fetchAmbientes = async () => {
    try {
      const response = await axiosClient.get("/ambientes/listar");
      setAmbientes(response.data);
    } catch (error) {
      console.error("Error al obtener los ambientes:", error);
      GlobalAlert.error("Hubo un error al obtener los ambientes.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHorarioData(prevData => {
      const newData = { ...prevData, [name]: value };
      console.log("Datos actualizados:", newData);
      return newData;
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Iniciando actualización de horario. Datos actuales:", horarioData);

    if (!horarioData.hora_inicio || !horarioData.hora_fin || !horarioData.dia || !horarioData.horas || !horarioData.ficha || !horarioData.ambiente ) {
      setError("Todos los campos son obligatorios");
      console.error("Error de validación: Campos incompletos", horarioData);
      return;
    }

    try {
      console.log(`Actualizando horario con ID: ${horarioData.id_horario}`);
      const dataToSend = {
        id_horario: parseInt(horarioData.id_horario),
        hora_inicio: horarioData.hora_inicio,
        hora_fin: horarioData.hora_fin,
        dia: horarioData.dia,
        horas: parseInt(horarioData.horas),
        ficha: parseInt(horarioData.ficha),
        ambiente: parseInt(horarioData.ambiente),
      };
      console.log("Datos a enviar:", dataToSend);

      const response = await axiosClient.put(`/horarios/actualizar/${horarioData.id_horario}`, dataToSend);
      console.log("Respuesta del servidor:", response.data);
      GlobalAlert.success("Horario actualizado correctamente.");
      refreshData(); // Llamar a la función refreshData
      onClose();
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      console.error("Headers de la respuesta:", error.response?.headers);
      const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
      GlobalAlert.error(`Error al actualizar el horario: ${errorMessage}`);
    }
  };

  return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      
          <Input
            label="Hora de Inicio"
            type="time"
            name="hora_inicio"
            value={horarioData.hora_inicio}
            onChange={handleInputChange}
            required
            className="w-96"
          />
          <Input
            label="Hora de Fin"
            type="time"
            name="hora_fin"
            value={horarioData.hora_fin}
            onChange={handleInputChange}
            required
            className="w-96"
          />
          <Select
            label="Día"
            placeholder="Seleccione un día"
            name="dia"
            selectedKeys={horarioData.dia ? [horarioData.dia] : []}
            onChange={(e) => handleInputChange({ target: { name: 'dia', value: e.target.value } })}
            required
            className="w-96"
          >
            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabados', 'domingo'].map((dia) => (
              <SelectItem key={dia} value={dia}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="Horas"
            placeholder="Ingrese el número de horas"
            name="horas"
            type="number"
            value={horarioData.horas}
            onChange={handleInputChange}
            required
            className="w-96"
          />
          <Select
            label="Ficha"
            placeholder="Seleccione una ficha"
            name="ficha"
            selectedKeys={horarioData.ficha ? [horarioData.ficha] : []}
            onChange={(e) => handleInputChange({ target: { name: 'ficha', value: e.target.value } })}
            required
            className="w-96"
          >
            {fichas.map((ficha) => (
              <SelectItem key={ficha.codigo.toString()} textValue={ficha.codigo.toString()}>
                {ficha.codigo}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Ambiente"
            placeholder="Seleccione un ambiente"
            name="ambiente"
            selectedKeys={horarioData.ambiente ? [horarioData.ambiente] : []}
            onChange={(e) => handleInputChange({ target: { name: 'ambiente', value: e.target.value } })}
            required
            className="w-96"
          >
            {ambientes.map((ambiente) => (
              <SelectItem key={ambiente.id_ambiente.toString()} textValue={ambiente.nombre_amb}>
                {ambiente.nombre_amb}
              </SelectItem>
            ))}
          </Select>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end gap-5 mr-5 my-5">
              <Button className="bg-[#0d324c] text-white" type="submit" color="success">
                Actualizar
              </Button>
            </div>
        </form>
  );
};

export default ActualizarHorario;