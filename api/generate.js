export default async function handler(req, res) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "Translate HTML email while preserving structure"
        },
        {
          role: "user",
          content: req.body.html
        }
      ]
    })
  });

  const data = await response.json();
  console.log("OPENAI RAW:", data); // 👈 ADD HERE

  res.status(200).json({
    output: data.choices?.[0]?.message?.content || ""
  });
}// JavaScript Document
