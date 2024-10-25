import React, { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import Swal from "sweetalert2";
import axiosClient from "../../../configs/axiosClient";

function FormProgramas({ initialData, onSuccess }) {
    const [nombre_programa, setNombrePrograma] = useState("");
    const [sigla, setSigla] = useState("");
    const [nivel, setNivel] = useState("Selecciona");
    const [isEditing, setIsEditing] = useState(false);
    const [idPrograma, setIdPrograma] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setNombrePrograma(initialData.nombre_programa || "");
            setSigla(initialData.sigla || "");
            setNivel(initialData.nivel || "Selecciona");
            setIdPrograma(initialData.id_programa);
            setIsEditing(true);
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = { nombre_programa, sigla, nivel };

        console.log("FormData:", formData);

        try {
            if (isEditing) {
                await axiosClient.put(`/programa/actualizar/${idPrograma}`, formData);
                Swal.fire("Éxito", "Programa actualizado correctamente", "success");
            } else {
                await axiosClient.post("/programa/registrar", formData);
                Swal.fire("Éxito", "Programa registrado correctamente", "success");
            }
            onSuccess();
        } catch (error) {
            console.error("Error al registrar/actualizar programa:", error);
            Swal.fire("Error", "No se pudo registrar/actualizar el programa", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
             <h1 className="text-xl font-bold mb-4">
                {isEditing ? "Actualizar Programa" : "Registro de Programas"}
            </h1>
            <Input
                type="text"
                label="Nombre Programa"
                className="w-96  my-4"
                value={nombre_programa}
                onChange={(e) => setNombrePrograma(e.target.value)}
                required
            />
            <Input
                type="text"
                label="Sigla"
                className="w-96 mb-4"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                required
            />
            <select
                className={`mb-4 h-14 rounded-xl bg-[#f4f4f5] p-2 ${errors.nivel ? 'border-red-500' : ''}`}
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                required
            >
                <option value="Selecciona">Selecciona un Nivel</option>
                <option value="Tecnico">Tecnico</option>
                <option value="Tecnólogo">Tecnólogo</option>
            </select>
            {errors.nivel && <p className="text-red-500">{errors.nivel}</p>}

            <div className="flex justify-end gap-5 mt-5">
                <Button className="bg-[#0d324c] text-white" type="submit">
                    {isEditing ? "Actualizar" : "Registrar"}
                </Button>
            </div>
        </form>
    );
}

export default FormProgramas;
