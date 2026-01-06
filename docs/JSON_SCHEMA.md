# Red Team Diagram JSON Schema

This document describes the JSON format for importing diagrams into the Red Team Diagram Editor. Use this schema to programmatically generate diagrams or to enable AI/LLM assistants to create attack flow diagrams.

## Quick Start for AI Assistants

When asked to generate a red team diagram, output valid JSON matching this structure:

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "custom",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "Phishing Email",
        "icon": "Mail",
        "color": "#ef4444",
        "description": "Initial access via spear phishing"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}
```

## Complete Schema

### Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nodes` | Array | Yes | Array of node objects (max 1000) |
| `edges` | Array | Yes | Array of edge objects (max 5000) |

### Node Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., "node-1", "initial-access") |
| `type` | string | Yes | Must be `"custom"` |
| `position` | object | Yes | `{ "x": number, "y": number }` coordinates |
| `data` | object | Yes | Node content and styling |

### Node Data Object

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `label` | string | Yes | 1-100 chars | Display name of the node |
| `icon` | string | Yes | See icon list | Lucide icon name |
| `color` | string | Yes | Hex or "transparent" | Node border/accent color |
| `description` | string | No | Max 500 chars | Additional details |
| `attachments` | array | No | Max 20 items | Links and images |
| `presentationOrder` | number | No | Positive integer | Order in presentation mode |

### Edge Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `source` | string | Yes | ID of source node |
| `target` | string | Yes | ID of target node |
| `type` | string | No | Edge style (default: smoothstep) |
| `animated` | boolean | No | Animate the edge |
| `label` | string | No | Text label on edge |

### Attachment Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (1-100 chars) |
| `type` | string | Yes | `"link"` or `"image"` |
| `name` | string | Yes | Display name (1-200 chars) |
| `url` | string | Conditional | Required for type "link" (max 2048 chars) |
| `data` | string | Conditional | Base64 data for type "image" |
| `createdAt` | number | Yes | Unix timestamp in milliseconds |

## Available Icons

Use these exact names for the `icon` field:

### Security & Protection
- `Shield`, `ShieldAlert`, `ShieldCheck`, `ShieldQuestion`
- `Lock`, `Unlock`, `Key`, `Fingerprint`

### Targets & Objectives
- `Target`, `Crosshair`, `Flag`, `CheckCircle`, `XCircle`

### Network & Infrastructure
- `Network`, `Server`, `Database`, `Cloud`, `HardDrive`
- `Router`, `Wifi`, `Radio`, `Signal`, `Radar`, `Satellite`
- `Globe`, `Globe2`, `Compass`

### Devices
- `Cpu`, `Smartphone`, `Laptop`, `MonitorSmartphone`
- `Plug`, `Power`, `Usb`, `Bluetooth`, `Cast`

### Code & Development
- `Terminal`, `Code`, `FileCode`, `Braces`, `Binary`, `Hash`
- `Bug`, `Command`, `GitBranch`, `GitCommit`, `Workflow`

### Files & Communication
- `Mail`, `FileText`, `Folder`, `Download`, `Upload`
- `Rss`, `Webhook`

### Users & Access
- `User`, `Users`, `Eye`, `EyeOff`, `Scan`, `ScanLine`

### Alerts & Status
- `AlertTriangle`, `AlertCircle`, `Zap`, `Activity`

### Connectivity
- `Link`, `Unlink`, `ExternalLink`, `Share2`, `Navigation`

### Other
- `Settings`, `Search`, `Filter`, `Chrome`
- `Boxes`, `Layers`, `Package`, `PackageCheck`

## Color Recommendations

Use colors to categorize attack phases:

| Phase | Recommended Color | Hex Code |
|-------|------------------|----------|
| Initial Access | Red | `#ef4444` |
| Execution | Orange | `#f97316` |
| Persistence | Amber | `#f59e0b` |
| Privilege Escalation | Yellow | `#eab308` |
| Defense Evasion | Lime | `#84cc16` |
| Credential Access | Green | `#22c55e` |
| Discovery | Teal | `#14b8a6` |
| Lateral Movement | Cyan | `#06b6d4` |
| Collection | Blue | `#3b82f6` |
| Command & Control | Indigo | `#6366f1` |
| Exfiltration | Purple | `#a855f7` |
| Impact | Pink | `#ec4899` |
| Objective/Goal | Emerald | `#10b981` |
| Transparent (text only) | - | `transparent` |

## Layout Guidelines

For readable diagrams, follow these positioning guidelines:

- **Horizontal spacing**: 250-300 pixels between nodes
- **Vertical spacing**: 150-200 pixels between rows
- **Flow direction**: Left-to-right or top-to-bottom
- **Starting position**: Begin at `{ "x": 0, "y": 0 }` or center of canvas

### Example Layout Patterns

**Linear Flow (left to right):**
```
Node 1 (0, 0) → Node 2 (300, 0) → Node 3 (600, 0)
```

**Tree Structure:**
```
                Node 1 (300, 0)
                     ↓
        Node 2 (0, 200)    Node 3 (600, 200)
```

**Diamond Pattern:**
```
                Node 1 (300, 0)
                     ↓
    Node 2 (0, 200)     Node 3 (600, 200)
                     ↓
                Node 4 (300, 400)
```

## Complete Example

Here's a full example of a phishing attack chain:

```json
{
  "nodes": [
    {
      "id": "phishing",
      "type": "custom",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "Phishing Email",
        "icon": "Mail",
        "color": "#ef4444",
        "description": "Spear phishing with malicious attachment targeting finance team",
        "presentationOrder": 1
      }
    },
    {
      "id": "macro-execution",
      "type": "custom",
      "position": { "x": 300, "y": 0 },
      "data": {
        "label": "Macro Execution",
        "icon": "Code",
        "color": "#f97316",
        "description": "VBA macro downloads and executes payload",
        "presentationOrder": 2
      }
    },
    {
      "id": "c2-beacon",
      "type": "custom",
      "position": { "x": 600, "y": 0 },
      "data": {
        "label": "C2 Beacon",
        "icon": "Radio",
        "color": "#6366f1",
        "description": "Cobalt Strike beacon established over HTTPS",
        "presentationOrder": 3,
        "attachments": [
          {
            "id": "att-1",
            "type": "link",
            "name": "MITRE T1071.001",
            "url": "https://attack.mitre.org/techniques/T1071/001/",
            "createdAt": 1704067200000
          }
        ]
      }
    },
    {
      "id": "credential-dump",
      "type": "custom",
      "position": { "x": 300, "y": 200 },
      "data": {
        "label": "Credential Harvesting",
        "icon": "Key",
        "color": "#22c55e",
        "description": "Mimikatz for LSASS memory dump",
        "presentationOrder": 4
      }
    },
    {
      "id": "lateral-movement",
      "type": "custom",
      "position": { "x": 600, "y": 200 },
      "data": {
        "label": "Lateral Movement",
        "icon": "Network",
        "color": "#06b6d4",
        "description": "Pass-the-hash to domain controller",
        "presentationOrder": 5
      }
    },
    {
      "id": "domain-admin",
      "type": "custom",
      "position": { "x": 450, "y": 400 },
      "data": {
        "label": "Domain Admin",
        "icon": "ShieldCheck",
        "color": "#10b981",
        "description": "Full domain compromise achieved",
        "presentationOrder": 6
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "phishing",
      "target": "macro-execution"
    },
    {
      "id": "e2",
      "source": "macro-execution",
      "target": "c2-beacon"
    },
    {
      "id": "e3",
      "source": "c2-beacon",
      "target": "credential-dump"
    },
    {
      "id": "e4",
      "source": "credential-dump",
      "target": "lateral-movement"
    },
    {
      "id": "e5",
      "source": "lateral-movement",
      "target": "domain-admin"
    }
  ]
}
```

## AI Prompt Templates

### Basic Attack Chain
```
Generate a red team diagram JSON showing [attack scenario]. Include:
- Initial access vector
- Execution method
- Persistence mechanism
- Objective

Use appropriate MITRE ATT&CK colors and icons. Output valid JSON only.
```

### Detailed TTP Mapping
```
Create a red team diagram JSON for [specific attack] with:
- Each node labeled with technique name
- Descriptions containing MITRE ATT&CK IDs
- Link attachments to relevant MITRE pages
- Presentation order following attack flow
- Colors matching ATT&CK tactic categories

Output valid JSON matching the Red Team Diagram Editor schema.
```

### Multi-Path Attack
```
Generate a red team diagram JSON showing [attack with multiple paths].
Include branching paths where:
- Path A: [first attack chain]
- Path B: [alternative approach]
Both paths should converge at [objective].

Use tree layout with proper spacing. Output valid JSON only.
```

## Validation

The application validates imported JSON against these rules:

1. **Required fields**: All required fields must be present
2. **String lengths**: Labels max 100 chars, descriptions max 500 chars
3. **Color format**: Must be valid hex (`#RRGGBB`) or `"transparent"`
4. **Icon names**: Must match an available icon exactly (case-sensitive)
5. **Node limits**: Maximum 1000 nodes
6. **Edge limits**: Maximum 5000 edges
7. **Attachment limits**: Maximum 20 attachments per node
8. **URL validation**: Link URLs must use http:// or https://

## Importing Diagrams

1. Generate or receive valid JSON
2. Save as a `.json` file
3. In the app, click **Import** in the toolbar
4. Select your JSON file
5. The diagram loads with all nodes, edges, and attachments

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid diagram format" | JSON doesn't match schema | Check required fields and types |
| "Invalid color" | Color not hex or transparent | Use `#RRGGBB` format |
| "Too many nodes" | Over 1000 nodes | Split into multiple diagrams |
| "Unsafe URL protocol" | URL not http/https | Use only http:// or https:// URLs |

---

For more help, see the [main README](../README.md) or open an issue on GitHub.
