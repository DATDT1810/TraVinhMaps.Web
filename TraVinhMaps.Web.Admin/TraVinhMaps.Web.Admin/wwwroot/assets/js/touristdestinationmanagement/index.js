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
        targets: 4,
        render: (data, type) => {
          if (type === "filter" || type === "sort") {
            return $("<div>").html(data).text().trim();
          }
          return data;
        },
      },
    ],
  });

  /* ========== Vẽ lại số thứ tự No. ========== */
  table
    .on("order.dt search.dt draw.dt", function () {
      let i = table.page.info().start + 1; // Adjust index based on current page
      table
        .cells(null, 0, { search: "applied", order: "applied" })
        .every(function () {
          this.data(i++);
        });
    });

  /* ========== BỘ LỌC THEO COMBOBOX ========== */
  $("#statusFilter").on("change", function () {
    table.page(0).draw("full-reset"); // Reset to page 1 and fully reset state
  });

  /* ========== CUSTOM FILTER LOGIC ========== */
  $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
    const filterValue = $("#statusFilter").val();
    const rowNode = table.row(dataIndex).node();
    const rowStatus = $(rowNode).data("status") === true;

    if (filterValue === "all") {
      return true; // Show all rows if filter is "all"
    }
    if (filterValue === "inactive") {
      return !rowStatus; // Show only inactive rows
    }
    return rowStatus; // Show only active rows
  });

  // Initialize filter to "active"
  $("#statusFilter").val("active").trigger("change");

  /* ========== HÀM CẬP NHẬT 1 HÀNG ========== */
  function updateRow(row, isActive) {
    const statusSpan = row.find("td:eq(4) span");
    if (isActive) {
      statusSpan
        .text("Active")
        .removeClass("badge-light-danger")
        .addClass("badge-light-primary");
      row.data("status", true);
    } else {
      statusSpan
        .text("Inactive")
        .removeClass("badge-light-primary")
        .addClass("badge-light-danger");
      row.data("status", false);
    }
    table.row(row).invalidate().draw("full-reset"); // Full reset to ensure filter reapplies
  }

  // AJAX Delete destination
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
          headers: { RequestVerificationToken: token },
          success: function (response) {
            if (response.success) {
              const row = $('a[data-id="' + destinationId + '"]').closest("tr");
              updateRow(row, false); // Cập nhật trạng thái Inactive
              const actionCell = row.find("td:last-child ul.action");
              actionCell.find(".delete-destination").replaceWith(
                `<a class="restore undelete-destination" href="javascript:void(0)" data-id="${destinationId}" title="Restore">
                  <i class="fa fa-undo"></i>
                </a>`
              );
              showTimedAlert("Success!", response.message, "success", 1000);
            } else {
              showTimedAlert("Failed!", response.message, "error", 1000);
            }
          },
          error: function (xhr) {
            showTimedAlert(
              "Error!",
              "An error occurred while deleting the destination: " +
                (xhr.responseJSON?.message || "Unknown error"),
              "error",
              1000
            );
          },
        });
      }
    });
  });

  // AJAX Restore destination
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
          headers: { RequestVerificationToken: token },
          success: function (response) {
            if (response.success) {
              const row = $('a[data-id="' + destinationId + '"]').closest("tr");
              updateRow(row, true); // Cập nhật trạng thái Active
              const actionCell = row.find("td:last-child ul.action");
              actionCell.find(".undelete-destination").replaceWith(
                `<a class="delete delete-destination" href="javascript:void(0)" data-id="${destinationId}" title="Delete">
                  <i class="fa fa-trash"></i>
                </a>`
              );
              showTimedAlert("Success!", response.message, "success", 1000);
            } else {
              showTimedAlert("Failed!", response.message, "error", 1000);
            }
          },
          error: function (xhr) {
            showTimedAlert(
              "Error!",
              "An error occurred while restoring the destination: " +
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
const sessionId = "@sessionId";
$("#destinationExportBtn").on("click", function () {
  showInfoAlert(
      "Exporting Data",
      "Retrieving all tourist destinations for export...",
      "OK",
      exportDestinationsToExcel 
  );
});

function exportDestinationsToExcel() {
  $.ajax({
    url: window.apiBaseUrl + "api/TouristDestination/GetAllDestinations",
    type: "GET",
    headers: {
      sessionId: sessionId,
      "X-CSRF-TOKEN": $('input[name="__RequestVerificationToken"]').val(),
    },
    success: function (response) {
      console.log("API response received:", response);
      const destinations = response.data || [];

      // Nếu không có data => báo lỗi và dừng
      if (destinations.length === 0) {
        showTimedAlert(
          "Export Warning!",
          "No destinations found for export.",
          "warning",
          1000
        );
        return;
      }

      // Có dữ liệu mới báo đang export
      showInfoAlert(
        "Exporting Destinations",
        "Retrieving all tourist destinations for export...",
        "OK"
      );

      try {
        const wb = XLSX.utils.book_new();
        const headerRow = [
          "#", "ID", "Name", "Average Rating", "Favorite Count", "Description", "Address",
          "Location Type", "Coordinates", "Images", "History Story Content", "History Story Images",
          "Destination Type ID", "Opening Hours", "Capacity", "Contact Phone", "Contact Email",
          "Contact Website", "Tag ID", "Ticket", "Status", "Created At", "Updated At"
        ];
        const data = [headerRow];

        destinations.forEach((destination, index) => {
          let imagesStr = destination.images?.length > 0
            ? destination.images.join("\n") : "—";
          let historyStoryContent = destination.historyStory?.content || "—";
          let historyStoryImages = destination.historyStory?.images?.length > 0
            ? destination.historyStory.images.join("\n") : "—";
          let coordinatesStr = (destination.location?.coordinates?.length >= 2)
            ? `[${destination.location.coordinates[0]}, ${destination.location.coordinates[1]}]` : "—";
          let openingHoursStr = destination.openingHours
            ? `${destination.openingHours.openTime || "—"} - ${destination.openingHours.closeTime || "—"}`
            : "—";
          let contactPhone = destination.contact?.phone || "—";
          let contactEmail = destination.contact?.email || "—";
          let contactWebsite = destination.contact?.website || "—";

          const rowData = [
            (index + 1).toString(),
            destination.id || "—",
            destination.name || "—",
            destination.avarageRating !== undefined ? destination.avarageRating.toFixed(2) : "—",
            destination.favoriteCount ?? "—",
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
            destination.createdAt ? new Date(destination.createdAt).toLocaleString() : "—",
            destination.updateAt ? new Date(destination.updateAt).toLocaleString() : "—",
          ];
          data.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws["!cols"] = [
          { wch: 5 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 60 },
          { wch: 50 }, { wch: 15 }, { wch: 25 }, { wch: 100 }, { wch: 100 }, { wch: 100 },
          { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 50 },
          { wch: 25 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
        ];
        ws["!rows"] = Array(data.length).fill({ hpt: 25 });

        XLSX.utils.book_append_sheet(wb, ws, "Tourist Destinations");
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
    },
    error: function (xhr, status, error) {
      console.error("API Error Details:", status, error);
      let errorMessage =
        "Could not retrieve destination data. Please check your connection or permissions.";
      if (xhr.status === 401) errorMessage = "Unauthorized access. Please log in again.";
      else if (xhr.status === 403) errorMessage = "You do not have permission to perform this action.";
      showTimedAlert("Export Error!", errorMessage, "error", 1000);
    },
  });
}

