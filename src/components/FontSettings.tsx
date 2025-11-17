import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useFont, FONT_OPTIONS } from '@/hooks/useFont';

interface FontSettingsProps {
  children: ReactNode;
}

export const FontSettings = ({ children }: FontSettingsProps) => {
  const { font, setFont } = useFont();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Font Settings</SheetTitle>
          <SheetDescription>
            Choose a font style for your diagrams
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 pb-6">
          <RadioGroup value={font} onValueChange={(value) => setFont(value as any)}>
            <div className="space-y-4">
              {FONT_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-lg font-semibold ${option.className}`}>
                        {option.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {option.description}
                      </span>
                      <div className={`text-sm mt-2 p-3 bg-muted rounded-md ${option.className}`}>
                        The quick brown fox jumps over the lazy dog
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </SheetContent>
    </Sheet>
  );
};
