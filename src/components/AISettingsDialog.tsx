import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Settings, Key, Check, Eye, EyeOff, Trash2, WifiOff, EyeOff as Anonymize, AlertTriangle } from 'lucide-react';
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
    if (provider !== 'lovable' && !hasApiKey(provider)) {
      toast.error(`Please add your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key first`);
      return;
    }
    updateSettings({ provider });
    toast.success(`Switched to ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Provider Settings
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-amber-500/20 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            <strong>Privacy Warning:</strong> AI features send your diagram data (node labels, descriptions, connections) to external AI services. 
            Enable <strong>Offline Mode</strong> to disable AI or use <strong>Anonymize Data</strong> to strip sensitive labels.
          </AlertDescription>
        </Alert>

        <Alert className="border-blue-500/20 bg-blue-500/5">
          <Key className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>API Keys:</strong> Stored locally in your browser. Never sent to our servers - only directly to the AI provider.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  Offline Mode
                </Label>
                <p className="text-xs text-muted-foreground">Disable all AI features - no data sent anywhere</p>
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
                <p className="text-xs text-muted-foreground">Replace node labels with generic placeholders before sending</p>
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
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Active Provider</Label>
            <RadioGroup
              value={settings.provider}
              onValueChange={(value) => handleProviderChange(value as AIProvider)}
              className="mt-2 space-y-2"
            >
              {PROVIDERS.map((provider) => (
                <div key={provider.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={provider.id}
                    id={provider.id}
                    disabled={provider.requiresKey && !hasApiKey(provider.id)}
                  />
                  <Label
                    htmlFor={provider.id}
                    className={`flex-1 cursor-pointer ${provider.requiresKey && !hasApiKey(provider.id) ? 'opacity-50' : ''}`}
                  >
                    <span className="font-medium">{provider.name}</span>
                    <span className="text-xs text-muted-foreground block">{provider.description}</span>
                  </Label>
                  {hasApiKey(provider.id) && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

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
      </DialogContent>
    </Dialog>
  );
}
