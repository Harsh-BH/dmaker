"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Info, Download, Copy, Code, FileDown, Sun, Moon } from 'lucide-react';
import { Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mermaid from "mermaid";
import { aiModels } from "@/config/models";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";


// Example diagrams for quick start
const exampleDiagrams = {
  flowchart: `flowchart TD
  Start([Start]) --> A[Project Overview]
  A --> B[Features]
  B --> C[Architecture]
  C --> D[Implementation]
  D --> End([End])`,
  
  ecommerce: `flowchart TD
  User([Customer]) --> FE[Frontend]
  FE --> API[API Gateway]
  API --> Auth[Authentication]
  API --> Products[Product Service]
  API --> Orders[Order Service]
  Products --> DB[(Product Database)]
  Orders --> DB
  Orders --> Payment[Payment Processor]
  Payment --> Orders`,
  
  cicd: `flowchart LR
  Code[Code Repository] --> Build
  Build --> Test
  Test -->|Pass| Deploy
  Test -->|Fail| Build
  Deploy --> Monitor
  Monitor -->|Issue| Code`
};

export default function Page() {
  const [mermaidCode, setMermaidCode] = useState<string>(exampleDiagrams.flowchart);
  const [renderedCode, setRenderedCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("qwen");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [selectedExample, setSelectedExample] = useState<string>("flowchart");
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const { toast } = useToast();

  // Initialize Mermaid when the component mounts
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: darkMode ? 'dark' : 'default',
      securityLevel: 'loose',
    });
    
    // Apply dark mode class to the document
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Re-render Mermaid diagram when code changes
  useEffect(() => {
    if (renderedCode) {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: darkMode ? 'dark' : 'default',
          securityLevel: 'loose',
        });
        mermaid.contentLoaded();
      } catch (error) {
        console.error("Error rendering diagram:", error);
      }
    }
  }, [renderedCode, darkMode]);

  const handleRenderDiagram = async () => {
    setLoading(true);
    
    try {
      // Add a small delay to ensure UI updates before rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      setRenderedCode(mermaidCode);
      // Clear AI insights when rendering a new diagram
      setAiInsight("");
    } catch (error) {
      console.error("Error rendering diagram:", error);
      toast({
        title: "Rendering Error",
        description: "There was an error rendering your diagram. Please check your syntax.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enhanceDiagramWithAI = async () => {
    if (!renderedCode) return;
    
    setEnhancing(true);
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mermaidCode: renderedCode,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance diagram");
      }

      const data = await response.json();
      
      // Update the diagram with enhanced code
      setMermaidCode(data.enhancedCode);
      setRenderedCode(data.enhancedCode);
      setAiInsight(data.insight || "Diagram enhanced with additional elements and connections.");
      
      toast({
        title: "Diagram Enhanced",
        description: `Enhanced using ${data.model || selectedModel}`,
      });
    } catch (error) {
      console.error("Error enhancing diagram:", error);
      setAiInsight("Failed to enhance diagram. Please try again.");
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance diagram. Please try again or select a different model.",
        variant: "destructive"
      });
    } finally {
      setEnhancing(false);
    }
  };

  const loadExample = (exampleKey: string) => {
    setSelectedExample(exampleKey);
    setMermaidCode(exampleDiagrams[exampleKey as keyof typeof exampleDiagrams]);
    setAiInsight("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidCode);
    toast({
      title: "Copied to Clipboard",
      description: "Diagram code copied to clipboard",
    });
  };

  const downloadSVG = () => {
    try {
      const svgElement = document.querySelector(".mermaid svg");
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "diagram.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      }
    } catch (error) {
      console.error("Error downloading SVG:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the diagram as SVG.",
        variant: "destructive"
      });
    }
  };

    return (
    <div className={`flex flex-col h-screen w-full p-4 cyberspace ${darkMode ? 'dark-theme' : ''}`}>
      <div className="theme-toggle">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setDarkMode(!darkMode)}
          className="pixel-border"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-300 pixelated" />
          ) : (
            <Moon className="h-5 w-5 text-blue-400 pixelated" />
          )}
        </Button>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Mermaid Code Editor */}
        <Card className="shadow-neon flex flex-col h-full pixel-card">
          <CardHeader className="pb-2 pixel-header">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="glitch-text">Write Mermaid Code</CardTitle>
                <CardDescription className="cyber-text">
                  Enter Mermaid syntax to generate a diagram
                </CardDescription>
              </div>
              <div>
                <Tabs value={selectedExample} onValueChange={loadExample} className="w-[280px]">
                  <TabsList className="grid grid-cols-3 pixel-tabs">
                    <TabsTrigger value="flowchart" className="pixel-tab">Simple</TabsTrigger>
                    <TabsTrigger value="ecommerce" className="pixel-tab">E-commerce</TabsTrigger>
                    <TabsTrigger value="cicd" className="pixel-tab">CI/CD</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 pt-0">
            <div className="flex-grow flex flex-col h-full">
              <Textarea
                placeholder="Enter your Mermaid code here..."
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                className="flex-grow font-mono text-sm h-full min-h-0 code-textarea"
              />
            </div>
          </CardContent>
              
          <CardFooter className="flex items-center gap-2 justify-between border-t pt-3 mt-auto pixel-footer">
            <div className="text-xs cyber-small-text">
              <span>Press Render to visualize your diagram</span>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={copyToClipboard}
                      className="pixel-button"
                    >
                      <Copy className="h-4 w-4 neon-icon" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="pixel-tooltip">
                    <p>Copy code to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
                    
              <Button
                onClick={handleRenderDiagram}
                className="cyber-button pixel-animation"
                disabled={loading || !mermaidCode.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin neon-spin" />
                    Rendering...
                  </>
                ) : (
                  "Render Diagram"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Diagram Viewer */}
        <Card className="shadow-neon flex flex-col h-full pixel-card">
          <CardHeader className="pb-2 pixel-header">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="glitch-text">Rendered Diagram</CardTitle>
                <CardDescription className="cyber-text">
                  Visual representation of your Mermaid code
                </CardDescription>
              </div>
              
              {renderedCode && (
                <div className="flex items-center gap-2">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-[140px] pixel-select">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent className="pixel-dropdown">
                      {Object.entries(aiModels).map(([key, model]) => (
                        <SelectItem key={key} value={key}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={enhanceDiagramWithAI}
                          className="ai-enhance-button"
                          disabled={enhancing || !renderedCode}
                        >
                          {enhancing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin neon-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-4 w-4 magic-wand" />
                              Enhance with AI
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="pixel-tooltip">
                        <p>Use AI to improve and add insights to your diagram</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-2 p-4 pt-0 overflow-hidden">
            {aiInsight && (
              <motion.div 
                className="insight-panel"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 font-semibold text-purple-300">
                  <Info size={16} className="insight-icon" />
                  <span>AI Insight</span>
                </div>
                <p className="mt-1 insight-text">{aiInsight}</p>
              </motion.div>
            )}
            
            <div className="flex-grow flex flex-col items-center justify-center overflow-hidden diagram-container">
              {loading || enhancing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin neon-loader" />
                  <p className="mt-2 text-sm loading-text">
                    {enhancing ? "Enhancing diagram with AI..." : "Rendering diagram..."}
                  </p>
                </div>
              ) : renderedCode ? (
                <div className="w-full h-full overflow-auto diagram-box">
                  <div className="mermaid w-full h-full">{renderedCode}</div>
                </div>
              ) : (
                <div className="text-center empty-state">
                  <p className="pixel-text">No diagram rendered yet.</p>
                  <p className="text-sm mt-2 pixel-small-text">Enter Mermaid code on the left and click "Render Diagram".</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-3 mt-auto pixel-footer">
            {renderedCode ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={downloadSVG}
                      className="download-button"
                    >
                      <FileDown className="h-4 w-4 mr-1 neon-icon" />
                      Export SVG
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="pixel-tooltip">
                    <p>Download diagram as SVG</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="text-xs cyber-small-text">
                <span>Diagram will appear here after rendering</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}