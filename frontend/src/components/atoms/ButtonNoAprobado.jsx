import React from 'react'
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonNoAprobado = ({ onClick }) => {
  return (
        <Tooltip content="No aprobado">
            <button className="px-2 py-1 bg-[#f41260] text-white rounded-lg flex items-center mx-2" onClick={onClick}>
                <Icons.noAprobado className='w-5 h-5' />
            </button>
        </Tooltip>
  )
}

export default ButtonNoAprobado


