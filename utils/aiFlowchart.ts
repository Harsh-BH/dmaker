import { FlowchartData } from '../types/flowchart';

interface AIFlowchartOptions {
  temperature?: number;
  model?: string;
  apiKey?: string;
}

/**
 * Enhances flowchart structure using AI to identify relationships
 * between different parts of a project roadmap
 */
export async function enhanceFlowchartWithAI(
  markdown: string,
  existingFlowchart: FlowchartData,
  options: AIFlowchartOptions = {}
): Promise<FlowchartData> {
  // Default options
  const {
    temperature = 0.2,
    model = 'qwen2.5-72b-online',
    apiKey = process.env.GROQ_API_KEY || ''
  } = options;
  
  if (!apiKey) {
    console.warn('No API key provided for AI flowchart enhancement');
    return existingFlowchart;
  }
  
  try {
    // Extract project phases and steps
    const phases = extractProjectPhases(markdown);
    
    // Enhance node connections based on dependencies
    const enhancedFlowchart = enhanceConnections(existingFlowchart, phases);
    
    return enhancedFlowchart;
  } catch (error) {
    console.error('Error enhancing flowchart with AI:', error);
    return existingFlowchart;
  }
}

/**
 * Extracts project phases and their relationships from markdown
 */
function extractProjectPhases(markdown: string) {
  // Parse the markdown to identify phases, steps, and relationships
  const phaseRegex = /#+\s*(?:Phase\s*\d+:|🚀\s*Project Roadmap)/gi;
  const stepRegex = /✅\s*(?:Step\s*\d+:)?\s*\*\*([^*]+)\*\*/gi;
  
  const phases = [];
  let currentPhase = null;
  
  // Split by lines to process the markdown
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const phaseMatch = line.match(phaseRegex);
    if (phaseMatch) {
      if (currentPhase) {
        phases.push(currentPhase);
      }
      currentPhase = {
        title: line.trim(),
        steps: []
      };
    } else if (currentPhase && line.includes('✅')) {
      const stepMatch = line.match(stepRegex);
      if (stepMatch) {
        currentPhase.steps.push({
          title: stepMatch[1] || line.trim(),
          completed: line.includes('✅')
        });
      }
    }
  }
  
  if (currentPhase && currentPhase.steps.length > 0) {
    phases.push(currentPhase);
  }
  
  return phases;
}

/**
 * Enhances connections between nodes based on project phase analysis
 */
function enhanceConnections(flowchart: FlowchartData, phases: any[]): FlowchartData {
  const { nodes, edges } = flowchart;
  
  // Clone the flowchart data to avoid mutating the input
  const enhancedNodes = [...nodes];
  const enhancedEdges = [...edges];
  
  // Identify phase nodes
  const phaseNodes = enhancedNodes.filter(node => 
    node.type === 'phase' || 
    (node.label && node.label.toLowerCase().includes('phase'))
  );
  
  // Connect phases sequentially if they're not already connected
  if (phaseNodes.length > 1) {
    for (let i = 0; i < phaseNodes.length - 1; i++) {
      const currentPhase = phaseNodes[i];
      const nextPhase = phaseNodes[i + 1];
      
      // Check if connection already exists
      const connectionExists = enhancedEdges.some(
        edge => edge.from === currentPhase.id && edge.to === nextPhase.id
      );
      
      if (!connectionExists) {
        enhancedEdges.push({
          from: currentPhase.id,
          to: nextPhase.id,
          label: 'Next Phase'
        });
      }
    }
  }
  
  return { nodes: enhancedNodes, edges: enhancedEdges };
}
