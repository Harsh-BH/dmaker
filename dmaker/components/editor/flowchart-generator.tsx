"use client"
import React, { useState } from 'react';
import { generateFlowchart } from '@/utils/flowchart';

const FlowchartGenerator = ({ readmeContent }: { readmeContent: string }) => {
  const [flowchartData, setFlowchartData] = useState(null);

  const handleGenerateFlowchart = () => {
    const generatedData = generateFlowchart(readmeContent);
    setFlowchartData(generatedData);
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Flowchart Generator</h2>
      <button
        onClick={handleGenerateFlowchart}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Generate Flowchart
      </button>
      {flowchartData ? (
        <div className="w-full h-64 border rounded-lg overflow-auto">
          {/* Render the flowchart visualization here */}
          <pre>{JSON.stringify(flowchartData, null, 2)}</pre>
        </div>
      ) : (
        <p>No flowchart generated yet. Click the button to generate.</p>
      )}
    </div>
  );
};

export default FlowchartGenerator;