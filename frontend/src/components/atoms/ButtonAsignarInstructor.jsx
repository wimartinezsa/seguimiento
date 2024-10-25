import React from 'react';
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonAsignarI = ({ onClick, ref}) => {
    return (
        <Tooltip content="Asignar Instructor">
            <button ref={ref} className="font-bold py-2 px-4 rounded" onClick={onClick}>
                <Icons.AsignarInstructor className='w-5 h-5' />
            </button>
        </Tooltip>
    );
};

export default ButtonAsignarI;


