export type FlowchartNodeType = 
  | 'component' 
  | 'process' 
  | 'decision' 
  | 'start' 
  | 'end' 
  | 'phase' 
  | 'step';

export interface FlowchartNode {
  id: string;
  label: string;
  type: FlowchartNodeType;
  children?: string[];
  emoji?: string;
  completed?: boolean;
  data?: Record<string, any>;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'default' | 'dependency' | 'sequence';
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}
