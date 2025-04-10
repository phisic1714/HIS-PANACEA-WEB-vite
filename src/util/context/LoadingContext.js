import React, { useState, createContext, useContext } from "react";

export const LoadingContext = createContext({});

export const useLoadingContext = () => {
    return useContext(LoadingContext);
}

export default function LoadingProvider({ children }) {
    const [loading, setLoading] = useState([]);

    const addLoading = (value) => {
        setLoading(p => [...p, value]);
    }

    const removeLoading = (value) => {
        setLoading(loading => loading.filter(item => item !== value));
    }

    const clearLoading = () => {
        setLoading([]);
    }

    const contextValue = {
        loading,
        addLoading,
        removeLoading,
        clearLoading
    }
    return (
        <LoadingContext.Provider value={contextValue}>{children}</LoadingContext.Provider>
    );
}