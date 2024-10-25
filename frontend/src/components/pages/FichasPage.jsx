import React from 'react';
import { Tabs, Tab } from "@nextui-org/react";
import TableFichas from "../organisms/TableFichas";
import TableHorarios from "../organisms/TableHorario";
import TableAmbiente from '../organisms/TableAmbiente';
import TableProgramas from '../organisms/TableProgramas';

function FichasPage() {
  return (
    <>
      <div className="flex min-h-screen flex-col m-10">
        <Tabs aria-label="Options">
          <Tab key="programas" title="Programas">
            <TableProgramas />
          </Tab>
          <Tab key="fichas" title="Fichas">
            <TableFichas />
          </Tab>
          <Tab key="ambientes" title="Ambientes">
            <TableAmbiente />
          </Tab>
          <Tab key="horarios" title="Horarios">
            <TableHorarios />
          </Tab>
        </Tabs>
      </div>
    </>
  );
}


export default FichasPage