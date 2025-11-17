import { z } from 'zod';

// Attachment schema with strict validation
const AttachmentSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(['link', 'image']),
  name: z.string().min(1).max(200),
  url: z.string().max(2048).optional(),
  data: z.string().optional(), // base64 image data
  createdAt: z.number().int().positive(),
});

// Node data schema
const NodeDataSchema = z.object({
  label: z.string().min(1).max(100),
  icon: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  description: z.string().max(500).optional(),
  attachments: z.array(AttachmentSchema).max(20).optional(),
  presentationOrder: z.number().int().positive().max(1000).optional(),
});

// ReactFlow node schema
const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: NodeDataSchema,
  width: z.number().optional(),
  height: z.number().optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
});

// ReactFlow edge schema
const EdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  style: z.record(z.any()).optional(),
  markerEnd: z.any().optional(),
  label: z.string().optional(),
  labelStyle: z.record(z.any()).optional(),
  labelBgStyle: z.record(z.any()).optional(),
});

// Complete diagram schema
export const DiagramSchema = z.object({
  nodes: z.array(NodeSchema).max(1000, 'Too many nodes (max 1000)'),
  edges: z.array(EdgeSchema).max(5000, 'Too many edges (max 5000)'),
});

export type ValidatedDiagram = z.infer<typeof DiagramSchema>;
