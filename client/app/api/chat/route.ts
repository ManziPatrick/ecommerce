import { NextRequest, NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "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",
});

export async function POST(request: NextRequest) {
    try {
        const { messages, context } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Invalid messages format" },
                { status: 400 }
            );
        }

        // Prepare messages with context
        const systemMessage = {
            role: "system",
            content: context || "You are a helpful assistant for macyemacye e-commerce store.",
        };

        const chatMessages = [systemMessage, ...messages];

        // Call OpenRouter API
        const completion = await openrouter.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: chatMessages as any,
            temperature: 0.7,
            max_tokens: 500,
        });

        const assistantMessage = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

        return NextResponse.json({
            message: assistantMessage,
            success: true,
        });
    } catch (error: any) {
        console.error("OpenRouter API Error:", error);

        return NextResponse.json(
            {
                error: "Failed to process chat request",
                message: "I'm having trouble connecting right now. Please try again or contact our support team at +250 790 706 170.",
                success: false,
            },
            { status: 500 }
        );
    }
}
