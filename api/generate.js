export default async function handler(req, res) {
  try {
    console.log("API HIT");

    const html = req.body?.html || "";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Translate HTML email while preserving structure."
          },
          {
            role: "user",
            content: html
          }
        ]
      })
    });

    const data = await response.json();

    console.log("OPENAI RESPONSE:", data);

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "OpenAI error",
        type: data.error?.code || data.error?.type
      });
    }

    return res.status(200).json({
      output: data?.choices?.[0]?.message?.content || ""
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}
