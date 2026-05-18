export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: "You are a helpful assistant for Wray Villa Retreat in Portland, Jamaica. Answer guest questions warmly.",
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, data);
      return res.status(response.status).json({
        error: data.error?.message || "API error",
        details: data,
      });
    }

    return res.status(200).json({ content: data.content });

  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
