import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import v from '../../../styles/Variables'

const ExcelUploader = () => {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(''); // Estado para el nombre del archivo

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile); // Guardar el archivo en el estado
    setFileName(uploadedFile.name); // Guardar el nombre del archivo

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Tomar el nombre de la primera hoja
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir la hoja en un arreglo de objetos JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setData(jsonData);
      } catch (error) {
        console.error("Error al leer el archivo:", error);
      }
    };

    reader.onerror = (error) => {
      console.error("Error al leer el archivo:", error);
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const downloadFile = () => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url); // Limpiar el objeto URL después de la descarga
  };

  return (
    <div>
      <p className="my-2 text-gray-700">{fileName}</p>
      <label className="relative inline-block cursor-pointer">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <span className="inline-block px-4 py-2 border shadow-lg rounded-xl">
          Seleccionar archivo 
        </span>
      </label>

      {file && (
        <div className="mt-4 ml-40">
          <button
            /* onClick={}  */
            className="px-2 py-1 bg-[#98e326] text-white rounded-lg"
          >
            <v.descargar className='w-5 h-5' />
          </button>
          <button
            onClick={downloadFile}
            className="px-2 py-1 ml-4 bg-[#70B22D] text-white rounded-lg"
          >
            <v.enviar className='w-5 h-5' />
          </button>
        </div>
      )}

      <table className="mt-4 w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => (
                <th key={key} className="border border-gray-200 px-4 py-2">
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i} className="border border-gray-200 px-4 py-2">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelUploader;