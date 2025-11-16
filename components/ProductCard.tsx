
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, TransactionType } from '../types';
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, EllipsisVerticalIcon } from './icons';
import ConfirmationModal from './modals/ConfirmationModal';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onStockIn: (product: Product) => void;
  onStockOut: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onStockIn, onStockOut }) => {
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [expandedColor, setExpandedColor] = useState<string | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const totalQuantity = useMemo(() => {
        return product.variations.reduce((sum, variation) => {
            return sum + variation.sizes.reduce((s, size) => s + size.quantity, 0);
        }, 0);
    }, [product]);

    const toggleColor = (colorId: string) => {
        setExpandedColor(expandedColor === colorId ? null : colorId);
    };

    const handleDeleteConfirm = () => {
        onDelete(product.id);
        setDeleteConfirmOpen(false);
    };

    return (
        <div className="bg-dark rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white pr-2">{product.name}</h3>
                    <div className="relative flex-shrink-0" ref={menuRef}>
                        <button onClick={() => setMenuOpen(prev => !prev)} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-40 origin-top-right bg-dark rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <button
                                        onClick={() => { onEdit(product); setMenuOpen(false); }}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                        role="menuitem"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => { setDeleteConfirmOpen(true); setMenuOpen(false); }}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                                        role="menuitem"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-1">Total Stock: <span className="font-semibold text-primary">{totalQuantity}</span></p>

                <div className="mt-4 space-y-2">
                    {product.variations.map(variation => (
                        <div key={variation.id} className="bg-secondary rounded-md">
                            <button onClick={() => toggleColor(variation.id)} className="w-full text-left p-2 flex justify-between items-center">
                                <span className="font-semibold text-gray-200">{variation.color}</span>
                                <span className={`transform transition-transform ${expandedColor === variation.id ? 'rotate-180' : ''}`}>
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </span>
                            </button>
                            {expandedColor === variation.id && (
                                <div className="p-2 border-t border-gray-700">
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        {variation.sizes.sort((a,b) => a.size.localeCompare(b.size, undefined, {numeric: true})).map(s => (
                                            <li key={s.id} className="flex justify-between">
                                                <span>Size: {s.size}</span>
                                                <span>Qty: {s.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-2 bg-secondary grid grid-cols-2 gap-2">
                <button onClick={() => onStockIn(product)} className="flex items-center justify-center w-full bg-green-600/20 text-green-400 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600/40 transition">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Stock In
                </button>
                <button onClick={() => onStockOut(product)} className="flex items-center justify-center w-full bg-red-600/20 text-red-400 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600/40 transition">
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Stock Out
                </button>
            </div>
             {isDeleteConfirmOpen && (
                <ConfirmationModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title={`Delete ${product.name}`}
                    message="Are you sure you want to delete this product and all its inventory? This action is irreversible."
                />
            )}
        </div>
    );
};

export default ProductCard;
