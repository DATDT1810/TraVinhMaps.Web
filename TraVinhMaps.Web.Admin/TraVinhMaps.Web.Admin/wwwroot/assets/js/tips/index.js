$(document).ready(function () {
  // Bộ lọc trạng thái
  $("#statusFilter").on("change", function () {
    const filter = $(this).val();
    let hasVisibleRows = false;

    $("table tbody tr:not(#no-items-row)").each(function () {
      const row = $(this);
      const tagId = String(row.data("tag-id") || "");
      const isActive = row.find('[id="delete-tips"]').length > 0;

      let show = false;
      if (filter === "all") show = isActive;
      else if (filter === "inactive") show = !isActive;
      else {
        const tagIds = tagId.split(",");
        show = tagIds.includes(filter) && isActive;
      }

      if (show) {
        row.show();
        hasVisibleRows = true;
      } else {
        row.hide();
      }
    });

    $("#no-items-row").toggle(!hasVisibleRows);
    updateSTT();
  });

  // Xóa tips
  $(document).on("click", "#delete-tips", function (e) {
    e.preventDefault();
    var id = $(this).data("id");
    var $row = $(this).closest("tr");
    var token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirm delete",
      "Are you sure you want to delete this tip?",
      "Delete",
      "Cancel"
    ).then(function (confirmed) {
      if (confirmed) {
        $.ajax({
          url: "/CommunityTips/Delete",
          type: "POST",
          data: {
            __RequestVerificationToken: token,
            id: id,
          },
          success: function (response) {
            if (response.success) {
              showTimedAlert("Success!", response.message, "success", 1000);
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              showTimedAlert("Error!", response.message, "error", 1000);
            }
          },
          error: function () {
            showTimedAlert(
              "Error!",
              "An error occurred while deleting the tip.",
              "error",
              1000
            );
          },
        });
      }
    });
  });

  // Khôi phục tips
  $(document).on("click", "#restore-tips", function (e) {
    e.preventDefault();
    var id = $(this).data("id");
    var $row = $(this).closest("tr");
    var token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Restore Tip",
      "Are you sure you want to restore this tip?",
      "Restore",
      "Cancel"
    ).then(function (confirmed) {
      if (confirmed) {
        $.ajax({
          url: "/CommunityTips/Restore",
          type: "POST",
          data: {
            __RequestVerificationToken: token,
            id: id,
          },
          success: function (response) {
            if (response.success) {
              showTimedAlert("Success!", response.message, "success", 1000);
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              showTimedAlert("Error!", response.message, "error", 1000);
            }
          },
          error: function () {
            showTimedAlert(
              "Error!",
              "An error occurred while restoring the tip.",
              "error",
              1000
            );
          },
        });
      }
    });
  });

  // Hàm cập nhật số thứ tự (STT)
  function updateSTT() {
    let stt = 1;
    $("table tbody tr:not(#no-items-row):visible").each(function () {
      $(this).find("td:eq(0)").text(stt++);
    });
  }

  // Gọi filter khi load trang
  $("#statusFilter").trigger("change");
  updateSTT();
});

// ------- Export Tips to Excel -------
// Hàm stripHtml để loại bỏ thẻ HTML và xử lý ký tự xuống dòng
function stripHtml(html) {
  if (!html) return "—"; // Trả về "—" nếu html là null/undefined
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  let text = tmp.textContent || tmp.innerText || "—";
  // Thay thế \r\n bằng dấu xuống dòng thực tế cho Excel
  return text.replace(/\r\n/g, '\n');
}

// Get session ID from Razor
const sessionId = "@sessionId";

// Handle export button click
$("#tipsExportBtn").on("click", function () {
  showInfoAlert(
    "Exporting Tips",
    "Retrieving all community tips for export...",
    "OK",
    exportTipsToExcel
  );
});

function exportTipsToExcel() {
  $.ajax({
    url: "https://localhost:7162/api/CommunityTips/GetAllTip",
    type: "GET",
    headers: {
      sessionId: sessionId,
      "X-CSRF-TOKEN": $('input[name="__RequestVerificationToken"]').val()
    },
    success: function (response) {
      console.log("API response received:", JSON.stringify(response, null, 2));

      // Extract tips: handle both flat array and object with data property
      let tips = Array.isArray(response) ? response : (response.data || []);

      // Debug: Log response details
      if (!response) {
        console.error("Response is null or undefined.");
      } else if (Array.isArray(response)) {
        console.log("Response is a flat array with", response.length, "tips.");
      } else if (!response.data) {
        console.warn("Warning: response.data is undefined or null. Full response:", JSON.stringify(response, null, 2));
      } else if (response.data.length === 0) {
        console.warn("Warning: response.data is an empty array.");
      }

      if (tips.length > 0) {
        try {
          // Create a workbook
          const wb = XLSX.utils.book_new();

          // Create header row with all fields from CommunityTipsResponse
          const headerRow = [
            "No.",
            "ID",
            "Title",
            "Content",
            "Tag ID",
            "Tag Name",
            "Status",
            "Created At",
            "Updated At"
          ];

          const data = [headerRow];

          // Process the tip data
          tips.forEach((tip, index) => {
            const rowData = [
              (index + 1).toString(),
              tip.id || "—",
              stripHtml(tip.title) || "—",
              stripHtml(tip.content) || "—",
              tip.tagId || "—",
              tip.tagName || "—", // Handle missing tagName
              tip.status ? "Active" : "Inactive",
              tip.createdAt ? new Date(tip.createdAt).toLocaleString() : "—",
              tip.updateAt ? new Date(tip.updateAt).toLocaleString() : "—"
            ];

            data.push(rowData);
          });

          // Create worksheet from data
          const ws = XLSX.utils.aoa_to_sheet(data);

          // Set column widths for better readability
          ws['!cols'] = [
            { wch: 5 },   // No.
            { wch: 25 },  // ID
            { wch: 40 },  // Title
            { wch: 80 },  // Content
            { wch: 25 },  // Tag ID
            { wch: 20 },  // Tag Name
            { wch: 10 },  // Status
            { wch: 20 },  // Created At
            { wch: 20 }   // Updated At
          ];

          // Configure row heights to accommodate multiline text
          const rowCount = data.length;
          ws['!rows'] = [];
          for (let i = 0; i < rowCount; i++) {
            ws['!rows'][i] = { hpt: 40 }; // Increased row height
          }

          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, "Community Tips");

          // Generate Excel file and trigger download
          const today = new Date().toISOString().slice(0, 10);
          const fileName = `community_tips_${today}.xlsx`;
          XLSX.writeFile(wb, fileName);

          showTimedAlert(
            "Export Successful!",
            `${tips.length} tips have been exported to Excel.`,
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
      } else {
        showTimedAlert(
          "Export Warning!",
          "No tips found for export.",
          "warning",
          1000
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("API Error Details:", status, error, xhr.responseText);
      let errorMessage = "Could not retrieve tip data. Please check your connection or permissions.";
      if (xhr.status === 401) {
        errorMessage = "Unauthorized access. Please log in again.";
      } else if (xhr.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      } else if (xhr.status === 404) {
        errorMessage = "API endpoint not found. Verify the URL: https://localhost:7162/api/CommunityTips/GetAllTip";
      }
      showTimedAlert("Export Error!", errorMessage, "error", 1000);
    }
  });
}