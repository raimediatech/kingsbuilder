import { useEffect, useState, createContext, useContext } from "react";

// Create a context for authentication
interface AuthContextType {
  isAuthenticated: boolean;
  shop: string | null;
  accessToken: string | null;
  login: (shop: string, accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  shop: null,
  accessToken: null,
  login: () => {},
  logout: () => {}
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shop, setShop] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Check for authentication on mount
  useEffect(() => {
    const storedShop = localStorage.getItem('shopifyShop');
    const storedToken = localStorage.getItem('shopifyToken');
    
    if (storedShop && storedToken) {
      setShop(storedShop);
      setAccessToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);
  
  // Login function
  const login = (shop: string, accessToken: string) => {
    localStorage.setItem('shopifyShop', shop);
    localStorage.setItem('shopifyToken', accessToken);
    setShop(shop);
    setAccessToken(accessToken);
    setIsAuthenticated(true);
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('shopifyShop');
    localStorage.removeItem('shopifyToken');
    setShop(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, shop, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}