// src/context/LoadingContext.jsx
import React, { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { selectGlobalLoading } from "../../lib/loadingSelector"

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const isLoading = useSelector(selectGlobalLoading); 
  const showLoading = () => {};
  const hideLoading = () => {};

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
