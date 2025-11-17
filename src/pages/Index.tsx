import { DiagramEditor } from '@/components/DiagramEditor';
import { ReactFlowProvider } from 'reactflow';

const Index = () => {
  return (
    <ReactFlowProvider>
      <DiagramEditor />
    </ReactFlowProvider>
  );
};

export default Index;
