import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Test, TestAttempt, AppState } from '../types';
import { apiService } from '../services/api';

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_TEST'; payload: Test }
  | { type: 'UPDATE_TEST'; payload: Test }
  | { type: 'DELETE_TEST'; payload: string }
  | { type: 'ADD_TEST_ATTEMPT'; payload: TestAttempt }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BACKEND_MODE'; payload: boolean };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loading: boolean;
  error: string | null;
  backendMode: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  loadInitialData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const initialState: AppState = {
  currentUser: null,
  users: [],
  tests: [],
  testAttempts: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'ADD_TEST':
      return { ...state, tests: [...state.tests, action.payload] };
    case 'UPDATE_TEST':
      return {
        ...state,
        tests: state.tests.map(test =>
          test.id === action.payload.id ? action.payload : test
        )
      };
    case 'DELETE_TEST':
      return {
        ...state,
        tests: state.tests.filter(test => test.id !== action.payload)
      };
    case 'ADD_TEST_ATTEMPT':
      return { ...state, testAttempts: [...state.testAttempts, action.payload] };
    case 'LOAD_STATE':
      return action.payload;
    case 'SET_LOADING':
      return state;
    case 'SET_ERROR':
      return state;
    case 'SET_BACKEND_MODE':
      return state;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [backendMode, setBackendMode] = React.useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    console.log('Initializing app...');
    
    // Check if backend is available
    const isBackendReady = await apiService.checkBackendHealth();
    setBackendMode(isBackendReady);
    
    if (isBackendReady) {
      console.log('Backend is available, checking for existing session...');
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await loadInitialData();
        } catch (error) {
          console.log('Failed to load with existing token, clearing session');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } else {
      console.log('Backend not available, using localStorage mode');
      loadFromLocalStorage();
    }
    
    setLoading(false);
  };

  const loadFromLocalStorage = () => {
    const savedState = localStorage.getItem('quizAppState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Error loading saved state:', error);
        createDefaultAdmin();
      }
    } else {
      createDefaultAdmin();
    }
  };

  const createDefaultAdmin = () => {
    const defaultAdmin: User = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@quiz.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      loginAttempts: 0
    };
    dispatch({ type: 'ADD_USER', payload: defaultAdmin });
  };

  const loadInitialData = async () => {
    if (!backendMode) {
      loadFromLocalStorage();
      return;
    }

    try {
      // Get current user profile
      const profileData = await apiService.getProfile();
      dispatch({ type: 'SET_CURRENT_USER', payload: profileData.user });

      // Load tests
      const testsData = await apiService.getTests();
      // Clear existing tests first
      dispatch({ type: 'LOAD_STATE', payload: { ...state, tests: [] } });
      testsData.tests.forEach(test => {
        dispatch({ type: 'ADD_TEST', payload: test });
      });

      // Load users if admin
      if (profileData.user.role === 'admin') {
        const usersData = await apiService.getUsers();
        // Clear existing users first
        dispatch({ type: 'LOAD_STATE', payload: { ...state, users: [] } });
        usersData.users.forEach(user => {
          dispatch({ type: 'ADD_USER', payload: user });
        });

        // Load all attempts for admin
        const attemptsData = await apiService.getAllAttempts();
        // Clear existing attempts first
        dispatch({ type: 'LOAD_STATE', payload: { ...state, testAttempts: [] } });
        attemptsData.attempts.forEach(attempt => {
          dispatch({ type: 'ADD_TEST_ATTEMPT', payload: attempt });
        });
      } else {
        // Load user's own attempts
        const attemptsData = await apiService.getUserAttempts();
        // Clear existing attempts first
        dispatch({ type: 'LOAD_STATE', payload: { ...state, testAttempts: [] } });
        attemptsData.attempts.forEach(attempt => {
          dispatch({ type: 'ADD_TEST_ATTEMPT', payload: attempt });
        });
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    if (state.currentUser && backendMode) {
      await loadInitialData();
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    setError(null);
    
    if (backendMode) {
      try {
        console.log('Attempting backend login...');
        const result = await apiService.login(username, password);
        
        // Store tokens
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        
        // Set current user
        dispatch({ type: 'SET_CURRENT_USER', payload: result.user });
        
        // Load initial data
        await loadInitialData();
        
        console.log('Backend login successful');
        return result.user;
      } catch (error) {
        console.error('Backend login failed:', error);
        setError(error instanceof Error ? error.message : 'Login failed');
        return null;
      }
    } else {
      // localStorage fallback
      return await legacyLogin(username, password);
    }
  };

  const logout = async () => {
    if (backendMode) {
      try {
        await apiService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear state
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    dispatch({ type: 'LOAD_STATE', payload: initialState });
  };

  // Legacy login for localStorage mode
  const legacyLogin = async (username: string, password: string): Promise<User | null> => {
    const user = state.users.find(
      u => (u.username === username || u.email === username)
    );

    if (!user) {
      setError('Invalid credentials');
      return null;
    }

    if (!user.isActive) {
      setError('Account is deactivated');
      return null;
    }

    if (user.loginAttempts >= 3) {
      setError('Account is locked due to too many failed attempts');
      return null;
    }

    if (user.password === password) {
      const updatedUser = { 
        ...user, 
        lastLogin: new Date().toISOString(),
        loginAttempts: 0 
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_CURRENT_USER', payload: updatedUser });
      return updatedUser;
    } else {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const updatedUser = { 
        ...user, 
        loginAttempts: newAttempts,
        isActive: newAttempts < 3
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      setError('Invalid credentials');
      return null;
    }
  };

  // Save to localStorage (fallback for demo mode)
  useEffect(() => {
    if (!backendMode && state.users.length > 0) {
      localStorage.setItem('quizAppState', JSON.stringify(state));
    }
  }, [state, backendMode]);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      loading, 
      error, 
      backendMode,
      login, 
      logout, 
      loadInitialData, 
      refreshData 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}