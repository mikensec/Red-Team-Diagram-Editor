import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Shield,
  Zap,
  Target,
  Network,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Terminal,
  Code,
  Bug,
  AlertTriangle,
  Flag,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
  Folder,
  Download,
  Upload,
  Settings,
  User,
  Users,
  Eye,
  EyeOff,
  Search,
  Filter,
  Activity,
  Globe,
  Wifi,
  Radio,
  Cpu,
  HardDrive,
  Boxes,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const AVAILABLE_ICONS = [
  { name: 'Shield', component: Shield },
  { name: 'Zap', component: Zap },
  { name: 'Target', component: Target },
  { name: 'Network', component: Network },
  { name: 'Lock', component: Lock },
  { name: 'Unlock', component: Unlock },
  { name: 'Key', component: Key },
  { name: 'Database', component: Database },
  { name: 'Server', component: Server },
  { name: 'Cloud', component: Cloud },
  { name: 'Terminal', component: Terminal },
  { name: 'Code', component: Code },
  { name: 'Bug', component: Bug },
  { name: 'AlertTriangle', component: AlertTriangle },
  { name: 'Flag', component: Flag },
  { name: 'CheckCircle', component: CheckCircle },
  { name: 'XCircle', component: XCircle },
  { name: 'Mail', component: Mail },
  { name: 'FileText', component: FileText },
  { name: 'Folder', component: Folder },
  { name: 'Download', component: Download },
  { name: 'Upload', component: Upload },
  { name: 'Settings', component: Settings },
  { name: 'User', component: User },
  { name: 'Users', component: Users },
  { name: 'Eye', component: Eye },
  { name: 'EyeOff', component: EyeOff },
  { name: 'Search', component: Search },
  { name: 'Filter', component: Filter },
  { name: 'Activity', component: Activity },
  { name: 'Globe', component: Globe },
  { name: 'Wifi', component: Wifi },
  { name: 'Radio', component: Radio },
  { name: 'Cpu', component: Cpu },
  { name: 'HardDrive', component: HardDrive },
  { name: 'Boxes', component: Boxes },
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [search, setSearch] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Label>Icon</Label>
      <Input
        type="text"
        placeholder="Search icons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ScrollArea className="h-[200px] border rounded-md p-2">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((icon) => {
            const Icon = icon.component;
            return (
              <button
                key={icon.name}
                type="button"
                onClick={() => onChange(icon.name)}
                className={cn(
                  "p-2 rounded-md hover:bg-accent transition-colors",
                  value === icon.name && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                title={icon.name}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export { AVAILABLE_ICONS };
