import React, { useState, useEffect } from 'react';
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import axiosClient from '../../../configs/axiosClient';
import Swal from 'sweetalert2';

const FormAmbientes = ({ onSubmit, onClose, actionLabel, mode, initialData }) => {
    const [formData, setFormData] = useState({
        id_ambiente: initialData?.id_ambiente || '',
        nombre_amb: initialData?.nombre_amb || '',
        municipio: initialData?.municipio || '',
        sede: initialData?.sede || '',
    });

    const optionsSede = [
        { value: 'yamboro', label: 'Yamboro' },
        { value: 'centro', label: 'Centro' }
    ];

    const [municipios, setMunicipios] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadMunicipios = async () => {
            try {
                const response = await axiosClient.get('/municipios/listar');
                setMunicipios(response.data);
            } catch (error) {
                console.error("Error al cargar municipios:", error);
                setMunicipios([]);
            }
        };

        loadMunicipios();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                id_ambiente: initialData.id_ambiente || '',
                nombre_amb: initialData.nombre_amb || '',
                municipio: initialData.municipio || '',
                sede: initialData.sede || '',
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Maneja los cambios en los select de manera específica
    const handleSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Ambiente registrado correctamente',
              });
        } catch (error) {
            console.error("Error al enviar formulario:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>

                <div className="py-2">
                    <Input
                        label="Nombre del Ambiente"
                        className='w-96'
                        placeholder="Nombre"
                        name="nombre_amb"
                        type="text"
                        value={formData.nombre_amb}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="py-2">
                    <Select
                        name="municipio"
                        value={formData.municipio}
                        onChange={(e) => handleSelectChange('municipio', e.target.value)}
                        required
                        className="w-96"
                        placeholder='Selecciona un Municipio'
                    >
                        <SelectItem value="">Seleccionar Municipio</SelectItem>
                        {municipios.map((municipio) => (
                            <SelectItem key={municipio.id_municipio} value={municipio.id_municipio}>
                                {municipio.nombre_mpio}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <div className="py-2">
                    <Select
                        name="sede"
                        value={formData.sede}
                        onChange={(e) => handleSelectChange('sede', e.target.value)}
                        className="w-96"
                        placeholder='Selecciona una Sede'
                    >
                        <SelectItem value="">Seleccionar Sede</SelectItem>
                        {optionsSede.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="mt-4 flex justify-end gap-2">

                    <Button className="bg-[#0d324c] text-white" type="submit">
                        {actionLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default FormAmbientes;