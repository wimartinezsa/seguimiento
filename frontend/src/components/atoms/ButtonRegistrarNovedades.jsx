import React from 'react';
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonRegistrarNovedad = ({ onClick, ref}) => {
    return (
        <Tooltip content="Novedades">
            <button ref={ref} className="font-bold py-2 px-4 rounded" onClick={onClick}>
                <Icons.RegistrarNovedad className='w-5 h-5' />
            </button>
        </Tooltip>
    );
};

export default ButtonRegistrarNovedad;
