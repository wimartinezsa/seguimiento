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
import RegistroHorario from '../molecules/Horarios/FormHorario.jsx';
import ActualizarHorario from '../molecules/Horarios/ActualizarHorarios.jsx';
import ButtonDesactivar from '../atoms/ButtonDesactivar.jsx';


function TableHorario() {
  const [initialData, setInitialData] = useState(null);
  const [selectedFicha, setSelectedFicha] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "dia",
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bodyContent, setBodyContent] = useState(null);
  const [page, setPage] = useState(1);
  const [fichas, setFichas] = useState([]);
  const [horarios, setHorarios] = useState([]);
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

  const fetchHorarios = useCallback(async () => {
    setHorarios([]);

    if (selectedFicha) {
      try {
        const response = await axiosClient.get(`/horarios/listarPorFicha/${selectedFicha}`);
        if (response.data.length > 0) {
          setHorarios(response.data);
        } else {
          Swal.fire({
            title: 'Sin horarios',
            text: 'No hay Horarios registrados para la ficha seleccionada.',
            icon: 'info',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error('Error fetching horarios:', error);
      }
    }
  }, [selectedFicha]);

  useEffect(() => {
    fetchHorarios();
  }, [selectedFicha, page, rowsPerPage, fetchHorarios]);

  const handleDesactivar = async (id_horario) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres desactivar este Horario?",
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

    if (result.isConfirmed) {
      try {
        const response = await axiosClient.post(`/horarios/desactivar/${id_horario}`);
        Swal.fire("Eliminada", response.data.message, "success");
        setHorarios((prevHorario) =>
          prevHorario.filter((horario) => horario.id_horario !== id_horario)
        );
      } catch (error) {
        console.error("Error Eliminando la horario:", error);
        Swal.fire("Error", "No se pudo Eliminar la horario", "error");
      }
    }
  };



  const handleOpenModal = (formType, data = null) => {
    setInitialData(data);
    if (formType === 'registro') {
      setBodyContent(<RegistroHorario initialData={data} fichaSeleccionada={selectedFicha} onClose={handleCloseModal} refreshData={handleUpdateData} />);
    } else if (formType === 'actualizar') {
      setBodyContent(<ActualizarHorario item={data} onClose={handleCloseModal} refreshData={handleUpdateData}/>);
    }
    setIsModalOpen(true);
  };

  const handleUpdateData = useCallback(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInitialData(null);
  };

  const handleTabChange = (key) => {
    setSelectedFicha(key);
  };

  const handleToggle = (initialData) => {
    if (initialData) {
        setInitialData(initialData);
        setambienteId(initialData.id_horario);
        handleOpenModal('actualizar', initialData);
    }
};


  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let fileteredHorarios = horarios;

    if (hasSearchFilter) {
      fileteredHorarios = fileteredHorarios.filter((seg) =>
        seg.dia.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return fileteredHorarios;
  }, [horarios, filterValue]);

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
              <ButtonActualizar onClick={() => handleOpenModal("actualizar", item)} />
              <ButtonDesactivar onClick={() => handleDesactivar(item.id_horario)} />
            </div>
          );

          
        default:
          return item[columnKey];
      }
    },
    [handleOpenModal]
  );


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
            value={selectedFicha} 
            onChange={handleFichaChange}
            placeholder="Seleccione una Ficha"
            className="w-48"
          >
            <SelectItem value="">Seleccione una ficha</SelectItem> 
            {fichas.map((ficha) => (
              <SelectItem key={ficha.codigo} value={ficha.codigo}>
                {`${ficha.codigo} - ${ficha.sigla}`}
              </SelectItem>
            ))}
          </Select>
          <Button
            onClick={() => handleOpenModal("registro")}
            className="bg-[#0d324c] text-white"
          >
            Registrar Horario
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 mb-5">
        <span className="text-default-400 text-small mt-2">
          Total {horarios.length} Horarios
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
    { key: "id_horario", label: "ID" },
    { key: "dia", label: "Día" },
    { key: "nombre_amb", label: "Ambiente" },
    { key: "hora_inicio", label: "Hora de Inicio" },
    { key: "hora_fin", label: "Hora de Fin" },
    { key: "horas", label: "Horas" },
    { key: "acciones", label: "Acciones" },
  ];
  

  return (
    <>
      <div>
        {topContent}
        {selectedFicha ? (
          horarios.length > 0 ? (
            <Table
              aria-label="Horarios Table"
              css={{ minWidth: "100%", height: "auto" }}
              className="p-4"
            >
              <TableHeader>
                {columns.map((column) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                ))}
              </TableHeader>
              <TableBody>
                {sortedItems.map((horario) => (
                  <TableRow key={horario.id_horario}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {renderCell(horario, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center mt-6">
              <p>No hay horarios registrados en esta ficha.</p>
            </div>
          )
        ) : (
          <div className="text-center mt-6">
            <p>Seleccione una ficha para ver las horarios.</p>
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
        title={initialData ? "Actualizar Horario" : "Registrar Horarios"}
      />
    </>
  );
}

export default TableHorario;
