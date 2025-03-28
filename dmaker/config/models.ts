export const aiModels = {
    qwen: {
      name: "Qwen 2.5",
      endpoint: "https://api.example.com/qwen",
      description: "An advanced AI model for enhancing text and generating flowcharts."
    },
    deepsekk: {
      name: "Deepsekk",
      endpoint: "https://api.example.com/deepsekk",
      description: "An open-source model for improving README content and visualizations."
    }
  };
  
  export const groqApiConfig = {
    baseUrl: "https://api.example.com/groq",
    apiKey: process.env.GROQ_API_KEY,
  };