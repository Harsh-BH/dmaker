"use client"
import React, { useState } from 'react';
import ReadmeEditor from '@/components/editor/readme-editor';
import FlowchartGenerator from '@/components/editor/flowchart-generator';

const SplitView = () => {
  const [readmeContent, setReadmeContent] = useState('');

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex-1 p-4 border-r border-gray-200">
        <h2 className="text-xl font-bold mb-4">README Editor</h2>
        <ReadmeEditor onContentChange={setReadmeContent} />
      </div>
      <div className="flex-1 p-4">
        <h2 className="text-xl font-bold mb-4">Flowchart Generator</h2>
        <FlowchartGenerator readmeContent={readmeContent} />
      </div>
    </div>
  );
};

export default SplitView;