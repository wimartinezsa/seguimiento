import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

// Componente GlobalModal
const ModalAcciones = ({ isOpen, onClose, title, bodyContent, footerActions = []}) => {
  return (      
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="w-auto max-w-fit"  // Ajusta el ancho del modal
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody className='overflow-y-auto max-h-[80vh] w-auto'>
              {bodyContent}
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2">
              {Array.isArray(footerActions) && footerActions.length > 0 && footerActions.map((action, index) => (
                <Button
                  key={index}
                  color={action.color}
                  onPress={() => {
                    if (action.onPress) {
                      action.onPress(); // Ejecuta la acción definida
                    }
                    onClose(); // Cierra el modal al hacer clic en el botón
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalAcciones;
