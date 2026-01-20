import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type AIProvider = 'lovable' | 'openai' | 'anthropic' | 'google' | 'ollama';

export interface AISettings {
  provider: AIProvider;
  openaiKey?: string;
  anthropicKey?: string;
  googleKey?: string;
  model?: string;
  offlineMode: boolean;
  anonymizeData: boolean;
  ollamaUrl: string;
  ollamaModel: string;
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'lovable',
  offlineMode: false,
  anonymizeData: false,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
};

const STORAGE_KEY = 'rtc-ai-settings';

interface AISettingsContextType {
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  clearApiKey: (provider: AIProvider) => void;
  hasApiKey: (provider: AIProvider) => boolean;
  getActiveApiKey: () => string | undefined;
}

const AISettingsContext = createContext<AISettingsContextType | null>(null);

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load AI settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save AI settings:', e);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearApiKey = (provider: AIProvider) => {
    if (provider === 'openai') {
      setSettings(prev => ({ ...prev, openaiKey: undefined }));
    } else if (provider === 'anthropic') {
      setSettings(prev => ({ ...prev, anthropicKey: undefined }));
    } else if (provider === 'google') {
      setSettings(prev => ({ ...prev, googleKey: undefined }));
    }
  };

  const hasApiKey = (provider: AIProvider): boolean => {
    if (provider === 'lovable') return true;
    if (provider === 'ollama') return true; // No API key needed for local Ollama
    if (provider === 'openai') return !!settings.openaiKey;
    if (provider === 'anthropic') return !!settings.anthropicKey;
    if (provider === 'google') return !!settings.googleKey;
    return false;
  };

  const getActiveApiKey = (): string | undefined => {
    if (settings.provider === 'openai') return settings.openaiKey;
    if (settings.provider === 'anthropic') return settings.anthropicKey;
    if (settings.provider === 'google') return settings.googleKey;
    return undefined;
  };

  return (
    <AISettingsContext.Provider value={{ settings, updateSettings, clearApiKey, hasApiKey, getActiveApiKey }}>
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (!context) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
}
