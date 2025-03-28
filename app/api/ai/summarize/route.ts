import { NextResponse } from "next/server";
import { aiModels, groqApiConfig } from "@/config/models";

export async function POST(request: Request) {
  try {
    const { content, model } = await request.json();
    
    // Validate inputs
    if (!content || !model) {
      return NextResponse.json(
        { error: "Content and model are required" },
        { status: 400 }
      );
    }
    
    // Check if model exists in our config
    const selectedModel = aiModels[model as keyof typeof aiModels];
    if (!selectedModel) {
      return NextResponse.json(
        { error: `Model "${model}" not found` },
        { status: 400 }
      );
    }
    
    // Log API request details for debugging
    console.log(`Calling Groq API with model: ${selectedModel.modelId}`);
    console.log(`API key present: ${!!groqApiConfig.apiKey}`);
    
    // Call the Groq API with better error handling
    const response = await fetch(`${groqApiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel.modelId,
        messages: [
          {
            role: "system",
            content: groqApiConfig.flowchartSystemPrompt
          },
          {
            role: "user",
            content: `Summarize the following README content and identify key components, relationships, and flow for a flowchart:\n\n${content.substring(0, 4000)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      }),
    });

    // More detailed error handling
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawError: errorText };
      }
      
      console.error("Groq API error:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check response format
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid API response format:", data);
      return NextResponse.json(
        { error: "Invalid API response format" },
        { status: 500 }
      );
    }

    const summary = data.choices[0].message.content.trim();
    return NextResponse.json({ summary });
    
  } catch (error) {
    console.error("Error in AI summarize endpoint:", error);
    return NextResponse.json(
      { error: "Failed to summarize content", details: (error instanceof Error) ? error.message : String(error) },
      { status: 500 }
    );
  }
}