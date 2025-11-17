import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Edit, Copy, Trash2, Download, Upload, Paperclip, Link as LinkIcon, Image as ImageIcon, Presentation, ChevronRight, ChevronLeft, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help & Documentation</h1>
            <p className="text-muted-foreground">Learn how to use the Red Team Diagram Editor</p>
          </div>
        </div>

        {/* Getting Started */}
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
                    Hover over any node to reveal action buttons. Click the edit button to modify the node's 
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
                    Click the delete button to remove a node and all its connections. This action also deletes 
                    associated attachments from storage.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    Add reference URLs to external resources. Enter a URL and optional name. Links open in a new 
                    tab when clicked in the attachment viewer.
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg border border-border">
                <p className="text-sm">
                  <strong>Viewing Attachments:</strong> Nodes with attachments display a numbered badge. 
                  Click the badge or the node itself to open the attachment viewer. Use arrow keys or navigation 
                  buttons to browse multiple attachments.
                </p>
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
              Connect nodes by dragging from the bottom handle of one node to the top handle of another. 
              Connections represent the flow or sequence of your attack path.
            </p>
            <div className="bg-muted/50 p-3 rounded-lg border border-border">
              <p className="text-sm">
                <strong>Tip:</strong> You can move nodes by dragging them, and the connections will automatically 
                adjust. Delete connections by selecting them and pressing Delete or Backspace.
              </p>
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
              Presentation mode provides a distraction-free view for presenting your attack diagrams to stakeholders, 
              red team members, or during briefings. Navigate through nodes sequentially with smooth transitions and focus.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Presentation className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Starting Presentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the "Present" button in the toolbar to enter presentation mode. The toolbar and controls 
                    will hide, and the first node will be highlighted and centered.
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
                    Use arrow keys (Left/Right or Up/Down) or the on-screen controls to navigate between nodes. 
                    The focused node is highlighted while others are dimmed for clarity.
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
                    Press 'F' or click the fullscreen button to toggle fullscreen for an immersive presentation 
                    experience. Perfect for large displays and projectors.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">Keyboard Shortcuts:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>Arrow Keys:</strong> Navigate between nodes (Right/Down = next, Left/Up = previous)</li>
                <li><strong>Home:</strong> Jump to first node</li>
                <li><strong>End:</strong> Jump to last node</li>
                <li><strong>F:</strong> Toggle fullscreen mode</li>
                <li><strong>Escape:</strong> Exit presentation mode</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Pro Tip:</strong> Organize your nodes in a logical sequence before presenting. 
                Presentation mode navigates nodes in the order they appear in the diagram.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Import & Export */}
        <Card>
          <CardHeader>
            <CardTitle>Import & Export</CardTitle>
            <CardDescription>Save and share your diagrams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Export Diagram</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Export" to download your diagram as a JSON file. The export includes all nodes, 
                    connections, and embedded attachment data (screenshots are saved as base64).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Import Diagram</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Import" and select a previously exported JSON file. This will load the diagram with 
                    all nodes, connections, and attachments restored.
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Auto-save:</strong> Your diagram is automatically saved to your browser's local storage 
                  as you work. It will be restored when you return to the app.
                </p>
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
                <strong>GitHub Pages Compatible:</strong> This app runs entirely in your browser, making it perfect 
                for deployment on GitHub Pages or any static hosting.
              </p>
            </div>
            <Separator className="my-3" />
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Recommendation:</strong> Regularly export your diagrams as backups. Store them in a secure 
                location, especially if they contain sensitive operational data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Tips & Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Use color coding to categorize attack phases (e.g., red for initial access, blue for persistence)</li>
              <li>Add descriptions to nodes for detailed documentation of techniques and tools used</li>
              <li>Attach screenshots of successful exploits or command outputs for reference</li>
              <li>Keep attachment file sizes under 5MB for optimal performance</li>
              <li>Use the minimap (bottom right) to navigate large diagrams</li>
              <li>Press Delete or Backspace to remove selected connections</li>
              <li>Export diagrams regularly as backups</li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Diagram Editor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Help;
