// OpenRouter API - provides access to multiple LLM providers
// Free models available: deepseek, meta-llama, google gemini experimental
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free model options on OpenRouter:
// - "google/gemma-3-27b-it:free" - Google Gemma 3 27B (free)
// - "meta-llama/llama-3.2-3b-instruct:free" - Meta Llama 3.2 (free)  
// - "mistralai/mistral-7b-instruct:free" - Mistral 7B (free)
const DEFAULT_MODEL = "google/gemma-3-27b-it:free";

if (!OPENROUTER_API_KEY) {
    console.warn("WARNING: OPENROUTER_API_KEY is not set in environment variables");
}

// Helper to generate text from prompt using OpenRouter
export async function generateText(prompt: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured. Please add it to your .env file.");
    }

    try {
        const response = await fetch(OPENROUTER_BASE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "AI Study Tracker"
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text || text.trim().length === 0) {
            throw new Error("AI returned empty response");
        }

        return text;
    } catch (error: any) {
        console.error("OpenRouter Error:", error);
        if (error.message?.includes('API key')) {
            throw new Error("Invalid API key. Please check your OPENROUTER_API_KEY in .env");
        }
        if (error.message?.includes('quota') || error.message?.includes('rate')) {
            throw new Error("API rate limit reached. Please try again later.");
        }
        throw new Error(error.message || "Failed to generate content");
    }
}
