import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Package, 
  Key, 
  Users, 
  Globe, 
  Cloud, 
  Network, 
  MessageSquare,
  Zap,
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { AttackNode } from '@/types/Diagram';
import { Edge } from 'reactflow';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'phishing-chain',
    name: 'Phishing Attack Chain',
    description: 'Email-based initial access with payload delivery and C2',
    icon: <Mail className="w-5 h-5" />
  },
  {
    id: 'ransomware',
    name: 'Ransomware Deployment',
    description: 'Full ransomware lifecycle from access to encryption',
    icon: <Lock className="w-5 h-5" />
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Attack',
    description: 'Vendor compromise to downstream customer infection',
    icon: <Package className="w-5 h-5" />
  },
  {
    id: 'credential-theft',
    name: 'Credential Theft Campaign',
    description: 'Phishing to credential capture and account takeover',
    icon: <Key className="w-5 h-5" />
  },
  {
    id: 'insider-threat',
    name: 'Insider Threat Scenario',
    description: 'Malicious insider data theft and exfiltration',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'web-app-attack',
    name: 'Web Application Attack',
    description: 'SQLi/XSS exploitation to database compromise',
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'cloud-attack',
    name: 'Cloud Infrastructure Attack',
    description: 'Cloud credential theft to resource compromise',
    icon: <Cloud className="w-5 h-5" />
  },
  {
    id: 'network-pentest',
    name: 'Network Penetration',
    description: 'External breach to domain controller compromise',
    icon: <Network className="w-5 h-5" />
  },
  {
    id: 'social-engineering',
    name: 'Social Engineering Campaign',
    description: 'OSINT to pretext development and exploitation',
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    id: 'zero-day',
    name: 'Zero-Day Exploitation',
    description: 'Vulnerability discovery to persistent access',
    icon: <Zap className="w-5 h-5" />
  }
];

interface TemplateGeneratorDialogProps {
  onApplyTemplate: (nodes: AttackNode[], edges: Edge[]) => void;
  hasExistingNodes: boolean;
  children?: React.ReactNode;
}

export function TemplateGeneratorDialog({ 
  onApplyTemplate, 
  hasExistingNodes,
  children 
}: TemplateGeneratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedDiagram, setGeneratedDiagram] = useState<{ nodes: AttackNode[]; edges: Edge[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (categoryId: string) => {
    setLoading(true);
    setSelectedCategory(categoryId);
    setError(null);
    setGeneratedDiagram(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-diagram-template`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ categoryId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate template');
      }

      const data = await response.json();
      
      if (data.diagram) {
        setGeneratedDiagram({
          nodes: data.diagram.nodes,
          edges: data.diagram.edges
        });
        toast.success(`Generated "${data.templateName}" template`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate template';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedDiagram) {
      onApplyTemplate(generatedDiagram.nodes, generatedDiagram.edges);
      setOpen(false);
      setGeneratedDiagram(null);
      setSelectedCategory(null);
      toast.success('Template applied successfully');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setGeneratedDiagram(null);
    setSelectedCategory(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Attack Diagram Template
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Privacy First:</strong> Templates are generated from predefined scenarios. 
            Your existing diagrams are never sent to AI.
          </AlertDescription>
        </Alert>

        {hasExistingNodes && !generatedDiagram && (
          <Alert variant="destructive" className="border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Applying a template will replace your current diagram. Consider exporting first.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!generatedDiagram ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleGenerate(category.id)}
                  disabled={loading}
                  className={`
                    p-4 rounded-lg border text-left transition-all
                    hover:border-primary hover:bg-primary/5
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${selectedCategory === category.id && loading ? 'border-primary bg-primary/10' : 'border-border'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${selectedCategory === category.id && loading ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {selectedCategory === category.id && loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        category.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <h3 className="font-medium mb-2">Template Preview</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• {generatedDiagram.nodes.length} nodes generated</p>
                <p>• {generatedDiagram.edges.length} connections</p>
                <p className="pt-2 font-medium text-foreground">Nodes:</p>
                <ul className="list-disc list-inside pl-2 space-y-0.5">
                  {generatedDiagram.nodes.slice(0, 6).map((node) => (
                    <li key={node.id} className="truncate">{node.data.label}</li>
                  ))}
                  {generatedDiagram.nodes.length > 6 && (
                    <li className="text-muted-foreground">...and {generatedDiagram.nodes.length - 6} more</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setGeneratedDiagram(null);
                setSelectedCategory(null);
              }}>
                Back to Templates
              </Button>
              <Button onClick={handleApply}>
                Apply Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
