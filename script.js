document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generateBtn");
  btn.addEventListener("click", generate);
});

async function generate() {
  const status = document.getElementById("status");
  const output = document.getElementById("output");

  try {
    status.textContent = "⏳ Calling API...";
    output.textContent = "";

    const fileInput = document.getElementById("htmlFile");
    const htmlFile = fileInput.files[0];

    if (!htmlFile) {
      alert("Upload HTML file");
      status.textContent = "Idle";
      return;
    }

    const html = await htmlFile.text();

    status.textContent = "📡 Sending request...";

    const res = await fetch("https://lingoformat.vercel.app/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ html })
    });

    status.textContent = "⏳ Waiting for response...";

    const data = await res.json();

    console.log("API RESPONSE:", data);

    if (!res.ok) {
      status.textContent = "❌ Error";
      output.textContent = data.error || "API Error";
      return;
    }

    status.textContent = "✅ Done";
    output.textContent = data.output || "No output returned";

  } catch (err) {
    console.error(err);
    status.textContent = "❌ Failed";
    output.textContent = "Something went wrong";
  }
}
