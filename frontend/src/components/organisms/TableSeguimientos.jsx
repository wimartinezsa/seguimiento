import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ComponentSeguimiento from './ComponentSeguimiento.jsx';
import ModalAcciones from '../molecules/ComponentsGlobals/ModalAcciones.jsx';
import axiosClient from '../../configs/axiosClient.jsx';
import { format } from 'date-fns';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    Pagination,
} from "@nextui-org/react";
import { SearchIcon } from "../NextIU/atoms/searchicons.jsx";
import ButtonActualizar from "../atoms/ButtonActualizar.jsx";
import ButtonRegistrarNovedad from '../atoms/ButtonRegistrarNovedades.jsx';
import ButtonEliminar from '../atoms/ButtonEliminar.jsx';
import { Tooltip } from '@nextui-org/react';
import Novedades from '../molecules/Seguimientos/Novedad.jsx';

function TableSeguimientos() {
    const [seguimientos, setSeguimientos] = useState([]);
    const [filterValue, setFilterValue] = useState("");
    const [selectedSeguimientoId, setSelectedSeguimientoId] = useState(null);
    const [bodyContent, setBodyContent] = useState(null);
    const [formType, setFormType] = useState("");  // Nuevo estado para determinar el tipo de formulario
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "identificacion",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [buttonStates, setButtonStates] = useState(() => {
        // Recuperar el estado de los botones desde localStorage
        const storedStates = localStorage.getItem('buttonStates');
        return storedStates ? JSON.parse(storedStates) : {};
    });
    const [buttonState, setButtonState] = useState("solicitud");



    const seguimientosIds = [1, 2, 3];


    // Fetch seguimientos from API
    const getSeguimientos = useCallback(async () => {
        try {
            const response = await axiosClient.get('/seguimientos/listarA');
            setSeguimientos(response.data);
        } catch (error) {
            console.error('Error al obtener los seguimientos:', error);
        }
    }, []);

    useEffect(() => {
        getSeguimientos();
    }, [getSeguimientos]);


    const handleUpdateData = useCallback(() => {
        getSeguimientos();
    }, [getSeguimientos]);


    // Function to open the modal and set the selected ID
    const handleOpenModal = (id_seguimiento, type) => {
        setFormType(type);
        if (type === 'formNovedades') {
            setBodyContent(<Novedades id_seguimiento={id_seguimiento} />);
        } else if (type === 'componentSeguimiento') {
            setBodyContent(
                <ComponentSeguimiento
                    id_seguimiento={id_seguimiento}
                    setButtonState={setButtonState}
                    mode="create"
                    handleSubmit={() => console.log("Submit")}
                    onClose={() => console.log("Close")}
                    actionLabel="Enviar"
                    onSuccess={() => {
                        handleUpdateData();
                        setButtonStates(prevStates => {
                            const updatedStates = {
                                ...prevStates,
                                [id_seguimiento]: "aprobado",
                            };
                            localStorage.setItem('buttonStates', JSON.stringify(updatedStates));
                            return updatedStates;
                        });
                    }}
                    
                    onReject={() => {
                        handleUpdateData();
                        setButtonStates(prevStates => {
                            const updatedStates = {
                                ...prevStates,
                                [id_seguimiento]: "no aprobado",
                            };
                            localStorage.setItem('buttonStates', JSON.stringify(updatedStates));
                            return updatedStates;
                        });
                    
                    }}
                    onIdSend={(id) => console.log("ID de seguimiento enviado:", id)}
                />
            );
        }

        setSelectedSeguimientoId(id_seguimiento);
        setIsModalOpen(true);
    };


    // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };




    // Filter items based on the search input
    const filteredItems = useMemo(() => {
        let filteredSeguimientos = seguimientos;

        if (filterValue) {
            filteredSeguimientos = filteredSeguimientos.filter(seg =>
                seg.nombres.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredSeguimientos;
    }, [seguimientos, filterValue]);

    // Calculate pagination
    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    // Get paginated items
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    // Sort items based on the sort descriptor
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    /* Color de cada Ficha */
    const hashCode = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    const intToColor = (int) => {
        const r = (int >> 16) & 0xFF;
        const g = (int >> 8) & 0xFF;
        const b = int & 0xFF;

        // Convertir a un color claro
        const lightR = Math.min(255, r + 100); // Aumenta el rojo
        const lightG = Math.min(255, g + 100); // Aumenta el verde
        const lightB = Math.min(255, b + 100); // Aumenta el azul

        return `rgba(${lightR}, ${lightG}, ${lightB}, 0.5)`; // Opacidad del 50%
    };

    const getColorForFicha = (fichaNumber) => {
        if (!fichaNumber) {
            return "rgba(240, 240, 240, 0.8)";  // Color por defecto si fichaNumber es null o undefined
        }
        const hash = hashCode(fichaNumber.toString());
        return intToColor(hash);
    };


    // Render cell based on column key

    const renderCell = useCallback((item, columnKey) => {
        const cellValue = item[columnKey];
    
        switch (columnKey) {
            case "acciones":
                return (
                    <div className="flex justify-around items-center">
                        <ButtonRegistrarNovedad onClick={() => handleOpenModal(null, 'formNovedades')} />
                    </div>
                );
    
            case "seguimiento1":
            case "seguimiento2":
            case "seguimiento3":
                const formattedDate = cellValue ? format(new Date(cellValue), 'dd-MM-yyyy') : 'Fecha no válida';
                const seguimientoIdKey = `id_${columnKey}`;
                const estadoKey = `estado${columnKey.charAt(columnKey.length - 1)}`;
                const estado = item[estadoKey]; // Obtenemos el estado directamente de la BD
    
                return (
                    <div className="flex flex-col items-center">
                        <Button
                            className="text-white h-8 w-10 text-xs"
                            style={{
                                backgroundColor:
                                    estado === "no aprobado" ? "red" :
                                    estado === "solicitud" ? "orange" :
                                    estado === "aprobado" ? "green" :
                                    "gray",  // Color por defecto si no hay estado
                            }}
                            onClick={() => handleOpenModal(item[seguimientoIdKey], 'componentSeguimiento')}
                        >
                            {formattedDate}
                        </Button>
                    </div>
                );
    
            case "codigo":
                return (
                    <Chip
                        className="text-[#3c3c3c]"
                        variant="flat"
                        style={{ backgroundColor: getColorForFicha(cellValue) || "rgba(240, 240, 240, 0.8)" }}
                    >
                        {cellValue}
                    </Chip>
                );
    
            case "porcentaje":
                // Formatear el porcentaje y añadir el símbolo "%"
                return `${cellValue}%`;
    
            case "actions": // Cambié "acciones" a "actions" para que coincida
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <ButtonActualizar onClick={() => console.log('Actualizar', item)} />
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem onClick={() => console.log('View', item)}>View</DropdownItem>
                                <DropdownItem onClick={() => console.log('Edit', item)}>Edit</DropdownItem>
                                <DropdownItem onClick={() => console.log('Delete', item)}>Delete</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
    
            default:
                return cellValue;
        }
    }, [buttonStates, handleOpenModal]);
    

    // Pagination handlers
    const onNextPage = useCallback(() => {
        if (page < pages) {
            setPage(prevPage => prevPage + 1);
        }
    }, [page, pages]);


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

    // Top content (search and pagination controls)
    const topContent = useMemo(() => (
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
            </div>
            <div className="flex items-center justify-between">
                <span className="text-default-400 text-small my-5">
                    Total {seguimientos.length} seguimientos
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
    ), [filterValue, seguimientos.length, onRowsPerPageChange, onClear, onSearchChange]);

    // Columns definition
    const columns = [
        { key: "identificacion", label: "Identificación" },
        { key: "nombres", label: "Aprendiz" },
        { key: "codigo", label: "Ficha" },
        { key: "razon_social", label: "Empresa" },
        { key: "nombre_instructor", label: "Instructor Asignado" },
        { key: "seguimiento1", label: "Seguimiento 1" },
        { key: "seguimiento2", label: "Seguimiento 2" },
        { key: "seguimiento3", label: "Seguimiento 3" },
        { key: "porcentaje", label: "Porcentaje" },
        { key: "acciones", label: "Acciones" },
    ];

    return (
        <div className="overflow-hidden flex-1 bg-dark p-2">
            <div className="flex flex-col">
                {topContent}
                <Table aria-label="Tabla de Personas" css={{ height: "auto", minWidth: "100%" }}>
                    <TableHeader>
                        {columns.map((column) => (
                            <TableColumn key={column.key}>{column.label}</TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {sortedItems.map((item) => (
                            <TableRow key={item.identificacion}>
                                {columns.map((column) => (
                                    <TableCell key={column.key}>
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

            {/* Modal */}
            {isModalOpen && (
                <ModalAcciones
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    bodyContent={bodyContent}
                />
            )}
        </div>
    );
}

export default TableSeguimientos;