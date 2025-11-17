import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface NeonModeContextType {
  neonMode: boolean;
  toggleNeonMode: () => void;
  setNeonMode: (enabled: boolean) => void;
}

const NeonModeContext = createContext<NeonModeContextType | undefined>(undefined);

export const NeonModeProvider = ({ children }: { children: ReactNode }) => {
  const [neonMode, setNeonModeState] = useState(() => {
    const stored = localStorage.getItem('neon-mode');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('neon-mode', String(neonMode));
    
    // Apply data attribute to body for CSS targeting
    if (neonMode) {
      document.body.setAttribute('data-neon', 'true');
    } else {
      document.body.removeAttribute('data-neon');
    }
  }, [neonMode]);

  const toggleNeonMode = () => setNeonModeState(prev => !prev);
  const setNeonMode = (enabled: boolean) => setNeonModeState(enabled);

  return (
    <NeonModeContext.Provider value={{ neonMode, toggleNeonMode, setNeonMode }}>
      {children}
    </NeonModeContext.Provider>
  );
};

export const useNeonMode = () => {
  const context = useContext(NeonModeContext);
  if (context === undefined) {
    throw new Error('useNeonMode must be used within a NeonModeProvider');
  }
  return context;
};
