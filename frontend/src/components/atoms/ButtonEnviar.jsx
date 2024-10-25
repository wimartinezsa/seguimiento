import React from 'react';
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonEnviar = ({ onClick, style}) => {
    return (
        <Tooltip content="Enviar">
            <button className="py-2 px-2 h-7 ml-4 w-8 bg-[#6fb12d] text-white rounded-lg flex items-center" style={{style}} onClick={onClick}>
                <Icons.enviar className='w-5 h-5' />
            </button>
        </Tooltip>
    );
};

export default ButtonEnviar;

