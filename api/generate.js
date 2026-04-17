
const mammoth = require("mammoth");
const archiver = require("archiver");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { htmlBase64, docxBase64 } = req.body;
    if (!htmlBase64 || !docxBase64) return res.status(400).json({ error: "Missing files" });

    const htmlContent = Buffer.from(htmlBase64, "base64").toString("utf-8");
    const docxBuffer = Buffer.from(docxBase64, "base64");
    const { value: docxText } = await mammoth.extractRawText({ buffer: docxBuffer });

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 8000,
        system: `You are an expert HTML email developer and multilingual content processor.
Your task is to generate localized HTML email versions from an English source HTML and a translation document.

RULES:
1. Preserve the FULL HTML structure — tables, VML, inline CSS, MSO conditionals, SFMC AMPscript, tracking links. Do NOT alter any of this.
2. Only replace visible text content with the translated equivalent.
3. Maintain full Outlook and SFMC compatibility.
4. Bold mapping: identify every bold/strong element in the English HTML, find the semantic equivalent phrase in the translation, and apply the same bold/strong tags.
5. Do NOT translate or modify HTML attributes, URLs, href values, class names, IDs, or inline styles.
6. Detect all non-English languages present in the translation document.

OUTPUT FORMAT (strictly follow this — no JSON, no markdown):
For each language, output a block like:
<!-- LANG: German -->
<full html here>
<!-- END -->

<!-- LANG: French -->
<full html here>
<!-- END -->`,
        messages: [{
          role: "user",
          content: `English HTML email:\n${htmlContent}\n\n---\nTranslation document:\n${docxText}`
        }]
      })
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      return res.status(500).json({ error: "Claude API error", detail: err });
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content.find(b => b.type === "text")?.text || "";

    // Parse language blocks
    const blockRegex = /<!--\s*LANG:\s*(.+?)\s*-->([\s\S]*?)<!--\s*END\s*-->/gi;
    const languages = [];
    let match;
    while ((match = blockRegex.exec(rawText)) !== null) {
      languages.push({ lang: match[1].trim(), html: match[2].trim() });
    }

    if (!languages.length) {
      return res.status(500).json({ error: "No language blocks found in Claude response", raw: rawText.slice(0, 500) });
    }

    // Build ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=localized_emails.zip");

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(res);

    for (const { lang, html } of languages) {
      const filename = `email_${lang.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.html`;
      archive.append(html, { name: filename });
    }

    await archive.finalize();

  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
};
