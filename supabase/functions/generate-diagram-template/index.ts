import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template categories with pre-defined prompts (NO user data ever sent)
const TEMPLATE_CATEGORIES: Record<string, { name: string; prompt: string }> = {
  'phishing-chain': {
    name: 'Phishing Attack Chain',
    prompt: 'Generate a red team diagram for a phishing attack chain with 5-6 nodes: initial phishing email, payload delivery (macro or link), command and control establishment, credential harvesting, lateral movement, and data exfiltration. Use a left-to-right flow.'
  },
  'ransomware': {
    name: 'Ransomware Deployment',
    prompt: 'Generate a red team diagram for ransomware deployment with 5-6 nodes: initial access (phishing or exploit), privilege escalation, disable security tools, deploy ransomware payload, encrypt files, and ransom demand/negotiation. Use top-to-bottom flow.'
  },
  'supply-chain': {
    name: 'Supply Chain Attack',
    prompt: 'Generate a red team diagram for a supply chain attack with 5-6 nodes: vendor/supplier compromise, inject malicious code into update, distribution to customers, backdoor activation, persistence establishment, and command and control. Use left-to-right flow.'
  },
  'credential-theft': {
    name: 'Credential Theft Campaign',
    prompt: 'Generate a red team diagram for credential theft with 5-6 nodes: reconnaissance, credential phishing page deployment, user credential capture, credential validation, account takeover, and privilege escalation. Use left-to-right flow.'
  },
  'insider-threat': {
    name: 'Insider Threat Scenario',
    prompt: 'Generate a red team diagram for insider threat with 5-6 nodes: disgruntled employee identification, access abuse, data collection, exfiltration preparation, data transfer to external storage, and cover tracks. Use top-to-bottom flow.'
  },
  'web-app-attack': {
    name: 'Web Application Attack',
    prompt: 'Generate a red team diagram for web application attack with 5-6 nodes: reconnaissance and scanning, vulnerability identification (SQLi/XSS), initial exploitation, web shell deployment, database access, and data exfiltration. Use left-to-right flow.'
  },
  'cloud-attack': {
    name: 'Cloud Infrastructure Attack',
    prompt: 'Generate a red team diagram for cloud infrastructure attack with 5-6 nodes: cloud credential theft, initial cloud access, privilege escalation in cloud, resource enumeration, data access, and persistent backdoor creation. Use left-to-right flow.'
  },
  'network-pentest': {
    name: 'Network Penetration',
    prompt: 'Generate a red team diagram for network penetration with 5-6 nodes: external reconnaissance, perimeter breach (VPN or exposed service), internal network access, network enumeration, domain controller compromise, and full network control. Use top-to-bottom flow.'
  },
  'social-engineering': {
    name: 'Social Engineering Campaign',
    prompt: 'Generate a red team diagram for social engineering with 5-6 nodes: target research and OSINT, pretext development, initial contact (phone/email), trust building, information/access extraction, and exploitation of gained access. Use left-to-right flow.'
  },
  'zero-day': {
    name: 'Zero-Day Exploitation',
    prompt: 'Generate a red team diagram for zero-day exploitation with 5-6 nodes: vulnerability discovery, exploit development, target identification, exploit delivery, code execution, and persistence establishment. Use left-to-right flow.'
  }
};

const SYSTEM_PROMPT = `You are a red team diagram generator. You output ONLY valid JSON for attack flow diagrams. Never include any explanations or markdown - just raw JSON.

Follow this exact schema:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "custom",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Node Name (max 100 chars)",
        "icon": "IconName",
        "color": "#hexcolor",
        "description": "Brief description of this step"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id"
    }
  ]
}

CRITICAL Layout guidelines - use GENEROUS spacing:
- Left-to-right flow: Start at x:50, increment x by 350 for each node in sequence, keep y consistent (around 100)
- Top-to-bottom flow: Start at y:50, increment y by 200 for each node in sequence, keep x consistent (around 100)
- For branching paths, offset perpendicular axis by ±200 from main path
- Minimum spacing between any two nodes: 300px horizontally, 180px vertically

Available icons (use exact names):
- Security: Shield, ShieldAlert, ShieldCheck, Lock, Unlock, Key, Fingerprint
- Targets: Target, Crosshair, Flag, CheckCircle, XCircle
- Network: Network, Server, Database, Cloud, HardDrive, Globe, Wifi, Router
- Devices: Cpu, Smartphone, Laptop, Plug, Usb
- Code: Terminal, Code, FileCode, Bug, Binary, Command, Workflow
- Files: Mail, FileText, Folder, Download, Upload
- Users: User, Users, Eye, EyeOff, Scan
- Alerts: AlertTriangle, AlertCircle, Zap, Activity
- Other: Link, ExternalLink, Settings, Search, Package

Color recommendations by attack phase:
- Initial Access: #ef4444 (red)
- Execution: #f97316 (orange)
- Persistence: #f59e0b (amber)
- Privilege Escalation: #eab308 (yellow)
- Defense Evasion: #84cc16 (lime)
- Credential Access: #22c55e (green)
- Discovery: #14b8a6 (teal)
- Lateral Movement: #06b6d4 (cyan)
- Collection: #3b82f6 (blue)
- Command & Control: #6366f1 (indigo)
- Exfiltration: #a855f7 (purple)
- Impact: #ec4899 (pink)
- Objective/Success: #10b981 (emerald)

Output ONLY the JSON object, no markdown code blocks, no explanations.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryId } = await req.json();
    
    if (!categoryId || !TEMPLATE_CATEGORIES[categoryId]) {
      return new Response(
        JSON.stringify({ error: 'Invalid template category' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const template = TEMPLATE_CATEGORIES[categoryId];
    console.log(`Generating template for category: ${categoryId} - ${template.name}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: template.prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate template' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'AI returned empty response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response (handle potential markdown code blocks)
    let diagramJson: string = generatedContent;
    
    // Remove markdown code blocks if present
    if (diagramJson.includes('```')) {
      const jsonMatch = diagramJson.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        diagramJson = jsonMatch[1].trim();
      }
    }

    // Validate it's valid JSON
    let parsedDiagram;
    try {
      parsedDiagram = JSON.parse(diagramJson);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError, diagramJson);
      return new Response(
        JSON.stringify({ error: 'AI generated invalid diagram format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic validation
    if (!parsedDiagram.nodes || !Array.isArray(parsedDiagram.nodes)) {
      return new Response(
        JSON.stringify({ error: 'Invalid diagram: missing nodes array' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!parsedDiagram.edges || !Array.isArray(parsedDiagram.edges)) {
      parsedDiagram.edges = [];
    }

    // Build node position lookup for edge handle calculation
    const nodePositions: Record<string, { x: number; y: number }> = {};
    for (const node of parsedDiagram.nodes) {
      if (node.id && node.position) {
        nodePositions[node.id] = node.position;
      }
    }

    // Calculate proper sourceHandle and targetHandle based on relative positions
    parsedDiagram.edges = parsedDiagram.edges.map((edge: { id: string; source: string; target: string }) => {
      const sourcePos = nodePositions[edge.source];
      const targetPos = nodePositions[edge.target];
      
      if (!sourcePos || !targetPos) {
        return edge;
      }

      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      
      let sourceHandle: string;
      let targetHandle: string;
      
      // Determine primary direction based on larger delta
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal connection
        if (dx > 0) {
          // Target is to the right
          sourceHandle = 'right-source';
          targetHandle = 'left-target';
        } else {
          // Target is to the left
          sourceHandle = 'left-source';
          targetHandle = 'right-target';
        }
      } else {
        // Vertical connection
        if (dy > 0) {
          // Target is below
          sourceHandle = 'bottom-source';
          targetHandle = 'top-target';
        } else {
          // Target is above
          sourceHandle = 'top-source';
          targetHandle = 'bottom-target';
        }
      }
      
      return {
        ...edge,
        sourceHandle,
        targetHandle,
      };
    });

    console.log(`Successfully generated template with ${parsedDiagram.nodes.length} nodes and ${parsedDiagram.edges.length} edges`);

    return new Response(
      JSON.stringify({ 
        diagram: parsedDiagram,
        templateName: template.name 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-diagram-template:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
