/************************************************************
 *  export-notifications.js  –  Export Notifications to Excel
 ************************************************************/

/* ===== 1. Thông báo Success / Error khi vừa load trang ===== */
document.addEventListener("DOMContentLoaded", () => {
  if (successMessage)
    showTimedAlert("Success!", successMessage, "success", 1000);
  else if (errorMessage) showTimedAlert("Error!", errorMessage, "error", 1000);
});

/* ===== 2. Hàm loại bỏ HTML (CKEditor) ===== */
function stripHtml(html) {
  if (!html) return "";
  // Chuyển <br> thành xuống dòng trước khi loại tag
  const tmp = document.createElement("div");
  tmp.innerHTML = html.replace(/<br\s*\/?>/gi, "\n");
  return (tmp.textContent || tmp.innerText || "").trim();
}

/* ===== 3. Nút Export ===== */
const sessionId = "@sessionId";

$("#notificationExportBtn").on("click", () => {
  showInfoAlert(
    "Exporting Notifications",
    "Retrieving all notifications for export...",
    "OK",
    exportNotificationsToExcel
  );
});

/* ===== 4. Export function ===== */
function exportNotificationsToExcel() {
  $.ajax({
    url: window.apiBaseUrl + "api/Notifications/all",
    type: "GET",
    headers: { sessionId },
    success: (resp) => {
      if (!resp || resp.length === 0) {
        showTimedAlert(
          "Export Error!",
          "No notifications found.",
          "error",
          1000
        );
        return;
      }

      /* ---------- Tạo workbook ---------- */
      const wb = XLSX.utils.book_new();
      const header = [
            "No.",
            "ID",
            "Title",
            "Content",
            "Created At",
          ];
      const rows = [header];

      resp.forEach((n, i) =>
        rows.push([
          i + 1,
          n.id || "—",
          stripHtml(n.title) || "—",
          stripHtml(n.content) || "—",
          n.createdAt ? new Date(n.createdAt).toLocaleString() : "—",
        ])
      );

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Column widths
      ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 60 }, { wch: 22 }];

      XLSX.utils.book_append_sheet(wb, ws, "Notifications");
      const fileName = `notifications_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showTimedAlert(
        "Export Successful!",
        `${resp.length} notifications have been exported.`,
        "success",
        1000
      );
    },
    error: () =>
      showTimedAlert(
        "Export Error!",
        "Could not retrieve notification data.",
        "error",
        1000
      ),
  });
}
