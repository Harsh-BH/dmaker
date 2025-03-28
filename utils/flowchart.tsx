import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

type FlowchartNode = {
  id: string;
  label: string;
  type: "start" | "process" | "decision" | "end";
  summary?: string; // Add summary field to store additional text
};

type FlowchartEdge = {
  from: string;
  to: string;
};

type FlowchartData = {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  summary: string; // Store the original summary
};

/**
 * Extract headings and structure from markdown content
 */
const extractStructure = (markdown: string) => {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdown);

  const headings: { depth: number; text: string; id: string }[] = [];

  visit(tree, "heading", (node: any) => {
    const text = node.children
      .filter((child: any) => child.type === "text")
      .map((child: any) => child.value)
      .join("");

    const id = `heading-${headings.length + 1}`;
    headings.push({ depth: node.depth, text, id });
  });

  // If no headings found, try to extract paragraphs or key sentences
  if (headings.length === 0) {
    let paragraphs: string[] = [];
    visit(tree, "paragraph", (node: any) => {
      const text = node.children
        .filter((child: any) => child.type === "text")
        .map((child: any) => child.value)
        .join("");
      
      paragraphs.push(text);
    });

    // Create artificial headings from paragraphs
    paragraphs.forEach((text, index) => {
      // Limit text length for labels
      const label = text.length > 50 ? text.substring(0, 47) + "..." : text;
      const id = `paragraph-${index + 1}`;
      headings.push({ depth: 2, text: label, id });
    });
  }

  return { headings };
};

/**
 * Generate flowchart data from markdown structure
 */
export const generateFlowchart = (markdown: string): FlowchartData => {
  const { headings } = extractStructure(markdown);

  const nodes: FlowchartNode[] = [];
  const edges: FlowchartEdge[] = [];

  // Add start node
  nodes.push({ id: "start", label: "Start", type: "start" });

  // Keep track of the last node at each depth level
  const lastNodeByDepth: Record<number, string> = {};
  lastNodeByDepth[0] = "start";

  // Process headings to create a hierarchical structure
  headings.forEach((heading) => {
    const node: FlowchartNode = {
      id: heading.id,
      label: heading.text,
      type: heading.depth === 1 ? "process" : "process", // Could use different types based on depth
    };

    nodes.push(node);

    // Connect to parent or previous sibling
    const parentDepth = heading.depth - 1;
    const parentId = lastNodeByDepth[parentDepth] || lastNodeByDepth[parentDepth - 1] || "start";
    
    edges.push({ from: parentId, to: heading.id });
    
    // Update last node at this depth
    lastNodeByDepth[heading.depth] = heading.id;
    
    // Remove any deeper level references when we move to a new branch
    for (let i = heading.depth + 1; i <= 6; i++) {
      delete lastNodeByDepth[i];
    }
  });

  // Add end node - connect to the last node at the lowest depth
  nodes.push({ id: "end", label: "End", type: "end" });
  
  const lastNode = Object.values(lastNodeByDepth).pop() || "start";
  edges.push({ from: lastNode, to: "end" });

  return { 
    nodes, 
    edges,
    summary: markdown // Store the original summary
  };
};