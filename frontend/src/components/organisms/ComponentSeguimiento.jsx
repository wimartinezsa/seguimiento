import React from "react";
import ActaSeguimiento from '../molecules/Seguimientos/ActaSeguimiento.jsx'
import Bitacoras from "../molecules/Seguimientos/Bitacoras.jsx";

function ComponentSeguimiento({ id_seguimiento, setButtonState, buttonState, onSuccess, onReject }) {
  const seguimientoNumeros = {
    1: 1,
    2: 2,
    3: 3,
  };
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">
        Seguimiento {seguimientoNumeros[id_seguimiento] || 1}{" "}
      {/* Mostrar el número de seguimiento */}
      </h1>
      {/* Sección para enviar acta */}
      <ActaSeguimiento id_seguimiento={id_seguimiento} setButtonState={setButtonState} onSuccess={onSuccess} onReject={onReject} buttonState={buttonState} />
      {/* Sección para registrar bitácoras  */}
      <div>
        <Bitacoras id_seguimiento={id_seguimiento} />
      </div>
    </div>
  );
}

export default ComponentSeguimiento;  