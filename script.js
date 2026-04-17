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
    // STEP 1: UI status
    status.textContent = "Reading files...";

    // STEP 2: Convert to base64
    const htmlBase64 = await fileToBase64(htmlFile);
    const docxBase64 = await fileToBase64(docxFile);

    status.textContent = "Sending to AI...";

    // STEP 3: API call
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

    // STEP 4: HANDLE ERROR RESPONSE (IMPORTANT NEW PART)
    if (!res.ok) {
      let errMsg = "Unknown error";

      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
        console.error("Backend error:", err);
      } catch (e) {
        console.error("Non-JSON error response");
      }

      status.textContent = "Error ❌";
      alert(errMsg);
      return;
    }

    status.textContent = "Generating ZIP...";

    // STEP 5: Download ZIP
    const blob = await res.blob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "localized_emails.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    status.textContent = "Download complete ✔";

  } catch (err) {
    console.error(err);
    status.textContent = "Failed ❌";
    alert("Something went wrong while generating email");
  }
}

// Convert file → base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
