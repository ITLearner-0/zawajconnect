
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { LazyLoadingMetrics } from '../services/analyticsService';

interface LazyLoadingState {
  // Global loading state
  isGlobalLoading: boolean;
  loadingQueue: string[];
  loadedItems: Set<string>;
  failedItems: Set<string>;
  
  // Performance metrics
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  
  // Configuration
  batchSize: number;
  preloadDistance: number;
  enableDebug: boolean;
  enableAnalytics: boolean;
  
  // Network optimization
  networkOptimization: boolean;
  adaptiveQuality: boolean;
  
  // Memory management
  memoryOptimization: boolean;
  cacheSize: number;
  
  // Error handling
  maxRetries: number;
  retryDelay: number;
}

type LazyLoadingAction =
  | { type: 'SET_LOADING'; payload: { id: string; loading: boolean } }
  | { type: 'ADD_TO_QUEUE'; payload: string }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'MARK_LOADED'; payload: string }
  | { type: 'MARK_FAILED'; payload: string }
  | { type: 'UPDATE_METRICS'; payload: Partial<LazyLoadingMetrics> }
  | { type: 'UPDATE_CONFIG'; payload: Partial<LazyLoadingState> }
  | { type: 'CLEAR_CACHE' }
  | { type: 'RESET_STATE' };

const initialState: LazyLoadingState = {
  isGlobalLoading: false,
  loadingQueue: [],
  loadedItems: new Set(),
  failedItems: new Set(),
  totalImages: 0,
  loadedImages: 0,
  failedImages: 0,
  averageLoadTime: 0,
  batchSize: 10,
  preloadDistance: 200,
  enableDebug: process.env.NODE_ENV === 'development',
  enableAnalytics: false,
  networkOptimization: true,
  adaptiveQuality: true,
  memoryOptimization: true,
  cacheSize: 50, // MB
  maxRetries: 3,
  retryDelay: 1000,
};

function lazyLoadingReducer(state: LazyLoadingState, action: LazyLoadingAction): LazyLoadingState {
  switch (action.type) {
    case 'SET_LOADING':
      const { id, loading } = action.payload;
      const newQueue = loading 
        ? [...state.loadingQueue, id]
        : state.loadingQueue.filter(item => item !== id);
      
      return {
        ...state,
        loadingQueue: newQueue,
        isGlobalLoading: newQueue.length > 0,
      };

    case 'ADD_TO_QUEUE':
      if (state.loadingQueue.includes(action.payload)) return state;
      return {
        ...state,
        loadingQueue: [...state.loadingQueue, action.payload],
        isGlobalLoading: true,
        totalImages: state.totalImages + 1,
      };

    case 'REMOVE_FROM_QUEUE':
      const filteredQueue = state.loadingQueue.filter(item => item !== action.payload);
      return {
        ...state,
        loadingQueue: filteredQueue,
        isGlobalLoading: filteredQueue.length > 0,
      };

    case 'MARK_LOADED':
      const newLoadedItems = new Set(state.loadedItems);
      newLoadedItems.add(action.payload);
      
      return {
        ...state,
        loadedItems: newLoadedItems,
        loadedImages: state.loadedImages + 1,
        loadingQueue: state.loadingQueue.filter(item => item !== action.payload),
        isGlobalLoading: state.loadingQueue.filter(item => item !== action.payload).length > 0,
      };

    case 'MARK_FAILED':
      const newFailedItems = new Set(state.failedItems);
      newFailedItems.add(action.payload);
      
      return {
        ...state,
        failedItems: newFailedItems,
        failedImages: state.failedImages + 1,
        loadingQueue: state.loadingQueue.filter(item => item !== action.payload),
        isGlobalLoading: state.loadingQueue.filter(item => item !== action.payload).length > 0,
      };

    case 'UPDATE_METRICS':
      return {
        ...state,
        ...action.payload,
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        ...action.payload,
      };

    case 'CLEAR_CACHE':
      return {
        ...state,
        loadedItems: new Set(),
        failedItems: new Set(),
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

interface LazyLoadingContextType {
  state: LazyLoadingState;
  dispatch: React.Dispatch<LazyLoadingAction>;
  actions: {
    addToQueue: (id: string) => void;
    removeFromQueue: (id: string) => void;
    markLoaded: (id: string) => void;
    markFailed: (id: string) => void;
    updateMetrics: (metrics: Partial<LazyLoadingMetrics>) => void;
    updateConfig: (config: Partial<LazyLoadingState>) => void;
    clearCache: () => void;
    resetState: () => void;
  };
}

const LazyLoadingContext = createContext<LazyLoadingContextType | undefined>(undefined);

interface LazyLoadingProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<LazyLoadingState>;
}

export const LazyLoadingProvider: React.FC<LazyLoadingProviderProps> = ({
  children,
  initialConfig = {},
}) => {
  const [state, dispatch] = useReducer(lazyLoadingReducer, {
    ...initialState,
    ...initialConfig,
  });

  const actions = {
    addToQueue: (id: string) => dispatch({ type: 'ADD_TO_QUEUE', payload: id }),
    removeFromQueue: (id: string) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id }),
    markLoaded: (id: string) => dispatch({ type: 'MARK_LOADED', payload: id }),
    markFailed: (id: string) => dispatch({ type: 'MARK_FAILED', payload: id }),
    updateMetrics: (metrics: Partial<LazyLoadingMetrics>) => 
      dispatch({ type: 'UPDATE_METRICS', payload: metrics }),
    updateConfig: (config: Partial<LazyLoadingState>) => 
      dispatch({ type: 'UPDATE_CONFIG', payload: config }),
    clearCache: () => dispatch({ type: 'CLEAR_CACHE' }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };

  // Performance monitoring
  useEffect(() => {
    if (state.enableAnalytics) {
      const successRate = state.totalImages > 0 
        ? (state.loadedImages / state.totalImages) * 100 
        : 0;
      
      if (state.enableDebug) {
        console.log('Lazy Loading State:', {
          totalImages: state.totalImages,
          loadedImages: state.loadedImages,
          failedImages: state.failedImages,
          successRate: `${successRate.toFixed(2)}%`,
          queueLength: state.loadingQueue.length,
        });
      }
    }
  }, [state.loadedImages, state.failedImages, state.enableAnalytics, state.enableDebug]);

  return (
    <LazyLoadingContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </LazyLoadingContext.Provider>
  );
};

export const useLazyLoadingContext = (): LazyLoadingContextType => {
  const context = useContext(LazyLoadingContext);
  if (!context) {
    throw new Error('useLazyLoadingContext must be used within a LazyLoadingProvider');
  }
  return context;
};

export const useLazyLoadingState = () => {
  const { state } = useLazyLoadingContext();
  return state;
};

export const useLazyLoadingActions = () => {
  const { actions } = useLazyLoadingContext();
  return actions;
};
