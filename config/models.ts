export const aiModels = {
  qwen: {
    name: "Qwen 2.5",
    // Actual Groq model ID for Qwen
    modelId: "deepseek-r1-distill-qwen-32b",
    description: "An advanced AI model for enhancing text and generating flowcharts."
  },
  deepseek: {
    name: "DeepSeek V2",
    // Actual Groq model ID for DeepSeek
    modelId: "deepseek-ai/deepseek-v2",
    description: "An open-source model for improving README content and visualizations."
  },
  llama: {
    name: "Llama 3.1 405B",
    // Actual Groq model ID for Llama
    modelId: "meta-llama/Meta-Llama-3.1-405B-Instruct",
    description: "Meta's latest open-source LLM for high-quality text generation and analysis."
  }
};

export const groqApiConfig = {
  // Actual Groq API base URL
  baseUrl: "https://api.groq.com/openai/v1",
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  
  // System prompt for flowchart generation
  flowchartSystemPrompt: "Analyze the README content and extract the main components, relationships, and processes that should be represented in a flowchart. Focus on identifying key entities, their connections, and the flow of information or processes."
};