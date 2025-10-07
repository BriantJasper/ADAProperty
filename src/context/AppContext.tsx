import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Property, ComparisonItem } from '../types/Property';

interface AppState {
  properties: Property[];
  comparisonCart: ComparisonItem[];
  isAdminMode: boolean;
  isAuthenticated: boolean;
  user: {
    username: string;
    role: 'admin' | 'user';
  } | null;
  selectedLocation: string;
}

type AppAction =
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'ADD_TO_COMPARISON'; payload: Property }
  | { type: 'REMOVE_FROM_COMPARISON'; payload: string }
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'SET_ADMIN_MODE'; payload: boolean }
  | { type: 'LOAD_PROPERTIES'; payload: Property[] }
  | { type: 'LOGIN'; payload: { username: string; role: 'admin' | 'user' } }
  | { type: 'LOGOUT' }
  | { type: 'SET_SELECTED_LOCATION'; payload: string }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  properties: [],
  comparisonCart: [],
  isAdminMode: false,
  isAuthenticated: false,
  user: null,
  selectedLocation: '',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PROPERTY':
      if (state.properties.some(p => p.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        properties: [...state.properties, action.payload],
      };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload),
        comparisonCart: state.comparisonCart.filter(item => item.property.id !== action.payload),
      };
    case 'ADD_TO_COMPARISON':
      if (state.comparisonCart.length >= 3) {
        return state; // Maksimal 3 properti
      }
      if (state.comparisonCart.some(item => item.property.id === action.payload.id)) {
        return state; // Sudah ada di keranjang
      }
      return {
        ...state,
        comparisonCart: [...state.comparisonCart, { property: action.payload, addedAt: new Date() }],
      };
    case 'REMOVE_FROM_COMPARISON':
      return {
        ...state,
        comparisonCart: state.comparisonCart.filter(item => item.property.id !== action.payload),
      };
    case 'CLEAR_COMPARISON':
      return {
        ...state,
        comparisonCart: [],
      };
    case 'SET_ADMIN_MODE':
      return {
        ...state,
        isAdminMode: action.payload,
      };
    case 'LOAD_PROPERTIES':
      return {
        ...state,
        properties: action.payload,
      };
    case 'SET_SELECTED_LOCATION':
      return {
        ...state,
        selectedLocation: action.payload,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isAdminMode: action.payload.role === 'admin',
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isAdminMode: false,
      };
    case 'HYDRATE_STATE':
      return {
        ...state,
        properties: action.payload.properties ?? state.properties,
        isAuthenticated: action.payload.isAuthenticated ?? state.isAuthenticated,
        user: action.payload.user ?? state.user,
        selectedLocation: action.payload.selectedLocation ?? state.selectedLocation,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Lazy initializer to load from localStorage on first render
  const [state, dispatch] = useReducer(appReducer, initialState, (base) => {
    try {
      const raw = localStorage.getItem('adaproperty_state');
      if (!raw) return base;
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return {
        ...base,
        properties: parsed.properties ?? base.properties,
        isAuthenticated: parsed.isAuthenticated ?? base.isAuthenticated,
        user: parsed.user ?? base.user,
        selectedLocation: parsed.selectedLocation ?? base.selectedLocation,
      };
    } catch {
      return base;
    }
  });

  // Persist selected parts of state
  try {
    const snapshot = {
      properties: state.properties,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      selectedLocation: state.selectedLocation,
    };
    localStorage.setItem('adaproperty_state', JSON.stringify(snapshot));
  } catch {
    // ignore write errors
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
