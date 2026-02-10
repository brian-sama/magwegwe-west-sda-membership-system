
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMembershipReport = async (members: any[], logs: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following membership data and audit logs for Magwegwe West SDA Church.
        Membership Count: ${members.length}
        Recent Activities: ${JSON.stringify(logs.slice(0, 5))}
        
        Provide a concise, professional summary for the Pastor including:
        1. Growth trends (baptism vs transfers by letter).
        2. Notable security activities from logs.
        3. A recommendation for community outreach or spiritual nurturing based on membership activity.
        
        Format the response in clear Markdown.
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Failed to generate church intelligence report at this time.";
  }
};

export const chatWithAssistant = async (query: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an intelligent assistant for the Magwegwe West SDA Membership System.
        Context: ${context}
        User Query: ${query}
        
        Provide helpful, compliant answers regarding the church management system. 
        Focus on accuracy regarding Seventh-day Adventist membership procedures (like transfers and baptisms) if asked.
        If asked to perform actions, explain that you can only provide information and the user must use the interface for changes.
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my brain right now.";
  }
};
