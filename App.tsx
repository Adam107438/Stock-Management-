
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Transaction, TransactionType } from './types';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import InventoryDashboard from './components/InventoryDashboard';
import AddEditProductModal from './components/modals/AddEditProductModal';
import StockMovementModal from './components/modals/StockMovementModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import TransactionHistory from './components/TransactionHistory';
import Auth from './components/Auth';
import { db } from './firebase';
import { ref, onValue, set, remove, update, push, child } from 'firebase/database';
import EditTransactionModal from './components/modals/EditTransactionModal';

const App: React.FC = () => {
  const { currentUser, login, signup, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
  const [isStockModalOpen, setStockModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockType, setStockType] = useState<TransactionType>(TransactionType.IN);

  useEffect(() => {
    if (currentUser?.uid) {
      const userProductsRef = ref(db, `users/${currentUser.uid}/products`);
      const userTransactionsRef = ref(db, `users/${currentUser.uid}/transactions`);

      const productsListener = onValue(userProductsRef, (snapshot) => {
        const data = snapshot.val();
        setProducts(data ? Object.values(data) : []);
      });

      const transactionsListener = onValue(userTransactionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const transactionList = Object.keys(data).map(key => ({
            ...data[key],
            id: key,
          })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(transactionList);
        } else {
          setTransactions([]);
        }
      });
      
      // Detach listeners on cleanup
      return () => {
        productsListener();
        transactionsListener();
      };
    } else {
      setProducts([]);
      setTransactions([]);
      setHistoryVisible(false);
      setEditMode(false);
    }
  }, [currentUser]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setAddEditModalOpen(true);
  };

  const handleOpenStockModal = (product: Product, type: TransactionType) => {
    setStockProduct(product);
    setStockType(type);
    setStockModalOpen(true);
  };
  
  const handleSaveProduct = (productData: Product) => {
    if (!currentUser) return;
    const productRef = ref(db, `users/${currentUser.uid}/products/${productData.id}`);
    set(productRef, productData);
    setAddEditModalOpen(false);
  };
  
  const handleDeleteProduct = (productId: string) => {
    if (!currentUser) return;
    const productRef = ref(db, `users/${currentUser.uid}/products/${productId}`);
    remove(productRef);
  };

  const handleStockMovement = (productId: string, color: string, size: string, quantity: number) => {
    if (!currentUser) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let productUpdatePath = '';
    let newStockQuantity = 0;

    const updatedVariations = product.variations.map((v, varIndex) => {
      if (v.color === color) {
        return {
          ...v,
          sizes: v.sizes.map((s, sizeIndex) => {
            if (s.size === size) {
              const currentQuantity = s.quantity;
              newStockQuantity = stockType === TransactionType.IN ? currentQuantity + quantity : currentQuantity - quantity;
              productUpdatePath = `users/${currentUser.uid}/products/${productId}/variations/${varIndex}/sizes/${sizeIndex}/quantity`;
              return { ...s, quantity: Math.max(0, newStockQuantity) };
            }
            return s;
          })
        };
      }
      return v;
    });

    const newTransaction: Omit<Transaction, 'id'> = {
      productId: product.id,
      productName: product.name,
      color,
      size,
      quantity,
      type: stockType,
      date: new Date().toISOString(),
    };
    
    const newTransactionKey = push(child(ref(db), `users/${currentUser.uid}/transactions`)).key;
    const updates = {};
    updates[productUpdatePath] = newStockQuantity;
    updates[`/users/${currentUser.uid}/transactions/${newTransactionKey}`] = newTransaction;

    update(ref(db), updates);
    setStockModalOpen(false);
  };

  const handleClearAllData = () => {
    if (!currentUser) return;
    const userRef = ref(db, `users/${currentUser.uid}`);
    remove(userRef);
    setConfirmModalOpen(false);
  };

  const handleUpdateTransaction = (originalTx: Transaction, newQuantity: number) => {
    if (!currentUser) return;

    const product = products.find(p => p.id === originalTx.productId);
    if (!product) {
      console.error("Product for transaction not found");
      setEditingTransaction(null);
      return;
    }
    
    const varIndex = product.variations.findIndex(v => v.color === originalTx.color);
    if (varIndex === -1) return;
    
    const sizeIndex = product.variations[varIndex].sizes.findIndex(s => s.size === originalTx.size);
    if (sizeIndex === -1) return;

    const currentStock = product.variations[varIndex].sizes[sizeIndex].quantity;
    const oldQtyEffect = originalTx.type === TransactionType.IN ? originalTx.quantity : -originalTx.quantity;
    const newQtyEffect = originalTx.type === TransactionType.IN ? newQuantity : -newQuantity;
    const stockDifference = newQtyEffect - oldQtyEffect;
    const newStock = currentStock + stockDifference;

    const updates = {};
    updates[`/users/${currentUser.uid}/products/${originalTx.productId}/variations/${varIndex}/sizes/${sizeIndex}/quantity`] = newStock;
    updates[`/users/${currentUser.uid}/transactions/${originalTx.id}/quantity`] = newQuantity;
    updates[`/users/${currentUser.uid}/transactions/${originalTx.id}/date`] = new Date().toISOString();

    update(ref(db), updates);
    setEditingTransaction(null);
  };
  
  const handleDeleteTransaction = () => {
    if (!currentUser || !deletingTransaction) return;

    const product = products.find(p => p.id === deletingTransaction.productId);
    if (!product) {
      console.error("Product for transaction not found");
      setDeletingTransaction(null);
      return;
    }

    const varIndex = product.variations.findIndex(v => v.color === deletingTransaction.color);
    if (varIndex === -1) return;
    
    const sizeIndex = product.variations[varIndex].sizes.findIndex(s => s.size === deletingTransaction.size);
    if (sizeIndex === -1) return;

    const currentStock = product.variations[varIndex].sizes[sizeIndex].quantity;
    const quantityToReverse = deletingTransaction.type === TransactionType.IN ? -deletingTransaction.quantity : +deletingTransaction.quantity;
    const newStock = currentStock + quantityToReverse;

    const updates = {};
    updates[`/users/${currentUser.uid}/products/${deletingTransaction.productId}/variations/${varIndex}/sizes/${sizeIndex}/quantity`] = newStock;
    updates[`/users/${currentUser.uid}/transactions/${deletingTransaction.id}`] = null; // Delete transaction

    update(ref(db), updates);
    setDeletingTransaction(null);
  };
  
  const totalStock = useMemo(() => {
    return products.reduce((total, product) => {
      return total + product.variations.reduce((productTotal, variation) => {
        return productTotal + variation.sizes.reduce((variationTotal, sizeItem) => {
          return variationTotal + sizeItem.quantity;
        }, 0);
      }, 0);
    }, 0);
  }, [products]);

  const toggleHistory = () => setHistoryVisible(prev => !prev);
  const toggleEditMode = () => setEditMode(prev => !prev);

  if (!currentUser) {
    return <Auth onLogin={login} onSignup={signup} />;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Header 
        username={currentUser.email || 'User'}
        onLogout={logout}
        onAddNew={handleOpenAddModal} 
        onClearData={() => setConfirmModalOpen(true)}
        onToggleHistory={toggleHistory}
        isHistoryVisible={isHistoryVisible}
        onToggleEditMode={toggleEditMode}
        isEditMode={isEditMode}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {isHistoryVisible ? (
          <TransactionHistory 
            transactions={transactions}
            isEditMode={isEditMode}
            onEdit={(t) => setEditingTransaction(t)}
            onDelete={(t) => setDeletingTransaction(t)}
           />
        ) : (
          <InventoryDashboard 
            products={products}
            totalStock={totalStock}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteProduct}
            onStockIn={(p) => handleOpenStockModal(p, TransactionType.IN)}
            onStockOut={(p) => handleOpenStockModal(p, TransactionType.OUT)}
          />
        )}
      </main>

      {isAddEditModalOpen && (
        <AddEditProductModal 
          isOpen={isAddEditModalOpen}
          onClose={() => setAddEditModalOpen(false)}
          onSave={handleSaveProduct}
          product={editingProduct}
        />
      )}

      {isStockModalOpen && stockProduct && (
        <StockMovementModal
          isOpen={isStockModalOpen}
          onClose={() => setStockModalOpen(false)}
          onConfirm={handleStockMovement}
          product={stockProduct}
          type={stockType}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleClearAllData}
          title="Clear All Data"
          message="Are you sure you want to delete all inventory and transaction data? This action is irreversible."
        />
      )}
      
      {editingTransaction && (
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onConfirm={handleUpdateTransaction}
          transaction={editingTransaction}
          products={products}
        />
      )}

      {deletingTransaction && (
        <ConfirmationModal
          isOpen={!!deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onConfirm={handleDeleteTransaction}
          title="Delete Transaction"
          message={`Are you sure you want to delete this transaction for "${deletingTransaction.productName}"? This will reverse the stock change.`}
        />
      )}
    </div>
  );
};

export default App;
