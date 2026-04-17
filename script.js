document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generateBtn");

  btn.addEventListener("click", generate);
});

async function generate() {
  console.log("generate function called");

  const fileInput = document.getElementById("htmlFile");
  const htmlFile = fileInput.files[0];

  if (!htmlFile) {
    alert("Upload HTML file");
    return;
  }

  const html = await htmlFile.text();

  try {
    const res = await fetch("https://lingoformat.vercel.app/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ html })
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);

    document.getElementById("output").textContent =
      data.message || JSON.stringify(data, null, 2);

  } catch (err) {
    console.error("Frontend error:", err);
    alert("Something went wrong");
  }
}
