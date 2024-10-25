import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormEtapaPractica from "./FormEtapaPractica.jsx";
import ModalAcciones from "./ModalAcciones.jsx";
import FormAprendices from "./FormUsuarios.jsx";
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
} from "@nextui-org/react";
import { SearchIcon } from "../NextIU/atoms/searchicons.jsx";

function TableAprendices() {
  const [personas, setPersonas] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(""); 
  const [modalEtapaOpen, setModalEtapaOpen] = useState(false); 
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get("/personas/listarA"); 
        setPersonas(response.data);
      } catch (error) {
        console.error("Error", error);
      }
    };
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    let filteredPersonas = personas;
    if (filterValue) {
      filteredPersonas = filteredPersonas.filter((seg) =>
        seg.nombres.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredPersonas;
  }, [personas, filterValue]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const handleOpenModal = (mode) => {
    setFormMode(mode);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalEtapaOpen(false); 
  };

  const handleFormAprendicesSubmit = () => {
    handleCloseModal(); 
    setModalEtapaOpen(true);
  };

  const columns = [
    { key: "id_persona", label: "ID" },
    { key: "identificacion", label: "Identificacion" },
    { key: "nombres", label: "Nombres" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Telefono" },
    { key: "nombre_mpio", label: "Municipio" },
    { key: "etapaProductiva", label: "Etapa Productiva" },
  ];

  return (
    <div className="overflow-hidden flex-1  bg-dark p-2">
      <div className="flex flex-col">
        <div className="flex flex-col mt-3">
          <div className="flex justify-between gap-3 items-end">
            <Input
              isClearable
              className="w-full sm:max-w-[44%] bg-[#f4f4f5] rounded"
              placeholder="Buscar..."
              startContent={<SearchIcon />}
              value={filterValue}
              onClear={() => setFilterValue("")}
              onValueChange={(value) => setFilterValue(value || "")}
            />
            <Button
              onClick={() => handleOpenModal("formAprendices")}
              className="bg-[#90d12c] text-white"
            >
              Registrar Aprendiz
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white text-small">
              Total {personas.length} Resultados
            </span>
            <label className="flex items-center text-white mr-30 text-small">
              Columnas por página:
              <select
                className="bg-transparent outline-none text-white text-small"
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </label>
          </div>
        </div>
        <Table
          aria-label="Tabla de Personas"
          css={{ height: "auto", minWidth: "100%" }}
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.key === "etapaProductiva" ? (
                      <Button
                        size="sm"
                        className="bg-[#90d12c] text-white"
                        onClick={() => handleOpenModal("formEtapaPractica")}
                      >
                        Registrar
                      </Button>
                    ) : column.key === "nombres" ? (
                      <User
                        name={item[column.key]}
                        avatarSrc="https://via.placeholder.com/150"
                        bordered
                        as="button"
                        size="sm"
                        color="primary"
                      />
                    ) : (
                      item[column.key]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prevPage) => prevPage - 1)}
          >
            Anterior
          </Button>
          <Button
            disabled={page === Math.ceil(filteredItems.length / rowsPerPage)}
            onClick={() => setPage((prevPage) => prevPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
      <ModalAcciones
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
          formMode === "formAprendices"
            ? "Registrar Aprendiz"
            : "Registrar Etapa Practica"
        }
        bodyContent={
          formMode === "formAprendices" ? (
            <FormAprendices onSubmit={handleFormAprendicesSubmit} />
          ) : (
            <FormEtapaPractica />
          )
        }
        footerActions={[
          {
            label: "Cerrar",
            color: "danger",
            onPress: handleCloseModal,
          },
          {
            label: formMode === "formAprendices" ? "Registrar" : "Acción",
            color: "primary",
            onPress:
              formMode === "formAprendices"
                ? handleFormAprendicesSubmit
                : () => console.log("Acción realizada"),
          },
        ]}
      />
      <ModalAcciones
        isOpen={modalEtapaOpen}
        onClose={handleCloseModal}
        title="Registrar Etapa Practica"
        bodyContent={<FormEtapaPractica />}
        footerActions={[
          {
            label: "Cerrar",
            color: "danger",
            onPress: handleCloseModal,
          },
          {
            label: "Acción",
            color: "primary",
            onPress: () => console.log("Acción realizada"),
          },
        ]}
      />
    </div>
  );
}

export default TableAprendices;
