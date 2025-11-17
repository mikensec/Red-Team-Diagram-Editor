import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import bgNightCity from '@/assets/bg-night-city.jpg';
import bgNature from '@/assets/bg-nature.jpg';
import bgMountains from '@/assets/bg-mountains.jpg';
import bgAbstract from '@/assets/bg-abstract.jpg';

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
export const getBackgroundStyle = (settings: BackgroundSettings): React.CSSProperties | null => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  };

  if (settings.preset === 'none') {
    return null;
  }

  // Handle image-based presets
  const imagePresets: Record<string, string> = {
    'night-city': bgNightCity,
    'nature': bgNature,
    'mountains': bgMountains,
    'abstract': bgAbstract,
  };

  if (imagePresets[settings.preset]) {
    return {
      ...baseStyle,
      backgroundImage: `url(${imagePresets[settings.preset]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: `blur(${settings.blur}px)`,
      opacity: settings.opacity,
    };
  }

  // Handle CSS gradient presets
  if (settings.preset === 'cyber-grid') {
    return {
      ...baseStyle,
      backgroundImage: `
        repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.1) 0px, transparent 1px, transparent 40px, rgba(0, 255, 255, 0.1) 41px),
        repeating-linear-gradient(90deg, rgba(255, 0, 255, 0.1) 0px, transparent 1px, transparent 40px, rgba(255, 0, 255, 0.1) 41px),
        linear-gradient(180deg, #050510 0%, #0a0a1e 100%)
      `,
      filter: `blur(${settings.blur}px)`,
      opacity: settings.opacity,
    };
  }

  // Handle custom images
  if (settings.preset === 'custom' && settings.customImage) {
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
};
