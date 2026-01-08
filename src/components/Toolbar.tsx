import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, Plus, Moon, Sun, HelpCircle, Presentation, Zap, ImageIcon, Type, Menu, ListOrdered, Share2, Sparkles, Brain } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { useNeonMode } from '@/hooks/useNeonMode';
import { BackgroundSettings } from './BackgroundSettings';
import { FontSettings } from './FontSettings';
import { StorageMonitor } from './StorageMonitor';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { VERSION } from '@/version';
import { TemplateGeneratorDialog } from './TemplateGeneratorDialog';
import { AIAssistantDialog } from './AIAssistantDialog';
import { AttackNode } from '@/types/Diagram';
import { Edge } from 'reactflow';

interface ToolbarProps {
  onAddNodeClick: () => void;
  onExport: () => void;
  onExportHtml: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onStartPresentation: () => void;
  onManageOrder: () => void;
  onApplyTemplate: (nodes: AttackNode[], edges: Edge[]) => void;
  hasNodes: boolean;
  nodes: AttackNode[];
  edges: Edge[];
  selectedNodeId?: string | null;
  onAddNodeFromAI?: (label: string, icon: string, color: string, description: string) => void;
}
export const Toolbar = ({
  onAddNodeClick,
  onExport,
  onExportHtml,
  onImport,
  onReset,
  onStartPresentation,
  onManageOrder,
  onApplyTemplate,
  hasNodes,
  nodes,
  edges,
  selectedNodeId,
  onAddNodeFromAI
}: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    theme,
    setTheme
  } = useTheme();
  const {
    neonMode,
    toggleNeonMode
  } = useNeonMode();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const handleMobileAction = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };
  return <>
      {/* Mobile Menu - Shows on small screens */}
      <div className={`absolute top-4 left-4 z-50 lg:hidden bg-card/95 backdrop-blur-sm p-2 rounded-lg border shadow-lg ${neonMode ? 'border-primary/30 neon-glow-cyan' : 'border-border'}`}>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
          <SheetHeader>
              <div className="flex items-center gap-3">
                <img src="/icon-192x192.png" alt="Red Team Canvas" className="w-8 h-8" />
                <SheetTitle>Red Team Canvas</SheetTitle>
              </div>
            </SheetHeader>
            
            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={() => handleMobileAction(onAddNodeClick)} variant="default" size="sm" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>

              <TemplateGeneratorDialog onApplyTemplate={onApplyTemplate} hasExistingNodes={hasNodes}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Template
                </Button>
              </TemplateGeneratorDialog>

              <AIAssistantDialog nodes={nodes} edges={edges} selectedNodeId={selectedNodeId} onAddNode={onAddNodeFromAI}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </AIAssistantDialog>

              <Separator />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleMobileAction(onExport)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMobileAction(onExportHtml)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Export as Interactive HTML
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => handleMobileAction(handleImportClick)} variant="outline" size="sm" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>

              <Separator />

              <Button onClick={() => handleMobileAction(onReset)} variant="destructive" size="sm" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Separator />

              <Button onClick={() => handleMobileAction(onStartPresentation)} variant="default" size="sm" disabled={!hasNodes} className="w-full justify-start">
                <Presentation className="w-4 h-4 mr-2" />
                Present
              </Button>

              <Button onClick={() => handleMobileAction(onManageOrder)} variant="outline" size="sm" disabled={!hasNodes} className="w-full justify-start">
                <ListOrdered className="w-4 h-4 mr-2" />
                Manage Order
              </Button>

              <Separator />

              <Button onClick={() => handleMobileAction(toggleNeonMode)} variant="outline" size="sm" className="w-full justify-start">
                <Zap className={`w-4 h-4 mr-2 ${neonMode ? 'text-neon-cyan' : ''}`} />
                {neonMode ? 'Disable' : 'Enable'} Neon Mode
              </Button>

              <BackgroundSettings>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Background Settings
                </Button>
              </BackgroundSettings>

              <FontSettings>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Type className="w-4 h-4 mr-2" />
                  Font Settings
                </Button>
              </FontSettings>

              <StorageMonitor />

              <Separator />

              <Button onClick={() => handleMobileAction(toggleTheme)} variant="outline" size="sm" className="w-full justify-start">
                {theme === 'dark' ? <>
                    <Sun className="w-4 h-4 mr-2" />
                    Light Mode
                  </> : <>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Mode
                  </>}
              </Button>

              <Button onClick={() => handleMobileAction(() => navigate('/help'))} variant="outline" size="sm" className="w-full justify-start">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>

              <Separator />

              <div className="text-center text-xs text-muted-foreground pt-2">
                v{VERSION}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Toolbar - Shows on large screens */}
      <div className={`absolute top-4 left-4 z-50 hidden lg:flex gap-2 bg-card/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg ${neonMode ? 'border-primary/30 neon-glow-cyan' : 'border-border'}`}>
        <div className="flex items-center gap-2">
          <img src="/icon-192x192.png" alt="Red Team Canvas" className="w-6 h-6" />
          
          
          <div className="w-px h-6 bg-border mx-1" />
          <Button onClick={onAddNodeClick} variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>

          <TemplateGeneratorDialog onApplyTemplate={onApplyTemplate} hasExistingNodes={hasNodes}>
            <Button variant="outline" size="sm" title="Generate diagram from template">
              <Sparkles className="w-4 h-4" />
            </Button>
          </TemplateGeneratorDialog>

          <AIAssistantDialog nodes={nodes} edges={edges} selectedNodeId={selectedNodeId} onAddNode={onAddNodeFromAI}>
            <Button variant="outline" size="sm" title="AI Red Team Assistant">
              <Brain className="w-4 h-4" />
            </Button>
          </AIAssistantDialog>

          <div className="w-px h-6 bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportHtml}>
                <Share2 className="w-4 h-4 mr-2" />
                Export as Interactive HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleImportClick} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

          <div className="w-px h-6 bg-border" />

          <StorageMonitor />

          <div className="w-px h-6 bg-border" />

          <Button onClick={onReset} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button onClick={onStartPresentation} variant="default" size="sm" disabled={!hasNodes} title="Start presentation mode">
            <Presentation className="w-4 h-4 mr-2" />
            Present
          </Button>

          <Button onClick={onManageOrder} variant="outline" size="sm" disabled={!hasNodes} title="Manage presentation order">
            <ListOrdered className="w-4 h-4 mr-2" />
            Manage Order
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button onClick={toggleNeonMode} variant="outline" size="sm" title={neonMode ? "Disable neon mode" : "Enable neon mode"}>
            <Zap className={`w-4 h-4 ${neonMode ? 'text-neon-cyan' : ''}`} />
          </Button>

          <div className="w-px h-6 bg-border" />

          <BackgroundSettings>
            <Button variant="outline" size="sm" title="Background settings">
              <ImageIcon className="w-4 h-4" />
            </Button>
          </BackgroundSettings>

          <div className="w-px h-6 bg-border" />

          <FontSettings>
            <Button variant="outline" size="sm" title="Font settings">
              <Type className="w-4 h-4" />
            </Button>
          </FontSettings>

          <div className="w-px h-6 bg-border" />

          <Button onClick={toggleTheme} variant="outline" size="sm" title="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button onClick={() => navigate('/help')} variant="outline" size="sm" title="Help">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>;
};