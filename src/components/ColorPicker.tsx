import { PRESET_COLORS } from '@/types/Diagram';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="space-y-3">
      <Label>Color</Label>
      <div className="grid grid-cols-9 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "w-8 h-8 rounded-md transition-all hover:scale-110 relative",
              value === color.value && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              color.value === 'transparent' && "border border-border"
            )}
            style={{ 
              backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
              backgroundImage: color.value === 'transparent' 
                ? 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)'
                : undefined,
              backgroundSize: color.value === 'transparent' ? '4px 4px' : undefined,
              backgroundPosition: color.value === 'transparent' ? '0 0, 0 2px, 2px -2px, -2px 0px' : undefined,
            }}
            title={color.name}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-10 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
};
