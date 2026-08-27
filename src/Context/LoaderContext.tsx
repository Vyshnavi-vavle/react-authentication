// src/context/LoaderContext.tsx
import React, { createContext, useState, useContext } from 'react';

// Context for managing loading state
interface LoaderContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

// Provider component
export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <LoaderContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

// Custom hook to use the LoaderContext
export const useLoaderContext = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoaderContext must be used within a LoaderProvider');
  }
  return context;
};
