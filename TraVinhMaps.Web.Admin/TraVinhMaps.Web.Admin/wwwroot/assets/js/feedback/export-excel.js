const sessionId = "@sessionId";

/* ---------- 1. Helpers ---------- */

// Remove HTML tags from a string
function stripHtml(html) {
  if (!html) return html;         
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "—";
}

/* ---------- 2. Export trigger ---------- */

$("#feedbackExportBtn").on("click", function () {
  showInfoAlert(
    "Exporting Feedback",
    "Retrieving all feedback for export...",
    "OK",
    exportFeedbackToExcel                
  );
});

/* ---------- 3. Main export function ---------- */

function exportFeedbackToExcel() {
  $.ajax({
    url: "https://localhost:7162/api/Feedback/all",
    type: "GET",
    headers: {
      sessionId: sessionId,
      "X-CSRF-TOKEN": $('input[name="__RequestVerificationToken"]').val(),
    },
    success: function (response) {
      console.log("API response received:", response);

      // Response schema: { data: [...] }
      const feedbacks = response.data || [];

      if (feedbacks.length === 0) {
        showTimedAlert(
          "Export Warning!",
          "No feedback found for export.",
          "warning",
          1000
        );
        return;
      }

      try {
        /* ---------- 3.1 Build worksheet data ---------- */

        // Header must match the data columns below (7 cols)
        const headerRow = [
          "No.",
          "ID",
          "UserId",
          "Username",
          "Content",
          "Images",
          "Created At",
        ];

        const data = [headerRow];

        feedbacks.forEach((item, index) => {
          // Format images array → newline‑separated list
          const imagesStr =
            item.images && item.images.length > 0
              ? item.images.join("\n")
              : "—";

          const rowData = [
            (index + 1).toString(),
            item.id || "—",
            item.userId || "—",
            item.username || "—",
            stripHtml(item.content) || "—",
            imagesStr,
            item.createdAt
              ? new Date(item.createdAt).toLocaleString()
              : "—",
          ];

          data.push(rowData);
        });

        /* ---------- 3.2 Create workbook ---------- */

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Column widths for readability
        ws["!cols"] = [
          { wch: 5 },   // No.
          { wch: 25 },  // ID
          { wch: 25 },  // UserId
          { wch: 30 },  // Username
          { wch: 60 },  // Content
          { wch: 100 }, // Images
          { wch: 25 },  // Created At
        ];

        // Optional: uniform row height
        ws["!rows"] = Array(data.length).fill({ hpt: 25 });

        XLSX.utils.book_append_sheet(wb, ws, "Feedback");

        /* ---------- 3.3 Save file ---------- */

        const today = new Date().toISOString().slice(0, 10);
        const fileName = `feedback_${today}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showTimedAlert(
          "Export Successful!",
          `${feedbacks.length} feedback items have been exported.`,
          "success",
          1000
        );
      } catch (ex) {
        console.error("Error during Excel creation:", ex);
        showTimedAlert(
          "Export Error",
          `Error creating Excel file: ${ex.message}`,
          "error",
          1000
        );
      }
    },

    error: function (xhr, status, error) {
      console.error("API Error Details:", status, error);

      let errorMessage =
        "Could not retrieve feedback data. Please check your connection or permissions.";
      if (xhr.status === 401) {
        errorMessage = "Unauthorized access. Please log in again.";
      } else if (xhr.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      }

      showTimedAlert("Export Error!", errorMessage, "error", 1000);
    },
  });
}
