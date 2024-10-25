import React, { createContext } from 'react'
import { SeguimientosProvider } from './SeguimientosContext'
import { PersonasProvider } from './PersonasContext'
import { NovedadesProvider } from './NovedadContext'
import { AsignacionProvider } from './AsignacionesContext'
import AmbienteContext, { AmbienteProvider } from './AmbienteContext'


export const GlobalContext = createContext()

const GlobalProvider = ({ children }) => {

    const globalContextValue = {}

    return (
        <GlobalContext.Provider value={globalContextValue}>
            <AmbienteProvider>
            <NovedadesProvider>
                <AsignacionProvider>
                    <SeguimientosProvider>
                        <PersonasProvider>

                            {children}
                        </PersonasProvider>
                    </SeguimientosProvider>
                </AsignacionProvider>
            </NovedadesProvider>
            </AmbienteProvider>
        </GlobalContext.Provider>
    )
}

export default GlobalProvider
