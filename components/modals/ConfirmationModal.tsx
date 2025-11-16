
import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="text-gray-300">{message}</p>
        <div className="flex justify-end mt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-gray-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
