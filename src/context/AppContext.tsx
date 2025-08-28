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

const initialLoading = false;
const initialError = null;
const initialBackendMode = false;

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
    default:
      return state;
  }
}

function loadingReducer(state: boolean, action: AppAction): boolean {
  switch (action.type) {
    case 'SET_LOADING':
      return action.payload;
    default:
      return state;
  }
}

function errorReducer(state: string | null, action: AppAction): string | null {
  switch (action.type) {
    case 'SET_ERROR':
      return action.payload;
    default:
      return state;
  }
}

function backendModeReducer(state: boolean, action: AppAction): boolean {
  switch (action.type) {
    case 'SET_BACKEND_MODE':
      return action.payload;
    default:
      return state;
  }
}
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loading, dispatchLoading] = useReducer(loadingReducer, initialLoading);
  const [error, dispatchError] = useReducer(errorReducer, initialError);
  const [backendMode, dispatchBackendMode] = useReducer(backendModeReducer, initialBackendMode);

  const setLoading = (loading: boolean) => {
    dispatchLoading({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatchError({ type: 'SET_ERROR', payload: error });
  };

  const setBackendMode = (mode: boolean) => {
    dispatchBackendMode({ type: 'SET_BACKEND_MODE', payload: mode });
  };
  useEffect(() => {
    // Check backend availability and initialize
    const initializeApp = async () => {
      const isBackendReady = await apiService.isBackendReady();
      setBackendMode(isBackendReady);
      
      if (isBackendReady) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          await loadInitialData();
        }
      } else {
        // Load from localStorage for demo mode
        loadFromLocalStorage();
      }
    };
    
    initializeApp();
  }, []);

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

  const loadInitialData = async () => {
    if (!backendMode) {
      loadFromLocalStorage();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get current user profile
      const profileData = await apiService.getProfile();
      dispatch({ type: 'SET_CURRENT_USER', payload: profileData.user });

      // Load tests
      const testsData = await apiService.getTests();
      testsData.tests.forEach(test => {
        dispatch({ type: 'ADD_TEST', payload: test });
      });

      // Load users if admin
      if (profileData.user.role === 'admin') {
        const usersData = await apiService.getUsers();
        usersData.users.forEach(user => {
          dispatch({ type: 'ADD_USER', payload: user });
        });

        // Load all attempts for admin
        const attemptsData = await apiService.getAllAttempts();
        attemptsData.attempts.forEach(attempt => {
          dispatch({ type: 'ADD_TEST_ATTEMPT', payload: attempt });
        });
      } else {
        // Load user's own attempts
        const attemptsData = await apiService.getUserAttempts();
        attemptsData.attempts.forEach(attempt => {
          dispatch({ type: 'ADD_TEST_ATTEMPT', payload: attempt });
        });
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      // If token is invalid, clear it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Fall back to localStorage mode
      setBackendMode(false);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (state.currentUser && backendMode) {
      await loadInitialData();
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    if (!backendMode) {
      return await legacyLogin(username, password);
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.login(username, password);
      
      // Store tokens
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      // Set current user
      dispatch({ type: 'SET_CURRENT_USER', payload: result.user });
      
      // Load initial data
      await loadInitialData();
      
      return result.user;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      // Try localStorage fallback
      console.log('Trying localStorage fallback...');
      return await legacyLogin(username, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
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
    
    setLoading(false);
  };


  // Save to localStorage (fallback for demo mode)
  useEffect(() => {
    if (!backendMode) {
      localStorage.setItem('quizAppState', JSON.stringify(state));
    }
  }, [state]);

  const createDefaultAdmin = () => {
    const adminExists = state.users.some(user => user.role === 'admin');
    if (!adminExists) {
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
    }
  };

  // Legacy login for localStorage mode
  const legacyLogin = async (username: string, password: string): Promise<User | null> => {
    const user = state.users.find(
      u => (u.username === username || u.email === username)
    );

    if (!user) return null;

    if (!user.isActive) {
      return null;
    }

    if (user.loginAttempts >= 3) {
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
      return null;
    }
  };



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