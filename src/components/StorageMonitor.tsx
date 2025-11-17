import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { getStorageStats, StorageStats } from '@/utils/storageMonitoring';
import { Progress } from '@/components/ui/progress';
import { useNeonMode } from '@/hooks/useNeonMode';

export const StorageMonitor = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [open, setOpen] = useState(false);
  const { neonMode } = useNeonMode();

  useEffect(() => {
    const loadStats = async () => {
      const storageStats = await getStorageStats();
      setStats(storageStats);
    };

    // Load stats when dialog opens
    if (open) {
      loadStats();
    }
  }, [open]);

  const getWarningLevel = () => {
    if (!stats) return 'safe';
    if (stats.usagePercent >= 90) return 'critical';
    if (stats.usagePercent >= 75) return 'warning';
    return 'safe';
  };

  const warningLevel = getWarningLevel();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={warningLevel === 'critical' ? 'border-destructive text-destructive' : ''}
        >
          <HardDrive className="w-4 h-4 mr-2" />
          Storage
          {warningLevel !== 'safe' && (
            <AlertTriangle className="w-3 h-3 ml-2 text-destructive" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Monitor
          </DialogTitle>
          <DialogDescription>
            Track your diagram's attachment storage usage
          </DialogDescription>
        </DialogHeader>

        {stats ? (
          <div className="space-y-6">
            {/* Storage Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">
                  {stats.usagePercent > 0 
                    ? `${stats.usagePercent.toFixed(1)}%` 
                    : 'Calculating...'}
                </span>
              </div>
              {stats.usagePercent > 0 && (
                <Progress 
                  value={stats.usagePercent} 
                  className={`h-2 ${neonMode ? 'neon-glow-cyan' : ''}`}
                />
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Estimated Quota: {stats.formattedQuota}</span>
              </div>
            </div>

            {/* Warning Messages */}
            {warningLevel === 'critical' && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive">Storage Almost Full</p>
                    <p className="text-muted-foreground mt-1">
                      You're using over 90% of available storage. Consider deleting unused attachments or compressing images.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {warningLevel === 'warning' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-600 dark:text-amber-500">Storage Getting Full</p>
                    <p className="text-muted-foreground mt-1">
                      You're using over 75% of available storage. Monitor your attachment usage.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{stats.totalAttachments}</div>
                <div className="text-sm text-muted-foreground">Total Attachments</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{stats.formattedSize}</div>
                <div className="text-sm text-muted-foreground">Attachments Size</div>
              </div>
            </div>

            {/* Tips */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">💡 Storage Tips:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Images are stored in your browser's IndexedDB</li>
                <li>Maximum 5MB per image, 20 attachments per node</li>
                <li>Compress large images before uploading</li>
                <li>Export diagrams regularly as backup</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Loading storage statistics...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
