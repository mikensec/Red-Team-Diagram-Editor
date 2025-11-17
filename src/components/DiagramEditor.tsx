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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from '@/nodes/CustomNode';
import { Toolbar } from './Toolbar';
import { AddNodeDialog } from './AddNodeDialog';
import { EditNodeDialog } from './EditNodeDialog';
import { AttackNode, Diagram, NodeData } from '@/types/Diagram';
import { saveDiagram, loadDiagram, exportDiagram, importDiagram } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { saveAttachment, getAttachment, deleteNodeAttachments, clearAllAttachments } from '@/utils/indexedDB';

const initialNodes: AttackNode[] = [];
const initialEdges: Edge[] = [];

export const DiagramEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<{ id: string; data: NodeData } | null>(null);
  const { toast } = useToast();

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
      const newNode: AttackNode = {
        ...node,
        id: newNodeId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: {
          ...node.data,
          attachments: node.data.attachments ? [...node.data.attachments] : undefined,
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
  }, [nodes, setNodes, toast]);

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

  return (
    <div className="w-screen h-screen">
      <Toolbar
        onAddNodeClick={() => setDialogOpen(true)}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
      />
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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="hsl(var(--muted-foreground))" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const nodeData = node.data as NodeData;
            return nodeData?.color || '#3b82f6';
          }}
          maskColor="hsl(var(--background) / 0.9)"
        />
      </ReactFlow>
    </div>
  );
};
