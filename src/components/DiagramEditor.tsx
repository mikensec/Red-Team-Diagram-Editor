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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from '@/nodes/CustomNode';
import { Toolbar } from './Toolbar';
import { AddNodeDialog } from './AddNodeDialog';
import { AttackNode, Diagram, NodeData } from '@/types/Diagram';
import { saveDiagram, loadDiagram, exportDiagram, importDiagram } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

const initialNodes: AttackNode[] = [];
const initialEdges: Edge[] = [];

export const DiagramEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dialogOpen, setDialogOpen] = useState(false);
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
