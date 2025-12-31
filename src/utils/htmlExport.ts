import { Diagram, Attachment } from '@/types/Diagram';
import { getAttachment } from './indexedDB';

// Embed all image data for export
const embedImageData = async (diagram: Diagram): Promise<Diagram> => {
  const exportDiagram = JSON.parse(JSON.stringify(diagram));
  
  for (const node of exportDiagram.nodes) {
    if (node.data.attachments) {
      for (const attachment of node.data.attachments) {
        if (attachment.type === 'image' && !attachment.data) {
          const data = await getAttachment(attachment.id);
          if (data) {
            attachment.data = data;
          }
        }
      }
    }
  }
  
  return exportDiagram;
};

export const exportAsHtml = async (diagram: Diagram): Promise<void> => {
  // Embed all image data
  const exportDiagram = await embedImageData(diagram);
  
  const htmlContent = generateHtmlContent(exportDiagram);
  
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attack-diagram-${new Date().toISOString().split('T')[0]}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

const generateHtmlContent = (diagram: Diagram): string => {
  const diagramJson = JSON.stringify(diagram);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attack Diagram - Interactive Viewer</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/reactflow@11/dist/umd/index.js" crossorigin></script>
  <script src="https://unpkg.com/lucide@0.462.0/dist/umd/lucide.min.js" crossorigin></script>
  <link href="https://unpkg.com/reactflow@11/dist/style.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f1f5f9;
    }
    #root { width: 100vw; height: 100vh; }
    
    /* ReactFlow background */
    .react-flow { background: #0f172a; }
    .react-flow__background { background: #0f172a; }
    
    /* Node styles - high contrast dark theme */
    .node-container {
      position: relative;
      padding: 14px 18px;
      border-radius: 10px;
      min-width: 180px;
      max-width: 280px;
      transition: all 0.2s ease;
      background: #1e293b;
      border: 2px solid;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .node-container.transparent {
      background: rgba(15, 23, 42, 0.8);
      border: 1px dashed #475569;
      box-shadow: none;
    }
    .node-container:hover { 
      transform: scale(1.03);
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    }
    .node-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      text-align: center;
    }
    .node-icon { flex-shrink: 0; }
    .node-icon svg { width: 24px; height: 24px; stroke-width: 2; }
    .node-label { 
      font-weight: 600; 
      font-size: 14px; 
      color: #f8fafc;
      line-height: 1.3;
    }
    .node-description { 
      font-size: 12px; 
      color: #94a3b8; 
      margin-top: 4px;
      line-height: 1.4;
    }
    .node-links { margin-top: 6px; }
    .node-link {
      display: block;
      font-size: 11px;
      color: #60a5fa;
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
      padding: 2px 0;
    }
    .node-link:hover { 
      text-decoration: underline;
      color: #93c5fd;
    }
    
    /* Attachment badge */
    .attachment-badge {
      position: absolute;
      top: -10px;
      right: -10px;
      background: #3b82f6;
      color: #ffffff;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
      z-index: 10;
      border: 2px solid #0f172a;
    }
    .attachment-badge:hover { 
      transform: scale(1.15);
      background: #2563eb;
    }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      backdrop-filter: blur(4px);
    }
    .modal-content {
      background: #1e293b;
      border-radius: 16px;
      max-width: 800px;
      width: 90vw;
      max-height: 90vh;
      overflow: auto;
      border: 1px solid #334155;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid #334155;
      background: #0f172a;
      border-radius: 16px 16px 0 0;
    }
    .modal-title { 
      font-weight: 600; 
      font-size: 18px;
      color: #f8fafc;
    }
    .modal-close {
      background: #334155;
      border: none;
      color: #f8fafc;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 16px;
      transition: background 0.2s;
    }
    .modal-close:hover { background: #475569; }
    .modal-body { padding: 24px; }
    
    /* Attachment list */
    .attachment-list { display: flex; flex-direction: column; gap: 16px; }
    .attachment-item {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      background: #0f172a;
      border-radius: 12px;
      border: 1px solid #334155;
    }
    .attachment-name { 
      font-weight: 600; 
      font-size: 14px;
      color: #e2e8f0;
    }
    .attachment-image {
      max-width: 100%;
      max-height: 500px;
      object-fit: contain;
      border-radius: 8px;
      background: #020617;
    }
    .attachment-link {
      color: #60a5fa;
      text-decoration: none;
      word-break: break-all;
      font-size: 14px;
    }
    .attachment-link:hover { 
      text-decoration: underline;
      color: #93c5fd;
    }
    
    /* Controls info */
    .controls-info {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #1e293b;
      padding: 14px 18px;
      border-radius: 10px;
      font-size: 13px;
      color: #94a3b8;
      border: 1px solid #334155;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    /* Title bar */
    .title-bar {
      position: fixed;
      top: 20px;
      left: 20px;
      background: #1e293b;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #f8fafc;
      border: 1px solid #334155;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .title-bar-icon {
      width: 20px;
      height: 20px;
      color: #3b82f6;
    }
    
    /* Hide ReactFlow handles in viewer */
    .react-flow__handle { display: none; }
    
    /* ReactFlow controls styling */
    .react-flow__controls {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .react-flow__controls-button {
      background: #1e293b;
      border: none;
      color: #f8fafc;
    }
    .react-flow__controls-button:hover {
      background: #334155;
    }
    .react-flow__controls-button svg {
      fill: #f8fafc;
    }
    
    /* MiniMap styling */
    .react-flow__minimap {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    const diagramData = ${diagramJson};
    
    const { useState, useCallback, createElement: h } = React;
    const { ReactFlow, Background, Controls, MiniMap } = window.ReactFlow;
    
    // Extended icon mapping using Lucide
    const iconMap = {
      'Shield': 'shield',
      'ShieldAlert': 'shield-alert',
      'ShieldCheck': 'shield-check',
      'ShieldQuestion': 'shield-question',
      'Zap': 'zap',
      'Target': 'target',
      'Crosshair': 'crosshair',
      'Network': 'network',
      'Lock': 'lock',
      'Unlock': 'unlock',
      'Key': 'key',
      'Fingerprint': 'fingerprint',
      'Database': 'database',
      'Server': 'server',
      'Cloud': 'cloud',
      'HardDrive': 'hard-drive',
      'Terminal': 'terminal',
      'Code': 'code',
      'FileCode': 'file-code',
      'Braces': 'braces',
      'Binary': 'binary',
      'Hash': 'hash',
      'Bug': 'bug',
      'AlertTriangle': 'alert-triangle',
      'AlertCircle': 'alert-circle',
      'Flag': 'flag',
      'CheckCircle': 'check-circle',
      'XCircle': 'x-circle',
      'Mail': 'mail',
      'FileText': 'file-text',
      'Folder': 'folder',
      'Download': 'download',
      'Upload': 'upload',
      'Settings': 'settings',
      'Command': 'command',
      'User': 'user',
      'Users': 'users',
      'Eye': 'eye',
      'EyeOff': 'eye-off',
      'Scan': 'scan',
      'ScanLine': 'scan-line',
      'Search': 'search',
      'Filter': 'filter',
      'Activity': 'activity',
      'Globe': 'globe',
      'Globe2': 'globe-2',
      'Compass': 'compass',
      'Wifi': 'wifi',
      'Radio': 'radio',
      'Signal': 'signal',
      'Radar': 'radar',
      'Satellite': 'satellite',
      'Router': 'router',
      'Bluetooth': 'bluetooth',
      'Cast': 'cast',
      'Rss': 'rss',
      'Webhook': 'webhook',
      'Cpu': 'cpu',
      'Boxes': 'boxes',
      'Layers': 'layers',
      'Package': 'package',
      'PackageCheck': 'package-check',
      'Smartphone': 'smartphone',
      'Laptop': 'laptop',
      'MonitorSmartphone': 'monitor-smartphone',
      'Link': 'link',
      'Unlink': 'unlink',
      'ExternalLink': 'external-link',
      'Share2': 'share-2',
      'Navigation': 'navigation',
      'Power': 'power',
      'Plug': 'plug',
      'Usb': 'usb',
      'Chrome': 'chrome',
      'GitBranch': 'git-branch',
      'GitCommit': 'git-commit',
      'Workflow': 'workflow'
    };
    
    // Create icon element
    function createIcon(iconName, color) {
      const lucideName = iconMap[iconName] || 'circle';
      return h('div', { 
        className: 'node-icon',
        style: { color },
        dangerouslySetInnerHTML: { __html: '<i data-lucide="' + lucideName + '" style="width:24px;height:24px;"></i>' }
      });
    }
    
    // Attachment Modal Component
    function AttachmentModal({ attachments, onClose }) {
      return h('div', { className: 'modal-overlay', onClick: onClose },
        h('div', { className: 'modal-content', onClick: e => e.stopPropagation() },
          h('div', { className: 'modal-header' },
            h('span', { className: 'modal-title' }, 'Attachments (' + attachments.length + ')'),
            h('button', { className: 'modal-close', onClick: onClose }, '✕')
          ),
          h('div', { className: 'modal-body' },
            h('div', { className: 'attachment-list' },
              attachments.map(att => 
                h('div', { key: att.id, className: 'attachment-item' },
                  h('div', { className: 'attachment-name' }, att.name),
                  att.type === 'image' && att.data
                    ? h('img', { className: 'attachment-image', src: att.data, alt: att.name })
                    : att.type === 'link' && att.url
                      ? h('a', { 
                          className: 'attachment-link', 
                          href: att.url, 
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        }, att.url)
                      : null
                )
              )
            )
          )
        )
      );
    }
    
    // Custom Node Component
    function CustomNode({ data }) {
      const [showModal, setShowModal] = useState(false);
      const hasAttachments = data.attachments && data.attachments.length > 0;
      const urlAttachments = (data.attachments || []).filter(att => att.type === 'link');
      const isTransparent = data.color === 'transparent';
      
      return h('div', null,
        h('div', { 
          className: 'node-container' + (isTransparent ? ' transparent' : ''),
          style: isTransparent ? {} : { 
            borderColor: data.color,
            boxShadow: '0 0 20px ' + data.color + '30, 0 4px 20px rgba(0,0,0,0.4)'
          }
        },
          hasAttachments && h('div', { 
            className: 'attachment-badge',
            onClick: () => setShowModal(true)
          }, data.attachments.length),
          h('div', { className: 'node-content' },
            createIcon(data.icon, isTransparent ? '#94a3b8' : data.color),
            h('div', null,
              h('div', { className: 'node-label' }, data.label),
              data.description && h('div', { className: 'node-description' }, data.description),
              urlAttachments.length > 0 && h('div', { className: 'node-links' },
                urlAttachments.map(att => 
                  h('a', { 
                    key: att.id,
                    className: 'node-link',
                    href: att.url,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  }, att.url)
                )
              )
            )
          )
        ),
        showModal && hasAttachments && h(AttachmentModal, {
          attachments: data.attachments,
          onClose: () => setShowModal(false)
        })
      );
    }
    
    const nodeTypes = { custom: CustomNode };
    
    // Main App Component
    function App() {
      const nodes = diagramData.nodes.map(node => ({
        ...node,
        data: { ...node.data, onEdit: undefined, onClone: undefined, onDelete: undefined }
      }));
      const edges = diagramData.edges;
      
      return h('div', { style: { width: '100%', height: '100%' } },
        h(ReactFlow, {
          nodes,
          edges,
          nodeTypes,
          fitView: true,
          nodesDraggable: true,
          nodesConnectable: false,
          elementsSelectable: true,
          panOnScroll: true,
          zoomOnScroll: true,
          defaultEdgeOptions: { 
            type: 'smoothstep',
            style: { stroke: '#64748b', strokeWidth: 2 }
          }
        },
          h(Background, { color: '#334155', gap: 24, size: 1 }),
          h(Controls, {}),
          h(MiniMap, { 
            nodeColor: function(n) { return n.data.color === 'transparent' ? '#64748b' : n.data.color; },
            maskColor: 'rgba(15, 23, 42, 0.9)',
            style: { background: '#1e293b' }
          })
        ),
        h('div', { className: 'title-bar' },
          h('i', { 'data-lucide': 'workflow', className: 'title-bar-icon' }),
          'Attack Diagram Viewer'
        ),
        h('div', { className: 'controls-info' },
          'Pan: Click + Drag | Zoom: Scroll | Click badges to view attachments'
        )
      );
    }
    
    // Render
    ReactDOM.createRoot(document.getElementById('root')).render(h(App));
    
    // Initialize Lucide icons after render
    setTimeout(() => lucide.createIcons(), 100);
  </script>
</body>
</html>`;
};
