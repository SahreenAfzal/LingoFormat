document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generateBtn").addEventListener("click", generate);
});

async function generate() {
  const status = document.getElementById("status");

  const htmlFile = document.getElementById("htmlFile").files[0];
  const docxFile = document.getElementById("docxFile").files[0];

  if (!htmlFile || !docxFile) {
    alert("Please upload both HTML and DOCX files");
    return;
  }

  try {
    status.textContent = "Reading files...";

    const htmlBase64 = await fileToBase64(htmlFile);
    const docxBase64 = await fileToBase64(docxFile);

    status.textContent = "Sending to server...";

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        html: htmlBase64.split(",")[1],
        file: docxBase64.split(",")[1]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      alert(err.error || "Something went wrong");
      status.textContent = "Error";
      return;
    }

    status.textContent = "Generating ZIP...";

    const blob = await res.blob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "localized_emails.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();

    status.textContent = "Download complete ✔";

  } catch (err) {
    console.error(err);
    status.textContent = "Failed";
    alert("Something went wrong");
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
