import React, { useEffect, useState, useMemo, useCallback } from "react";
import FormProgramas from '../molecules/Programas/FormProgramas.jsx'
import ModalAcciones from "../molecules/ComponentsGlobals/ModalAcciones.jsx";
import Swal from "sweetalert2";
import axiosClient from "../../configs/axiosClient.jsx";
import { format } from "date-fns";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    User,
    Pagination,
} from "@nextui-org/react";
import { SearchIcon } from "../NextIU/atoms/searchicons.jsx";
import ButtonActualizar from "../atoms/ButtonActualizar.jsx";
import ButtonDesactivar from "../atoms/ButtonDesactivar.jsx";


function TableProgramas() {
    const [programas, setProgramas] = useState([]);
    const [filterValue, setFilterValue] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "id_programa",
        direction: "ascending",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bodyContent, setBodyContent] = useState(null);
    const [page, setPage] = useState(1);
    const [initialData, setInitialData] = useState(null);


    const fetchData = async () => {
        try {
            const response = await axiosClient.get("/programa/listar"); // Ajusta la ruta del endpoint
            setProgramas(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (formType, data = null) => {
        setIsModalOpen(true); // Abrir el modal
        if (formType === 'programa') {
            setBodyContent(
                <FormProgramas
                    initialData={data}
                    onSuccess={handleUpdateData} // Pasar la función de éxito para actualizar la tabla
                />
            );
        }
    };

    const handleUpdateData = useCallback(() => {
        fetchData();
        setIsModalOpen(false); // Cerrar el modal después de actualizar
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    const handleDesactivar = async (id_programa) => {
        // Mostrar una alerta de confirmación
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Quieres desactivar este programa?",
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

        // Si el usuario confirma, proceder con la desactivación
        if (result.isConfirmed) {
            try {
                const response = await axiosClient.put(`/programa/inactivar/${id_programa}`);
                Swal.fire("Desactivado", response.data.message, "success");
                fetchData();

                // Actualizar el estado para eliminar el instructor desactivado
                setProgramas((prevProgramas) =>
                    prevProgramas.filter((programa) => programa.id_programa !== id_programa)
                );
            } catch (error) {
                console.error("Error desactivando el programa:", error);
                Swal.fire("Error", "No se pudo desactivar el programa", "error");
            }
        }
    };


    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        let filteredProgramas = programas;
    
        if (hasSearchFilter) {
            filteredProgramas = filteredProgramas.filter((prog) =>
                prog.sigla.toLowerCase().includes(filterValue.toLowerCase()) ||
                prog.nombre_programa.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
    
        return filteredProgramas;
    }, [programas, filterValue]);
    
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

    const renderCell = useCallback(
        (item, columnKey) => {
            const cellValue = item[columnKey];

            switch (columnKey) {


                case "acciones":
                    return (
                        <div className="flex justify-around items-center">
                            <ButtonActualizar
                                onClick={() => handleOpenModal("programa", item)}
                            />
                            <ButtonDesactivar
                                onClick={() => handleDesactivar(item.id_programa)}
                            />


                        </div>
                    );



                default:
                    return cellValue;
            }
        },
        [handleDesactivar, handleOpenModal]
    );

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
                                onClick={() => handleOpenModal("programa")}
                                className="bg-[#0d324c] text-white"
                            >
                                Registrar Programa
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 mb-5">
                    <span className="text-default-400 text-small mt-2">
                        Total {programas.length} programas
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
        programas.length,
        onRowsPerPageChange,
        onClear,
        onSearchChange,
    ]);

    const columns = [
        { key: "id_programa", label: "ID" },
        { key: "nombre_programa", label: "Nombre" },
        { key: "sigla", label: "Sigla" },
        { key: "nivel", label: "Nivel" },
        { key: "acciones", label: "Acciones" },
    ];

    return (
        <div className="overflow-hidden flex-1 bg-dark p-2">
            <div className="flex flex-col">
                {topContent}
                <Table
                    aria-labelledby="Tabla de Programas"
                    css={{ height: "auto", minWidth: "100%" }}
                >
                    <TableHeader>
                        {columns.map((column) => (
                            <TableColumn key={column.key}>{column.label}</TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {sortedItems.map((item) => (
                            <TableRow key={item.id_programa}>
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
            <div>
                <ModalAcciones
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    bodyContent={bodyContent}
                />
            </div>
        </div>
    );
}

export default TableProgramas;
