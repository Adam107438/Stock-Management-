
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpIcon, ArrowDownIcon, HistoryIcon, PencilIcon, TrashIcon } from './icons';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isEditMode: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, isEditMode, onEdit, onDelete }) => {
  return (
    <div className="bg-dark p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <HistoryIcon className="h-6 w-6 mr-2 text-primary" />
          Transaction History
        </h2>
        {isEditMode && (
          <div className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">
            Edit Mode Active
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full align-middle">
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="bg-secondary p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    {t.type === TransactionType.IN ? (
                        <span className="p-1.5 bg-green-500/20 text-green-400 rounded-full mr-3">
                          <ArrowUpIcon className="h-4 w-4" />
                        </span>
                    ) : (
                        <span className="p-1.5 bg-red-500/20 text-red-400 rounded-full mr-3">
                          <ArrowDownIcon className="h-4 w-4" />
                        </span>
                    )}
                    <div>
                      <p className="font-semibold text-white">{t.productName}</p>
                      <p className="text-sm text-gray-400">
                        {t.color} / Size: {t.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300 flex sm:flex-col sm:items-end items-center sm:mr-4">
                      <p>
                          <span className={`font-bold ${t.type === TransactionType.IN ? 'text-green-400' : 'text-red-400'}`}>
                              {t.type === TransactionType.IN ? '+' : '-'}{t.quantity}
                          </span>
                          <span className="text-gray-400 ml-1">units</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-0 sm:mt-1">
                          {new Date(t.date).toLocaleString()}
                      </p>
                    </div>
                    {isEditMode && (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => onEdit(t)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(t)} className="p-2 text-red-400 hover:text-white rounded-full hover:bg-red-800 transition">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
                <HistoryIcon className="mx-auto h-12 w-12 text-gray-500"/>
                <h3 className="mt-2 text-sm font-semibold text-gray-300">No transactions yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Stock movements will appear here.
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
