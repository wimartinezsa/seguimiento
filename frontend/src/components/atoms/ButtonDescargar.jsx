import React from 'react'
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonDescargar = ({ onClick }) => {
  return (
        <Tooltip content="Descargar">
            <button className="px-2 py-1 bg-[#0d324c] text-white rounded-lg flex items-center" onClick={onClick}>
                <Icons.descargar className='w-5 h-5' />
            </button>
        </Tooltip>
  )
}

export default ButtonDescargar


