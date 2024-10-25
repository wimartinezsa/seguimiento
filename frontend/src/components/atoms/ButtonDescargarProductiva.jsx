import React from 'react'
import Icons from '../../styles/Variables';
import { Tooltip } from "@nextui-org/react"

const ButtonDescargarProductiva = ({ onClick }) => {
  return (
        <Tooltip content="Descargar ZIP">
            <button className="px-2 py-1 text-black rounded-lg flex items-center" onClick={onClick}>
                <Icons.descargar className='w-5 h-5' />
            </button>
        </Tooltip>
  )
}

export default ButtonDescargarProductiva


