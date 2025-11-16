
import React, { useState, useMemo, useEffect } from 'react';
import { Product, TransactionType } from '../../types';
import Modal from './Modal';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string, color: string, size: string, quantity: number) => void;
  product: Product;
  type: TransactionType;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ isOpen, onClose, onConfirm, product, type }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product.variations.length > 0) {
        setSelectedColor(product.variations[0].color);
        if (product.variations[0].sizes.length > 0) {
            setSelectedSize(product.variations[0].sizes[0].size);
        } else {
            setSelectedSize('');
        }
    } else {
        setSelectedColor('');
        setSelectedSize('');
    }
    setQuantity(1);
  }, [product, isOpen]);
  
  const availableSizes = useMemo(() => {
    const variation = product.variations.find(v => v.color === selectedColor);
    return variation ? variation.sizes : [];
  }, [product, selectedColor]);

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.find(s => s.size === selectedSize)) {
      setSelectedSize(availableSizes[0].size);
    } else if (availableSizes.length === 0) {
      setSelectedSize('');
    }
  }, [availableSizes, selectedSize]);

  const maxQuantity = useMemo(() => {
    if (type === TransactionType.OUT) {
      const size = availableSizes.find(s => s.size === selectedSize);
      return size ? size.quantity : 0;
    }
    return undefined;
  }, [type, availableSizes, selectedSize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColor || !selectedSize || quantity <= 0) return;
    if (type === TransactionType.OUT && maxQuantity !== undefined && quantity > maxQuantity) {
      alert("Cannot stock out more than available quantity.");
      return;
    }
    onConfirm(product.id, selectedColor, selectedSize, quantity);
  };

  const selectClasses = "w-full bg-secondary border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${type} - ${product.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">Color</label>
          <select id="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className={selectClasses}>
            {product.variations.map(v => <option key={v.id} value={v.color}>{v.color}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-1">Size</label>
          <select id="size" value={selectedSize} onChange={e => setSelectedSize(e.target.value)} disabled={!selectedColor} className={selectClasses}>
            {availableSizes.map(s => <option key={s.id} value={s.size}>{s.size}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={maxQuantity}
            required
            className={selectClasses}
          />
          {type === TransactionType.OUT && maxQuantity !== undefined && (
             <p className="text-xs text-gray-400 mt-1">Available: {maxQuantity}</p>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-700">Cancel</button>
          <button type="submit" className={`px-4 py-2 rounded-md text-white ${type === TransactionType.IN ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
        </div>
      </form>
    </Modal>
  );
};

export default StockMovementModal;
