import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import Swal from 'sweetalert2';
import axiosClient from "../../../configs/axiosClient";

function FormRegistroAsignacion({ initialData, onSuccess, id_productiva }) {
    const [SelectActividad, setSelectedActividad] = useState("");
    const [actividad, setActividad] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchActividades = async () => {
            try {
                const response = await axiosClient.get("/actividades/listar");
                setActividad(response.data);
            } catch (error) {
                console.error("Error al obtener Actividades", error);
            }
        };

        fetchActividades();
    }, []);

    useEffect(() => {
        if (initialData) {
            setSelectedActividad(initialData.id_actividad || "");
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const formData = {
            id_productiva: id_productiva || "DEFAULT_PRODUCTIVA",
            actividad: SelectActividad,
        };

        try {
            await axiosClient.post('/registrar', formData);
            Swal.fire('Éxito', 'Asignación registrada correctamente', 'success');
            setSelectedActividad("");

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error del servidor:", error);
            Swal.fire('Error', error.response?.data?.message || 'Por favor selecciona una Actividad', 'error');
        }
    };

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">
            Registro de Asignacion e Instructor
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col">
                <select
                    className={`mt-4 h-14 rounded-xl bg-[#f4f4f5] p-2 ${errors.actividad ? 'border-red-500' : ''}`}
                    id="actividad"
                    name="Actividad"
                    value={SelectActividad}
                    onChange={(e) => setSelectedActividad(e.target.value)}
                    required
                >
                    <option value="">Selecciona un Instructor y una Actividad</option>
                    {actividad.map((actividad) => {
                        const formatearFecha = (fecha) => {
                            const dateObj = new Date(fecha);
                            const day = String(dateObj.getDate()).padStart(2, '0');
                            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                            const year = dateObj.getFullYear();
                            return `${day}-${month}-${year}`;
                        };

                        const fechaInicioFormateada = formatearFecha(actividad.fecha_inicio);
                        const fechaFinFormateada = formatearFecha(actividad.fecha_fin);

                        return (
                            <option key={actividad.id_actividad} value={actividad.id_actividad}>
                                {`${actividad.instructor} - ${fechaInicioFormateada} a ${fechaFinFormateada} - ${actividad.horario_inicio} a ${actividad.horario_fin}`}
                            </option>
                        );
                    })}
                </select>

                <div className="flex justify-end gap-5 mt-5">
                    <Button className="bg-[#0d324c] text-white" type="submit" color="success">
                        Registrar
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default FormRegistroAsignacion;
