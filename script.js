document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generateBtn");

  btn.addEventListener("click", generate);
});

async function generate() {
  const htmlFile = document.getElementById("htmlFile").files[0];

  if (!htmlFile) {
    alert("Upload HTML file");
    return;
  }

  const html = await htmlFile.text();

  try {
    console.log("BEFORE fetch");

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ html })
  });

  
    console.log("status:", res.status);
const data = await res.json();
console.log("response data:", data);

    document.getElementById("output").textContent = data.output;

  } catch (e) {
    alert("API error");
    console.error(e);
  }
}
