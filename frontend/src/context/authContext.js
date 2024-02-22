import React, { useState, createContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Define the isAuthenticated state and its setter function
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userInfo) => {
    setIsAuthenticated(true); // Mark the user as authenticated
    setUser(userInfo); // Update the user state with the new user's data
  };
  
  const logout = () => {
    setIsAuthenticated(false); // Mark the user as not authenticated
    setUser(null); // Clear the user state
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser); // Update the user state with the updated user's data
  };

  return (
    // Provide both user and isAuthenticated states to the context consumers
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
