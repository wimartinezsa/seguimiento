import React, { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import Swal from "sweetalert2";
import axiosClient from "../../../configs/axiosClient";
import { parseISO, format } from "date-fns";

function FormProductiva({ initialData, onSuccess }) {
  const [formData, setFormData] = useState({
    ficha: "",
    aprendiz: "",
    matricula: "", // Añadir campo de matrícula
    empresa: "",
    fecha_inicio: "",
    fecha_fin: "",
    alternativa: "Selecciona",
    estado: "Selecciona",
    acuerdoFile: null,
    arlFile: null,
    consultaFile: null,
  });
  const [fichas, setFichas] = useState([]);
  const [aprendices, setAprendices] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Obtener las fichas
    const fetchFichas = async () => {
      try {
        const response = await axiosClient.get("/fichas/listar");
        setFichas(response.data);
      } catch (error) {
        console.error("Error al obtener Fichas", error);
      }
    };

    // Obtener las empresas
    const fetchEmpresas = async () => {
      try {
        const response = await axiosClient.get("/empresas/listar");
        setEmpresas(response.data);
      } catch (error) {
        console.error("Error al obtener Empresas", error);
      }
    };

    fetchFichas();
    fetchEmpresas();
  }, []);

  // Actualizar formulario cuando se está en modo de edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        ficha: initialData.ficha || "",
        aprendiz: initialData.aprendiz || "",
        matricula: initialData.matricula || "",
        empresa: initialData.empresa || "",
        fecha_inicio: initialData.fecha_inicio
          ? format(parseISO(initialData.fecha_inicio), "yyyy-MM-dd")
          : "",
        fecha_fin: initialData.fecha_fin
          ? format(parseISO(initialData.fecha_fin), "yyyy-MM-dd")
          : "",
        alternativa: initialData.alternativa || "Selecciona",
        estado: initialData.estado || "Selecciona",
        acuerdoFile: null,
        arlFile: null,
        consultaFile: null,
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [initialData]);

  // Manejar el cambio de ficha para cargar aprendices
  const handleFichaChange = async (e) => {
    const selectedFicha = e.target.value;
    setFormData((prevData) => ({ ...prevData, ficha: selectedFicha }));

    if (selectedFicha) {
      try {
        const response = await axiosClient.get(
          `/productiva/listarAprendicezFichas/${selectedFicha}`
        );
        if (response.data.length > 0) {
          setAprendices(response.data); // Guardar los aprendices si hay resultados
        } else {
          setAprendices([]); // Limpiar la lista si no hay aprendices
          Swal.fire(
            "Advertencia",
            "No se encontraron aprendices para esta ficha.",
            "warning"
          );
        }
      } catch (error) {
        console.error("Error al obtener Aprendices", error);
        Swal.fire(
          "Error",
          "Hubo un problema al obtener los aprendices.",
          "error"
        );
      }
    }
  };

  // Manejador para cambiar el aprendiz y capturar la matrícula
  const handleAprendizChange = (e) => {
    const selectedAprendiz = e.target.value;

    // Buscar el aprendiz seleccionado para obtener la matrícula
    const aprendizSeleccionado = aprendices.find(
      (aprendiz) => aprendiz.id_persona === parseInt(selectedAprendiz)
    );

    setFormData((prevData) => ({
      ...prevData,
      aprendiz: selectedAprendiz,
      matricula: aprendizSeleccionado ? aprendizSeleccionado.id_matricula : "", // Asignar matrícula
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prevData) => ({ ...prevData, [name]: file }));
    } else {
      Swal.fire("Error", "Por favor, selecciona un archivo válido", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("ficha", formData.ficha);
    formDataToSend.append("aprendiz", formData.aprendiz);
    formDataToSend.append("matricula", formData.matricula); // Enviar el ID de la matrícula
    formDataToSend.append("empresa", formData.empresa);
    formDataToSend.append("fecha_inicio", formData.fecha_inicio);
    formDataToSend.append("fecha_fin", formData.fecha_fin);
    formDataToSend.append("alternativa", formData.alternativa);
    formDataToSend.append("estado", formData.estado);

    // Adjuntar archivos si los hay
    if (formData.acuerdoFile) {
      formDataToSend.append("acuerdoFile", formData.acuerdoFile);
    }
    if (formData.arlFile) {
      formDataToSend.append("arlFile", formData.arlFile);
    }
    if (formData.consultaFile) {
      formDataToSend.append("consultaFile", formData.consultaFile);
    }

    try {
      const response = isEditing
        ? await axiosClient.put(
            `/productiva/actualizar/${initialData.id_productiva}`,
            formDataToSend,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          )
        : await axiosClient.post("/productiva/registrar", formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      Swal.fire(
        "Éxito",
        `Etapa Productiva ${isEditing ? "actualizada" : "registrada"} correctamente`,
        "success"
      );
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(
        `Error al ${isEditing ? "actualizar" : "registrar"} Etapa Productiva:`,
        error.response?.data || error.message
      );
      Swal.fire(
        "Error",
        `No se pudo ${isEditing ? "actualizar" : "registrar"} la Etapa Productiva: ${error.response?.data?.message || "Error desconocido"}`,
        "error"
      );
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        {isEditing
          ? "Actualizar Etapa Productiva"
          : "Registro de Etapas Productivas"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col"
        encType="multipart/form-data"
      >
        <select
          id="ficha"
          name="ficha"
          value={formData.ficha}
          onChange={handleFichaChange}
          required
          className="mb-4 h-[52px] rounded-xl bg-[#f4f4f5] p-2"
        >
          <option value="">Selecciona una Ficha</option>
          {fichas.map((ficha) => (
            <option key={ficha.codigo} value={ficha.codigo}>
              {ficha.codigo}
            </option>
          ))}
        </select>

        {formData.ficha && (
          <select
            id="aprendiz"
            name="aprendiz"
            value={formData.aprendiz}
            onChange={handleAprendizChange}
            required
            className="mb-4 h-[52px] rounded-xl bg-[#f4f4f5] p-2"
          >
            <option value="">Selecciona un Aprendiz</option>
            {aprendices.map((aprendiz) => (
              <option key={aprendiz.id_persona} value={aprendiz.id_persona}>
                {aprendiz.nombres}
              </option>
            ))}
          </select>
        )}

<select
          id="empresa"
          name="empresa"
          value={formData.empresa}
          onChange={handleInputChange}
          required
          className="mb-4 h-[52px] rounded-xl bg-[#f4f4f5] p-2"
        >
          <option value="">Selecciona una Empresa</option>
          {empresas.map((empresa) => (
            <option key={empresa.id_empresa} value={empresa.id_empresa}>
              {empresa.razon_social}
            </option>
          ))}
        </select>

        <Input
          id="fecha_inicio"
          type="date"
          label="Fecha de Inicio"
          name="fecha_inicio"
          value={formData.fecha_inicio}
          onChange={handleInputChange}
          required
          className="mb-4 h-[52px] rounded-xl bg-[#f4f4f5] p-2"
        />

        <Input
          id="fecha_fin"
          type="date"
          label="Fecha de Finalización"
          name="fecha_fin"
          value={formData.fecha_fin}
          onChange={handleInputChange}
          required
          className="mb-4 h-[52px] rounded-xl bg-[#f4f4f5] p-2"
        />

        <select
          id="alternativa"
          className={`mb-4 h-[52px] rounded-xl bg-[#f4f4f5] p-2 ${
            errors.alternativa ? "border-red-500" : ""
          }`}
          name="alternativa"
          value={formData.alternativa}
          onChange={handleInputChange}
          required
        >
          <option value="Selecciona">Selecciona una alternativa</option>
          <option value="Contrato de Aprendizaje">
            Contrato de Aprendizaje
          </option>
          <option value="Proyecto Productivo">Proyecto Productivo</option>
          <option value="Pasantías">Pasantías</option>
          <option value="Monitoria">Monitoria</option>
        </select>

        {isEditing && (
          <select
            id="estado"
            className={`mb-4 h-[52px] rounded-xl bg-[#f4f4f5] p-2 ${
              errors.estado ? "border-red-500" : ""
            }`}
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            required
          >
            <option value="Selecciona">Selecciona un estado</option>
            <option value="Inicio">Inicio</option>
            <option value="Terminado">Terminado</option>
            <option value="Renuncia">Renuncia</option>
          </select>
        )}

        <Input
          type="file"
          label="Acuerdo"
          onChange={handleFileChange}
          className="mb-5"
          name="acuerdoFile"
        />
        <Input
          type="file"
          label="ARL"
          onChange={handleFileChange}
          className="mb-5"
          name="arlFile"
        />
        <Input
          type="file"
          label="Consulta"
          onChange={handleFileChange}
          className="mb-5"
          name="consultaFile"
        />

        <div className="flex justify-end gap-5 mt-5">
          <Button className="bg-[#0d324c] text-white" type="submit">
            {isEditing ? "Actualizar" : "Registrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default FormProductiva;





