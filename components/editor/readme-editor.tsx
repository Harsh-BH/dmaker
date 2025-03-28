"use client"
import React, { useState } from 'react';

const ReadmeEditor = () => {
  const [content, setContent] = useState('');

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  return (
    <div className="flex flex-col h-full p-4 border-r">
      <h2 className="text-xl font-bold mb-2">README Editor</h2>
      <textarea
        className="flex-1 p-2 border rounded-md"
        value={content}
        onChange={handleChange}
        placeholder="Write your README content here..."
      />
    </div>
  );
};

export default ReadmeEditor;