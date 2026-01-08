import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  FileText, 
  Shield, 
  Loader2, 
  Settings,
  AlertCircle,
  LogIn,
  Crosshair,
  Route,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAISettings } from '@/hooks/useAISettings';
import { AuthDialog } from './AuthDialog';
import { AISettingsDialog } from './AISettingsDialog';
import { AttackNode } from '@/types/Diagram';
import { Edge } from 'reactflow';

interface TTPSuggestion {
  technique: string;
  description: string;
  tactic: string;
  icon: string;
  color: string;
}

interface AttackPathAnalysis {
  gaps: Array<{ between: string[]; missing: string; suggestion: string }>;
  alternatives: Array<{ description: string; path: string[] }>;
  improvements: string[];
  risk_rating: { level: string; explanation: string };
}

interface ExecutiveSummary {
  title: string;
  summary: string;
  impact: string;
  key_findings: string[];
  recommendations: string[];
}

interface RemediationAdvice {
  node_label: string;
  detection: string;
  prevention: string;
  mitigation: string;
  controls: Array<{ name: string; priority: string }>;
}

interface AIAssistantDialogProps {
  nodes: AttackNode[];
  edges: Edge[];
  selectedNodeId?: string | null;
  onAddNode?: (label: string, icon: string, color: string, description: string) => void;
  children?: React.ReactNode;
}

export function AIAssistantDialog({ 
  nodes, 
  edges, 
  selectedNodeId,
  onAddNode,
  children 
}: AIAssistantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ttp-suggest');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const [ttpResults, setTtpResults] = useState<TTPSuggestion[] | null>(null);
  const [pathResults, setPathResults] = useState<AttackPathAnalysis | null>(null);
  const [summaryResults, setSummaryResults] = useState<ExecutiveSummary | null>(null);
  const [remediationResults, setRemediationResults] = useState<RemediationAdvice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const { settings, getActiveApiKey } = useAISettings();

  const selectedNode = selectedNodeId 
    ? nodes.find(n => n.id === selectedNodeId) 
    : null;

  const callAIAssistant = async (feature: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setShowAuthDialog(true);
        return;
      }

      const body: Record<string, unknown> = {
        feature,
        provider: settings.provider,
      };

      // Add API key for non-Lovable providers
      if (settings.provider !== 'lovable') {
        const apiKey = getActiveApiKey();
        if (!apiKey) {
          toast.error(`Please add your ${settings.provider} API key in AI Settings`);
          return;
        }
        body.apiKey = apiKey;
      }

      // Add diagram for analysis features
      if (feature !== 'ttp-suggest') {
        body.diagram = {
          nodes: nodes.map(n => ({
            id: n.id,
            data: {
              label: n.data.label,
              description: n.data.description,
              icon: n.data.icon,
              color: n.data.color,
            }
          })),
          edges: edges.map(e => ({ source: e.source, target: e.target }))
        };
      }

      // Add selected node for TTP suggest
      if (feature === 'ttp-suggest' && selectedNode) {
        body.selectedNode = {
          id: selectedNode.id,
          data: {
            label: selectedNode.data.label,
            description: selectedNode.data.description,
            icon: selectedNode.data.icon,
          }
        };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI request failed');
      }

      const data = await response.json();
      
      switch (feature) {
        case 'ttp-suggest':
          setTtpResults(Array.isArray(data.result) ? data.result : []);
          break;
        case 'attack-path-analyze':
          setPathResults(data.result);
          break;
        case 'executive-summary':
          setSummaryResults(data.result);
          break;
        case 'remediation-advisor':
          setRemediationResults(Array.isArray(data.result) ? data.result : []);
          break;
      }

      toast.success('Analysis complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestedNode = (suggestion: TTPSuggestion) => {
    if (onAddNode) {
      onAddNode(
        suggestion.technique,
        suggestion.icon || 'Zap',
        suggestion.color || '#6366f1',
        suggestion.description
      );
      toast.success(`Added: ${suggestion.technique}`);
    }
  };

  const clearResults = () => {
    setTtpResults(null);
    setPathResults(null);
    setSummaryResults(null);
    setRemediationResults(null);
    setError(null);
  };

  return (
    <>
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={() => toast.success('You can now use AI features')}
      />
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) clearResults();
      }}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Red Team Assistant
              </DialogTitle>
              <AISettingsDialog>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  {settings.provider === 'lovable' ? 'Lovable AI' : settings.provider.toUpperCase()}
                </Button>
              </AISettingsDialog>
            </div>
          </DialogHeader>

          {!isAuthenticated && (
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <LogIn className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Sign in required</strong> to use AI features.
                <Button 
                  variant="link" 
                  className="h-auto p-0 ml-1"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Sign in now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ttp-suggest" className="text-xs">
                <Crosshair className="w-3 h-3 mr-1" />
                TTP Suggest
              </TabsTrigger>
              <TabsTrigger value="attack-path-analyze" className="text-xs">
                <Route className="w-3 h-3 mr-1" />
                Path Analyze
              </TabsTrigger>
              <TabsTrigger value="executive-summary" className="text-xs">
                <ClipboardList className="w-3 h-3 mr-1" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="remediation-advisor" className="text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Remediation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ttp-suggest" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select a node on the diagram, then get AI suggestions for next attack techniques based on MITRE ATT&CK.
              </div>
              
              {selectedNode ? (
                <div className="p-3 rounded-lg border bg-muted/50">
                  <span className="text-xs text-muted-foreground">Selected:</span>
                  <p className="font-medium">{selectedNode.data.label}</p>
                </div>
              ) : (
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>Select a node on the diagram first</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={() => callAIAssistant('ttp-suggest')} 
                disabled={loading || !selectedNode}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crosshair className="w-4 h-4 mr-2" />}
                Suggest Next Techniques
              </Button>

              {ttpResults && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {ttpResults.map((suggestion, idx) => (
                      <div key={idx} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: suggestion.color }}>
                              {suggestion.technique}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-muted">
                              {suggestion.tactic}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddSuggestedNode(suggestion)}
                          >
                            Add Node
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="attack-path-analyze" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Analyze your attack diagram for gaps, missing steps, and alternative paths.
              </div>

              <Button 
                onClick={() => callAIAssistant('attack-path-analyze')} 
                disabled={loading || nodes.length === 0}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Route className="w-4 h-4 mr-2" />}
                Analyze Attack Path
              </Button>

              {pathResults && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {pathResults.risk_rating && (
                      <div className={`p-3 rounded-lg border ${
                        pathResults.risk_rating.level === 'critical' ? 'border-red-500 bg-red-500/10' :
                        pathResults.risk_rating.level === 'high' ? 'border-orange-500 bg-orange-500/10' :
                        pathResults.risk_rating.level === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                        'border-green-500 bg-green-500/10'
                      }`}>
                        <p className="font-medium text-sm">Risk: {pathResults.risk_rating.level.toUpperCase()}</p>
                        <p className="text-xs mt-1">{pathResults.risk_rating.explanation}</p>
                      </div>
                    )}

                    {pathResults.gaps?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Gaps Identified</h4>
                        {pathResults.gaps.map((gap, idx) => (
                          <div key={idx} className="p-2 rounded border mb-2 text-xs">
                            <p className="text-muted-foreground">Between: {gap.between?.join(' → ')}</p>
                            <p className="mt-1"><strong>Missing:</strong> {gap.missing}</p>
                            <p className="mt-1 text-primary"><strong>Suggestion:</strong> {gap.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {pathResults.improvements?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Improvements</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {pathResults.improvements.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="executive-summary" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Generate a non-technical executive summary of your attack diagram.
              </div>

              <Button 
                onClick={() => callAIAssistant('executive-summary')} 
                disabled={loading || nodes.length === 0}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Generate Executive Summary
              </Button>

              {summaryResults && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">{summaryResults.title}</h3>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">Summary</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {summaryResults.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">Business Impact</h4>
                      <p className="text-sm text-muted-foreground">{summaryResults.impact}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">Key Findings</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {summaryResults.key_findings?.map((finding, idx) => (
                          <li key={idx}>{finding}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {summaryResults.recommendations?.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const text = `${summaryResults.title}\n\n${summaryResults.summary}\n\nImpact: ${summaryResults.impact}\n\nKey Findings:\n${summaryResults.key_findings?.map(f => `• ${f}`).join('\n')}\n\nRecommendations:\n${summaryResults.recommendations?.map(r => `• ${r}`).join('\n')}`;
                        navigator.clipboard.writeText(text);
                        toast.success('Copied to clipboard');
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="remediation-advisor" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Get defensive recommendations for each step in your attack chain.
              </div>

              <Button 
                onClick={() => callAIAssistant('remediation-advisor')} 
                disabled={loading || nodes.length === 0}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Generate Remediation Plan
              </Button>

              {remediationResults && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {remediationResults.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border">
                        <p className="font-medium text-sm text-primary">{item.node_label}</p>
                        
                        <div className="mt-2 space-y-2 text-xs">
                          <div>
                            <span className="font-medium">Detection:</span>
                            <p className="text-muted-foreground">{item.detection}</p>
                          </div>
                          <div>
                            <span className="font-medium">Prevention:</span>
                            <p className="text-muted-foreground">{item.prevention}</p>
                          </div>
                          <div>
                            <span className="font-medium">Mitigation:</span>
                            <p className="text-muted-foreground">{item.mitigation}</p>
                          </div>
                          {item.controls?.length > 0 && (
                            <div>
                              <span className="font-medium">Controls:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.controls.map((ctrl, cidx) => (
                                  <span 
                                    key={cidx}
                                    className={`px-2 py-0.5 rounded text-xs ${
                                      ctrl.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                                      ctrl.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                      'bg-green-500/20 text-green-500'
                                    }`}
                                  >
                                    {ctrl.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
