import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontFamily = 
  | 'inter'
  | 'poppins'
  | 'roboto'
  | 'montserrat'
  | 'space-grotesk'
  | 'outfit';

export const FONT_OPTIONS = [
  { value: 'inter' as const, label: 'Inter', className: 'font-inter', description: 'Clean & professional' },
  { value: 'poppins' as const, label: 'Poppins', className: 'font-poppins', description: 'Rounded & friendly' },
  { value: 'roboto' as const, label: 'Roboto', className: 'font-roboto', description: 'Classic & reliable' },
  { value: 'montserrat' as const, label: 'Montserrat', className: 'font-montserrat', description: 'Geometric & modern' },
  { value: 'space-grotesk' as const, label: 'Space Grotesk', className: 'font-space', description: 'Tech-focused' },
  { value: 'outfit' as const, label: 'Outfit', className: 'font-outfit', description: 'Contemporary' },
];

interface FontContextType {
  font: FontFamily;
  setFont: (font: FontFamily) => void;
  getFontClassName: () => string;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

const STORAGE_KEY = 'app-font-preference';

export const FontProvider = ({ children }: { children: ReactNode }) => {
  const [font, setFontState] = useState<FontFamily>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as FontFamily) || 'inter';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, font);
    
    // Apply font class to html element
    const htmlElement = document.documentElement;
    FONT_OPTIONS.forEach(option => {
      htmlElement.classList.remove(option.className);
    });
    const selectedFont = FONT_OPTIONS.find(f => f.value === font);
    if (selectedFont) {
      htmlElement.classList.add(selectedFont.className);
    }
  }, [font]);

  const setFont = (newFont: FontFamily) => {
    setFontState(newFont);
  };

  const getFontClassName = () => {
    return FONT_OPTIONS.find(f => f.value === font)?.className || 'font-inter';
  };

  return (
    <FontContext.Provider value={{ font, setFont, getFontClassName }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within FontProvider');
  }
  return context;
};
