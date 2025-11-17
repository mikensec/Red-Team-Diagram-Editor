import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Upload, Trash2, Plus } from 'lucide-react';
import { NODE_TYPES, NodeType } from '@/types/Diagram';
import { useRef } from 'react';

interface ToolbarProps {
  onAddNode: (type: NodeType) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

export const Toolbar = ({ onAddNode, onExport, onImport, onReset }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg">
      <div className="flex items-center gap-2">
        <Select onValueChange={(value) => onAddNode(value as NodeType)}>
          <SelectTrigger className="w-[180px]">
            <Plus className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Add Node" />
          </SelectTrigger>
          <SelectContent>
            {NODE_TYPES.map((node) => (
              <SelectItem key={node.value} value={node.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `hsl(var(--${node.color}))` }}
                  />
                  {node.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
      </div>
    </div>
  );
};
