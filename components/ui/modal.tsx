import React from "react";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Затемнённый фон */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      {/* Контент модального окна */}
      <div className="bg-white z-10 p-4 rounded shadow-lg max-w-3xl w-full">
        {children}
      </div>
    </div>
  );
};
