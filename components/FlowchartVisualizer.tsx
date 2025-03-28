import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { FlowchartData, FlowchartNode, FlowchartEdge } from '../types/flowchart';

interface FlowchartVisualizerProps {
  flowchartData: FlowchartData;
  height?: string;
  width?: string;
  options?: Record<string, any>;
}

const getNodeColor = (nodeType: FlowchartNode['type'], isCompleted?: boolean): string => {
  if (isCompleted) {
    return '#4CAF50'; // Green for completed nodes
  }
  
  switch (nodeType) {
    case 'start':
      return '#2196F3'; // Blue
    case 'end':
      return '#F44336'; // Red
    case 'phase':
      return '#9C27B0'; // Purple
    case 'step':
      return '#FF9800'; // Orange
    case 'decision':
      return '#FFEB3B'; // Yellow
    case 'component':
      return '#3F51B5'; // Indigo
    default:
      return '#607D8B'; // Blue Grey
  }
};

const getNodeShape = (nodeType: FlowchartNode['type']): string => {
  switch (nodeType) {
    case 'start':
    case 'end':
      return 'circle';
    case 'decision':
      return 'diamond';
    case 'phase':
      return 'box';
    default:
      return 'box';
  }
};

const FlowchartVisualizer: React.FC<FlowchartVisualizerProps> = ({
  flowchartData,
  height = '800px',
  width = '100%',
  options = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || !flowchartData) return;
    
    // Format nodes for vis.js
    const visNodes = new DataSet(
      flowchartData.nodes.map(node => ({
        id: node.id,
        label: node.emoji ? `${node.emoji} ${node.label}` : node.label,
        color: getNodeColor(node.type, node.completed),
        shape: getNodeShape(node.type),
        font: { size: 16 },
        margin: 10,
        shadow: true
      }))
    );
    
    // Format edges for vis.js
    const visEdges = new DataSet(
      flowchartData.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        label: edge.label,
        arrows: 'to',
        smooth: { type: 'curvedCW', roundness: 0.2 }
      }))
    );
    
    // Network configuration
    const data = { nodes: visNodes, edges: visEdges };
    
    const defaultOptions = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed',
          levelSeparation: 150,
          nodeSpacing: 120
        }
      },
      physics: {
        hierarchicalRepulsion: {
          centralGravity: 0.0,
          springLength: 120,
          springConstant: 0.01,
          nodeDistance: 200
        },
        solver: 'hierarchicalRepulsion'
      },
      interaction: {
        navigationButtons: true,
        keyboard: true
      }
    };
    
    // Create network
    networkRef.current = new Network(
      containerRef.current,
      data,
      { ...defaultOptions, ...options }
    );
    
    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [flowchartData, options]);
  
  return (
    <div
      ref={containerRef}
      style={{
        height,
        width,
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

export default FlowchartVisualizer;
