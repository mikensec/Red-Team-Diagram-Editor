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
import { AttackNode, Diagram, NodeData } from '@/types/Diagram';
import { saveDiagram, loadDiagram, exportDiagram, importDiagram } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { useNeonMode } from '@/hooks/useNeonMode';
import { useBackground, getBackgroundStyle } from '@/hooks/useBackground';
import { saveAttachment, getAttachment, deleteNodeAttachments, clearAllAttachments } from '@/utils/indexedDB';

const initialNodes: AttackNode[] = [];
const initialEdges: Edge[] = [];

export const DiagramEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<{ id: string; data: NodeData } | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentPresentationIndex, setCurrentPresentationIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const { fitView } = useReactFlow();
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
          x: node.position.x + 150,
          y: node.position.y + 150,
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

      const newNode: AttackNode = {
        id: nodeId,
        type: 'custom',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
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
        description: `Added ${data.label} node`,
      });
    },
    [setNodes, toast, handleEditNode, handleCloneNode, handleDeleteNode]
  );

  const handleExport = useCallback(() => {
    exportDiagram({ nodes: nodes as AttackNode[], edges });
    toast({
      title: 'Diagram exported',
      description: 'JSON file downloaded successfully',
    });
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

  // Presentation mode functions
  const handleStartPresentation = useCallback(() => {
    if (nodes.length === 0) {
      toast({
        title: 'No nodes to present',
        description: 'Add some nodes before starting presentation mode',
        variant: 'destructive',
      });
      return;
    }
    setIsPresentationMode(true);
    setCurrentPresentationIndex(0);
    
    // Focus on first node
    setTimeout(() => {
      fitView({ 
        nodes: [{ id: nodes[0].id }], 
        duration: 800, 
        padding: 0.3,
        maxZoom: 1.5,
      });
    }, 100);
    
    toast({
      title: 'Presentation mode',
      description: 'Use arrow keys to navigate. Press Escape to exit.',
    });
  }, [nodes, fitView, toast]);

  const handleExitPresentation = useCallback(() => {
    setIsPresentationMode(false);
    setCurrentPresentationIndex(0);
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    fitView({ duration: 800, padding: 0.1 });
  }, [isFullscreen, fitView]);

  const handleNextNode = useCallback(() => {
    if (currentPresentationIndex < nodes.length - 1) {
      const nextIndex = currentPresentationIndex + 1;
      setCurrentPresentationIndex(nextIndex);
      fitView({ 
        nodes: [{ id: nodes[nextIndex].id }], 
        duration: 800, 
        padding: 0.3,
        maxZoom: 1.5,
      });
    }
  }, [currentPresentationIndex, nodes, fitView]);

  const handlePreviousNode = useCallback(() => {
    if (currentPresentationIndex > 0) {
      const prevIndex = currentPresentationIndex - 1;
      setCurrentPresentationIndex(prevIndex);
      fitView({ 
        nodes: [{ id: nodes[prevIndex].id }], 
        duration: 800, 
        padding: 0.3,
        maxZoom: 1.5,
      });
    }
  }, [currentPresentationIndex, nodes, fitView]);

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

  // Modify node styles for presentation mode
  const presentationNodes = useMemo(() => {
    if (!isPresentationMode) return nodes;
    
    return nodes.map((node, index) => ({
      ...node,
      style: {
        ...node.style,
        opacity: index === currentPresentationIndex ? 1 : 0.4,
        transition: 'opacity 0.3s ease',
      },
    }));
  }, [nodes, isPresentationMode, currentPresentationIndex]);

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
          onImport={handleImport}
          onReset={handleReset}
          onStartPresentation={handleStartPresentation}
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
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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

      {isPresentationMode && (
        <PresentationControls
          currentIndex={currentPresentationIndex}
          totalNodes={nodes.length}
          onNext={handleNextNode}
          onPrevious={handlePreviousNode}
          onExit={handleExitPresentation}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
          hasNext={currentPresentationIndex < nodes.length - 1}
          hasPrevious={currentPresentationIndex > 0}
        />
      )}
    </div>
  );
};
