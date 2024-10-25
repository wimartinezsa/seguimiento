import React, { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import axiosClient from "../../../configs/axiosClient";
import GlobalAlert from "../ComponentsGlobals/GlobalAlert";
import GlobalModal from "../ComponentsGlobals/GlobalModal";
import { useDisclosure } from "@nextui-org/react";
import { Calendar } from 'lucide-react';

export const RegistroEmpresa = ({ onRegisterSuccess }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [empresaData, setEmpresaData] = useState({
    razon_social: "",
    direccion: "",
    telefono: "",
    correo: "",
    municipio: "",
    jefe_inmediato: "",

  });
  const [municipios, setMunicipios] = useState([]);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        const response = await axiosClient.get("/municipios/listar");
        setMunicipios(response.data);
      } catch (error) {
        console.error("Error al obtener los municipios:", error);
        GlobalAlert.error("Hubo un error al obtener los municipios.");
      }
    };
    fetchMunicipios();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEmpresaData({ ...empresaData, [name]: value });
  };

  const handleSelectChange = (name) => (e) => {
    setEmpresaData({ ...empresaData, [name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!empresaData.razon_social || !empresaData.direccion || !empresaData.telefono || !empresaData.municipio) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }

    try {
      const response = await axiosClient.post("/empresas/registrar", empresaData);
      console.log("Respuesta del servidor:", response.data);
      GlobalAlert.success("Empresa registrada correctamente.");
      setEmpresaData({
        razon_social: "",
        direccion: "",
        telefono: "",
        correo: "",
        municipio: "",
        jefe_inmediato: "",
      });
      onClose();
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      console.error("Error al registrar la empresa:", error.response?.data || error);
      GlobalAlert.error("Hubo un error al registrar la empresa.");
    }
  };




  return (
    <div className="flex flex-col gap-2">
    <div className="relative z-20 flex items-center justify-end gap-3">
      <Button
        onPress={onOpen}
        className="bg-[#0d324c] text-white absolute top-0 z-30" // Aseguramos que el botón tenga un z-index alto
      >
        Registrar Empresa
      </Button>
    </div>
      <GlobalModal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Registro de Empresas"
        children={
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Razón Social"
              placeholder="Ingresa la razón social"
              name="razon_social"
              value={empresaData.razon_social}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Dirección"
              placeholder="Ingresa la dirección"
              name="direccion"
              value={empresaData.direccion}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Teléfono"
              placeholder="Ingresa el teléfono"
              name="telefono"
              value={empresaData.telefono}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Correo"
              placeholder="Ingresa el correo"
              name="correo"
              value={empresaData.correo}
              onChange={handleInputChange}
            />
            <Select
              label="Municipio"
              placeholder="Selecciona un municipio"
              name="municipio"
              value={empresaData.municipio}
              onChange={handleSelectChange("municipio")}
              required
            >
              {municipios.map((municipio) => (
                <SelectItem key={municipio.id_municipio} value={municipio.id_municipio}>
                  {municipio.nombre_mpio}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Jefe Inmediato"
              placeholder="Ingresa el jefe inmediato"
              name="jefe_inmediato"
              value={empresaData.jefe_inmediato}
              onChange={handleInputChange}
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-end gap-5 mr-5 my-5">
              <Button className="bg-[#0d324c] text-white" type="submit" color="success">
                Registrar
              </Button>
            </div>
          </form>
        }
      />
    </div>
  );
};

export default RegistroEmpresa;