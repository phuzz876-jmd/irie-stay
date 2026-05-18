export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are a helpful assistant for Wray Villa Retreat in Portland Jamaica. Answer guest questions helpfully.",
        messages: messages,
      }),
    });

    const data = await response.json();
    console.log("Status:", response.status, "Data:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "API error" });
    }

    return res.status(200).json({ content: data.content });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
