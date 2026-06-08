function goBack() {
  window.history.back();
}

document.addEventListener("DOMContentLoaded", function () {

  const form      = document.getElementById("registrationForm");
  const submitBtn = document.getElementById("submitBtn");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    const fd   = new FormData(form);
    const data = {};
    fd.forEach((value, key) => { data[key] = value; });
    data.timestamp = new Date().toLocaleString();

    const payload = {
      access_key: "e520ef25-1ade-4cf1-8138-c63df3a50548",
      subject:    "VHM Scholarship – New Prize Claim Registration",
      from_name:  "VHM Scholarship Portal",
      email:      data["Parent Email"] || "info@vhmscholarship.org",

      message: `
NEW PRIZE CLAIM REGISTRATION
Submitted: ${data.timestamp}

── STUDENT ──────────────────────────────
First Name   : ${data["First Name"]    || ""}
Middle Name  : ${data["Middle Name"]   || ""}
Surname      : ${data["Surname"]       || ""}
Current Class: ${data["Current Class"] || ""}

── SCHOOL ───────────────────────────────
School Name   : ${data["School Name"]    || ""}
School Address: ${data["School Address"] || ""}
School Phone  : ${data["School Phone"]   || ""}
Class Teacher : ${data["Class Teacher"]  || ""}
Principal     : ${data["Principal"]      || ""}

── FEES ─────────────────────────────────
Tuition Amount: ${data["Tuition Amount"] || ""}
Bank Details  : ${data["Bank Details"]   || ""}

── SIGNATURES ───────────────────────────
Principal Name: ${data["Principal Name"] || ""}
HCF Leader    : ${data["HCF Leader"]     || ""}
Parent Name   : ${data["Parent Name"]    || ""}
      `.trim()
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Submission failed");
      }

      // Save ALL fields with camelCase keys so prizesuccess.html can populate the PDF
      localStorage.setItem("candidateData", JSON.stringify({
        firstName:     data["First Name"]    || "",
        middleName:    data["Middle Name"]   || "",
        lastName:      data["Surname"]       || "",
        currentClass:  data["Current Class"] || "",

        schoolName:    data["School Name"]    || "",
        schoolAddress: data["School Address"] || "",
        schoolPhone:   data["School Phone"]   || "",
        classTeacher:  data["Class Teacher"]  || "",
        principal:     data["Principal"]      || "",

        tuitionAmount: data["Tuition Amount"] || "",
        bankDetails:   data["Bank Details"]   || "",

        principalName: data["Principal Name"] || "",
        hcfLeader:     data["HCF Leader"]     || "",
        parentName:    data["Parent Name"]    || "",

        timestamp: data.timestamp
      }));

      submitBtn.textContent = "Success! Redirecting…";
      window.location.href = "prizesuccess.html";

    } catch (err) {
      console.error("Web3Forms error:", err);
      alert("❌ Submission failed. Please check your connection and try again.");
      submitBtn.disabled    = false;
      submitBtn.textContent = "Submit";
    }
  });

});
