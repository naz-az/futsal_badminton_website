import React, { useState, createContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userInfo) => {
    console.log("Logging in user:", userInfo);
    setUser(userInfo); // Update the user state
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser); // Update the user state
};

return (
  <AuthContext.Provider value={{ user, login, logout, updateUser }}>
    {console.log("AuthProvider value:", { user, login, logout, updateUser })}
    {children}
  </AuthContext.Provider>
);

};

export default AuthContext;