import React from 'react';
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonEliminar = ({ onClick, ref}) => {
    return (
        <Tooltip content="Eliminar Novedad">
            <button ref={ref} className="font-bold py-2 px-4 rounded" onClick={onClick}>
                <Icons.Eliminar className='w-5 h-5' />
            </button>
        </Tooltip>
    );
};

export default ButtonEliminar;
