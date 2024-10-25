import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import TableEmpresas from "../organisms/TableEmpresa";
import TableProductiva from "../organisms/TablePractica";

function EtapaPracticaPage() {
    const [userRole, setUserRole] = useState(null);
    const [userRol, setUserRol] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserRole(user.cargo);
                setUserRol(user.rol);
            } catch (error) {
                console.error("Error al parsear el JSON del usuario:", error);
            }
        }
    }, []);
    return (
        /* ayudando  */
        <>
            <div className="flex min-h-screen flex-col m-10">
                <Tabs aria-label="Options">
                    <Tab key="instructor" title="Empresas">
                        <TableEmpresas />
                    </Tab>
                    <Tab key= "instrutor" title="Etapa Practica">
                        <TableProductiva />
                    </Tab>
                </Tabs>
            </div>
        </>
    );
}

export default EtapaPracticaPage;