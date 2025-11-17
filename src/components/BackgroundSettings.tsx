import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useBackground, BackgroundPreset } from '@/hooks/useBackground';
import { useToast } from '@/hooks/use-toast';

interface BackgroundSettingsProps {
  children: React.ReactNode;
}

const presets: { id: BackgroundPreset; label: string; description: string }[] = [
  { id: 'none', label: 'None', description: 'Plain background' },
  { id: 'night-city', label: 'Night City', description: 'Urban cyberpunk vibes' },
  { id: 'nature', label: 'Nature', description: 'Forest and sky tones' },
  { id: 'cyber-grid', label: 'Cyber Grid', description: 'Digital grid pattern' },
  { id: 'abstract', label: 'Abstract', description: 'Colorful gradients' },
  { id: 'mountains', label: 'Mountains', description: 'Mountain silhouettes' },
];

export const BackgroundSettings = ({ children }: BackgroundSettingsProps) => {
  const { settings, updateSettings, setCustomImage } = useBackground();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please choose an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please choose an image file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomImage(result);
        toast({
          title: 'Background uploaded',
          description: 'Your custom background has been set',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Background Settings</SheetTitle>
          <SheetDescription>
            Customize the diagram background with presets or your own image
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Presets */}
          <div className="space-y-3">
            <Label>Background Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant={settings.preset === preset.id ? 'default' : 'outline'}
                  className="h-auto flex-col items-start p-3"
                  onClick={() => updateSettings({ preset: preset.id })}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {preset.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Image Upload */}
          <div className="space-y-3">
            <Label>Custom Background Image</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById('bg-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                id="bg-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {settings.preset === 'custom' && settings.customImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                <img
                  src={settings.customImage}
                  alt="Custom background preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Blur Control */}
          {settings.preset !== 'none' && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Blur Intensity</Label>
                <span className="text-sm text-muted-foreground">{settings.blur}px</span>
              </div>
              <Slider
                value={[settings.blur]}
                onValueChange={(value) => updateSettings({ blur: value[0] })}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* Opacity Control */}
          {settings.preset !== 'none' && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Background Opacity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(settings.opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.opacity * 100]}
                onValueChange={(value) => updateSettings({ opacity: value[0] / 100 })}
                min={10}
                max={80}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Preview Info */}
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Adjust blur and opacity to ensure your diagram nodes
              remain clearly visible against the background.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
