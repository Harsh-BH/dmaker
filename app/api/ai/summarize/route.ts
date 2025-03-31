import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// AI models configuration - using models that work well for this task
const aiModels = {
  qwen: {
    name: "Qwen 2.5",
    modelId: "qwen-qwq-32b", // Changed model 
    description: "An advanced model for enhancing diagrams"
  },
  deepseek: {
    name: "DeepSeek V2",
    modelId: "deepseek-r1-distill-llama-70b", // Changed to Claude which has better formatting
    description: "Specialized in technical flowcharts"
  },
  llama: {
    name: "Llama 3.1",
    modelId: "llama3-8b-8192",
    description: "Well-balanced for general diagrams"
  }
};

// Helper function to validate and clean Mermaid code
function cleanMermaidCode(code: string): string {
  // Ensure it starts with flowchart or graph
  if (!/^\s*(flowchart|graph)/i.test(code)) {
    if (code.includes("flowchart") || code.includes("graph")) {
      // Extract just the flowchart part
      const match = /(flowchart|graph)[\s\S]+/i.exec(code);
      if (match) {
        code = match[0];
      }
    } else {
      // Not valid Mermaid code
      return "";
    }
  }
  
  // Remove any standalone "note" lines that aren't attached to nodes (invalid Mermaid)
  code = code.replace(/^\s*note\s+["']?[^:]+["']?\s*$/gm, "");
  
  // Fix common syntax errors
  code = code.replace(/\)\)(?!\s*-->)/g, ")"); // Fix duplicate closing parentheses
  code = code.replace(/\[\[/g, "[").replace(/\]\]/g, "]"); // Fix double brackets
  
  // Ensure code ends with a newline character to help Mermaid render properly
  return code.trim() + "\n";
}

export async function POST(request: Request) {
  try {
    const { mermaidCode, model } = await request.json();
    
    console.log("Request received:", { model, codeLength: mermaidCode?.length });
    
    if (!mermaidCode) {
      return NextResponse.json(
        { error: "Mermaid code is required" },
        { status: 400 }
      );
    }
    
    const selectedModel = aiModels[model as keyof typeof aiModels];
    if (!selectedModel) {
      return NextResponse.json(
        { error: `Model "${model}" not found` },
        { status: 400 }
      );
    }
    
    console.log(`Using model: ${selectedModel.name} (${selectedModel.modelId})`);
    
    try {
      // Provide a very specific prompt with constraints on output format
      const completion = await groq.chat.completions.create({
        model: selectedModel.modelId,
        messages: [
          {
            role: "system",
            content: `You are an expert at enhancing Mermaid diagrams. Follow these strict rules:
1. Use only standard Mermaid syntax that works with Mermaid.js v10+
2. Wrap your diagram code in \`\`\`mermaid and \`\`\` tags
3. Start with flowchart TD or flowchart LR
4. Do NOT use unsupported features like standalone notes
5. Keep node IDs simple (letters and numbers)
6. Use proper syntax for styling: style NodeID fill:#color,stroke:#color
7. Verify your syntax before providing the answer
8. Ensure there is an empty line at the end of your diagram code`
          },
          {
            role: "user",
            content: `Enhance this Mermaid diagram to make it more detailed:

\`\`\`mermaid
${mermaidCode}
\`\`\`

Provide ONLY:
1. A brief description of your changes (2-3 sentences)
2. The enhanced Mermaid code in a code block with \`\`\`mermaid tags
3. Ensure there is an empty line at the end of your diagram code`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3 // Lower temperature for more deterministic output
      });
      
      const aiResponse = completion.choices[0]?.message?.content || "";
      console.log("AI response length:", aiResponse.length);
      
      if (!aiResponse) {
        throw new Error("Empty response from AI");
      }

      // Extract the Mermaid code
      const codeBlockRegex = /```(?:mermaid)?\s*([\s\S]*?)```/;
      const match = codeBlockRegex.exec(aiResponse);
      
      let enhancedCode = mermaidCode; // Default to original code
      let insight = "Diagram enhanced with additional details.";
      
      if (match && match[1]) {
        // Clean up the enhanced code and ensure it ends with a newline
        const extractedCode = match[1].trim();
        enhancedCode = cleanMermaidCode(extractedCode);
        
        if (!enhancedCode) {
          // If cleaning removed everything, use original code
          enhancedCode = mermaidCode + "\n";  // Add newline to original code too
          console.warn("Cleaned code was empty, reverting to original");
        }
        
        // Extract insight from before the code block
        const beforeCodeBlock = aiResponse.split("```mermaid")[0].trim();
        if (beforeCodeBlock) {
          insight = beforeCodeBlock;
        }
      } else {
        console.warn("No code block found in AI response");
        // Ensure original code has a newline at the end
        enhancedCode = mermaidCode + "\n";
      }

      // Print the first 100 characters of the enhanced code for debugging
      console.log("Enhanced code (first 100 chars):", enhancedCode.substring(0, 100));
      
      // Add fallback for simple diagrams if needed
      if (enhancedCode.length < 20) {
        console.warn("Enhanced code too short, using fallback");
        enhancedCode = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E
    
    style A fill:#90EE90,stroke:#333
    style E fill:#FF9090,stroke:#333
`;
        insight = "Using fallback diagram as the AI generation had issues.";
      }

      return NextResponse.json({ 
        enhancedCode,
        insight,
        model: selectedModel.name
      });
      
    } catch (apiError: any) {
      console.error("Groq API Error:", apiError.message);
      return NextResponse.json(
        { error: `AI API error: ${apiError.message}` },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("Error processing request:", error.message);
    return NextResponse.json(
      { error: "Failed to enhance diagram" },
      { status: 500 }
    );
  }
}