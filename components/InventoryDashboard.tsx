
import React, { useState, useMemo } from 'react';
import { Product, TransactionType } from '../types';
import ProductCard from './ProductCard';
import { BoxIcon } from './icons';

interface InventoryDashboardProps {
  products: Product[];
  totalStock: number;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onStockIn: (product: Product) => void;
  onStockOut: (product: Product) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ products, totalStock, onEdit, onDelete, onStockIn, onStockOut }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const totalProducts = products.length;

  return (
    <div>
      <div className="mb-6 bg-dark p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Inventory Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-secondary p-4 rounded-md">
                <p className="text-sm text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-primary">{totalProducts}</p>
            </div>
            <div className="bg-secondary p-4 rounded-md">
                <p className="text-sm text-gray-400">Total Stock</p>
                <p className="text-2xl font-bold text-primary">{totalStock}</p>
            </div>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-dark border border-gray-600 rounded-md focus:ring-primary focus:border-primary placeholder-gray-500"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onStockIn={onStockIn}
              onStockOut={onStockOut}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <BoxIcon className="mx-auto h-12 w-12 text-gray-500"/>
            <h3 className="mt-2 text-sm font-semibold text-gray-300">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try adjusting your search." : "Get started by adding a new product."}
            </p>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
