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
  // $.fn.dataTable.ext.search.push((settings, data) => {
  //   const filter = $("#statusFilter").val(); // all | inactive
  //   const status = data[4]; // Text thuần nhờ render

  //   if (filter === "inactive") return status === "Inactive";
  //   return status === "Active"; // "all" chỉ hiển thị Active
  // });
  $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
  const filterValue = $("#statusFilter").val(); // Sẽ là "active" hoặc "inactive"

  // Lấy node của hàng hiện tại
  const rowNode = table.row(dataIndex).node();
  
  // Lấy trạng thái từ thuộc tính data-status mà chúng ta đã thêm
  // Chuyển "true" thành true (boolean) và "false" thành false (boolean)
  const rowStatus = $(rowNode).data('status') === true;

  if (filterValue === "inactive") {
    return !rowStatus; // Hiển thị nếu trạng thái là false (không hoạt động)
  }
  
  // Mặc định (filterValue === "active") chỉ hiển thị hàng có trạng thái là true (hoạt động)
  return rowStatus; 
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
  $(document).on("click", ".delete-destination", function (e) {
    e.preventDefault();
    const destinationId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to delete this destination?",
      "Delete",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        $.ajax({
          url: "/Admin/TouristDestinationManagement/DeleteDestination",
          method: "POST",
          data: { id: destinationId },
          headers: {
            RequestVerificationToken: token,
          },
          success: function (response) {
            if (response.success) {
              // const row = $(`a[data-id="${destinationId}"]`).closest("tr");
              const row = $('a[data-id="' + destinationId + '"]').closest("tr");
              row
                .find("td:eq(4) span")
                .text("Inactive")
                .removeClass("badge-light-primary")
                .addClass("badge-light-danger");
              // Update action dropdown from Ban -> Unban
              const actionCell = row.find("td:last-child ul.action");
              actionCell.find(".delete-destination").replaceWith(
                `<a class="restore undelete-destination" href="javascript:void(0)" data-id="${destinationId}" title="Restore">
                      <i class="fa fa-undo"></i>
                  </a>`
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
              "An error occurred while banning the destination: " +
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
  $(document).on("click", ".undelete-destination", function (e) {
    e.preventDefault();
    const destinationId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to restore this destination?",
      "Restore",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        $.ajax({
          url: "/Admin/TouristDestinationManagement/RestoreDestination",
          method: "POST",
          data: { id: destinationId },
          headers: {
            RequestVerificationToken: token,
          },
          success: function (response) {
            if (response.success) {
              const row = $('a[data-id="' + destinationId + '"]').closest("tr");

              row
                .find("td:eq(4) span")
                .text("Active")
                .removeClass("badge-light-danger")
                .addClass("badge-light-primary");

              // Update action dropdown from Unban -> Ban
              const actionCell = row.find("td:last-child ul.action");
              actionCell.find(".undelete-destination").replaceWith(
                `<a class="delete delete-destination" href="javascript:void(0)" data-id="${destinationId}" title="Delete">
                      <i class="fa fa-trash"></i>
                  </a>`
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
              "Error",
              "An error occurred while unbanning the user: " +
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

// ------- Export Destinations to Excel -------
const sessionId = "@sessionId"; // Get session ID from Razor

// Handle export button click
$("#destinationExportBtn").on("click", function () {
  showInfoAlert(
    "Exporting Destinations",
    "Retrieving all tourist destinations for export...",
    "OK",
    exportDestinationsToExcel
  );
});

function exportDestinationsToExcel() {
  $.ajax({
    url: "https://localhost:7162/api/TouristDestination/GetAllDestinations",
    type: "GET",
    headers: {
      sessionId: sessionId,
      "X-CSRF-TOKEN": $('input[name="__RequestVerificationToken"]').val(),
    },
    success: function (response) {
      console.log("API response received:", response);

      // Extract destinations from the data field in the response
      const destinations = response.data || [];

      if (destinations.length > 0) {
        try {
          // Create a workbook
          const wb = XLSX.utils.book_new();

          // Create header row with all fields from TouristDestinationResponse
          const headerRow = [
            "#",
            "ID",
            "Name",
            "Average Rating",
            "Favorite Count",
            "Description",
            "Address",
            "Location Type",
            "Coordinates",
            "Images",
            "History Story Content",
            "History Story Images",
            "Destination Type ID",
            "Opening Hours",
            "Capacity",
            "Contact Phone",
            "Contact Email",
            "Contact Website",
            "Tag ID",
            "Ticket",
            "Status",
            "Created At",
            "Updated At",
          ];

          const data = [headerRow];

          // Process the destination data from the API
          destinations.forEach((destination, index) => {
            // Format images array
            let imagesStr = "—";
            if (destination.images && destination.images.length > 0) {
              imagesStr = destination.images.join("\n");
            }

            // Format history story
            let historyStoryContent = "—";
            let historyStoryImages = "—";
            if (destination.historyStory) {
              historyStoryContent = destination.historyStory.content || "—";
              if (
                destination.historyStory.images &&
                destination.historyStory.images.length > 0
              ) {
                historyStoryImages = destination.historyStory.images.join("\n");
              }
            }

            // Format location coordinates
            let coordinatesStr = "—";
            if (
              destination.location &&
              destination.location.coordinates &&
              destination.location.coordinates.length >= 2
            ) {
              coordinatesStr = `[${destination.location.coordinates[0]}, ${destination.location.coordinates[1]}]`;
            }

            // Format opening hours
            let openingHoursStr = "—";
            if (destination.openingHours) {
              openingHoursStr = `${
                destination.openingHours.openTime || "—"
              } - ${destination.openingHours.closeTime || "—"}`;
            }

            // Format contact information
            let contactPhone = "—";
            let contactEmail = "—";
            let contactWebsite = "—";
            if (destination.contact) {
              contactPhone = destination.contact.phone || "—";
              contactEmail = destination.contact.email || "—";
              contactWebsite = destination.contact.website || "—";
            }

            const rowData = [
              (index + 1).toString(),
              destination.id || "—",
              destination.name || "—",
              destination.avarageRating !== undefined
                ? destination.avarageRating.toFixed(2)
                : "—",
              destination.favoriteCount !== undefined
                ? destination.favoriteCount
                : "—",
              destination.description || "—",
              destination.address || "—",
              destination.location?.type || "—",
              coordinatesStr,
              imagesStr,
              historyStoryContent,
              historyStoryImages,
              destination.destinationTypeId || "—",
              openingHoursStr,
              destination.capacity || "—",
              contactPhone,
              contactEmail,
              contactWebsite,
              destination.tagId || "—",
              destination.ticket || "—",
              destination.status ? "Active" : "Inactive",
              destination.createdAt
                ? new Date(destination.createdAt).toLocaleString()
                : "—",
              destination.updateAt
                ? new Date(destination.updateAt).toLocaleString()
                : "—",
            ];

            data.push(rowData);
          });

          // Create worksheet from data
          const ws = XLSX.utils.aoa_to_sheet(data);

          // Set column widths for better readability
          ws["!cols"] = [
            { wch: 5 }, // #
            { wch: 25 }, // ID
            { wch: 30 }, // Name
            { wch: 15 }, // Average Rating
            { wch: 15 }, // Favorite Count
            { wch: 60 }, // Description
            { wch: 50 }, // Address
            { wch: 15 }, // Location Type
            { wch: 25 }, // Coordinates
            { wch: 100 }, // Images
            { wch: 100 }, // History Story Content
            { wch: 100 }, // History Story Images
            { wch: 25 }, // Destination Type ID
            { wch: 20 }, // Opening Hours
            { wch: 15 }, // Capacity
            { wch: 20 }, // Contact Phone
            { wch: 30 }, // Contact Email
            { wch: 50 }, // Contact Website
            { wch: 25 }, // Tag ID
            { wch: 20 }, // Ticket
            { wch: 10 }, // Status
            { wch: 20 }, // Created At
            { wch: 20 }, // Updated At
          ];

          // Configure row heights to accommodate multiline text
          const rowCount = data.length;
          ws["!rows"] = [];
          for (let i = 0; i < rowCount; i++) {
            ws["!rows"][i] = { hpt: 25 }; // Default row height
          }

          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, "Tourist Destinations");

          // Generate Excel file and trigger download
          const today = new Date().toISOString().slice(0, 10);
          const fileName = `tourist_destinations_${today}.xlsx`;
          XLSX.writeFile(wb, fileName);

          showTimedAlert(
            "Export Successful!",
            `${destinations.length} destinations have been exported to Excel.`,
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
          "No destinations found for export.",
          "warning",
          1000
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("API Error Details:", status, error);
      let errorMessage =
        "Could not retrieve destination data. Please check your connection or permissions.";
      if (xhr.status === 401) {
        errorMessage = "Unauthorized access. Please log in again.";
      } else if (xhr.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      }
      showTimedAlert("Export Error!", errorMessage, "error", 1000);
    },
  });
}
