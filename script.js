async function generate() {
  const htmlFile = document.getElementById("htmlFile").files[0];
  const docxFile = document.getElementById("docxFile").files[0];

  if (!htmlFile || !docxFile) {
    alert("Upload both files");
    return;
  }

  const html = await htmlFile.text();

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ html })
  });

  const data = await res.json();
  document.getElementById("output").textContent = data.output;
}// JavaScript Document