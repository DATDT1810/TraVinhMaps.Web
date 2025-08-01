// Handle Excel export
$("#adminExportBtn").on("click", function () {
  showInfoAlert(
    "Exporting Data",
    "Retrieving all admin data for export...",
    "OK",
    exportTableToExcel
  );
});

// Get session ID from Razor
const sessionId = "@sessionId";

// Function to export admin data to Excel
function exportTableToExcel() {
  $.ajax({
    url: window.apiBaseUrl + "/api/Admins/all",
    type: "GET",
    headers: {
      sessionId: sessionId,
    },
    success: function (response) {
      if (response && response.length > 0) {
        const wb = XLSX.utils.book_new();

        const headerRow = [
          "No.",
          "Username",
          "Email",
          "Status",
          "Is Forbidden",
          "Created At",
          "Updated At",
          "Role ID",
          "Avatar URL",
        ];

        const data = [headerRow];

        response.forEach((admin, index) => {
          const row = [
            index + 1,
            admin.username || "—",
            admin.email || "—",
            admin.status ? "Active" : "Inactive",
            admin.isForbidden ? "Yes" : "No",
            admin.createdAt
              ? new Date(admin.createdAt).toLocaleString()
              : "—",
            admin.updatedAt
              ? new Date(admin.updatedAt).toLocaleString()
              : "—",
            admin.roleId || "—",
            (admin.profile && admin.profile.avatar) || "—",
          ];

          data.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Optional: column width
        ws["!cols"] = [
          { wch: 5 },  // No.
          { wch: 20 }, // Username
          { wch: 30 }, // Email
          { wch: 10 }, // Status
          { wch: 12 }, // Is Forbidden
          { wch: 20 }, // Created At
          { wch: 20 }, // Updated At
          { wch: 10 }, // Role ID
          { wch: 40 }, // Avatar URL
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Admins");

        const today = new Date().toISOString().slice(0, 10);
        const fileName = `admin_list_${today}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showTimedAlert(
          "Export Successful!",
          `${response.length} admins have been exported.`,
          "success",
          1000
        );
      } else {
        showTimedAlert(
          "Export Error!",
          "No admin data available.",
          "error",
          1000
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("Error fetching admin data:", error);
      showTimedAlert(
        "Export Error!",
        "Failed to retrieve data. Check connection or permission.",
        "error",
        1000
      );
    },
  });
}
