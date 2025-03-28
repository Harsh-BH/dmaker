export interface ReadmeContent {
    title: string;
    description: string;
    sections: Section[];
  }
  
  export interface Section {
    heading: string;
    content: string;
  }
  
  export interface FlowchartData {
    nodes: Node[];
    edges: Edge[];
  }
  
  export interface Node {
    id: string;
    label: string;
    type: string; // e.g., 'input', 'process', 'output'
  }
  
  export interface Edge {
    from: string; // ID of the source node
    to: string;   // ID of the target node
  }