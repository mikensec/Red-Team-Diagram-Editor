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
import { NodeContextMenu } from './NodeContextMenu';
import { AttackNode, Diagram, NodeData } from '@/types/Diagram';
import { saveDiagram, loadDiagram, exportDiagram, importDiagram } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

const initialNodes: AttackNode[] = [];
const initialEdges: Edge[] = [];

export const DiagramEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
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
    const diagram = loadDiagram();
    if (diagram) {
      setNodes(diagram.nodes || []);
      setEdges(diagram.edges || []);
      toast({
        title: 'Diagram loaded',
        description: 'Previous diagram restored from localStorage',
      });
    }
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

  const handleAddNode = useCallback(
    (data: NodeData) => {
      const newNode: AttackNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        data,
      };
      setNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Node added',
        description: `Added ${data.label} node`,
      });
    },
    [setNodes, toast]
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

  const handleReset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('red-team-diagram');
    toast({
      title: 'Diagram reset',
      description: 'All nodes and edges cleared',
    });
  }, [setNodes, setEdges, toast]);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const handleEditNode = useCallback(() => {
    if (!contextMenu) return;
    
    const node = nodes.find((n) => n.id === contextMenu.nodeId) as AttackNode;
    if (node) {
      setSelectedNodeData({ id: node.id, data: node.data });
      setEditDialogOpen(true);
    }
  }, [contextMenu, nodes]);

  const handleSaveEdit = useCallback(
    (data: NodeData) => {
      if (!selectedNodeData) return;

      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeData.id
            ? { ...node, data }
            : node
        )
      );

      toast({
        title: 'Node updated',
        description: 'Node properties have been updated',
      });
    },
    [selectedNodeData, setNodes, toast]
  );

  const handleCloneNode = useCallback(() => {
    if (!contextMenu) return;

    const node = nodes.find((n) => n.id === contextMenu.nodeId) as AttackNode;
    if (node) {
      const newNode: AttackNode = {
        ...node,
        id: `node-${Date.now()}`,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Node cloned',
        description: `Cloned ${node.data.label} node`,
      });
    }
  }, [contextMenu, nodes, setNodes, toast]);

  const handleDeleteNode = useCallback(() => {
    if (!contextMenu) return;

    setNodes((nds) => nds.filter((node) => node.id !== contextMenu.nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== contextMenu.nodeId && edge.target !== contextMenu.nodeId
    ));

    toast({
      title: 'Node deleted',
      description: 'Node and its connections have been removed',
    });
  }, [contextMenu, setNodes, setEdges, toast]);

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
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={handleEditNode}
          onClone={handleCloneNode}
          onDelete={handleDeleteNode}
          onClose={() => setContextMenu(null)}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={handleNodeContextMenu}
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
