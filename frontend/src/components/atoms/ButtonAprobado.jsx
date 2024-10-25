import React from 'react'
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonAprobado = ({ onClick }) => {
  return (
        <Tooltip content="Aprobado">
            <button className="px-2 py-1 bg-[#198d57] text-white rounded-lg flex items-center ml-2" onClick={onClick}>
                <Icons.aprobado className='w-5 h-5' />
            </button>
        </Tooltip>
  )
}

export default ButtonAprobado


