import React, { createContext, useState, useEffect } from 'react';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [boulders,setBoulders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBoulders = () => {
      setIsLoading(true);
      fetch("http://192.168.1.113:5000/climbing/boulders")
        .then(response => response.json())
        .then(jsonResponse => setBoulders(jsonResponse))
        .catch(error => console.log(error))
        .finally(() => setIsLoading(false))
    };

  useEffect(()=>{
    fetchBoulders()
  },[]);

  return (
    <GlobalStateContext.Provider value={{ boulders, fetchBoulders, isLoading }}>
      {children}
    </GlobalStateContext.Provider>
  );
};
