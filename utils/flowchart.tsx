import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';

type FlowchartNode = {
  id: string;
  label: string;
  type: 'component' | 'process' | 'decision' | 'start' | 'end' | 'phase' | 'step';
  children?: string[];
  emoji?: string;
  completed?: boolean;
};

type FlowchartEdge = {
  from: string;
  to: string;
  label?: string;
};

type FlowchartData = {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
};

/**
 * Extract headings, structure, and checkmarks from markdown content
 */
const extractStructure = (markdown: string) => {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdown);
  
  const headings: { depth: number; text: string; id: string; emoji?: string }[] = [];
  const codeBlocks: { lang: string; value: string; id: string }[] = [];
  const listItems: { text: string; id: string; completed: boolean; parent?: string }[] = [];
  
  let currentHeadingId = '';
  
  visit(tree, 'heading', (node: any) => {
    let text = '';
    let emoji = '';
    
    // Extract text and emoji if present
    node.children.forEach((child: any) => {
      if (child.type === 'text') {
        text += child.value;
      } else if (child.type === 'emphasis' || child.type === 'strong') {
        const innerText = child.children.map((c: any) => c.value).join('');
        text += innerText;
      } else if (child.type === 'inlineCode') {
        text += child.value;
      }
    });
    
    // Check for emoji (simple pattern matching for common project emojis)
    const emojiMatch = text.match(/([\u{1F300}-\u{1F6FF}]|[\u{2700}-\u{27BF}])/u);
    if (emojiMatch) {
      emoji = emojiMatch[0];
      text = text.replace(emojiMatch[0], '').trim();
    }
    
    const id = `heading-${headings.length + 1}`;
    headings.push({ depth: node.depth, text, id, emoji });
    currentHeadingId = id;
  });
  
  visit(tree, 'code', (node: any) => {
    const id = `code-${codeBlocks.length + 1}`;
    codeBlocks.push({ 
      lang: node.lang || 'text', 
      value: node.value, 
      id 
    });
  });
  
  // Extract list items and check for checkmarks
  visit(tree, 'listItem', (node: any, index, parent: any) => {
    const id = `list-${listItems.length + 1}`;
    let text = '';
    let completed = false;
    
    // Check for checkmark syntax (✅ or - [x])
    if (node.children[0] && node.children[0].type === 'paragraph') {
      const paragraphNode = node.children[0];
      
      // Extract complete text
      text = paragraphNode.children
        .map((child: any) => {
          if (child.type === 'text') return child.value;
          if (child.type === 'emphasis' || child.type === 'strong') {
            return child.children.map((c: any) => c.value).join('');
          }
          return '';
        })
        .join('');
      
      // Check for completion indicators
      if (text.includes('✅') || text.includes('[x]') || text.includes('[X]')) {
        completed = true;
        text = text.replace(/✅|\[x\]|\[X\]/g, '').trim();
      }
    }
    
    listItems.push({ 
      text, 
      id, 
      completed, 
      parent: currentHeadingId 
    });
  });
  
  return { headings, codeBlocks, listItems };
};

/**
 * Generate structured flowchart data from markdown
 */
const generateBasicFlowchart = (structure: ReturnType<typeof extractStructure>): FlowchartData => {
  const { headings, codeBlocks, listItems } = structure;
  const nodes: FlowchartNode[] = [];
  const edges: FlowchartEdge[] = [];
  
  // Create start node
  nodes.push({
    id: 'start',
    label: 'Start',
    type: 'start'
  });
  
  // Generate nodes from headings
  let previousNodeId = 'start';
  let lastNodesByLevel: Record<number, string> = {};
  let phaseNodes: string[] = [];
  
  headings.forEach(heading => {
    // Determine node type based on content and depth
    let nodeType: FlowchartNode['type'] = 'process';
    
    if (heading.depth === 1) {
      nodeType = 'component';
    } else if (heading.depth === 2 && 
              (heading.text.toLowerCase().includes('phase') || 
               heading.text.includes('roadmap'))) {
      nodeType = 'phase';
    } else if (heading.text.toLowerCase().includes('step')) {
      nodeType = 'step';
    }
    
    const node: FlowchartNode = {
      id: heading.id,
      label: heading.text,
      type: nodeType,
      emoji: heading.emoji
    };
    
    nodes.push(node);
    
    // Track phase nodes
    if (nodeType === 'phase') {
      phaseNodes.push(heading.id);
    }
    
    // Connect to parent heading or previous sibling
    if (heading.depth > 1 && lastNodesByLevel[heading.depth - 1]) {
      edges.push({
        from: lastNodesByLevel[heading.depth - 1],
        to: heading.id
      });
    } else if (heading.depth === 2) { // Connect major sections to start
      edges.push({
        from: 'start',
        to: heading.id
      });
    } else {
      edges.push({
        from: previousNodeId,
        to: heading.id
      });
    }
    
    previousNodeId = heading.id;
    lastNodesByLevel[heading.depth] = heading.id;
  });
  
  // Add list items as step nodes if they're important enough
  listItems.forEach((item) => {
    if (item.text.length > 10 && item.parent) { // Only add meaningful list items
      const node: FlowchartNode = {
        id: item.id,
        label: item.text,
        type: 'step',
        completed: item.completed
      };
      
      nodes.push(node);
      
      edges.push({
        from: item.parent,
        to: item.id
      });
    }
  });
  
  // Add code blocks as decision nodes
  codeBlocks.forEach((codeBlock, index) => {
    const node: FlowchartNode = {
      id: codeBlock.id,
      label: `Code (${codeBlock.lang})`,
      type: 'decision'
    };
    
    nodes.push(node);
    
    if (index === 0 && headings.length === 0) {
      edges.push({
        from: 'start',
        to: codeBlock.id
      });
    } else if (headings.length > 0) {
      // Connect to the nearest preceding heading
      edges.push({
        from: previousNodeId,
        to: codeBlock.id
      });
    }
    
    previousNodeId = codeBlock.id;
  });
  
  // Create end node
  nodes.push({
    id: 'end',
    label: 'End',
    type: 'end'
  });
  
  // Connect phases to end
  if (phaseNodes.length > 0) {
    phaseNodes.forEach(phaseId => {
      edges.push({
        from: phaseId,
        to: 'end'
      });
    });
  } else {
    // Connect last node to end
    edges.push({
      from: previousNodeId,
      to: 'end'
    });
  }
  
  return { nodes, edges };
};

/**
 * Main function to generate flowchart data from README content
 */
export const generateFlowchart = (readmeContent: string): FlowchartData => {
  // Extract structure from markdown
  const structure = extractStructure(readmeContent);
  
  // Generate structured flowchart
  const flowchartData = generateBasicFlowchart(structure);
  
  return flowchartData;
};

/**
 * Enhance flowchart data using LLM API
 */
export const enhanceFlowchartWithAI = async (
  readmeContent: string,
  flowchartData: FlowchartData
): Promise<FlowchartData> => {
  // This would be implemented to call the Groq API with models like qwen 2.5 or deepsekk
  // For now, just return the existing data
  return flowchartData;
};