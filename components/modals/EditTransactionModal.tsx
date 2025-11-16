
import React, { useState, useMemo } from 'react';
import { Product, Transaction, TransactionType } from '../../types';
import Modal from './Modal';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (originalTransaction: Transaction, newQuantity: number) => void;
  transaction: Transaction;
  products: Product[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, onConfirm, transaction, products }) => {
  const [quantity, setQuantity] = useState(transaction.quantity);

  const product = useMemo(() => products.find(p => p.id === transaction.productId), [products, transaction.productId]);
  
  const currentStock = useMemo(() => {
    if (!product) return 0;
    const variation = product.variations.find(v => v.color === transaction.color);
    if (!variation) return 0;
    const size = variation.sizes.find(s => s.size === transaction.size);
    return size ? size.quantity : 0;
  }, [product, transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
        alert("Quantity must be greater than zero.");
        return;
    };

    if (transaction.type === TransactionType.OUT) {
        const diff = quantity - transaction.quantity;
        if (diff > currentStock) {
            alert(`Cannot increase stock out quantity by ${diff}. Only ${currentStock} units available to remove.`);
            return;
        }
    }
    onConfirm(transaction, quantity);
  };

  const inputClasses = "w-full bg-secondary border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Transaction - ${transaction.productName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='bg-secondary p-3 rounded-md'>
            <p><span className='font-semibold text-gray-400'>Product:</span> {transaction.productName}</p>
            <p><span className='font-semibold text-gray-400'>Variation:</span> {transaction.color} / {transaction.size}</p>
            <p><span className='font-semibold text-gray-400'>Type:</span> {transaction.type}</p>
            <p><span className='font-semibold text-gray-400'>Current Stock for this item:</span> {currentStock}</p>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">New Quantity</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            required
            className={inputClasses}
            autoFocus
          />
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-700">Cancel</button>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Changes</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTransactionModal;
