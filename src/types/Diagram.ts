import { Node, Edge } from 'reactflow';

export interface NodeData {
  label: string;
  icon: string;
  color: string;
  onEdit?: (nodeId: string) => void;
  onClone?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export interface AttackNode extends Node {
  type: 'custom';
  data: NodeData;
}

export interface Diagram {
  nodes: AttackNode[];
  edges: Edge[];
}

// Predefined color palette for quick selection
export const PRESET_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];
