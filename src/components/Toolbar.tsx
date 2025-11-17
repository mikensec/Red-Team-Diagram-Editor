import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, Plus, Moon, Sun, HelpCircle, Presentation, Zap } from 'lucide-react';
import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { useNeonMode } from '@/hooks/useNeonMode';

interface ToolbarProps {
  onAddNodeClick: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onStartPresentation: () => void;
  hasNodes: boolean;
}

export const Toolbar = ({ onAddNodeClick, onExport, onImport, onReset, onStartPresentation, hasNodes }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const { neonMode, toggleNeonMode } = useNeonMode();
  const navigate = useNavigate();

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
    <div className={`absolute top-4 left-4 z-10 flex gap-2 bg-card/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg ${neonMode ? 'border-primary/30 neon-glow-cyan' : 'border-border'}`}>
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

        <Button 
          onClick={onStartPresentation} 
          variant="default" 
          size="sm"
          disabled={!hasNodes}
          title="Start presentation mode"
        >
          <Presentation className="w-4 h-4 mr-2" />
          Present
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button onClick={toggleNeonMode} variant="outline" size="sm" title={neonMode ? "Disable neon mode" : "Enable neon mode"}>
          <Zap className={`w-4 h-4 ${neonMode ? 'text-neon-cyan' : ''}`} />
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button onClick={toggleTheme} variant="outline" size="sm" title="Toggle theme">
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button onClick={() => navigate('/help')} variant="outline" size="sm" title="Help">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
