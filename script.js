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
   

  const res = await fetch("https://lingoformat.vercel.app/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ html })
});

const data = await res.json();


 document.getElementById("output").textContent =
  `${data.message}\nHTML size: ${data.receivedHTMLLength}`;

  } catch (e) {
    alert("API error");
    console.error(e);
  }
}
