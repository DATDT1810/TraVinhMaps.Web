$(document).ready(function () {
  const table = $("#project-status").DataTable({
    paging: true,
    ordering: true,
    info: true,
    searching: true,
    columnDefs: [
      {
        targets: 0,
        searchable: false,
        orderable: false,
      },
      {
        // Cột Status
        targets: 4,
        render: (data, type) => {
          if (type === "filter" || type === "sort") {
            return $("<div>").html(data).text().trim(); // Bóc text từ HTML
          }
          return data; // Giữ nguyên badge khi hiển thị
        },
      },
    ],
  });

  /* ========== Vẽ lại số thứ tự No. ========== */
  table
    .on("order.dt search.dt draw.dt", function () {
      let i = 1;
      table
        .cells(null, 0, { search: "applied", order: "applied" })
        .every(function () {
          this.data(i++);
        });
    })
    .draw();

  /* ========== 2. BỘ LỌC THEO COMBOBOX ========== */
  $("#statusFilter").on("change", () => table.draw());

  // Hàm filter
  $.fn.dataTable.ext.search.push((settings, data) => {
    const filter = $("#statusFilter").val(); // all | inactive
    const status = data[4]; // Text thuần nhờ render

    if (filter === "inactive") return status === "Inactive";
    return status === "Active"; // "all" chỉ hiển thị Active
  });

  $("#statusFilter").val("active").trigger("change"); // Mặc định

  /* ========== 3. HÀM CẬP NHẬT 1 HÀNG ========== */
  function updateRow(row, isActive) {
    const statusSpan = row.find("td:eq(4) span");
    if (isActive) {
      statusSpan
        .text("Active")
        .removeClass("badge-light-danger")
        .addClass("badge-light-primary");
    } else {
      statusSpan
        .text("Inactive")
        .removeClass("badge-light-primary")
        .addClass("badge-light-danger");
    }
    table.row(row).invalidate().draw(false); // Giữ nguyên trang
  }

  // AJAX Ban user with SweetAlert2
  $(document).on("click", ".delete-eventandfestival", function (e) {
    e.preventDefault();
    const eventAndFestivalId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to delete this event and festival?",
      "Delete",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        $.ajax({
          url: "/Admin/EventAndFestivalManagement/DeleteEventAndFestival",
          method: "POST",
          data: { id: eventAndFestivalId },
          headers: {
            RequestVerificationToken: token,
          },
          success: function (response) {
            if (response.success) {
              // const row = $(`a[data-id="${destinationId}"]`).closest("tr");
              const row = $('a[data-id="' + eventAndFestivalId + '"]').closest(
                "tr"
              );
              row
                .find("td:eq(4) span")
                .text("Inactive")
                .removeClass("badge-light-primary")
                .addClass("badge-light-danger");
              // Update action dropdown from Ban -> Unban
              const actionCell = row.find("td:last-child ul.action");
              actionCell.find(".delete-eventandfestival").replaceWith(
                `<a title="Restore" class="restore undelete-eventandfestival" href="javascript:void(0)"
                                                                    data-id="@item.Id"><i class="fa fa-undo"></i></a>`
              );
              table.row(row).invalidate().draw(false);
              showTimedAlert("Success!", response.message, "success", 1000);
            } else {
              showTimedAlert("Failed!", response.message, "error", 1000);
            }
          },
          error: function (xhr) {
            showTimedAlert(
              "Error!",
              "An error occurred while banning the event and festival: " +
                (xhr.responseJSON?.message || "Unknown error"),
              "error",
              1000
            );
          },
        });
      }
    });
  });

  // AJAX Unban user with SweetAlert2
  $(document).on("click", ".undelete-eventandfestival", function (e) {
    e.preventDefault();
    const eventAndFestivalId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to restore this event and festival?",
      "Restore",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        $.ajax({
          url: "/Admin/EventAndFestivalManagement/RestoreEventAndFestival",
          method: "POST",
          data: { id: eventAndFestivalId },
          headers: {
            RequestVerificationToken: token,
          },
          success: function (response) {
            if (response.success) {
              // const row = $(`a[data-id="${destinationId}"]`).closest("tr");
              const row = $('a[data-id="' + eventAndFestivalId + '"]').closest(
                "tr"
              );

              row
                .find("td:eq(4) span")
                .text("Active")
                .removeClass("badge-light-danger")
                .addClass("badge-light-primary");

              // Update action dropdown from Unban -> Ban
              const actionCell = row.find("td:last-child ul.action");
              actionCell.find(".undelete-eventandfestival").replaceWith(
                `<a title="Delete" class="delete delete-eventandfestival" href="javascript:void(0)"
                                                                    data-id="@item.Id"><i class="fa fa-trash"></i></a>`
              );

              table.row(row).invalidate().draw(false);
              showTimedAlert("Success!", response.message, "success", 1000);
            } else {
              showTimedAlert("Failed!", response.message, "error", 1000);
            }
          },
          error: function (xhr) {
            showTimedAlert(
              "Error!",
              "An error occurred while banning the event and festival: " +
                (xhr.responseJSON?.message || "Unknown error"),
              "error",
              1000
            );
          },
        });
      }
    });
  });
});

/********************* 5. EXPORT EXCEL ***********/
const sessionId = "@sessionId";

// Handle export
$("#festivalExportBtn").on("click", function () {
  showInfoAlert(
    "Exporting Festivals",
    "Retrieving all festivals for export...",
    "OK",
    exportFestivalsToExcel
  );
});

// Hàm stripHtml để loại bỏ thẻ HTML
function stripHtml(html) {
  if (!html) return html; // Trả về giá trị gốc nếu html là null/undefined
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "—";
}

// Define stripHtml function to remove HTML tags
function stripHtml(html) {
  if (!html) return html; // Return original value if html is null/undefined
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "—";
}

function exportFestivalsToExcel() {
  $.ajax({
    url: "window.apiBaseUrl + "/api/EventAndFestival/GetAllEventAndFestinal",
    type: "GET",
    headers: {
      sessionId: sessionId,
      "X-CSRF-TOKEN": $('input[name="__RequestVerificationToken"]').val(),
    },
    success: function (response) {
      console.log("API response received:", response);

      // Extract festivals from the data field in the response
      const festivals = response.data || [];

      if (festivals.length > 0) {
        try {
          // Create a workbook
          const wb = XLSX.utils.book_new();

          // Create header row with all fields from EventAndFestivalResponse
          const headerRow = [
            "No.",
            "ID",
            "Event Name",
            "Description",
            "Start Date",
            "End Date",
            "Category",
            "Images",
            "Location Name",
            "Location Address",
            "Location Coordinates",
            "Marker ID",
            "Tag ID",
            "Status",
            "Created At",
          ];

          const data = [headerRow];

          // Process the festival data from the API
          festivals.forEach((item, index) => {
            // Format images array
            let imagesStr = "—";
            if (item.images && item.images.length > 0) {
              imagesStr = item.images.join("\n");
            }

            // Format location details
            let locationName = "—";
            let locationAddress = "—";
            let coordinatesStr = "—";
            let markerId = "—";
            if (item.location) {
              locationName = item.location.name || "—";
              locationAddress = item.location.address || "—";
              markerId = item.location.markerId || "—";
              if (
                item.location.location &&
                item.location.location.coordinates &&
                item.location.location.coordinates.length >= 2
              ) {
                coordinatesStr = `[${item.location.location.coordinates[0]}, ${item.location.location.coordinates[1]}]`;
              }
            }

            const rowData = [
              (index + 1).toString(),
              item.id || "—",
              stripHtml(item.nameEvent) || "—",
              stripHtml(item.description) || "—",
              item.startDate ? new Date(item.startDate).toLocaleString() : "—",
              item.endDate ? new Date(item.endDate).toLocaleString() : "—",
              item.category || "—",
              imagesStr,
              locationName,
              locationAddress,
              coordinatesStr,
              markerId,
              item.tagId || "—",
              item.status ? "Active" : "Inactive",
              item.createdAt ? new Date(item.createdAt).toLocaleString() : "—",
            ];

            data.push(rowData);
          });

          // Create worksheet from data
          const ws = XLSX.utils.aoa_to_sheet(data);

          // Set column widths for better readability
          ws["!cols"] = [
            { wch: 5 }, // No.
            { wch: 25 }, // ID
            { wch: 30 }, // Event Name
            { wch: 60 }, // Description
            { wch: 20 }, // Start Date
            { wch: 20 }, // End Date
            { wch: 20 }, // Category
            { wch: 100 }, // Images
            { wch: 30 }, // Location Name
            { wch: 50 }, // Location Address
            { wch: 40 }, // Location Coordinates
            { wch: 25 }, // Marker ID
            { wch: 25 }, // Tag ID
            { wch: 10 }, // Status
            { wch: 20 }, // Created At
          ];

          // Configure row heights to accommodate multiline text
          const rowCount = data.length;
          ws["!rows"] = [];
          for (let i = 0; i < rowCount; i++) {
            ws["!rows"][i] = { hpt: 25 }; // Default row height
          }

          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, "Festivals");

          // Generate Excel file and trigger download

          const today = new Date().toISOString().slice(0, 10);
          const fileName = `festivals_${today}.xlsx`;
          XLSX.writeFile(wb, fileName);

          showTimedAlert(
            "Export Successful!",
            `${festivals.length} festivals have been exported.`,
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
          "No festivals found for export.",
          "warning",
          1000
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("API Error Details:", status, error);
      let errorMessage =
        "Could not retrieve festival data. Please check your connection or permissions.";
      if (xhr.status === 401) {
        errorMessage = "Unauthorized access. Please log in again.";
      } else if (xhr.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      }
      showTimedAlert("Export Error!", errorMessage, "error", 1000);
    },
  });
}
