import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, Plus, Moon, Sun } from 'lucide-react';
import { useRef } from 'react';
import { useTheme } from 'next-themes';

interface ToolbarProps {
  onAddNodeClick: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

export const Toolbar = ({ onAddNodeClick, onExport, onImport, onReset }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg">
      <div className="flex items-center gap-2">
        <Button onClick={onAddNodeClick} variant="default" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Node
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button onClick={handleImportClick} variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-px h-6 bg-border" />

        <Button onClick={onReset} variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button onClick={toggleTheme} variant="outline" size="sm" title="Toggle theme">
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
