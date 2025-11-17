import { Node, Edge } from 'reactflow';

export type NodeType = 
  | 'initial-access'
  | 'c2'
  | 'lateral-movement'
  | 'execution'
  | 'privilege-escalation'
  | 'objective';

export interface AttackNode extends Node {
  type: NodeType;
  data: {
    label: string;
  };
}

export interface Diagram {
  nodes: AttackNode[];
  edges: Edge[];
}

export const NODE_TYPES: { value: NodeType; label: string; color: string }[] = [
  { value: 'initial-access', label: 'Initial Access', color: 'node-initial-access' },
  { value: 'c2', label: 'C2', color: 'node-c2' },
  { value: 'lateral-movement', label: 'Lateral Movement', color: 'node-lateral' },
  { value: 'execution', label: 'Execution', color: 'node-execution' },
  { value: 'privilege-escalation', label: 'Privilege Escalation', color: 'node-privilege' },
  { value: 'objective', label: 'Objective', color: 'node-objective' },
];
