"use server";

import { API_BASE_URL } from "../lib/constants/config";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chatWithAI(messages: ChatMessage[]) {
  try {
    // Calling our OWN backend API
    const response = await fetch(`${API_BASE_URL}/chat/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    return { success: true, message: result.aiResponse };
  } catch (error) {
    console.error("Internal Chat Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to connect to our AI service." 
    };
  }
}


