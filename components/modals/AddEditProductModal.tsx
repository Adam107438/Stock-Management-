
import React, { useState, useEffect } from 'react';
import { Product, ColorVariation, SizeVariation } from '../../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon } from '../icons';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
}

const AddEditProductModal: React.FC<AddEditProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [name, setName] = useState('');
  const [variations, setVariations] = useState<ColorVariation[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      // Deep copy to avoid mutating original state
      setVariations(JSON.parse(JSON.stringify(product.variations))); 
    } else {
      setName('');
      setVariations([{ id: Date.now().toString(), color: '', sizes: [{id: (Date.now() + 1).toString(), size: '', quantity: 0}] }]);
    }
  }, [product, isOpen]);

  const handleVariationChange = (index: number, field: keyof ColorVariation, value: any) => {
    const newVariations = [...variations];
    (newVariations[index] as any)[field] = value;
    setVariations(newVariations);
  };

  const handleSizeChange = (varIndex: number, sizeIndex: number, field: keyof SizeVariation, value: any) => {
    const newVariations = [...variations];
    (newVariations[varIndex].sizes[sizeIndex] as any)[field] = value;
    setVariations(newVariations);
  };
  
  const addVariation = () => {
    setVariations([...variations, { id: Date.now().toString(), color: '', sizes: [{id: (Date.now() + 1).toString(), size: '', quantity: 0}] }]);
  };
  
  const removeVariation = (index: number) => {
    if (variations.length > 1) {
        setVariations(variations.filter((_, i) => i !== index));
    }
  };

  const addSize = (varIndex: number) => {
    const newVariations = [...variations];
    newVariations[varIndex].sizes.push({ id: Date.now().toString(), size: '', quantity: 0 });
    setVariations(newVariations);
  };

  const removeSize = (varIndex: number, sizeIndex: number) => {
    const newVariations = [...variations];
    if (newVariations[varIndex].sizes.length > 1) {
        newVariations[varIndex].sizes = newVariations[varIndex].sizes.filter((_, i) => i !== sizeIndex);
        setVariations(newVariations);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalVariations = variations
        .filter(v => v.color.trim() !== '')
        .map(v => ({
            ...v,
            sizes: v.sizes.filter(s => s.size.trim() !== '')
        }))
        .filter(v => v.sizes.length > 0);

    if (finalVariations.length === 0) return;

    onSave({
      id: product ? product.id : Date.now().toString(),
      name,
      variations: finalVariations,
    });
  };

  const inputClasses = "w-full bg-secondary border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
          <input id="productName" type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClasses} />
        </div>

        <h3 className="text-md font-medium text-gray-200 pt-2 border-t border-gray-700">Variations</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {variations.map((variation, varIndex) => (
            <div key={variation.id} className="bg-secondary p-4 rounded-md border border-gray-700 space-y-3">
                <div className="flex items-center space-x-2">
                <input
                    type="text"
                    placeholder="Color (e.g., Black)"
                    value={variation.color}
                    onChange={e => handleVariationChange(varIndex, 'color', e.target.value)}
                    className={`${inputClasses} flex-grow`}
                />
                <button type="button" onClick={() => removeVariation(varIndex)} className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={variations.length <= 1}>
                    <TrashIcon className="w-5 h-5"/>
                </button>
                </div>
                
                <div className="space-y-2 pl-2 border-l-2 border-gray-600">
                    {variation.sizes.map((size, sizeIndex) => (
                    <div key={size.id} className="flex items-center space-x-2">
                        <input
                        type="text"
                        placeholder="Size"
                        value={size.size}
                        onChange={e => handleSizeChange(varIndex, sizeIndex, 'size', e.target.value)}
                        className={inputClasses}
                        />
                         {product ? null : (
                         <input
                            type="number"
                            placeholder="Qty"
                            min="0"
                            value={size.quantity}
                            onChange={e => handleSizeChange(varIndex, sizeIndex, 'quantity', parseInt(e.target.value) || 0)}
                            className={`${inputClasses} w-24`}
                        />
                        )}
                        <button type="button" onClick={() => removeSize(varIndex, sizeIndex)} className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={variation.sizes.length <= 1}>
                         <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    ))}
                </div>
                <button type="button" onClick={() => addSize(varIndex)} className="text-sm text-primary hover:text-indigo-400 flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1"/> Add Size
                </button>
            </div>
            ))}
        </div>

        <button type="button" onClick={addVariation} className="w-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 rounded-md py-2 flex items-center justify-center transition">
          <PlusIcon className="w-5 h-5 mr-2"/> Add Color Variation
        </button>
        
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-700">Cancel</button>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Product</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditProductModal;
