import React, { useState } from "react";
import ButtonDescargar from "../../atoms/ButtonDescargar.jsx";

const PDFUploader = ({ onFileSelect, className }) => {
  const [file, setFile] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    // Verificar que el archivo es un PDF
    if (uploadedFile.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF");
      return;
    }

    setFile(uploadedFile);
    onFileSelect(uploadedFile);
  };



  return (
    <div className="flex items-center gap-4">
      {file ? (
        <span className="text-base text-gray-400 mr-4">Archivo Cargado</span>
      ) : (
        <label className="relative inline-block cursor-pointer mr-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${className}`}
            />
          <span className="inline-block px-4 py-2 border shadow-lg rounded-xl">
            Seleccionar archivo PDF
          </span>
        </label>
      )}

    </div>
  );
};

export default PDFUploader;
