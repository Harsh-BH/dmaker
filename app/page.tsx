"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateFlowchart } from "@/utils/flowchart";
import { aiModels, groqApiConfig } from "@/config/models";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [readmeContent, setReadmeContent] = useState("");
  const [flowchartData, setFlowchartData] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState("qwen");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const summarizeWithAI = async (content: string): Promise<string> => {
    try {
      const model = aiModels[selectedModel as keyof typeof aiModels];
      
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          model: selectedModel,
          groqApiKey: groqApiConfig.apiKey
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize content");
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error("Error summarizing content:", error);
      return "Failed to generate summary. Using original content.";
    }
  };

  // Modify just the handleGenerateFlowchart function
const handleGenerateFlowchart = async () => {
  setLoading(true);
  
  try {
    // First, summarize the content using AI
    const summarizedContent = await summarizeWithAI(readmeContent);
    setSummary(summarizedContent);
    
    // Then, generate flowchart from the summary
    const generatedFlowchart = generateFlowchart(summarizedContent);
    setFlowchartData(generatedFlowchart);
  } catch (error) {
    console.error("Error generating flowchart:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">README Flowchart Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {/* README Editor */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Write Your README</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your README content here..."
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
              className="h-80"
            />
            
            <div className="mt-4 flex items-center gap-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qwen">Qwen 2.5</SelectItem>
                  <SelectItem value="deepsekk">Deepsekk</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleGenerateFlowchart}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading || !readmeContent.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Flowchart"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Flowchart Viewer */}
        
{/* Flowchart Viewer */}
<Card className="shadow-lg">
  <CardHeader>
    <CardTitle>Generated Flowchart</CardTitle>
  </CardHeader>
  <CardContent className="h-96 flex flex-col gap-4">
    {flowchartData?.summary && (
      <div className="bg-gray-100 p-3 rounded-md text-sm">
        <h3 className="font-semibold mb-1">AI Summary:</h3>
        <p>{flowchartData.summary}</p>
      </div>
    )}
    
    <div className="flex-1 flex items-center justify-center overflow-hidden">
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-sm text-gray-500">Generating flowchart...</p>
        </div>
      ) : flowchartData ? (
        <div className="w-full h-full">
          {/* Replace this with a flowchart rendering library like React Flow */}
          <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto h-full">
            {JSON.stringify(flowchartData.nodes, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-gray-500">No flowchart generated yet.</p>
      )}
    </div>
  </CardContent>
</Card>
      </div>
    </div>
  );
}