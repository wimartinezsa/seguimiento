import React, { useCallback, useEffect, useMemo, useState } from "react";
import ModalAcciones from "../molecules/ComponentsGlobals/ModalAcciones.jsx";
import Swal from "sweetalert2";
import axiosClient from "../../configs/axiosClient.jsx";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Pagination,
    Chip,
} from "@nextui-org/react";
import ButtonActualizar from "../atoms/ButtonActualizar.jsx";
import FormAsignacion from "../molecules/Asignaciones/FormAsignacion.jsx";
import { SearchIcon } from "../NextIU/atoms/searchicons.jsx";
import ButtonEditarAsignacionI from "../atoms/ButtonEditarAsignacionI.jsx";
import ButtonAsignarI from "../atoms/ButtonAsignarInstructor.jsx";
import FormActualizarAsignacion from "../molecules/Asignaciones/FormEditAsignacion.jsx";
import { format } from 'date-fns';
import ButtonDescargarProductiva from "../atoms/ButtonDescargarProductiva.jsx";
import FormProductiva from "../molecules/Productivas/FormEtapaPractica.jsx";
import ButtonDesactivar from "../atoms/ButtonDesactivar.jsx";

function TableProductiva() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [productivas, setProductivas] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [modalContent, setModalContent] = useState(null);
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "id_productiva",
        direction: "ascending",
    });

    // Fetch data from API
    const fetchData = useCallback(async () => {
        console.log("Fetching data...");
        try {
            const response = await axiosClient.get("/productiva/listar");
            setProductivas(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo obtener los datos.",
                icon: "error",
            });
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCloseModal = () => {
        setModalOpen(false);
        setInitialData(null);
        setModalContent(null);
    };

    const handleOpenModal = (formType, data = null, id_productiva) => {
        setModalOpen(true);
        setInitialData(data);

        switch (formType) {
            case 'productiva':
                setModalContent(
                    <FormProductiva
                        initialData={null}
                        onSuccess={handleUpdateData} // Aquí se pasa la función handleSubmit
                    />
                );
                break;

            case 'actualizar_productiva':
                setModalContent(
                    <FormProductiva
                        initialData={data}
                        onSuccess={handleUpdateData} // Aquí se pasa la función handleSubmit
                        id_productiva={id_productiva}
                    />
                );
                break;

            case 'asignacion':
                setModalContent(
                    <FormAsignacion
                        initialData={null}
                        onSuccess={handleUpdateData}
                        id_productiva={id_productiva}
                    />
                );
                break;

            case 'actualizar_asignacion':
                setModalContent(
                    <FormActualizarAsignacion
                        initialData={data}
                        onSuccess={handleUpdateData}
                        id_productiva={id_productiva}
                        id_asignacion={data.id_asignacion}
                    />
                );
                break;

            default:
                break;
        }
    };

   /*  const handleSubmit = async (data, id_productiva) => {
        try {
            if (id_productiva) {
                await axiosClient.put(`/productiva/actualizar/${id_productiva}`, data);
            } else {
                await axiosClient.post(`/productiva/registrar`, data);
            }
            handleUpdateData(); // Actualiza los datos en la tabla
            handleCloseModal(); // Cierra el modal
        } catch (error) {
            console.error("Error al guardar datos:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo guardar los datos.",
                icon: "error",
            });
        }
    }; */


    const handleUpdateData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const handleEditAsignacion = (data) => {
        handleOpenModal('actualizar_asignacion', data, data.id_productiva);
    };

    const handleEditProductiva = (data) => {
        handleOpenModal('actualizar_productiva', data, data.id_productiva);
    };

    const handleDesactivar = async (id_asignacion) => {
        // Mostrar una alerta de confirmación
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Quieres eliminar esta asignacion? Si lo haces, se borrará la asignacion de la etapa productiva",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, Eliminar",
            cancelButtonText: "No, cancelar",
            reverseButtons: true,
            customClass: {
                confirmButton: "bg-[#90d12c] text-white hover:bg-green-600 border-green-500",
                cancelButton: "bg-[#f31260] text-white hover:bg-red-600 border-red-500",
            },
        });

        // Si el usuario confirma, proceder con la desactivación
        if (result.isConfirmed) {
            try {
                const response = await axiosClient.delete(`/eliminar/${id_asignacion}`);
                Swal.fire("Eliminada", response.data.message, "success");
                // Actualizar el estado para eliminar el instructor desactivado

                setAsignaciones((prevAsignacion) =>
                    prevAsignacion.filter((asignacion) => asignacion.id_asignacion !== id_asignacion)
                );
                handleUpdateData();
            } catch (error) {
                console.error("Error Eliminando la Matricula:", error);
                Swal.fire("Error", "No se pudo Eliminar la matricula", "error");
            }
        }
    };

    const downloadFile = async (id_productiva) => {
        try {
            const response = await axiosClient.get(`/productiva/descargarPdf/${id_productiva}`, {
                responseType: 'blob',
            });

            // Verifica si el servidor está respondiendo con un archivo JSON, lo que indica un error
            if (response.headers['content-type'] === 'application/json') {
                const errorData = await response.data.text();
                console.error('Error del servidor:', errorData);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo descargar el archivo.",
                    icon: "error",
                });
                return;
            }

            const fileURL = URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', `Archivo_${id_productiva}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            Swal.fire({
                title: "Error",
                text: "No se pudo descargar el archivo.",
                icon: "error",
            });
        }
    };

    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        if (hasSearchFilter) {
            return productivas.filter((seg) =>
                seg.aprendiz_nombre?.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return productivas;
    }, [productivas, filterValue]);
    

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredItems.slice(start, start + rowsPerPage);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const getColorForEstado = (estado) => {
        switch (estado) {
            case "Inicio":
                return "rgba(173, 216, 230, 0.8)"; // Azul claro
            case "Renuncia":
                return "rgba(255, 182, 193, 0.8)"; // Rojo claro
            case "Terminado":
                return "rgba(144, 238, 144, 0.8)"; // Verde claro
            default:
                return "rgba(240, 240, 240, 0.8)"; // Color por defecto
        }
    };

    const renderCell = (productiva, columnKey) => {
        const cellValue = productiva[columnKey];
        switch (columnKey) {
            case "acciones":
                return (
                    <div className="flex justify-around items-center">
                        <ButtonActualizar onClick={() => handleEditProductiva(productiva)} />
                        <ButtonDescargarProductiva onClick={() => downloadFile(productiva.id_productiva)} />
                    </div>
                );
            case "instructor_nombre":
                return (
                    <div className="flex items-center">
                        <span>{cellValue}</span>
                        {cellValue ? (
                            <ButtonEditarAsignacionI onClick={() => handleEditAsignacion(productiva)} />
                        ) : (
                            <ButtonAsignarI onClick={() => handleOpenModal("asignacion", null, productiva.id_productiva)} />
                        )}
                        <ButtonDesactivar onClick={() => handleDesactivar(productiva.id_asignacion)}/>
                    </div>
                );
            case "fecha_inicio":
            case "fecha_fin":
                return cellValue ? format(new Date(cellValue), 'dd-MM-yyyy') : 'N/A'; // Formatea la fecha
            case "estado":
                return (
                    <Chip
                        className="text-[#3c3c3c]"
                        variant="flat"
                        style={{ backgroundColor: getColorForEstado(cellValue) }} // Color claro por defecto
                    >
                        {cellValue}
                    </Chip>
                );
            default:
                return cellValue;
        }
    };

    const onRowsPerPageChange = useCallback((e) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSearchChange = useCallback((value) => {
        setFilterValue(value || "");
        setPage(1);
    }, []);

    const onClear = useCallback(() => {
        setFilterValue("");
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col mt-3">
                <div className="flex flex-col mt-3">
                    <div className="flex justify-between gap-3 items-end">
                        <Input
                            isClearable
                            className="w-full sm:max-w-[44%] bg-[#f4f4f5] rounded"
                            placeholder="Buscar..."
                            startContent={<SearchIcon />}
                            value={filterValue}
                            onClear={onClear}
                            onValueChange={onSearchChange}
                        />
                        <div>
                            <Button
                                onClick={() => handleOpenModal("productiva")}
                                className="bg-[#0d324c] text-white"
                            >
                                Registrar Etapa Productiva
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 mb-5">
                    <span className="text-default-400 text-small mt-2">
                        Total {productivas.length} usuarios
                    </span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                            value={rowsPerPage}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        filterValue,
        productivas.length,
        onRowsPerPageChange,
        onClear,
        onSearchChange,
    ]);


    const columns = [
        { key: "id_productiva", label: "ID" },
        { key: "aprendiz_nombre", label: "Aprendiz" },
        { key: "instructor_nombre", label: "Instructor" },
        { key: "empresa_nombre", label: "Empresa" },
        { key: "fecha_inicio", label: "Fecha de Inicio" },
        { key: "fecha_fin", label: "Fecha de Fin" },
        { key: "alternativa", label: "Alternativa" },
        { key: "estado", label: "Estado" },
        { key: "acciones", label: "Acciones" },
    ];

    return (
        <div className="overflow-hidden flex-1 bg-dark p-2">
            <div className="flex flex-col">
                {topContent}
                <Table
                    aria-labelledby="Tabla de productivas"
                    className="text-left"
                    striped
                >
                    <TableHeader>
                        {columns.map((column) => (
                            <TableColumn key={column.key} style={{ width: '250px' }}>
                                {column.label}
                            </TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {sortedItems.map((item) => (
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.key} style={{ width: '250px' }}>
                                        {renderCell(item, column.key)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex justify-start mt-4">
                    <Pagination
                        total={pages}
                        initialPage={page}
                        onChange={(page) => setPage(page)}
                        color="success"
                        aria-label="Paginación de la tabla"
                        showControls
                    />
                </div>
            </div>
            <ModalAcciones
                isOpen={modalOpen}
                onClose={handleCloseModal}
                bodyContent={modalContent}
            />
        </div>
    );
}

export default TableProductiva;
