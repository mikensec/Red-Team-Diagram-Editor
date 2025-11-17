import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { useNeonMode } from '@/hooks/useNeonMode';

interface PresentationControlsProps {
  currentIndex: number;
  totalNodes: number;
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const PresentationControls = ({
  currentIndex,
  totalNodes,
  onNext,
  onPrevious,
  onExit,
  onToggleFullscreen,
  isFullscreen,
  hasNext,
  hasPrevious,
}: PresentationControlsProps) => {
  const { neonMode } = useNeonMode();
  
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card/95 backdrop-blur-sm px-6 py-4 rounded-lg border shadow-2xl animate-fade-in ${neonMode ? 'border-primary/50 neon-glow-cyan' : 'border-border'}`}>
      <Button
        onClick={onPrevious}
        variant="outline"
        size="sm"
        disabled={!hasPrevious}
        title="Previous node (Arrow Left/Up)"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="px-4 py-1 bg-muted rounded-md text-sm font-medium">
        {currentIndex + 1} / {totalNodes}
      </div>

      <Button
        onClick={onNext}
        variant="outline"
        size="sm"
        disabled={!hasNext}
        title="Next node (Arrow Right/Down)"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-2" />

      <Button
        onClick={onToggleFullscreen}
        variant="outline"
        size="sm"
        title="Toggle fullscreen (F)"
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4" />
        ) : (
          <Maximize className="w-4 h-4" />
        )}
      </Button>

      <Button
        onClick={onExit}
        variant="destructive"
        size="sm"
        title="Exit presentation (Escape)"
      >
        <X className="w-4 h-4 mr-2" />
        Exit
      </Button>
    </div>
  );
};
