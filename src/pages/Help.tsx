import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Copy, Trash2, Download, Upload, Paperclip, Link as LinkIcon, Image as ImageIcon, Presentation, ChevronRight, Maximize, Github, Contact, FileJson, Share2, Bot, Code, ListOrdered } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import banner from '@/assets/banner.png';
import { VERSION } from '@/version';

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="flex justify-center mb-8">
          <img src={banner} alt="Red Team Diagram Editor" className="max-w-2xl w-full h-auto" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Help & Documentation</h1>
              <p className="text-muted-foreground">Learn how to use the Red Team Diagram Editor v2.0</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://github.com/mikensec/Red-Team-Diagram-Editor', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
            <TabsTrigger value="ai-integration">AI Integration</TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Create visual attack flow diagrams for red team operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This application helps you create and manage attack diagrams for red team planning and documentation. 
                  Build flows with custom nodes, connect them visually, and attach screenshots and links for reference.
                </p>
              </CardContent>
            </Card>

            {/* Managing Nodes */}
            <Card>
              <CardHeader>
                <CardTitle>Managing Nodes</CardTitle>
                <CardDescription>Create and organize your diagram elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Add Node</h4>
                      <p className="text-sm text-muted-foreground">
                        Click the "Add Node" button in the toolbar to create a new node. Choose an icon, color, label, 
                        optional description, and add attachments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Edit className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Edit Node</h4>
                      <p className="text-sm text-muted-foreground">
                        Select any node to reveal action buttons. Click the edit button to modify the node's 
                        properties, description, or manage attachments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Copy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Clone Node</h4>
                      <p className="text-sm text-muted-foreground">
                        Click the clone button to duplicate a node with all its properties and attachments. 
                        The new node will be offset slightly from the original.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-medium">Delete Node</h4>
                      <p className="text-sm text-muted-foreground">
                        Click the delete button or press the Delete key to remove a node and all its connections. 
                        This action also deletes associated attachments from storage.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connecting Nodes */}
            <Card>
              <CardHeader>
                <CardTitle>Connecting Nodes</CardTitle>
                <CardDescription>Create flows and relationships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect nodes by hovering over a node to reveal connection handles on all four sides (top, bottom, left, right). 
                  Drag from any handle to another node to create a connection.
                </p>
                <div className="bg-muted/50 p-3 rounded-lg border border-border">
                  <p className="text-sm">
                    <strong>Tip:</strong> Connection handles appear as small circles when you hover over a node. 
                    Drag between any two handles to create a connection. Delete connections by selecting them and pressing Delete.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">General</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code className="bg-muted px-1 rounded">Delete</code> - Remove selected nodes/edges</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Presentation Mode</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code className="bg-muted px-1 rounded">←/→</code> - Previous/Next node</li>
                      <li><code className="bg-muted px-1 rounded">Home</code> - First node</li>
                      <li><code className="bg-muted px-1 rounded">End</code> - Last node</li>
                      <li><code className="bg-muted px-1 rounded">F</code> - Toggle fullscreen</li>
                      <li><code className="bg-muted px-1 rounded">Escape</code> - Exit presentation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Attachments
                </CardTitle>
                <CardDescription>Add screenshots, images, and links to nodes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ImageIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Images & Screenshots</h4>
                      <p className="text-sm text-muted-foreground">
                        Upload screenshots, images, or animated GIFs (max 5MB each). Files are stored locally in your 
                        browser using IndexedDB. Click the attachment badge on a node to view all attachments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <LinkIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Links</h4>
                      <p className="text-sm text-muted-foreground">
                        Add reference URLs to external resources like MITRE ATT&CK pages. Links are displayed on nodes 
                        and open in a new tab when clicked.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg border border-border">
                    <p className="text-sm">
                      <strong>Viewing Attachments:</strong> Nodes with attachments display a numbered badge. 
                      Click the badge to open the attachment viewer with navigation controls.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Presentation Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="w-5 h-5" />
                  Presentation Mode
                </CardTitle>
                <CardDescription>Present your diagrams professionally</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Presentation mode provides a distraction-free view for presenting attack diagrams. Navigate through 
                  nodes sequentially with smooth transitions and focus.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ListOrdered className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Manage Presentation Order</h4>
                      <p className="text-sm text-muted-foreground">
                        Click "Manage Order" to customize which nodes appear in presentations and their sequence. 
                        Use drag-and-drop or auto-order based on node positions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Navigation</h4>
                      <p className="text-sm text-muted-foreground">
                        Use arrow keys or on-screen controls to navigate. The focused node is highlighted 
                        while others are dimmed for clarity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Maximize className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Fullscreen Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Press 'F' or click the fullscreen button for an immersive experience on large displays.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Storage & Privacy</CardTitle>
                <CardDescription>How your data is stored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>100% Local Storage:</strong> All data is stored locally in your browser using localStorage 
                    and IndexedDB. Nothing is sent to external servers.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Browser-Specific:</strong> Your diagrams are tied to the browser you're using. Clearing 
                    browser data will delete your diagrams unless you've exported them.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>PWA Support:</strong> Install as a Progressive Web App for offline use in air-gapped environments.
                  </p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Recommendation:</strong> Regularly export your diagrams as backups. Store them in a secure 
                    location, especially if they contain sensitive operational data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Multiple ways to save and share your diagrams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileJson className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Export as JSON</h4>
                      <p className="text-sm text-muted-foreground">
                        Download your diagram as a JSON file for backup or to import into another browser/device. 
                        Includes all nodes, connections, and embedded attachment data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Share2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Export as Interactive HTML</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate a standalone HTML file that anyone can open in a browser. Recipients can pan, zoom, 
                        and view attachments without installing anything. Perfect for sharing with stakeholders.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    <strong>Interactive HTML:</strong> The exported HTML file works completely offline and includes 
                    all diagram data and images embedded. No internet connection required to view.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importing Diagrams
                </CardTitle>
                <CardDescription>Load diagrams from JSON files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click "Import" and select a JSON file to load a diagram. This works with:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Previously exported diagram files</li>
                  <li>Diagrams shared by team members</li>
                  <li>AI-generated diagram JSON (see AI Integration tab)</li>
                </ul>
                <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Auto-save:</strong> Your diagram is automatically saved to your browser's local storage 
                    as you work. It will be restored when you return to the app.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Integration Tab */}
          <TabsContent value="ai-integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI/LLM Integration
                </CardTitle>
                <CardDescription>Generate diagrams with AI assistants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Any AI assistant (ChatGPT, Claude, Gemini, etc.) can generate valid diagram JSON that you can 
                  import directly. Just describe your attack scenario and ask for JSON output.
                </p>

                <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-3">
                  <h4 className="font-medium">Example Prompt</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "Generate a red team attack diagram JSON for a phishing campaign that leads to domain admin 
                    compromise. Include initial access, C2 establishment, credential harvesting, lateral movement, 
                    and objective nodes. Use MITRE ATT&CK colors and include technique descriptions. Output valid 
                    JSON for the Red Team Diagram Editor."
                  </p>
                </div>

                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Pro Tip:</strong> Share the JSON schema documentation with the AI for better results. 
                    The schema is available in the GitHub repository at <code className="bg-muted px-1 rounded">docs/JSON_SCHEMA.md</code>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  JSON Schema Overview
                </CardTitle>
                <CardDescription>Structure for programmatic diagram generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-muted-foreground">
{`{
  "nodes": [
    {
      "id": "node-1",
      "type": "custom",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "Phishing Email",
        "icon": "Mail",
        "color": "#ef4444",
        "description": "Initial access via spear phishing",
        "presentationOrder": 1
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Fields</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li><strong>id:</strong> Unique identifier for each node/edge</li>
                    <li><strong>type:</strong> Must be "custom" for nodes</li>
                    <li><strong>position:</strong> X/Y coordinates (spacing: ~300px horizontal, ~200px vertical)</li>
                    <li><strong>label:</strong> Display name (max 100 chars)</li>
                    <li><strong>icon:</strong> Lucide icon name (65+ available)</li>
                    <li><strong>color:</strong> Hex color (#RRGGBB) or "transparent"</li>
                    <li><strong>description:</strong> Optional details (max 500 chars)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Popular Icons</h4>
                  <p className="text-xs text-muted-foreground">
                    Mail, Terminal, Network, Key, Shield, Database, Server, Cloud, Bug, Target, Flag, 
                    ShieldCheck, Radio, Code, User, Lock, Unlock, Fingerprint, Scan, Globe
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recommended Colors by Phase</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: '#ef4444' }} />
                      <span>Initial Access: #ef4444</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: '#f97316' }} />
                      <span>Execution: #f97316</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: '#6366f1' }} />
                      <span>C2: #6366f1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: '#22c55e' }} />
                      <span>Credential Access: #22c55e</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: '#06b6d4' }} />
                      <span>Lateral Movement: #06b6d4</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: '#10b981' }} />
                      <span>Objective: #10b981</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>Created By</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                <Contact className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">Michael Nieto</h4>
                <p className="text-sm text-muted-foreground mt-1">Red Team Attack Diagram Tool v2.0</p>
                <a 
                  href="https://www.linkedin.com/in/nietomichael/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
                >
                  <LinkIcon className="w-4 h-4" />
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 space-y-4">
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Diagram Editor
          </Button>
          <p className="text-xs text-muted-foreground">
            v{VERSION} | Made with ❤️ for the red team community
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
