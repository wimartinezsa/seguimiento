import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
    Input,
    Button,
    Pagination,
    Chip,
    Select,
    SelectItem
} from "@nextui-org/react";
import { SearchIcon } from "../NextIU/atoms/searchicons.jsx";
import ButtonActualizar from "../atoms/ButtonActualizar.jsx";
import FormMatriculas from '../molecules/Matriculas/FormMatriculas.jsx';
import FormAprendices from '../molecules/Matriculas/FormAprendices.jsx';
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import ButtonDesactivar from '../atoms/ButtonDesactivar.jsx';


function TableMatriculas() {
    const [selectedFicha, setSelectedFicha] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "identificacion",
        direction: "ascending",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bodyContent, setBodyContent] = useState(null);
    const [page, setPage] = useState(1);
    const [fichas, setFichas] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);


    // Fetch para obtener las fichas
    useEffect(() => {
        const fetchFichas = async () => {
            try {
                const response = await axiosClient.get('/fichas/listarN');
                if (response.data.length > 0) {
                    setFichas(response.data);
                } else {
                    Swal.fire({
                        title: 'Sin Fichas',
                        text: 'No hay fichas registradas.',
                        icon: 'info',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error fetching fichas:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al obtener las fichas.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        };

        fetchFichas();
    }, []);

    // Fetch para obtener las matriculas de la ficha seleccionada
    const fetchMatriculas = useCallback(async () => {
        // Restablecer el estado de matrículas antes de la nueva carga
        setMatriculas([]);

        if (selectedFicha) {
            try {
                const response = await axiosClient.get(`/matriculas/listar/${selectedFicha}`);
                if (response.data.length > 0) {
                    setMatriculas(response.data);
                } else {
                    Swal.fire({
                        title: 'Sin Matrículas',
                        text: 'No hay matrículas registradas para la ficha seleccionada.',
                        icon: 'info',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error fetching matriculas:', error);
            }
        }
    }, [selectedFicha]);

    useEffect(() => {
        fetchMatriculas();
    }, [selectedFicha, page, rowsPerPage, fetchMatriculas]);

    const handleDesactivar = async (id_matricula) => {
        // Mostrar una alerta de confirmación
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Quieres eliminar esta matrícula? Si lo haces, se borrarán todos los registros asociados, incluida la etapa productiva y los seguimientos si existen.",
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
                const response = await axiosClient.delete(`/matriculas/cancelada/${id_matricula}`);
                Swal.fire("Eliminada", response.data.message, "success");

                // Actualizar el estado para eliminar el instructor desactivado
                setMatriculas((prevMatriculas) =>
                    prevMatriculas.filter((matricula) => matricula.id_matricula !== id_matricula)
                );
            } catch (error) {
                console.error("Error Eliminando la Matricula:", error);
                Swal.fire("Error", "No se pudo Eliminar la matricula", "error");
            }
        }
    };



    const fetchFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);  // Asegúrate de que 'file' es el nombre esperado en el backend.

        try {
            const response = await axiosClient.post('/excel/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFile(response.data);

            Swal.fire({
                title: 'Importación exitosa',
                text: 'Los datos se han importado correctamente.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            fetchMatriculas();

        } catch (error) {
            console.error("Error al cargar archivo:", error);
            Swal.fire({
                title: 'Error',
                text: 'Error al cargar el archivo. Intenta de nuevo más tarde.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            fetchFile(selectedFile);  // Llama a la función fetchFile pasando el archivo seleccionado
        }
    };



    const handleClickImportarExcel = () => {
        fileInputRef.current.click(); // Triggers file input click
    };


    const handleOpenModal = (formType, data = null) => {
        if (formType === 'formMatriculas') {
            setBodyContent(<FormMatriculas initialData={data} fichaSeleccionada={selectedFicha} onSuccess={handleUpdateData} />);
        } else if (formType === 'formAprendices') {
            setBodyContent(<FormAprendices />);
        }
        setIsModalOpen(true);
    };

    const handleUpdateData = useCallback(() => {
        fetchMatriculas();
    }, [fetchMatriculas]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleTabChange = (key) => {
        setSelectedFicha(key);
    };


    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        let filteredMatriculas = matriculas;
    
        if (hasSearchFilter) {
            filteredMatriculas = filteredMatriculas.filter((seg) => {
                const nombreValido = seg.nombre_aprendiz && seg.nombre_aprendiz.toString().toLowerCase().includes(filterValue.toLowerCase());
                const identificacionValida = seg.identificacion && seg.identificacion.toString().toLowerCase().includes(filterValue.toLowerCase());
                return nombreValido || identificacionValida;
            });
        }
    
        return filteredMatriculas;
    }, [matriculas, filterValue]);
    
    
    
    
    
    

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
                            <ButtonActualizar onClick={() => handleOpenModal("formMatriculas", item)} />
                            <ButtonDesactivar onClick={() => handleDesactivar(item.id_matricula)} />
                        </div>
                    );
                case "estado":
                    return (
                        <Chip
                            className="text-[#3c3c3c]"
                            variant="flat"
                            style={{ backgroundColor: getColorForFicha(cellValue) || "rgba(240, 240, 240, 0.8)" }} // Color claro por defecto
                        >
                            {cellValue}
                        </Chip>
                    );
                default:
                    return item[columnKey];
            }
        },
        [handleOpenModal]
    );

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
        const hash = hashCode(fichaNumber.toString());
        return intToColor(hash);
    };
    const handleFichaChange = (event) => {
        console.log("Ficha seleccionada:", event.target.value);
        setSelectedFicha(event.target.value);
    };


    const onRowsPerPageChange = useCallback((e) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSearchChange = useCallback((value) => {
        setFilterValue(value || "");
        setPage(1);
    }, []);


    const topContent = (
        <div className="flex flex-col mt-3">
            <div className="flex justify-between gap-3 items-end">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%] bg-[#f4f4f5] rounded"
                    placeholder="Buscar..."
                    startContent={<SearchIcon />}
                    value={filterValue}
                    onClear={() => setFilterValue('')}
                    onValueChange={setFilterValue}
                />
                <div className="flex items-center gap-3">
                    <Select
                        value={selectedFicha} // Verifica que selectedFicha tenga el valor correcto
                        onChange={handleFichaChange} // Asegúrate de que el estado cambia correctamente
                        placeholder="Seleccione una Ficha"
                        className="w-48"
                    >
                        <SelectItem value="">Seleccione una ficha</SelectItem> {/* Opción por defecto */}
                        {fichas.map((ficha) => (
                            <SelectItem key={ficha.codigo} value={ficha.codigo}>
                                {`${ficha.codigo} - ${ficha.sigla} `}
                            </SelectItem>
                        ))}
                    </Select>

                    <Button className="bg-[#34688e] text-white" onClick={handleClickImportarExcel}>
                        Importar Excel
                    </Button>
                    <Input
                        ref={fileInputRef}
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileInput"
                        type="file"
                    />

                    <Button
                        onClick={() => handleOpenModal("formMatriculas")}
                        className="bg-[#2b7ab3] text-white"
                    >
                        Matricular
                    </Button>
                    <Button
                        onClick={() => handleOpenModal("formAprendices")}
                        className="bg-[#0d324c] text-white"
                    >
                        Registrar Aprendiz
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2 mb-5">
                <span className="text-default-400 text-small mt-2">
                    Total {matriculas.length} matriculas
                </span>
                <label className="flex items-center text-default-400 text-small">
                    Rows per page:
                    <select
                        className="bg-transparent outline-none text-default-400 text-small"
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
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

    const columns = [
        { key: "id_matricula", label: "ID" },
        { key: "identificacion", label: "Identificación" },
        { key: "nombre_aprendiz", label: "Aprendiz" },
        { key: "correo", label: "Correo" },
        { key: "telefono", label: "Telefono" },
        { key: "ficha", label: "Ficha" },
        { key: "estado", label: "Estado" },
        { key: "pendiente_tecnicos", label: "Rap P. Técnicos" },
        { key: "pendiente_transversales", label: "Rap P. Transversales" },
        { key: "pendiente_ingles", label: "Rap P. Inglés" },
        { key: "acciones", label: "Acciones" },
    ];

    return (
        <>
            <div>
                {topContent}
                {selectedFicha ? (
                    matriculas.length > 0 ? (
                        <Table
                            aria-label="Matriculas Table"
                            css={{ minWidth: "100%", height: "auto" }}
                        >
                            <TableHeader>
                                {columns.map((column) => (
                                    <TableColumn key={column.key}>{column.label}</TableColumn>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {sortedItems.map((matricula) => (
                                    <TableRow key={matricula.id_matricula}>
                                        {columns.map((column) => (
                                            <TableCell key={column.key}>
                                                {renderCell(matricula, column.key)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center mt-6">
                            <p>No hay matrículas registradas en esta ficha.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center mt-6">
                        <p>Seleccione una ficha para ver las matrículas.</p>
                    </div>
                )}

            </div>

            <Pagination
                total={pages}
                initialPage={page}
                onChange={(page) => setPage(page)}
                color="success"
                aria-label="Paginación de la tabla"
                showControls
            />
            <ModalAcciones
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                bodyContent={bodyContent}
            />
        </>
    );
}

export default TableMatriculas;
