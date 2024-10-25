import React, { useEffect, useState, useMemo, useCallback } from "react";
import FormUsuarios from "../molecules/Instructores/FormUsuarios.jsx";
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
  User,
  Pagination,
} from "@nextui-org/react";
import { SearchIcon } from "../NextIU/atoms/searchicons.jsx";
import ButtonActualizar from "../atoms/ButtonActualizar.jsx";
import ButtonDesactivar from "../atoms/ButtonDesactivar.jsx";
import ButtonListarActividad from "../atoms/ButtonListarActividad.jsx";
import ListActividad from "../molecules/Instructores/ListActividad.jsx";

function TableInstructores() {
  const [personas, setPersonas] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "identificacion",
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bodyContent, setBodyContent] = useState(null);
  const [page, setPage] = useState(1);
  const [areas, setAreas] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axiosClient.get("/personas/listarI"); 
      setPersonas(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (formType, data = null) => {
    if (formType === "formUsuarios") {
      setBodyContent(
        <FormUsuarios initialData={data} onSuccess={handleUpdateData} />
      );
    } else if (formType === "ListActividades") {
      setBodyContent(
        <ListActividad selectedInstructor={data} onClose={handleCloseModal} />
      );
    }
    setIsModalOpen(true);
  };

  const handleUpdateData = useCallback(() => {
    fetchData();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchAreas = async () => {
    try {
      const response = await axiosClient.get("/areas/listar");
      setAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };
  useEffect(() => {
    fetchAreas();
  }, []);

  const handleDesactivar = async (id_persona) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres desactivar este usuario?",
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
        const response = await axiosClient.post(`/personas/desactivar/${id_persona}`);
        Swal.fire("Desactivado", response.data.message, "success");
          setPersonas((prevPersonas) =>
          prevPersonas.filter((persona) => persona.id_persona !== id_persona)
        );
      } catch (error) {
        console.error("Error desactivando usuario:", error);
        Swal.fire("Error", "No se pudo desactivar el usuario", "error");
      }
    }
  };
  

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredPersonas = personas;

    if (hasSearchFilter) {
      filteredPersonas = filteredPersonas.filter((seg) => {
        const identificacion = seg.identificacion ? String(seg.identificacion).toLowerCase() : "";
        return (
          seg.nombres.toLowerCase().includes(filterValue.toLowerCase()) ||
          identificacion.includes(filterValue.toLowerCase())
        );
      });
    }

    return filteredPersonas;
  }, [personas, filterValue]);

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
        case "area":
          const area = areas.find((area) => area.id_area === item.area);
          return area ? area.nombre_area : "";

        case "acciones":
          return (
            <div className="flex justify-around items-center">
              <ButtonActualizar
                onClick={() => handleOpenModal("formUsuarios", item)}
              />
              <ButtonDesactivar
                onClick={() => handleDesactivar(item.id_persona)}
              />
              <ButtonListarActividad
                onClick={() => handleOpenModal("ListActividades", item)}
              />
            </div>
          );

        case "nombres":
          return (
            <User
              name={cellValue}
              avatarSrc="https://via.placeholder.com/150"
              bordered
              as="button"
              size="sm"
              color="primary"
            />
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
                onClick={() => handleOpenModal("formUsuarios")}
                className="bg-[#0d324c] text-white"
              >
                Registrar Instructor
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 mb-5">
          <span className="text-default-400 text-small mt-2">
            Total {personas.length} usuarios
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
    personas.length,
    onRowsPerPageChange,
    onClear,
    onSearchChange,
  ]);

  const columns = [
    { key: "id_persona", label: "ID" },
    { key: "identificacion", label: "Identificación" },
    { key: "nombres", label: "Nombres" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "rol", label: "Rol" },
    { key: "tipo", label: "Tipo" },
    { key: "sede", label: "Sede" },
    { key: "area", label: "Area" },
    { key: "acciones", label: "Acciones" },
  ];

  return (
    <div className="overflow-hidden flex-1 bg-dark p-2">
      <div className="flex flex-col">
        {topContent}
        <Table
          aria-labelledby="Tabla de Personas"
          css={{ height: "auto", minWidth: "100%" }}
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.id_persona}>
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

export default TableInstructores;
