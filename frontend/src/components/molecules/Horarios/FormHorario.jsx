import React, { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import axiosClient from "../../../configs/axiosClient";
import GlobalAlert from "../ComponentsGlobals/GlobalAlert";
import GlobalModal from "../ComponentsGlobals/GlobalModal";
import { useDisclosure } from "@nextui-org/react";
import { Clock } from 'lucide-react';

export const RegistroHorario = ({ refreshData, onClose }) => {
  const { isOpen, onOpen } = useDisclosure();
  const [horarioData, setHorarioData] = useState({
    hora_inicio: "",
    hora_fin: "",
    dia: "",
    horas: "",
    ficha: "",
    ambiente: "",
  });
  const [fichas, setFichas] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFichas = async () => {
      try {
        const response = await axiosClient.get("/fichas/listar");
        setFichas(response.data);
      } catch (error) {
        console.error("Error al obtener las fichas:", error);
      }
    };

    const fetchAmbientes = async () => {
      try {
        const response = await axiosClient.get("/ambientes/listar");
        setAmbientes(response.data);
      } catch (error) {
        console.error("Error al obtener los ambientes:", error);
      }
    };

    fetchFichas();
    fetchAmbientes();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setHorarioData({ ...horarioData, [name]: value });
  };

  const handleSelectChange = (name) => (e) => {
    setHorarioData({ ...horarioData, [name]: e.target.value });
  };

  const handleTimeChange = (name, value) => {
    setHorarioData({ ...horarioData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!horarioData.hora_inicio || !horarioData.hora_fin || !horarioData.dia || !horarioData.horas || !horarioData.ficha || !horarioData.ambiente) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await axiosClient.post("/horarios/registrar", horarioData);
      console.log("Respuesta del servidor:", response.data);
      setHorarioData({
        hora_inicio: "",
        hora_fin: "",
        dia: "",
        horas: "",
        ficha: "",
        ambiente: "",
      });
      onClose();
      refreshData();
    } catch (error) {
      console.error("Error al registrar el horario:", error.response?.data || error);
    }
  };

  const TimeInput = ({ label, name, value, onChange }) => (
    <Popover>
      <PopoverTrigger>
        <Input
          label={label}
          placeholder="Selecciona una hora"
          value={value}
          endContent={<Clock className="text-default-400" />}
          readOnly
        />
      </PopoverTrigger>
      <PopoverContent>
        <Input
          type="time"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="max-w-xs"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TimeInput
              label="Hora de Inicio"
              name="hora_inicio"
              value={horarioData.hora_inicio}
              onChange={handleTimeChange}
              className="w-96"
            />
            <TimeInput
              label="Hora de Fin"
              name="hora_fin"
              value={horarioData.hora_fin}
              onChange={handleTimeChange}
              className="w-96"

            />
            <Select
              label="Día"
              placeholder="Seleccione un día"
              name="dia"
              selectedKeys={horarioData.dia ? [horarioData.dia] : []}
              onChange={handleSelectChange("dia")}
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
              onChange={handleSelectChange("ficha")}
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
              onChange={handleSelectChange("ambiente")}
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
                Registrar
              </Button>
            </div>
          </form>

    </div>
  );
};

export default RegistroHorario;