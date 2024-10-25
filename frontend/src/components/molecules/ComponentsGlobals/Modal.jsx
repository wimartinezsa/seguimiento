import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

function AccionesModal({ label, isOpen, onClose, onAccept }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="top-center" width="90%">
      <ModalContent className="w-full max-w-screen-md">
        <ModalHeader></ModalHeader>
        <ModalBody className="relative overflow-hidden"> {/* Añadir relative y overflow-hidden */}
          <div className="h-[600px] overflow-y-auto"> {/* Definir altura fija y barra de desplazamiento */}
            <label>{label}</label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button className="bg-[#84CC16] text-white" onPress={onAccept}>
            Aceptar
          </Button>
          <Button color="danger" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AccionesModal;