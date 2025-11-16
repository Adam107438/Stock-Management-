
import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, HistoryIcon, BoxIcon, Bars3Icon, PencilIcon } from './icons';

interface HeaderProps {
  username: string;
  onLogout: () => void;
  onAddNew: () => void;
  onClearData: () => void;
  onToggleHistory: () => void;
  isHistoryVisible: boolean;
  onToggleEditMode: () => void;
  isEditMode: boolean;
}

const LogoutIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ username, onLogout, onAddNew, onClearData, onToggleHistory, isHistoryVisible, onToggleEditMode, isEditMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
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
  
  return (
    <header className="bg-dark sticky top-0 z-30 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <BoxIcon className="h-8 w-8 text-primary" />
            <h1 className="ml-3 text-2xl font-bold text-white">SoleSync</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
             <div className="hidden sm:flex items-center text-sm text-gray-300">
                Welcome, <span className="font-bold text-white ml-1">{username}</span>
             </div>
             <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={onAddNew}
                  className="flex items-center bg-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add
                </button>
             </div>
             
             <button
                onClick={onToggleHistory}
                className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"
                title={isHistoryVisible ? "Show Inventory" : "Show History"}
              >
                {isHistoryVisible ? <BoxIcon className="h-5 w-5" /> : <HistoryIcon className="h-5 w-5" />}
              </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"
              title="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
             <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"
                    title="More options"
                >
                    <Bars3Icon className="h-5 w-5" />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-dark rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            {isHistoryVisible && (
                                <button
                                    onClick={() => { onToggleEditMode(); setMenuOpen(false); }}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                    role="menuitem"
                                >
                                    <PencilIcon className="h-4 w-4 mr-3" />
                                    {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                                </button>
                            )}
                            <button
                                onClick={() => { onClearData(); setMenuOpen(false); }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                                role="menuitem"
                            >
                                <TrashIcon className="h-4 w-4 mr-3" />
                                Clear All Data
                            </button>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <button
          onClick={onAddNew}
          className="sm:hidden fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full shadow-lg z-20 hover:bg-indigo-700 transition"
          aria-label="Add New Product"
        >
        <PlusIcon className="h-6 w-6" />
      </button>
    </header>
  );
};

export default Header;
