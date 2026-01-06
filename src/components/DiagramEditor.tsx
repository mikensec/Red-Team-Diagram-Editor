import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Node,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from '@/nodes/CustomNode';
import { Toolbar } from './Toolbar';
import { AddNodeDialog } from './AddNodeDialog';
import { EditNodeDialog } from './EditNodeDialog';
import { PresentationControls } from './PresentationControls';
import { PresentationOrderManager } from './PresentationOrderManager';
import { AttackNode, Diagram, NodeData } from '@/types/Diagram';
import { saveDiagram, loadDiagram, exportDiagram, importDiagram } from '@/utils/storage';
import { exportAsHtml } from '@/utils/htmlExport';
import { useToast } from '@/hooks/use-toast';
import { useNeonMode } from '@/hooks/useNeonMode';
import { useBackground, getBackgroundStyle } from '@/hooks/useBackground';
import { saveAttachment, getAttachment, deleteNodeAttachments, clearAllAttachments } from '@/utils/indexedDB';
import { Edit, Copy, Trash2 } from 'lucide-react';

const initialNodes: AttackNode[] = [];
const initialEdges: Edge[] = [];

export const DiagramEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<{ id: string; data: NodeData } | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentPresentationIndex, setCurrentPresentationIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [orderManagerOpen, setOrderManagerOpen] = useState(false);
  const { toast } = useToast();
  const { fitView, getViewport } = useReactFlow();
  const { neonMode } = useNeonMode();
  const { settings: bgSettings } = useBackground();

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  // Load diagram on mount
  useEffect(() => {
    const loadDiagramAsync = async () => {
      const diagram = await loadDiagram();
      if (diagram) {
        setNodes(diagram.nodes || []);
        setEdges(diagram.edges || []);
        toast({
          title: 'Diagram loaded',
          description: 'Previous diagram restored with attachments',
        });
      }
    };
    loadDiagramAsync();
  }, [setNodes, setEdges, toast]);

  // Auto-save on changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      saveDiagram({ nodes: nodes as AttackNode[], edges });
    }
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Track selected nodes
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    setSelectedNodes(selectedNodes);
  }, []);

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (isPresentationMode) return;
    setSelectedEdgeId(edge.id);
  }, [isPresentationMode]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdgeId(null);
    toast({
      title: 'Connection deleted',
      description: 'Connection has been removed',
    });
  }, [setEdges, toast]);

  const handleEditNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId) as AttackNode;
    if (node) {
      setSelectedNodeData({ id: node.id, data: node.data });
      setEditDialogOpen(true);
    }
  }, [nodes]);

  const handleCloneNode = useCallback(async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId) as AttackNode;
    if (node) {
      const newNodeId = `node-${Date.now()}`;
      
      // Create a completely new node object without spreading the original
      const newNode: AttackNode = {
        id: newNodeId,
        type: 'custom',
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: {
          label: node.data.label,
          icon: node.data.icon,
          color: node.data.color,
          description: node.data.description,
          attachments: node.data.attachments ? JSON.parse(JSON.stringify(node.data.attachments)) : undefined,
          onEdit: handleEditNode,
          onClone: undefined, // Will be set after this function is defined
          onDelete: undefined, // Will be set after handleDeleteNode is defined
        },
      };

      // Clone attachments to IndexedDB with new IDs
      if (node.data.attachments) {
        for (const attachment of node.data.attachments) {
          if (attachment.type === 'image' && attachment.data) {
            const newAttId = `att-${Date.now()}-${Math.random()}`;
            await saveAttachment(newAttId, newNodeId, attachment.data);
            // Update the attachment ID in the cloned node
            const attIndex = newNode.data.attachments!.findIndex(a => a.id === attachment.id);
            if (attIndex !== -1) {
              newNode.data.attachments![attIndex].id = newAttId;
            }
          }
        }
      }

      setNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Node cloned',
        description: `Cloned ${node.data.label} node with attachments`,
      });
    }
  }, [nodes, setNodes, toast, handleEditNode]);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    // Delete attachments from IndexedDB
    await deleteNodeAttachments(nodeId);
    
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));

    toast({
      title: 'Node deleted',
      description: 'Node and its attachments have been removed',
    });
  }, [setNodes, setEdges, toast]);

  const handleAddNode = useCallback(
    async (data: NodeData) => {
      const nodeId = `node-${Date.now()}`;
      
      // Save image attachments to IndexedDB
      if (data.attachments) {
        for (const attachment of data.attachments) {
          if (attachment.type === 'image' && attachment.data) {
            await saveAttachment(attachment.id, nodeId, attachment.data);
          }
        }
      }

      // Get current viewport to position node in center of view
      const viewport = getViewport();
      const centerX = -viewport.x + (window.innerWidth / 2) / viewport.zoom;
      const centerY = -viewport.y + (window.innerHeight / 2) / viewport.zoom;

      const newNode: AttackNode = {
        id: nodeId,
        type: 'custom',
        position: { x: centerX - 100, y: centerY - 50 }, // Offset slightly to center the node
        data: {
          ...data,
          attachments: data.attachments,
          onEdit: handleEditNode,
          onClone: handleCloneNode,
          onDelete: handleDeleteNode,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Node added',
        description: `Added ${data.label} node in view`,
      });
    },
    [setNodes, toast, handleEditNode, handleCloneNode, handleDeleteNode, getViewport]
  );

  const handleExport = useCallback(() => {
    exportDiagram({ nodes: nodes as AttackNode[], edges });
    toast({
      title: 'Diagram exported',
      description: 'JSON file downloaded successfully',
    });
  }, [nodes, edges, toast]);

  const handleExportHtml = useCallback(async () => {
    try {
      await exportAsHtml({ nodes: nodes as AttackNode[], edges });
      toast({
        title: 'HTML exported',
        description: 'Interactive HTML file downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export HTML',
        variant: 'destructive',
      });
    }
  }, [nodes, edges, toast]);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const diagram = await importDiagram(file);
        setNodes(diagram.nodes || []);
        setEdges(diagram.edges || []);
        toast({
          title: 'Diagram imported',
          description: 'Diagram loaded successfully',
        });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: error instanceof Error ? error.message : 'Failed to import diagram',
          variant: 'destructive',
        });
      }
    },
    [setNodes, setEdges, toast]
  );

  const handleReset = useCallback(async () => {
    await clearAllAttachments();
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('red-team-diagram');
    toast({
      title: 'Diagram reset',
      description: 'All nodes, edges, and attachments cleared',
    });
  }, [setNodes, setEdges, toast]);

  // Presentation order management
  const presentationSortedNodes = useMemo(() => {
    return (nodes as AttackNode[])
      .filter(n => n.data.presentationOrder !== undefined)
      .sort((a, b) => (a.data.presentationOrder || 0) - (b.data.presentationOrder || 0));
  }, [nodes]);

  const handleUpdateNodeOrder = useCallback((nodeId: string, order: number | undefined) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, presentationOrder: order } }
          : node
      )
    );
  }, [setNodes]);

  const handleAutoOrder = useCallback(() => {
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.position.y !== b.position.y) {
        return a.position.y - b.position.y;
      }
      return a.position.x - b.position.x;
    });

    setNodes((nds) =>
      nds.map((node) => {
        const index = sortedNodes.findIndex((n) => n.id === node.id);
        return {
          ...node,
          data: { ...node.data, presentationOrder: index + 1 },
        };
      })
    );

    toast({
      title: 'Auto-ordered',
      description: 'Nodes ordered by position (top-to-bottom, left-to-right)',
    });
  }, [nodes, setNodes, toast]);

  // Presentation mode functions
  const handleStartPresentation = useCallback(() => {
    if (presentationSortedNodes.length === 0) {
      toast({
        title: 'No presentation order set',
        description: 'Use "Manage Order" to define which nodes to present and in what order',
        variant: 'destructive',
      });
      return;
    }
    setSelectedEdgeId(null); // Clear any selected edge
    setIsPresentationMode(true);
    setCurrentPresentationIndex(0);
    
    // Focus on first node in presentation order
    setTimeout(() => {
      fitView({
        nodes: [{ id: presentationSortedNodes[0].id }],
        duration: 800, 
        padding: 0.3,
        maxZoom: 1.5,
      });
    }, 100);
    
    toast({
      title: 'Presentation mode',
      description: 'Use arrow keys to navigate. Press Escape to exit.',
    });
  }, [presentationSortedNodes, fitView, toast]);

  const handleExitPresentation = useCallback(() => {
    setIsPresentationMode(false);
    setCurrentPresentationIndex(0);
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    fitView({ duration: 800, padding: 0.1 });
  }, [isFullscreen, fitView]);

  const handleNextNode = useCallback(() => {
    if (currentPresentationIndex < presentationSortedNodes.length - 1) {
      const nextIndex = currentPresentationIndex + 1;
      setCurrentPresentationIndex(nextIndex);
      fitView({ 
        nodes: [{ id: presentationSortedNodes[nextIndex].id }], 
        duration: 800, 
        padding: 0.3,
        maxZoom: 1.5,
      });
    }
  }, [currentPresentationIndex, presentationSortedNodes, fitView]);

  const handlePreviousNode = useCallback(() => {
    if (currentPresentationIndex > 0) {
      const prevIndex = currentPresentationIndex - 1;
      setCurrentPresentationIndex(prevIndex);
      fitView({ 
        nodes: [{ id: presentationSortedNodes[prevIndex].id }], 
        duration: 800, 
        padding: 0.3,
        maxZoom: 1.5,
      });
    }
  }, [currentPresentationIndex, presentationSortedNodes, fitView]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!isPresentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          handleExitPresentation();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          handleNextNode();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePreviousNode();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentPresentationIndex(0);
          fitView({ 
            nodes: [{ id: nodes[0].id }], 
            duration: 800, 
            padding: 0.3,
            maxZoom: 1.5,
          });
          break;
        case 'End':
          e.preventDefault();
          setCurrentPresentationIndex(nodes.length - 1);
          fitView({ 
            nodes: [{ id: nodes[nodes.length - 1].id }], 
            duration: 800, 
            padding: 0.3,
            maxZoom: 1.5,
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, handleExitPresentation, handleNextNode, handlePreviousNode, handleToggleFullscreen, nodes, fitView]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle applying AI-generated template
  const handleApplyTemplate = useCallback(async (templateNodes: AttackNode[], templateEdges: Edge[]) => {
    // Clear existing attachments first
    await clearAllAttachments();
    
    // Set the new nodes and edges
    setNodes(templateNodes);
    setEdges(templateEdges);
    
    // Save the new diagram
    const diagram: Diagram = { nodes: templateNodes, edges: templateEdges };
    await saveDiagram(diagram);
    
    // Fit the view to show all nodes
    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 100);
    
    toast({
      title: 'Template Applied',
      description: `Loaded ${templateNodes.length} nodes and ${templateEdges.length} connections.`,
    });
  }, [setNodes, setEdges, fitView, toast]);

  const handleSaveEdit = useCallback(
    async (data: NodeData) => {
      if (!selectedNodeData) return;

      // Save new image attachments to IndexedDB
      if (data.attachments) {
        for (const attachment of data.attachments) {
          if (attachment.type === 'image' && attachment.data) {
            await saveAttachment(attachment.id, selectedNodeData.id, attachment.data);
          }
        }
      }

      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeData.id
            ? { 
                ...node, 
                data: {
                  ...data,
                  onEdit: handleEditNode,
                  onClone: handleCloneNode,
                  onDelete: handleDeleteNode,
                }
              }
            : node
        )
      );

      toast({
        title: 'Node updated',
        description: 'Node properties and attachments have been updated',
      });
    },
    [selectedNodeData, setNodes, toast, handleEditNode, handleCloneNode, handleDeleteNode]
  );

  // Update handlers in existing nodes on mount
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onEdit: handleEditNode,
          onClone: handleCloneNode,
          onDelete: handleDeleteNode,
        },
      }))
    );
  }, [handleEditNode, handleCloneNode, handleDeleteNode, setNodes]);

  // Handle Delete key for edges and nodes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete nodes/edges when dialogs are open or in presentation mode
      if (isPresentationMode || dialogOpen || editDialogOpen || orderManagerOpen) return;
      
      if (e.key === 'Delete') {
        // Delete selected edges
        setEdges((eds) => eds.filter((edge) => !edge.selected));
        
        // Delete selected nodes
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          selectedNodes.forEach(node => {
            handleDeleteNode(node.id);
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, dialogOpen, editDialogOpen, orderManagerOpen, nodes, setEdges, handleDeleteNode]);

  // Modify node styles for presentation mode and pass isPresentationMode to nodes
  const presentationNodes = useMemo(() => {
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    
    if (isPresentationMode && presentationSortedNodes.length > 0) {
      const currentNodeId = presentationSortedNodes[currentPresentationIndex]?.id;
      return nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isPresentationMode,
          isSelected: selectedNodeIds.has(node.id),
        },
        style: {
          ...node.style,
          opacity: node.id !== currentNodeId ? 0.4 : 1,
          transition: 'opacity 0.3s ease',
        },
      }));
    }
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isPresentationMode: false,
        isSelected: selectedNodeIds.has(node.id),
      },
    }));
  }, [nodes, isPresentationMode, currentPresentationIndex, presentationSortedNodes, selectedNodes]);

  // Add styling to edges to show selected state
  const styledEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: edge.id === selectedEdgeId ? 3 : 2,
        stroke: edge.id === selectedEdgeId ? 'hsl(var(--destructive))' : undefined,
      },
      animated: edge.id === selectedEdgeId,
    }));
  }, [edges, selectedEdgeId]);

  const backgroundStyle = getBackgroundStyle(bgSettings);

  return (
    <div className={`w-screen h-screen relative overflow-hidden ${neonMode && bgSettings.preset === 'none' ? 'cyber-grid' : ''}`}>
      {/* Custom background layer - lowest z-index */}
      {backgroundStyle && (
        <>
          <div style={{ ...backgroundStyle, zIndex: 0 }} className="pointer-events-none" />
          <div 
            className="absolute inset-0 bg-background/10 pointer-events-none"
            style={{ zIndex: 1 }}
          />
        </>
      )}
      {!isPresentationMode && (
        <Toolbar
          onAddNodeClick={() => setDialogOpen(true)}
          onExport={handleExport}
          onExportHtml={handleExportHtml}
          onImport={handleImport}
          onReset={handleReset}
          onStartPresentation={handleStartPresentation}
          onManageOrder={() => setOrderManagerOpen(true)}
          onApplyTemplate={handleApplyTemplate}
          hasNodes={nodes.length > 0}
        />
      )}
      <AddNodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddNode={handleAddNode}
      />
      <EditNodeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
        initialData={selectedNodeData?.data || null}
      />
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <ReactFlow
          nodes={presentationNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={handleEdgeClick}
          onPaneClick={() => {
            setSelectedEdgeId(null);
            setSelectedNodes([]);
          }}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          nodesDraggable={!isPresentationMode}
          nodesConnectable={!isPresentationMode}
          elementsSelectable={!isPresentationMode}
          zoomOnScroll={!isPresentationMode}
          panOnDrag={!isPresentationMode}
          panOnScroll={isPresentationMode}
          fitView
          style={{ background: 'transparent' }}
        >
          {/* Only show ReactFlow background if no custom background */}
          {bgSettings.preset === 'none' && (
            <Background 
              color={neonMode ? "hsl(180 100% 50% / 0.1)" : "hsl(var(--muted-foreground))"}
              gap={neonMode ? 20 : 16}
              size={neonMode ? 2 : 1}
            />
          )}
          {!isPresentationMode && (
            <Controls className={neonMode ? "[&_button]:bg-card/90 [&_button]:border-primary/30 [&_button]:text-foreground [&_button:hover]:bg-card [&_button]:backdrop-blur-sm" : ""} />
          )}
          {!isPresentationMode && (
            <MiniMap
              nodeColor={(node) => {
                const nodeData = node.data as NodeData;
                return nodeData?.color || (neonMode ? 'hsl(180 100% 50%)' : '#3b82f6');
              }}
              maskColor="hsl(var(--background) / 0.8)"
              className={neonMode ? "!bg-card/90 !border-primary/30 backdrop-blur-sm" : ""}
            />
          )}
        </ReactFlow>
      </div>

      {/* Delete button for selected edge */}
      {selectedEdgeId && !isPresentationMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg border-destructive/30">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Connection selected</p>
            <button
              onClick={() => handleDeleteEdge(selectedEdgeId)}
              className="px-3 py-1 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedEdgeId(null)}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floating toolbar for selected node */}
      {selectedNodes.length === 1 && !isPresentationMode && (() => {
        const selectedNode = selectedNodes[0] as AttackNode;
        const viewport = getViewport();
        
        // Calculate screen position from node position
        const screenX = selectedNode.position.x * viewport.zoom + viewport.x;
        const screenY = selectedNode.position.y * viewport.zoom + viewport.y;
        
        return (
          <div
            className={`absolute z-50 flex gap-1 bg-card/95 backdrop-blur-sm rounded-md p-1 shadow-lg border animate-fade-in ${neonMode ? 'border-primary/50 neon-glow-cyan' : 'border-border'}`}
            style={{
              left: `${screenX}px`,
              top: `${screenY - 50}px`, // Position above the node
              transform: 'translateX(-50%)',
            }}
          >
            <button
              onClick={() => handleEditNode(selectedNode.id)}
              className="p-1.5 hover:bg-accent rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleCloneNode(selectedNode.id)}
              className="p-1.5 hover:bg-accent rounded transition-colors"
              title="Clone"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteNode(selectedNode.id)}
              className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {isPresentationMode && (
        <PresentationControls
          currentIndex={currentPresentationIndex}
          totalNodes={presentationSortedNodes.length}
          onNext={handleNextNode}
          onPrevious={handlePreviousNode}
          onExit={handleExitPresentation}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
          hasNext={currentPresentationIndex < presentationSortedNodes.length - 1}
          hasPrevious={currentPresentationIndex > 0}
        />
      )}
      <PresentationOrderManager
        open={orderManagerOpen}
        onOpenChange={setOrderManagerOpen}
        nodes={nodes as AttackNode[]}
        onUpdateOrder={handleUpdateNodeOrder}
        onAutoOrder={handleAutoOrder}
      />
    </div>
  );
};
