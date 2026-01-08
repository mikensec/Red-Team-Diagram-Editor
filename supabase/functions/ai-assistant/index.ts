import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AIFeature = 'ttp-suggest' | 'attack-path-analyze' | 'executive-summary' | 'remediation-advisor';
type AIProvider = 'lovable' | 'openai' | 'anthropic' | 'google';

interface RequestBody {
  feature: AIFeature;
  provider: AIProvider;
  apiKey?: string;
  diagram?: {
    nodes: Array<{ id: string; data: { label: string; description?: string; icon?: string; color?: string } }>;
    edges: Array<{ source: string; target: string }>;
  };
  selectedNode?: { id: string; data: { label: string; description?: string; icon?: string } };
}

const SYSTEM_PROMPTS: Record<AIFeature, string> = {
  'ttp-suggest': `You are a MITRE ATT&CK expert. Given a node from a red team attack diagram, suggest 3-5 logical next attack techniques.

For each suggestion, provide:
- technique: The technique name with MITRE ID (e.g., "T1059.001 - PowerShell")
- description: Brief 1-2 sentence explanation of why this follows logically
- tactic: The MITRE ATT&CK tactic category
- icon: Suggested icon name (Shield, Terminal, Key, Network, User, Database, Cloud, Mail, Lock, Unlock, Bug, Zap, Eye, FileText, Server, Globe)
- color: Hex color matching the tactic

Output as JSON array:
[{"technique": "...", "description": "...", "tactic": "...", "icon": "...", "color": "#..."}]`,

  'attack-path-analyze': `You are a red team expert. Analyze the attack diagram for gaps, missing steps, or alternative attack paths.

Provide:
- gaps: Array of missing steps between nodes that should be addressed
- alternatives: Array of alternative attack paths that could achieve similar goals
- improvements: Array of suggestions to make the attack chain more realistic
- risk_rating: Overall risk rating (low/medium/high/critical) with explanation

Output as JSON:
{
  "gaps": [{"between": ["node1", "node2"], "missing": "description", "suggestion": "what to add"}],
  "alternatives": [{"description": "...", "path": ["step1", "step2"]}],
  "improvements": ["suggestion1", "suggestion2"],
  "risk_rating": {"level": "...", "explanation": "..."}
}`,

  'executive-summary': `You are a security consultant creating executive briefings. Generate a non-technical summary of this attack diagram for stakeholders.

Include:
- title: A clear, impactful title
- summary: 2-3 paragraph executive summary explaining the attack in business terms
- impact: Business impact assessment
- key_findings: 3-5 bullet points of key findings
- recommendations: 3-5 high-level recommendations

Output as JSON:
{
  "title": "...",
  "summary": "...",
  "impact": "...",
  "key_findings": ["...", "..."],
  "recommendations": ["...", "..."]
}`,

  'remediation-advisor': `You are a defensive security expert. For each step in this attack diagram, provide defensive recommendations.

For each node, provide:
- node_label: The original node name
- detection: How to detect this attack step
- prevention: How to prevent it
- mitigation: How to reduce impact if it succeeds
- controls: Specific security controls to implement (with priority: high/medium/low)

Output as JSON array:
[{
  "node_label": "...",
  "detection": "...",
  "prevention": "...",
  "mitigation": "...",
  "controls": [{"name": "...", "priority": "high|medium|low"}]
}]`
};

function buildUserPrompt(feature: AIFeature, diagram?: RequestBody['diagram'], selectedNode?: RequestBody['selectedNode']): string {
  if (feature === 'ttp-suggest' && selectedNode) {
    return `Current node: "${selectedNode.data.label}"
Description: ${selectedNode.data.description || 'No description'}
Icon: ${selectedNode.data.icon || 'Not specified'}

Suggest the next logical attack techniques that would follow this step.`;
  }

  if (!diagram || !diagram.nodes?.length) {
    return 'No diagram provided. Please provide an attack diagram to analyze.';
  }

  const nodeDescriptions = diagram.nodes.map(n => 
    `- ${n.data.label}${n.data.description ? `: ${n.data.description}` : ''}`
  ).join('\n');

  const edgeDescriptions = diagram.edges.map(e => {
    const source = diagram.nodes.find(n => n.id === e.source)?.data.label || e.source;
    const target = diagram.nodes.find(n => n.id === e.target)?.data.label || e.target;
    return `- ${source} → ${target}`;
  }).join('\n');

  return `Attack Diagram Analysis:

NODES (Attack Steps):
${nodeDescriptions}

CONNECTIONS (Attack Flow):
${edgeDescriptions || 'No connections defined'}

Analyze this attack chain and provide your assessment.`;
}

async function callLovableAI(messages: Array<{ role: string; content: string }>) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add credits to continue.');
    }
    throw new Error('AI service error');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function callOpenAI(messages: Array<{ role: string; content: string }>, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function callAnthropic(messages: Array<{ role: string; content: string }>, apiKey: string) {
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemMessage,
      messages: userMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();
  return data.content?.[0]?.text;
}

async function callGoogle(messages: Array<{ role: string; content: string }>, apiKey: string) {
  const parts = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: parts,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Google AI API error');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { feature, provider, apiKey, diagram, selectedNode } = body;

    if (!feature || !SYSTEM_PROMPTS[feature]) {
      return new Response(
        JSON.stringify({ error: 'Invalid feature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For TTP suggest, we need a selected node
    if (feature === 'ttp-suggest' && !selectedNode) {
      return new Response(
        JSON.stringify({ error: 'Please select a node first' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For other features, we need a diagram
    if (feature !== 'ttp-suggest' && (!diagram || !diagram.nodes?.length)) {
      return new Response(
        JSON.stringify({ error: 'Please create a diagram first' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPTS[feature] },
      { role: 'user', content: buildUserPrompt(feature, diagram, selectedNode) }
    ];

    console.log(`Processing ${feature} request for user ${user.id} with provider ${provider}`);

    let result: string | undefined;

    switch (provider) {
      case 'openai':
        if (!apiKey) throw new Error('OpenAI API key required');
        result = await callOpenAI(messages, apiKey);
        break;
      case 'anthropic':
        if (!apiKey) throw new Error('Anthropic API key required');
        result = await callAnthropic(messages, apiKey);
        break;
      case 'google':
        if (!apiKey) throw new Error('Google API key required');
        result = await callGoogle(messages, apiKey);
        break;
      case 'lovable':
      default:
        result = await callLovableAI(messages);
        break;
    }

    if (!result) {
      throw new Error('AI returned empty response');
    }

    // Parse JSON from response
    let parsedResult;
    try {
      // Handle potential markdown code blocks
      let jsonStr = result;
      if (jsonStr.includes('```')) {
        const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonStr = match[1].trim();
      }
      parsedResult = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, return raw text
      parsedResult = { raw: result };
    }

    return new Response(
      JSON.stringify({ result: parsedResult, feature }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
