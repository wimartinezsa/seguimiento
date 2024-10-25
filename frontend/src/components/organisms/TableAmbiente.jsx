import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import ModalAcciones from '../molecules/ComponentsGlobals/ModalAcciones.jsx';
import Swal from 'sweetalert2';
import axiosClient from '../../configs/axiosClient.jsx';
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
import FormAmbientes from '../molecules/Ambientes/FormAmbientes.jsx';
import AmbienteContext from '../../context/AmbienteContext.jsx';


export default function TableAmbiente() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [ambientes, setAmbientes] = useState([]);
    const { idAmbiente, setambienteId } = useContext(AmbienteContext);
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
        setInitialData(data);
        if (formType === 'ambiente') {
            setModalContent(
                <FormAmbientes
                    initialData={data}
                    onSubmit={handleFormAmbienteSubmit}
                    onClose={handleCloseModal}
                    mode={data ? 'update' : 'create'}
                    actionLabel={data ? 'Actualizar' : 'Registrar'}
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

    const handleFormAmbienteSubmit = async (formData) => {
        try {
            if (formData.id_ambiente) {
                const response = await axiosClient.put(`/ambientes/actualizar/${formData.id_ambiente}`, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Ambiente actualizado correctamente',
                  });
                console.log('Respuesta del servidor:', response.data);
            } else {
                const response = await axiosClient.post('/ambientes/registrar', formData);
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
            setambienteId(initialData.id_ambiente);
            handleOpenModal('ambiente', initialData);
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
            const response = await axiosClient.get('/ambientes/listar');
    
            const formattedData = response.data
                .filter((item) => item.estado === 'activo')  
                .map((item) => ({
                    ...item,
                }));
    
            console.log('Datos filtrados:', formattedData); 
    
            setAmbientes(formattedData);
        } catch (error) {
            console.error('Error en la petición GET:', error);
        }
    };
    
    
    

    const handleDesactivar = async (id_ambiente) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Quieres desactivar este ambiente?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, desactivar",
            cancelButtonText: "No, cancelar",
            reverseButtons: true,
            customClass: {
                confirmButton: "bg-[#90d12c] text-white hover:bg-green-600 border-green-500",
                cancelButton: "bg-[#f31260] text-white hover:bg-red-600 border-red-500",
            },
        });
    
        if (result.isConfirmed) {
            try {
                const response = await axiosClient.put(`/ambientes/inactivar/${id_ambiente}`, {
                    activo: 0,
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Ambiente desactivado',
                  });
    
                setAmbientes((prevAmbientes) =>
                    prevAmbientes.filter((ambiente) => ambiente.id_ambiente !== id_ambiente)
                );
            } catch (error) {
                console.error("Error desactivando el ambiente:", error);
                Swal.fire("Error", "No se pudo desactivar el ambiente", "error");
            }
        }
    };
    
      

    const hasSearchFilter = Boolean(filterValue);
    const filteredItems = useMemo(() => {
        let filteredAmbientes = ambientes;

        if (hasSearchFilter) {
            filteredAmbientes = filteredAmbientes.filter(seg =>
                seg.nombre_amb.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredAmbientes;
    }, [ambientes, filterValue]);

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

    const renderCell = (ambiente, columnKey) => {
        const cellValue = ambiente[columnKey];
        switch (columnKey) {
            case "actions":
                return (
                    <div className='flex justify-around items-center'>
                        <ButtonActualizar onClick={() => handleToggle(ambiente)} />
                        <ButtonDesactivar
                onClick={() => handleDesactivar(ambiente.id_ambiente)}
              />
                    </div>
                );
            default:
                return cellValue;
        }
    };

    const columns = [
        { key: "id_ambiente", label: "ID" },
        { key: "nombre_amb", label: "Nombre del Ambiente" },
        { key: "sede", label: "Sede" },
        { key: "municipio", label: "Muncipio" },
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
                        <Button onClick={() => handleOpenModal('ambiente')} className="bg-[#0d324c] text-white ml-60">
                            Registrar Ambiente
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-default-400 text-small">
                        Total {ambientes.length} ambiente
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
        ambientes.length,
        onRowsPerPageChange,
        onClear,
        onSearchChange,
    ]);

    return (
        <div>
            {topContent}
            <Table
                aria-labelledby="Tabla de Ambientes"
                css={{ height: "auto", minWidth: "100%" }}
                sortDescriptor={{ column: "fecha", direction: "ascending" }}
            >
                <TableHeader>
                    {columns.map((column) => (
                        <TableColumn key={column.key}>{column.label}</TableColumn>
                    ))}
                </TableHeader>
                <TableBody  items={sortedItems}>
                    {(item) => (
                        <TableRow key={item.id_ambiente}>
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
            title={initialData ? "Actualizar Ambiente" : "Registrar Ambiente"}
            bodyContent={modalContent}
        />
        </div>
    );
}