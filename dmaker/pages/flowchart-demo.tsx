import React, { useState, useEffect } from 'react';
import { generateFlowchart } from '../utils/flowchart';
import { enhanceFlowchartWithAI } from '../utils/aiFlowchart';
import FlowchartVisualizer from '../components/FlowchartVisualizer';
import { FlowchartData } from '../types/flowchart';

const FlowchartDemo = () => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null);
  const [useAI, setUseAI] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleGenerateFlowchart = async () => {
    if (!markdownContent) return;
    
    setIsLoading(true);
    
    try {
      // Generate basic flowchart
      const basicFlowchart = generateFlowchart(markdownContent);
      
      if (useAI) {
        // Enhance with AI
        const enhancedFlowchart = await enhanceFlowchartWithAI(
          markdownContent,
          basicFlowchart
        );
        setFlowchartData(enhancedFlowchart);
      } else {
        setFlowchartData(basicFlowchart);
      }
    } catch (error) {
      console.error('Error generating flowchart:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flowchart Generator Demo</h1>
      
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-medium">Paste Markdown Content:</span>
          <textarea
            className="w-full border rounded-md p-2 mt-1"
            rows={10}
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            placeholder="# Project Title&#10;&#10;## Phase 1: Planning&#10;&#10;✅ Step 1: Requirements gathering..."
          />
        </label>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span>Enhance with AI</span>
        </label>
      </div>
      
      <button
        onClick={handleGenerateFlowchart}
        disabled={isLoading || !markdownContent}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Flowchart'}
      </button>
      
      {flowchartData && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Generated Flowchart</h2>
          <FlowchartVisualizer flowchartData={flowchartData} height="600px" />
        </div>
      )}
    </div>
  );
};

export default FlowchartDemo;
