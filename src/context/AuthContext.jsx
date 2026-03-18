import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../api/api.js';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authCheckRef = useRef(false);

  // Memoize computed values
  const isSuperAdmin = useMemo(() => user?.role === 'superadmin', [user]);
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isEmployee = useMemo(() => user?.role === 'employee', [user]);
  const isCustomer = useMemo(() => user?.role === 'customer', [user]);

  // Check if user is logged in on mount
  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckRef.current) return;
    authCheckRef.current = true;
    
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  // Unified login function - handles all roles (superadmin, admin, employee, customer)
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    
    // Redirect based on role
    if (userData.role === 'superadmin') {
      navigate('/superadmin/dashboard');
    } else if (userData.role === 'admin') {
      navigate('/app/dashboard');
    } else if (userData.role === 'employee') {
      navigate('/app/billing');
    } else if (userData.role === 'customer') {
      navigate('/app/billing');
    }
    
    return userData;
  };

  // Customer signup - backend assigns role="customer"
  const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    // Backend returns token/user - set session
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    
    // Role-based redirect
    if (userData.role === 'superadmin') {
      navigate('/superadmin/dashboard');
    } else if (userData.role === 'admin') {
      navigate('/app/dashboard');
    } else if (userData.role === 'employee') {
      navigate('/app/billing');
    } else {
      navigate('/app/billing');
    }
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login,
      signup,
      logout, 
      isSuperAdmin,
      isAdmin, 
      isEmployee,
      isCustomer,
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

