export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ step: "env", error: "ANTHROPIC_API_KEY is not set" });
  }

  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 50,
        messages: [{ role: "user", content: "Say hello." }],
      }),
    });

    const body = await claudeRes.text();

    return res.status(200).json({
      step: "claude",
      claudeStatus: claudeRes.status,
      claudeOk: claudeRes.ok,
      claudeBody: body.slice(0, 500),
    });
  } catch (err) {
    return res.status(500).json({ step: "fetch", error: err.message });
  }
}
