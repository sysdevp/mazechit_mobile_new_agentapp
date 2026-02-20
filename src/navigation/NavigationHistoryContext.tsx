import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

interface NavigationHistoryItem {
  stack: string;
  screen: string;
  timestamp: number;
}

interface NavigationHistoryContextType {
  history: NavigationHistoryItem[];
  addToHistory: (stack: string, screen: string) => void;
  getPreviousScreen: () => NavigationHistoryItem | null;
  clearHistory: () => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);

  const addToHistory = useCallback((stack: string, screen: string) => {
    setHistory(prev => {
      // Remove duplicates if the same screen is visited consecutively
      const lastItem = prev[prev.length - 1];
      if (lastItem && lastItem.stack === stack && lastItem.screen === screen) {
        return prev;
      }
      
      // Add new item
      const newItem: NavigationHistoryItem = { stack, screen, timestamp: Date.now() };
      return [...prev, newItem];
    });
  }, []);

  const getPreviousScreen = useCallback((): NavigationHistoryItem | null => {
    if (history.length <= 1) return null;
    return history[history.length - 2];
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <NavigationHistoryContext.Provider value={{ history, addToHistory, getPreviousScreen, clearHistory }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);
  if (!context) {
    throw new Error('useNavigationHistory must be used within NavigationHistoryProvider');
  }
  return context;
}

// Hook to track current screen in history
export function useTrackScreen(stack: string, screen: string) {
  const { addToHistory } = useNavigationHistory();

  useFocusEffect(
    useCallback(() => {
      addToHistory(stack, screen);
    }, [stack, screen, addToHistory])
  );
}

