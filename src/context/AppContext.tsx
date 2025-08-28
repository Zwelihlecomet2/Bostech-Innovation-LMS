import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Test, TestAttempt, AppState } from '../types';

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_TEST'; payload: Test }
  | { type: 'UPDATE_TEST'; payload: Test }
  | { type: 'DELETE_TEST'; payload: string }
  | { type: 'ADD_TEST_ATTEMPT'; payload: TestAttempt }
  | { type: 'LOAD_STATE'; payload: AppState };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  createDefaultAdmin: () => void;
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
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('quizAppState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quizAppState', JSON.stringify(state));
  }, [state]);

  const createDefaultAdmin = () => {
    const adminExists = state.users.some(user => user.role === 'admin');
    if (!adminExists) {
      const defaultAdmin: User = {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@quiz.com',
        password: 'admin123', // In production, this should be hashed
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        loginAttempts: 0 // Add this line
      };
      dispatch({ type: 'ADD_USER', payload: defaultAdmin });
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    const user = state.users.find(
      u => (u.username === username || u.email === username)
    );

    if (!user) return null;

    // Check if account is already inactive
    if (!user.isActive) {
      return null;
    }

    // Check if credentials are correct
    if (user.password === password) {
      // Reset login attempts on successful login
      const updatedUser = { 
        ...user, 
        lastLogin: new Date().toISOString(),
        loginAttempts: 0 
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_CURRENT_USER', payload: updatedUser });
      return updatedUser;
    } else {
      // Increment login attempts
      const newAttempts = (user.loginAttempts || 0) + 1;
      const updatedUser = { 
        ...user, 
        loginAttempts: newAttempts,
        // Deactivate account after 3 failed attempts
        isActive: newAttempts < 3
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return null;
    }
  };

  const logout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, login, logout, createDefaultAdmin }}>
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