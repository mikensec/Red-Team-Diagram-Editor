import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Settings, Key, Check, Eye, EyeOff, Trash2, WifiOff, EyeOff as Anonymize, AlertTriangle, Server } from 'lucide-react';
import { useAISettings, AIProvider } from '@/hooks/useAISettings';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PROVIDERS = [
  {
    id: 'lovable' as AIProvider,
    name: 'Lovable AI (Built-in)',
    description: 'Free tier included - no API key required',
    requiresKey: false,
  },
  {
    id: 'ollama' as AIProvider,
    name: 'Ollama (Local)',
    description: '100% private - runs on your machine, no data leaves',
    requiresKey: false,
    isLocal: true,
  },
  {
    id: 'openai' as AIProvider,
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4, GPT-3.5 Turbo',
    requiresKey: true,
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'anthropic' as AIProvider,
    name: 'Anthropic',
    description: 'Claude 3.5, Claude 3',
    requiresKey: true,
    keyPlaceholder: 'sk-ant-...',
  },
  {
    id: 'google' as AIProvider,
    name: 'Google AI',
    description: 'Gemini Pro, Gemini Flash',
    requiresKey: true,
    keyPlaceholder: 'AIza...',
  },
];

interface AISettingsDialogProps {
  children?: React.ReactNode;
}

export function AISettingsDialog({ children }: AISettingsDialogProps) {
  const { settings, updateSettings, clearApiKey, hasApiKey } = useAISettings();
  const [open, setOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    lovable: false,
    openai: false,
    anthropic: false,
    google: false,
    ollama: false,
  });
  const [tempKeys, setTempKeys] = useState({
    openai: settings.openaiKey || '',
    anthropic: settings.anthropicKey || '',
    google: settings.googleKey || '',
  });

  const toggleShowKey = (provider: AIProvider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSaveKey = (provider: AIProvider) => {
    const key = tempKeys[provider as keyof typeof tempKeys];
    if (!key.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (provider === 'openai') {
      updateSettings({ openaiKey: key.trim() });
    } else if (provider === 'anthropic') {
      updateSettings({ anthropicKey: key.trim() });
    } else if (provider === 'google') {
      updateSettings({ googleKey: key.trim() });
    }

    toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved`);
  };

  const handleClearKey = (provider: AIProvider) => {
    clearApiKey(provider);
    setTempKeys(prev => ({ ...prev, [provider]: '' }));
    toast.success('API key removed');
  };

  const handleProviderChange = (provider: AIProvider) => {
    if (provider !== 'lovable' && provider !== 'ollama' && !hasApiKey(provider)) {
      toast.error(`Please add your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key first`);
      return;
    }
    updateSettings({ provider });
    toast.success(`Switched to ${provider === 'ollama' ? 'Ollama (Local)' : provider.charAt(0).toUpperCase() + provider.slice(1)}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Provider Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          <div className="space-y-4 pr-4">
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-sm">
                <strong>Privacy Warning:</strong> AI features send your diagram data to external services. 
                Enable <strong>Offline Mode</strong> or use <strong>Anonymize Data</strong>.
              </AlertDescription>
            </Alert>

            <Alert className="border-amber-500/20 bg-amber-500/5">
              <Key className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-sm">
                <strong>API Key Security:</strong> Keys are stored unencrypted in your browser's localStorage. 
                They may be accessible to browser extensions or if an XSS vulnerability exists. 
                <strong> We recommend:</strong>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Use API keys with spending limits</li>
                  <li>Rotate keys periodically</li>
                  <li>Clear keys when using shared computers</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <WifiOff className="w-4 h-4" />
                    Offline Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">Disable all AI features - no data sent</p>
                </div>
                <Switch
                  checked={settings.offlineMode}
                  onCheckedChange={(checked) => {
                    updateSettings({ offlineMode: checked });
                    toast.success(checked ? 'AI features disabled' : 'AI features enabled');
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Anonymize className="w-4 h-4" />
                    Anonymize Data
                  </Label>
                  <p className="text-xs text-muted-foreground">Replace labels with placeholders</p>
                </div>
                <Switch
                  checked={settings.anonymizeData}
                  onCheckedChange={(checked) => {
                    updateSettings({ anonymizeData: checked });
                    toast.success(checked ? 'Data will be anonymized' : 'Anonymization disabled');
                  }}
                  disabled={settings.offlineMode}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Active Provider</Label>
              <RadioGroup
                value={settings.provider}
                onValueChange={(value) => handleProviderChange(value as AIProvider)}
                className="mt-2 space-y-2"
              >
                {PROVIDERS.map((provider) => {
                  const needsKey = provider.requiresKey && !hasApiKey(provider.id);
                  return (
                    <div key={provider.id} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={provider.id}
                        id={provider.id}
                        disabled={needsKey}
                      />
                      <Label
                        htmlFor={provider.id}
                        className={`flex-1 cursor-pointer ${needsKey ? 'opacity-50' : ''}`}
                      >
                        <span className="font-medium flex items-center gap-2">
                          {provider.name}
                          {needsKey && (
                            <span className="text-[10px] font-normal bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                              API key required
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground block">{provider.description}</span>
                      </Label>
                      {hasApiKey(provider.id) && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {settings.provider === 'ollama' && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Server className="w-4 h-4" />
                Ollama Configuration
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Make sure Ollama is running locally. Data stays 100% on your machine.
              </p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Server URL</Label>
                  <Input
                    placeholder="http://localhost:11434"
                    value={settings.ollamaUrl}
                    onChange={(e) => updateSettings({ ollamaUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Model</Label>
                  <Input
                    placeholder="llama3.2"
                    value={settings.ollamaModel}
                    onChange={(e) => updateSettings({ ollamaModel: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Run <code className="bg-muted px-1 rounded">ollama list</code> to see available models
                  </p>
                </div>
              </div>
            </div>
          )}

            <div className="border-t pt-4">
            <Label className="text-sm font-medium">API Keys</Label>
            <div className="mt-2 space-y-3">
              {PROVIDERS.filter(p => p.requiresKey).map((provider) => (
                <div key={provider.id} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{provider.name}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        placeholder={provider.keyPlaceholder}
                        value={tempKeys[provider.id as keyof typeof tempKeys]}
                        onChange={(e) => setTempKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowKey(provider.id)}
                      >
                        {showKeys[provider.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {hasApiKey(provider.id) ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleClearKey(provider.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSaveKey(provider.id)}
                        disabled={!tempKeys[provider.id as keyof typeof tempKeys].trim()}
                      >
                        Save
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
