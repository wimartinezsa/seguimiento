import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import FormAsignacion from '../molecules/Asignaciones/FormAsignacion.jsx';
import ModalAcciones from '../molecules/ComponentsGlobals/ModalAcciones.jsx';
import Swal from 'sweetalert2';
import axiosClient from '../../configs/axiosClient.jsx';
import AsignacionContext from '../../context/AsignacionesContext.jsx';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Pagination,
} from "@nextui-org/react";
import ButtonActualizar from "../atoms/ButtonActualizar.jsx";
import { SearchIcon } from '../NextIU/atoms/searchicons.jsx';
import ButtonDesactivar from "../atoms/ButtonDesactivar.jsx";


export default function TableAsignaciones() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [asignaciones, setAsignaciones] = useState([]);
    const { idAsignacion, setAsignacionId } = useContext(AsignacionContext);
    const [modalContent, setModalContent] = useState(null);
    const [filterValue, setFilterValue] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "ID",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);

    useEffect(() => {
        peticionGet();
    }, []);

    const handleOpenModal = (formType, data = null) => {
        if (formType === 'asignacion') {
            setModalContent(
                <FormAsignacion
                    initialData={data}
                    onSubmit={handleFormAsignacionSubmit}
                    onClose={handleCloseModal}
                    mode={data ? 'update' : 'create'}
                />
            );
        }
        setModalOpen(true);
    };

    const handleCloseModal = async () => {
        setModalOpen(false);
        setInitialData(null);
        setModalContent(null);
        await peticionGet();
    };

    const handleFormAsignacionSubmit = async (formData) => {
        try {
            if (formData.id_asignacion) {
                const response = await axiosClient.put(`/actualizar/${formData.id_asignacion}`, formData);
                console.log('Respuesta del servidor:', response.data);
            } else {
                const response = await axiosClient.post('/registrar', formData);
                console.log('Respuesta del servidor:', response.data);
            }
            handleCloseModal();
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleToggle = (initialData) => {
        if (initialData) {
            setInitialData(initialData);
            setAsignacionId(initialData.id_asignacion); // Asegúrate que este ID exista
            handleOpenModal('asignacion', initialData);
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
        setPage(1);
    }, []);

    const peticionGet = async () => {
        try {
            const response = await axiosClient.get('/listar');
            const formattedData = response.data.map((item) => ({
                ...item,
                fecha_inicio: formatDate(item.fecha_inicio),
                fecha_fin: formatDate(item.fecha_fin),
            }));
            setAsignaciones(formattedData);
        } catch (error) {
        }
    };

    const handleDesactivar = async (id_asignacion) => {
        // Mostrar una alerta de confirmación
        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: "¿Quieres eliminar esta asignacion?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
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
            setAsignaciones((prevAsignaciones) =>
                prevAsignaciones.filter((asignacion) => asignacion.id_asignacion !== id_asignacion)
            );
          } catch (error) {
            console.error("Error eliminando la asignacion:", error);
            Swal.fire("Error", "No se pudo eliminar la asignacion", "error");
          }
        }
      };
      

    const hasSearchFilter = Boolean(filterValue);
    const filteredItems = useMemo(() => {
        let filteredAsignaciones = asignaciones;

        if (hasSearchFilter) {
            filteredAsignaciones = filteredAsignaciones.filter(seg =>
                seg.nombre_instructor.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredAsignaciones;
    }, [asignaciones, filterValue]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString().split('T')[0];
    };

    const pages = useMemo(() => Math.ceil(filteredItems.length / rowsPerPage), [
        filteredItems.length,
        rowsPerPage,
    ]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const renderCell = (asignacion, columnKey) => {
        const cellValue = asignacion[columnKey];
        switch (columnKey) {
            case "actions":
                return (
                    <div className='flex justify-around items-center'>
                        <ButtonActualizar onClick={() => handleToggle(asignacion)} />
                        <ButtonDesactivar
                onClick={() => handleDesactivar(asignacion.id_asignacion)}
              />
                    </div>
                );
            default:
                return cellValue;
        }
    };

    const columns = [
        { key: "id_asignacion", label: "ID" },
        { key: "nombre_aprendiz", label: "Aprendiz" },
        { key: "nombre_instructor", label: "Instructor" },
        { key: "rango_fechas", label: "Fechas" },
        { key: "horario", label: "Hora y Día" },
        { key: "actions", label: "Acciones" },
    ];

    const topContent = useMemo(() => {
        return (
            <div className="my-10">
                <div className="flex flex-col mt-3">
                    <div className="flex justify-between gap-3 items-end mb-4">
                        <Input
                            isClearable
                            className="w-full sm:max-w-[44%] bg-[#f4f4f5] rounded"
                            placeholder="Buscar..."
                            startContent={<SearchIcon />}
                            value={filterValue}
                            onClear={onClear}
                            onValueChange={onSearchChange}
                        />
                        <Button onClick={() => handleOpenModal('asignacion')} className="bg-[#0d324c] text-white ml-60">
                            Registrar Asignación
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-default-400 text-small">
                        Total {asignaciones.length} asignaciones
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
        asignaciones.length,
        onRowsPerPageChange,
        onClear,
        onSearchChange,
    ]);

    return (
        <div>
            {topContent}
            <Table
                aria-labelledby="Tabla de Asignaciones"
                css={{ height: "auto", minWidth: "100%" }}
                sortDescriptor={{ column: "fecha", direction: "ascending" }}
            >
                <TableHeader>
                    {columns.map((column) => (
                        <TableColumn key={column.key}>{column.label}</TableColumn>
                    ))}
                </TableHeader>
                <TableBody emptyContent={"No hay asignaciones registradas"} items={sortedItems}>
                    {(item) => (
                        <TableRow key={item.id_asignacion}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
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
            <ModalAcciones
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title={initialData ? "Actualizar Asignación" : "Registrar Asignación"}
                bodyContent={modalContent}
            />
        </div>
    );
}

