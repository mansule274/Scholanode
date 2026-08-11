import { createContext, useContext } from "react";


// Create the context
const UserContext = createContext();
  // const isDev = import.meta.env.VITE_ENV === 'development';
export const ContextProvider = ({ children}) => {
  
     


  return (
    <UserContext.Provider value={{ 
     
 }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUserContext = () => {
  return useContext(UserContext);

};

export { UserContext };