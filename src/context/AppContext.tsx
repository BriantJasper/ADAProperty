import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Property, ComparisonItem } from '../types/Property';
import type { ConsignmentRequest, ConsignmentStatus } from '../types/Consignment';
import ApiService from '../services/api';

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
  loading: boolean;
  error: string | null;
  consignmentInbox: ConsignmentRequest[];
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
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CONSIGNMENT'; payload: ConsignmentRequest }
  | { type: 'REMOVE_CONSIGNMENT'; payload: string }
  | { type: 'MARK_CONSIGNMENT_STATUS'; payload: { id: string; status: ConsignmentStatus } };

const initialState: AppState = {
  properties: [],
  comparisonCart: [],
  isAdminMode: false,
  isAuthenticated: false,
  user: null,
  selectedLocation: '',
  loading: false,
  error: null,
  consignmentInbox: [],
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
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'ADD_CONSIGNMENT':
      if (state.consignmentInbox.some(c => c.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        consignmentInbox: [action.payload, ...state.consignmentInbox],
      };
    case 'REMOVE_CONSIGNMENT':
      return {
        ...state,
        consignmentInbox: state.consignmentInbox.filter(c => c.id !== action.payload),
      };
    case 'MARK_CONSIGNMENT_STATUS':
      return {
        ...state,
        consignmentInbox: state.consignmentInbox.map(c =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loadProperties: (filters?: any) => Promise<void>;
  addProperty: (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateProperty: (id: string, propertyData: Partial<Property>) => Promise<{ success: boolean; error?: string }>;
  deleteProperty: (id: string) => Promise<{ success: boolean; error?: string }>;
  addConsignment: (data: Omit<ConsignmentRequest, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  removeConsignment: (id: string) => void;
  markConsignmentStatus: (id: string, status: ConsignmentStatus) => void;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // API functions
  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await ApiService.login(username, password);
      
      if (response.success) {
        localStorage.setItem('auth_token', response.data.token);
        dispatch({ type: 'LOGIN', payload: response.data.user });
        // Refresh properties from backend after login
        try {
          const loadResp = await ApiService.getProperties();
          if (loadResp?.success) {
            dispatch({ type: 'LOAD_PROPERTIES', payload: loadResp.data || [] });
          }
        } catch (e) {
          console.error('Failed to load properties after login:', e);
        }
        return { success: true };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'LOGOUT' });
  };

  const loadProperties = async (filters?: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await ApiService.getProperties(filters);
      
      if (response && response.success) {
        dispatch({ type: 'LOAD_PROPERTIES', payload: response.data || [] });
      } else {
        console.error('Failed to load properties:', response);
        // Don't throw error, just set error state
        dispatch({ type: 'SET_ERROR', payload: response?.error || 'Failed to load properties' });
      }
    } catch (error: any) {
      console.error('Error in loadProperties:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Unknown error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Ensure required fields have default values and keep optional fields
      const safePropertyData = {
        ...propertyData,
        images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : ['/images/p1.png'],
        features: propertyData.features || [],
        price: typeof propertyData.price === 'number' ? propertyData.price : 0,
        title: propertyData.title || 'Properti Baru',
        description: propertyData.description || 'Deskripsi properti',
        location: propertyData.location || 'Jakarta',
        subLocation: (propertyData as any).subLocation || propertyData.location || 'Jababeka',
        type: propertyData.type || 'rumah',
        status: propertyData.status || 'dijual',
        bedrooms: typeof propertyData.bedrooms === 'number' ? propertyData.bedrooms : 1,
        bathrooms: typeof propertyData.bathrooms === 'number' ? propertyData.bathrooms : 1,
        area: typeof propertyData.area === 'number' ? propertyData.area : 0,
        landArea: typeof (propertyData as any).landArea === 'number' ? (propertyData as any).landArea : undefined,
        floors: typeof (propertyData as any).floors === 'number' ? (propertyData as any).floors : undefined,
        whatsappNumber: propertyData.whatsappNumber || '6281234567890',
        // keep social links and tour url
        igUrl: (propertyData as any).igUrl || undefined,
        tiktokUrl: (propertyData as any).tiktokUrl || undefined,
        tourUrl: (propertyData as any).tourUrl || undefined,
        // keep financing if provided
        financing: (propertyData as any).financing || undefined,
      };
      
      const response = await ApiService.createProperty(safePropertyData);
      
      if (response && response.success && response.data) {
        // Add the new property to the state
        dispatch({ type: 'ADD_PROPERTY', payload: response.data });
        return { success: true };
      } else {
        console.error('Failed to create property:', response);
        const validationMessage = Array.isArray((response as any)?.errors)
          ? (response as any).errors.map((e: any) => e?.msg || e?.message || String(e)).join('; ')
          : null;
        const errMsg = (response as any)?.error || validationMessage || 'Failed to create property';
        dispatch({ type: 'SET_ERROR', payload: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (error: any) {
      console.error('Error adding property:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Unknown error occurred' });
      return { success: false, error: error.message || 'Unknown error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await ApiService.updateProperty(id, propertyData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROPERTY', payload: response.data });
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to update property');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await ApiService.deleteProperty(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_PROPERTY', payload: id });
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to delete property');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Consignment helpers (local-only)
  const addConsignment = async (
    data: Omit<ConsignmentRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const id = `consign_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date();
      const payload: ConsignmentRequest = {
        ...data,
        id,
        createdAt,
        status: 'pending',
        images: Array.isArray(data.images) ? data.images.slice(0, 5) : [],
      };
      dispatch({ type: 'ADD_CONSIGNMENT', payload });
      return { success: true };
    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', payload: e?.message || 'Failed to add consignment' });
      return { success: false, error: e?.message || 'Failed to add consignment' };
    }
  };

  const removeConsignment = (id: string) => {
    dispatch({ type: 'REMOVE_CONSIGNMENT', payload: id });
  };

  const markConsignmentStatus = (id: string, status: ConsignmentStatus) => {
    dispatch({ type: 'MARK_CONSIGNMENT_STATUS', payload: { id, status } });
  };

  const changeCredentials = async (currentPassword: string, newCredentials: { username: string; password: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Ambil token dari localStorage (diset saat login)
      const token = typeof Storage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await ApiService.changeCredentials(currentPassword, newCredentials, token || undefined);
      
      if (response.success) {
        // Update the stored credentials in localStorage for fallback mode
        if (typeof Storage !== 'undefined') {
          localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
        }
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Failed to change credentials');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load properties from API on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const response = await ApiService.getProperties();
        
        if (response.success) {
          dispatch({ type: 'LOAD_PROPERTIES', payload: response.data });
        } else {
          throw new Error(response.error || 'Failed to load properties');
        }
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initializeApp();
  }, []);

  // Persist comparison cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('comparison_cart', JSON.stringify(state.comparisonCart));
    } catch {
      // ignore write errors
    }
  }, [state.comparisonCart]);

  // Persist selected location to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('selected_location', state.selectedLocation);
    } catch {
      // ignore write errors
    }
  }, [state.selectedLocation]);

  // Hydrate consignment inbox from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('consignment_inbox');
      if (raw) {
        const parsed = JSON.parse(raw) as ConsignmentRequest[];
        // revive dates
        const revived = parsed.map(c => ({ ...c, createdAt: new Date(c.createdAt) }));
        revived.forEach(c => dispatch({ type: 'ADD_CONSIGNMENT', payload: c }));
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist consignment inbox to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('consignment_inbox', JSON.stringify(state.consignmentInbox));
    } catch {
      // ignore
    }
  }, [state.consignmentInbox]);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch,
      login,
      logout,
      loadProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      changeCredentials,
      addConsignment,
      removeConsignment,
      markConsignmentStatus
    }}>
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
