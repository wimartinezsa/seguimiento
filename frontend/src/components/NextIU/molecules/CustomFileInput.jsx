import React, { useState } from 'react';

const CustomFileInput = ({ onChange, ...props }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        setSelectedFile(e.target.files[0]);
        onChange(e);
    };

    return (
        <div className="flex w-full items-center justify-between space-x-4 p-2 border-2 hover:border-gray-400 rounded-xl transition-colors duration-300">
            <input
                type="file"
                onChange={handleChange}
                {...props}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            {selectedFile && (
                <p>Archivo seleccionado: {selectedFile.name}</p>
            )}
        </div>
    );
};

export default CustomFileInput;
