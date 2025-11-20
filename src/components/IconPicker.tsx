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
  Router,
  Smartphone,
  Laptop,
  MonitorSmartphone,
  Binary,
  Fingerprint,
  Scan,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Webhook,
  GitBranch,
  GitCommit,
  Package,
  PackageCheck,
  Layers,
  Link,
  Unlink,
  Crosshair,
  Navigation,
  Radar,
  Signal,
  Power,
  Plug,
  Usb,
  Bluetooth,
  Cast,
  Chrome,
  FileCode,
  Braces,
  Command,
  Hash,
  Binary as BinaryIcon,
  AlertCircle,
  ShieldQuestion,
  Globe2,
  Compass,
  Satellite,
  Rss,
  Share2,
  ExternalLink,
  Workflow,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const AVAILABLE_ICONS = [
  { name: 'Shield', component: Shield },
  { name: 'ShieldAlert', component: ShieldAlert },
  { name: 'ShieldCheck', component: ShieldCheck },
  { name: 'ShieldQuestion', component: ShieldQuestion },
  { name: 'Zap', component: Zap },
  { name: 'Target', component: Target },
  { name: 'Crosshair', component: Crosshair },
  { name: 'Network', component: Network },
  { name: 'Lock', component: Lock },
  { name: 'Unlock', component: Unlock },
  { name: 'Key', component: Key },
  { name: 'Fingerprint', component: Fingerprint },
  { name: 'Database', component: Database },
  { name: 'Server', component: Server },
  { name: 'Cloud', component: Cloud },
  { name: 'HardDrive', component: HardDrive },
  { name: 'Terminal', component: Terminal },
  { name: 'Code', component: Code },
  { name: 'FileCode', component: FileCode },
  { name: 'Braces', component: Braces },
  { name: 'Binary', component: Binary },
  { name: 'Hash', component: Hash },
  { name: 'Bug', component: Bug },
  { name: 'AlertTriangle', component: AlertTriangle },
  { name: 'AlertCircle', component: AlertCircle },
  { name: 'Flag', component: Flag },
  { name: 'CheckCircle', component: CheckCircle },
  { name: 'XCircle', component: XCircle },
  { name: 'Mail', component: Mail },
  { name: 'FileText', component: FileText },
  { name: 'Folder', component: Folder },
  { name: 'Download', component: Download },
  { name: 'Upload', component: Upload },
  { name: 'Settings', component: Settings },
  { name: 'Command', component: Command },
  { name: 'User', component: User },
  { name: 'Users', component: Users },
  { name: 'Eye', component: Eye },
  { name: 'EyeOff', component: EyeOff },
  { name: 'Scan', component: Scan },
  { name: 'ScanLine', component: ScanLine },
  { name: 'Search', component: Search },
  { name: 'Filter', component: Filter },
  { name: 'Activity', component: Activity },
  { name: 'Globe', component: Globe },
  { name: 'Globe2', component: Globe2 },
  { name: 'Compass', component: Compass },
  { name: 'Wifi', component: Wifi },
  { name: 'Radio', component: Radio },
  { name: 'Signal', component: Signal },
  { name: 'Radar', component: Radar },
  { name: 'Satellite', component: Satellite },
  { name: 'Router', component: Router },
  { name: 'Bluetooth', component: Bluetooth },
  { name: 'Cast', component: Cast },
  { name: 'Rss', component: Rss },
  { name: 'Webhook', component: Webhook },
  { name: 'Cpu', component: Cpu },
  { name: 'Boxes', component: Boxes },
  { name: 'Layers', component: Layers },
  { name: 'Package', component: Package },
  { name: 'PackageCheck', component: PackageCheck },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Laptop', component: Laptop },
  { name: 'MonitorSmartphone', component: MonitorSmartphone },
  { name: 'Link', component: Link },
  { name: 'Unlink', component: Unlink },
  { name: 'ExternalLink', component: ExternalLink },
  { name: 'Share2', component: Share2 },
  { name: 'Navigation', component: Navigation },
  { name: 'Power', component: Power },
  { name: 'Plug', component: Plug },
  { name: 'Usb', component: Usb },
  { name: 'Chrome', component: Chrome },
  { name: 'GitBranch', component: GitBranch },
  { name: 'GitCommit', component: GitCommit },
  { name: 'Workflow', component: Workflow },
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
