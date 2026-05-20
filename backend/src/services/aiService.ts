import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const hasApiKey = !!process.env.OPENAI_API_KEY;

function generateFallbackSummary(title: string, description: string, priority: string): string {
  const titleLower = title.toLowerCase();
  const text = `${titleLower} ${description.toLowerCase()}`;

  let context = '';
  if (text.includes('database') || text.includes('db') || text.includes('postgres') || text.includes('mongo')) {
    context = 'Database layer connectivity issue detected. ';
  } else if (text.includes('api') || text.includes('gateway') || text.includes('http')) {
    context = 'API layer service disruption detected. ';
  } else if (text.includes('auth') || text.includes('login') || text.includes('token')) {
    context = 'Authentication/authorization service issue detected. ';
  } else if (text.includes('network') || text.includes('dns') || text.includes('firewall')) {
    context = 'Network infrastructure problem detected. ';
  } else if (text.includes('memory') || text.includes('cpu') || text.includes('resource')) {
    context = 'Resource exhaustion or capacity issue detected. ';
  } else if (text.includes('payment') || text.includes('stripe') || text.includes('billing')) {
    context = 'External payment service integration issue. ';
  }

  const severityMap: Record<string, string> = {
    'Critical': 'CRITICAL SEVERITY - Immediate attention required. ',
    'High': 'HIGH SEVERITY - Urgent investigation needed. ',
    'Medium': 'MODERATE SEVERITY - Standard response protocol. ',
    'Low': 'LOW SEVERITY - Standard monitoring. '
  };

  return `${severityMap[priority] || ''}${context}Incident: "${title}". ${description ? `Details: ${description.slice(0, 200)}` : ''} Requires coordination across infrastructure and development teams.`;
}

function generateFallbackActions(title: string, description: string, priority: string): string {
  const text = `${title.toLowerCase()} ${description.toLowerCase()}`;

  let actions: string[];

  if (text.includes('database') || text.includes('db') || text.includes('postgres') || text.includes('mongo')) {
    actions = [
      'Check database connection pool settings and current utilization',
      'Review slow query logs and execution plans',
      'Verify replica set health and replication lag',
      'Check disk space and I/O throughput metrics',
      'Review recent schema changes or index modifications'
    ];
  } else if (text.includes('api') || text.includes('gateway') || text.includes('http')) {
    actions = [
      'Check API gateway logs for error patterns',
      'Review rate limiting and throttling configurations',
      'Verify upstream service endpoint health',
      'Check for recent deployment or configuration changes',
      'Review load balancer health and distribution'
    ];
  } else if (text.includes('auth') || text.includes('login') || text.includes('token')) {
    actions = [
      'Verify token expiration and refresh mechanism',
      'Check LDAP/SSO service availability',
      'Review permission and role assignments',
      'Check for account lockouts or brute force attempts',
      'Verify API keys and service account credentials'
    ];
  } else if (text.includes('network') || text.includes('dns') || text.includes('firewall')) {
    actions = [
      'Check DNS resolution and propagation status',
      'Review firewall rules and security group settings',
      'Verify load balancer and CDN health',
      'Test network latency between services',
      'Check for BGP route changes or outages'
    ];
  } else if (text.includes('memory') || text.includes('cpu') || text.includes('resource')) {
    actions = [
      'Review current resource utilization metrics',
      'Check for memory leaks or runaway processes',
      'Verify auto-scaling policies and triggers',
      'Review container/pod resource limits',
      'Check for spike in incoming traffic or requests'
    ];
  } else if (text.includes('payment') || text.includes('stripe') || text.includes('billing')) {
    actions = [
      'Check external payment provider status page',
      'Review API response codes from payment gateway',
      'Verify API credentials and webhook configuration',
      'Check for transaction log anomalies',
      'Review customer complaint patterns'
    ];
  } else {
    actions = [
      'Collect relevant logs and metrics for root cause analysis',
      'Check recent deployment or configuration changes',
      'Verify all dependent services are healthy',
      'Establish incident communication channel',
      'Document initial findings and timeline'
    ];
  }

  if (priority === 'Critical' || priority === 'High') {
    actions.push('Consider paging on-call engineer if not already done');
    actions.push('Prepare stakeholder communication if impact is user-facing');
  }

  return actions.map(a => `• ${a}`).join('\n');
}

function generateFallbackPriorityReview(title: string, description: string, currentPriority: string): string {
  const text = `${title.toLowerCase()} ${description.toLowerCase()}`;

  const criticalWords = ['outage', 'down', 'crash', 'data loss', 'breach', 'hack', 'leak', 'total failure', 'unavailable'];
  const highWords = ['latency', 'error', 'failing', 'degraded', 'partial', 'timeout', '502', '503', '504'];
  const mediumWords = ['warning', 'minor', 'slow', 'performance'];
  const lowWords = ['info', 'request', 'enhancement', 'improve'];

  let recommended = currentPriority;

  for (const kw of criticalWords) {
    if (text.includes(kw)) {
      recommended = 'Critical';
      break;
    }
  }

  if (recommended === currentPriority) {
    for (const kw of highWords) {
      if (text.includes(kw) && currentPriority !== 'Critical') {
        recommended = 'High';
        break;
      }
    }
  }

  if (recommended === currentPriority) {
    for (const kw of mediumWords) {
      if (text.includes(kw) && currentPriority !== 'High' && currentPriority !== 'Critical') {
        recommended = 'Medium';
        break;
      }
    }
  }

  const status = recommended === currentPriority ? 'APPROPRIATE' : 'CONSIDER UPDATING';

  return `Current Priority: ${currentPriority}\n\nAI Recommendation: ${recommended}\n\nAssessment: ${status}\n\nKeyword analysis suggests priority ${recommended === currentPriority ? 'is correct' : 'may need adjustment'}.`;
}

export async function generateAISummary(incident: { title: string; description: string; priority: string }): Promise<string> {
  if (!hasApiKey) {
    return generateFallbackSummary(incident.title, incident.description, incident.priority);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an SRE assistant. Generate a brief, professional incident summary for a war room dashboard.'
        },
        {
          role: 'user',
          content: `Title: ${incident.title}\nDescription: ${incident.description}\nPriority: ${incident.priority}`
        }
      ],
      max_tokens: 200
    });

    return response.choices[0]?.message?.content || generateFallbackSummary(incident.title, incident.description, incident.priority);
  } catch (error) {
    console.error('OpenAI API error, using fallback:', error);
    return generateFallbackSummary(incident.title, incident.description, incident.priority);
  }
}

export async function generateAIActions(incident: { title: string; description: string; priority: string }): Promise<string> {
  if (!hasApiKey) {
    return generateFallbackActions(incident.title, incident.description, incident.priority);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a DevOps runbook assistant. Generate actionable next steps in bullet format.'
        },
        {
          role: 'user',
          content: `Title: ${incident.title}\nDescription: ${incident.description}\nPriority: ${incident.priority}`
        }
      ],
      max_tokens: 300
    });

    return response.choices[0]?.message?.content || generateFallbackActions(incident.title, incident.description, incident.priority);
  } catch (error) {
    console.error('OpenAI API error, using fallback:', error);
    return generateFallbackActions(incident.title, incident.description, incident.priority);
  }
}

export async function generatePriorityReview(incident: { title: string; description: string; priority: string }): Promise<string> {
  if (!hasApiKey) {
    return generateFallbackPriorityReview(incident.title, incident.description, incident.priority);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an incident triage assistant. Review priority and provide recommendation.'
        },
        {
          role: 'user',
          content: `Title: ${incident.title}\nDescription: ${incident.description}\nCurrent Priority: ${incident.priority}`
        }
      ],
      max_tokens: 150
    });

    return response.choices[0]?.message?.content || generateFallbackPriorityReview(incident.title, incident.description, incident.priority);
  } catch (error) {
    console.error('OpenAI API error, using fallback:', error);
    return generateFallbackPriorityReview(incident.title, incident.description, incident.priority);
  }
}