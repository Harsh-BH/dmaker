"use client"
import { useState } from "react";

interface AiEnhanceButtonProps {
  readmeContent: string;
  onEnhance: (enhancedContent: string) => void;
}

const AiEnhanceButton: React.FC<AiEnhanceButtonProps> = ({ readmeContent, onEnhance }) => {
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: readmeContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance content");
      }

      const data = await response.json();
      onEnhance(data.enhancedContent);
    } catch (error) {
      console.error("Error enhancing content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnhance}
      disabled={loading}
      className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Enhancing..." : "Enhance README & Flowchart"}
    </button>
  );
};

export default AiEnhanceButton;