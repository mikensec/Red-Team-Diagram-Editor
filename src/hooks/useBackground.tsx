import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type BackgroundPreset = 
  | 'none'
  | 'night-city'
  | 'nature'
  | 'cyber-grid'
  | 'abstract'
  | 'mountains'
  | 'custom';

export interface BackgroundSettings {
  preset: BackgroundPreset;
  customImage?: string;
  blur: number;
  opacity: number;
}

interface BackgroundContextType {
  settings: BackgroundSettings;
  updateSettings: (settings: Partial<BackgroundSettings>) => void;
  setCustomImage: (image: string) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const defaultSettings: BackgroundSettings = {
  preset: 'none',
  blur: 8,
  opacity: 0.3,
};

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<BackgroundSettings>(() => {
    const stored = localStorage.getItem('background-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('background-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setCustomImage = (image: string) => {
    setSettings(prev => ({
      ...prev,
      preset: 'custom',
      customImage: image,
    }));
  };

  return (
    <BackgroundContext.Provider value={{ settings, updateSettings, setCustomImage }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

// Background preset styles
export const getBackgroundStyle = (settings: BackgroundSettings) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  };

  if (settings.preset === 'none') {
    return null;
  }

  let backgroundImage = '';

  switch (settings.preset) {
    case 'night-city':
      backgroundImage = `
        radial-gradient(ellipse at 20% 80%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(0, 191, 255, 0.3) 0%, transparent 50%),
        linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)
      `;
      break;
    case 'nature':
      backgroundImage = `
        radial-gradient(ellipse at 50% 100%, rgba(34, 139, 34, 0.4) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(135, 206, 235, 0.3) 0%, transparent 50%),
        linear-gradient(180deg, #1a3a2e 0%, #2d5a3d 50%, #1a2f23 100%)
      `;
      break;
    case 'cyber-grid':
      backgroundImage = `
        repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.1) 0px, transparent 1px, transparent 40px, rgba(0, 255, 255, 0.1) 41px),
        repeating-linear-gradient(90deg, rgba(255, 0, 255, 0.1) 0px, transparent 1px, transparent 40px, rgba(255, 0, 255, 0.1) 41px),
        linear-gradient(180deg, #050510 0%, #0a0a1e 100%)
      `;
      break;
    case 'abstract':
      backgroundImage = `
        radial-gradient(circle at 10% 20%, rgba(255, 0, 128, 0.3) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(0, 128, 255, 0.3) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(128, 0, 255, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)
      `;
      break;
    case 'mountains':
      backgroundImage = `
        radial-gradient(ellipse at 50% 80%, rgba(75, 85, 99, 0.4) 0%, transparent 70%),
        linear-gradient(180deg, #1e293b 0%, #334155 40%, #1e293b 100%)
      `;
      break;
    case 'custom':
      if (settings.customImage) {
        return {
          ...baseStyle,
          backgroundImage: `url(${settings.customImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: `blur(${settings.blur}px)`,
          opacity: settings.opacity,
        };
      }
      return null;
  }

  return {
    ...baseStyle,
    backgroundImage,
    filter: `blur(${settings.blur}px)`,
    opacity: settings.opacity,
  };
};
