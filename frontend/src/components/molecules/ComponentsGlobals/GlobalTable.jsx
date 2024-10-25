import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Input
} from "@nextui-org/react";
import axiosClient from '../../../configs/axiosClient';
import ButtonActualizar from '../../atoms/ButtonActualizar';
import ButtonDesactivar from '../../atoms/ButtonDesactivar';
import { SearchIcon } from '../../NextIU/atoms/searchicons';
import Swal from 'sweetalert2';

const GlobalTable = ({ columns, dataEndpoint, updateComponent: UpdateComponent, refreshTrigger, contentName, idField, desactivarEndpoint }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const response = await axiosClient.get(dataEndpoint);
      setData(response.data);
      setTotalPages(Math.ceil(response.data.length / rowsPerPage));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDesactivar = async (itemId) => {
    // Mostrar una alerta de confirmación
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres eliminar este Componente?",
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
          const response = await axiosClient.post(`${desactivarEndpoint}${itemId}`);
          Swal.fire("Eliminado", response.data.message, "success");
          
          // Actualizar el estado para eliminar el elemento desactivado
          await fetchData(); // Forzar la recarga de datos
      } catch (error) {
          console.error("Error desactivando el elemento:", error);
          Swal.fire("Error", "No se pudo desactivar el elemento", "error");
      }
  }  
  };
  

  useEffect(() => {
    fetchData();
  }, [dataEndpoint, refreshTrigger]);

  useEffect(() => {
    setTotalPages(Math.ceil(data.length / rowsPerPage));
  }, [data, rowsPerPage]);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1); // Reset to first page whenever rows per page changes
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const paginatedData = filteredData.slice(start, end);

  const handleUpdateClick = (item) => {
    setSelectedItem(item);
    setIsUpdateModalOpen(true);
  };

  const renderCell = (item, column) => {
    return item[column.key]; // Utilizar key para obtener el valor
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center justify-between gap-3 z-10">
          <Input
            isClearable
            className="w-full sm:max-w-[44%] bg-[#f4f4f5] rounded"
            placeholder="Buscar..."
            startContent={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4 my-2">
        <span className="text-default-400 text-small mt-2">
          Total {filteredData.length} {contentName}
        </span>
        <label className="flex items-center text-default-400 text-small">
          Rows per page:
          <select
            className="bg-transparent outline-none text-default-400 text-small ml-2"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>

      <Table aria-label="Example table with pagination">
        <TableHeader>
          {columns.map((column, index) => (
            <TableColumn key={index}>{column.label}</TableColumn> // Usar label
          ))}
          <TableColumn>Acciones</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, index) => (
            <TableRow key={item[idField]}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>{renderCell(item, column)}</TableCell> // Utilizar renderCell
              ))}
              <TableCell>
              <div className="flex justify-around items-center">
                <ButtonActualizar onClick={() => handleUpdateClick(item)} />
                <ButtonDesactivar onClick={() => handleDesactivar(item[idField])} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-between mt-4">
        <Pagination
          total={totalPages}
          initialPage={page}
          onChange={(newPage) => {
            handlePageChange(newPage);
          }}
          color={page === 1 ? "default" : "success"} 
          aria-label="Paginación global"
          showControls
        />
      </div>

      {isUpdateModalOpen && selectedItem && (
        <UpdateComponent
          item={selectedItem}
          onClose={() => setIsUpdateModalOpen(false)}
          refreshData={() => {
            setIsUpdateModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default GlobalTable;
