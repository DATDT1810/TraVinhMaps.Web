/************************************************************
 * local-specialties/index.js
 * - Bộ lọc trạng thái
 * - Xóa / Khôi phục Local Specialties
 * - Cập nhật số thứ tự (STT)
 * - Export excel
 ************************************************************/

$(document).ready(function () {
  /********************* 0. HÀM TIỆN ÍCH ************************/
  // Cập nhật badge Status trong cùng ô (cột thứ 4, index 3)
  function setStatusBadge($row, isActive) {
    const $badge = $row.find("td:eq(3) .badge"); // td index 3 = Status
    if (!$badge.length) return;

    if (isActive) {
      $badge
        .removeClass("badge-light-danger")
        .addClass("badge-light-primary")
        .text("Active");
    } else {
      $badge
        .removeClass("badge-light-primary")
        .addClass("badge-light-danger")
        .text("Inactive");
    }
  }

  // Đánh lại STT cho các hàng đang hiển thị
  function updateVisibleRowStt() {
    let stt = 1;
    $("#basic-9 tbody tr:visible").each(function () {
      $(this).find("td:first").text(stt++);
    });
  }

  /********************* 1. BỘ LỌC TRẠNG THÁI ******************/
  $("#statusFilter").on("change", function () {
    const filter = $(this).val();
    let hasVisibleRows = false;
    let stt = 1;

    $("table tbody tr:not(#no-items-row)").each(function () {
      const $row = $(this);
      const tagIds = String($row.data("tag-id") || "").split(",");
      const isActive = $row.find("#delete-localSpecialties").length > 0;

      let show = false;
      if (filter === "all") show = isActive;
      else if (filter === "inactive") show = !isActive;
      else show = tagIds.includes(filter) && isActive;

      if (show) {
        $row.show();
        $row.find("td:first").text(stt++);
        hasVisibleRows = true;
      } else {
        $row.hide();
      }
    });

    $("#no-items-row").toggle(!hasVisibleRows);

    const tbody = $("#basic-9 tbody");
    tbody.find(".empty-message-row").remove();
    if ($("#basic-9 tbody tr:visible").length === 0) {
      tbody.append(`
        <tr class="empty-message-row">
          <td colspan="6" class="text-center">No matching records found</td>
        </tr>`);
    }
  });

  /********************* 2. XÓA LOCAL SPECIALTIES *************/
  $(document).on("click", "#delete-localSpecialties", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const $row = $(this).closest("tr");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirm delete",
      "Are you sure you want to delete this local specialties?",
      "Delete",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: "/LocalSpecialties/Delete",
        type: "POST",
        data: { __RequestVerificationToken: token, id },
        success: (res) => {
          if (res.success) {
            showTimedAlert("Success!", res.message, "success", 1000);

            // Đổi nút delete → restore
            $row.find("td:last .delete").parent().html(`
              <a id="restore-localSpecialties" class="restore" href="javascript:void(0)"
                 data-id="${id}" title="Restore"><i class="fa fa-undo"></i></a>`);

            // Cập nhật badge Status sang Inactive
            setStatusBadge($row, false);

            $("#statusFilter").trigger("change");
            updateVisibleRowStt();
          } else {
            showTimedAlert("Error!", res.message, "error", 1000);
          }
        },
        error: () =>
          showTimedAlert(
            "Error!",
            "An error occurred while deleting.",
            "error",
            1000
          ),
      });
    });
  });

  /********************* 3. KHÔI PHỤC LOCAL SPECIALTIES ********/
  $(document).on("click", "#restore-localSpecialties", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const $row = $(this).closest("tr");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Restore Local Specialties",
      "Are you sure you want to restore this local specialties?",
      "Restore",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: "/LocalSpecialties/Restore",
        type: "POST",
        data: { __RequestVerificationToken: token, id },
        success: (res) => {
          if (res.success) {
            showTimedAlert("Success!", res.message, "success", 1000);

            // Đổi nút restore → delete
            $row.find("td:last .restore").parent().html(`
              <a id="delete-localSpecialties" class="delete" href="javascript:void(0)"
                 data-id="${id}" title="Delete"><i class="fa fa-trash"></i></a>`);

            // Cập nhật badge Status sang Active
            setStatusBadge($row, true);

            $("#statusFilter").trigger("change");
            updateVisibleRowStt();
          } else {
            showTimedAlert("Error!", res.message, "error", 1000);
          }
        },
        error: () =>
          showTimedAlert(
            "Error!",
            "An error occurred while restoring.",
            "error",
            1000
          ),
      });
    });
  });

  /********************* 4. KHỞI TẠO BAN ĐẦU ******************/
  $("#statusFilter").trigger("change");
  updateVisibleRowStt();
});

  /********************* 5. EXPORT EXCEL ***********/
const sessionId = "@sessionId";

// Handle export
$("#localSpecialtiesExportBtn").on("click", function () {
  showInfoAlert(
    "Exporting Local Specialties",
    "Retrieving all local specialties for export...",
    "OK",
    exportLocalSpecialtiesToExcel
  );
});

// Hàm stripHtml để loại bỏ thẻ HTML
function stripHtml(html) {
  if (!html) return html; // Trả về giá trị gốc nếu html là null/undefined
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "—";
}

function exportLocalSpecialtiesToExcel() {
  $.ajax({
    url: "https://localhost:7162/api/LocalSpecialties/all",
    type: "GET",
    headers: {
      sessionId: sessionId,
      "X-CSRF-TOKEN": $('input[name="__RequestVerificationToken"]').val()
    },
    success: function (response) {
      console.log("API response received:", response);

      // Extract specialties from the data field in the response
      const specialties = response.data || [];

      if (specialties.length > 0) {
        try {
          // Create a workbook
          const wb = XLSX.utils.book_new();

          // Create header row with all fields from LocalSpecialtiesResponse
          const headerRow = [
            "No.",
            "ID",
            "Food Name",
            "Description",
            "Images",
            "Locations",
            "Coordinates",
            "Tag ID",
            "Status",
            "Created At",
            "Updated At"
          ];

          const data = [headerRow];

          // Process the specialty data from the API
          specialties.forEach((item, index) => {
            // Format images array
            let imagesStr = "—";
            if (item.images && item.images.length > 0) {
              imagesStr = item.images.join('\n');
            }

            // Format locations and coordinates
            let locationsStr = "—";
            let coordinatesStr = "—";
            if (item.locations && item.locations.length > 0) {
              const locationDetails = [];
              const coordinates = [];

              item.locations.forEach(loc => {
                const locName = loc.name || "—";
                const locAddress = loc.address || "—";
                locationDetails.push(`${locName}: ${locAddress} (ID: ${loc.locationId || "—"})`);

                if (loc.location && loc.location.coordinates && loc.location.coordinates.length >= 2) {
                  coordinates.push(`[${loc.location.coordinates[0]}, ${loc.location.coordinates[1]}]`);
                }
              });

              locationsStr = locationDetails.length > 0 ? locationDetails.join('\n') : "—";
              coordinatesStr = coordinates.length > 0 ? coordinates.join('\n') : "—";
            }

            const rowData = [
              (index + 1).toString(),
              item.id || "—",
              stripHtml(item.foodName) || "—",
              stripHtml(item.description) || "—",
              imagesStr,
              locationsStr,
              coordinatesStr,
              item.tagId || "—",
              item.status ? "Active" : "Inactive",
              item.createdAt ? new Date(item.createdAt).toLocaleString() : "—",
              item.updateAt ? new Date(item.updateAt).toLocaleString() : "—"
            ];

            data.push(rowData);
          });

          // Create worksheet from data
          const ws = XLSX.utils.aoa_to_sheet(data);

          // Set column widths for better readability
          ws['!cols'] = [
            { wch: 5 },    // No.
            { wch: 25 },   // ID
            { wch: 30 },   // Food Name
            { wch: 60 },   // Description
            { wch: 100 },  // Images
            { wch: 100 },  // Locations
            { wch: 40 },   // Coordinates
            { wch: 25 },   // Tag ID
            { wch: 10 },   // Status
            { wch: 20 },   // Created At
            { wch: 20 }    // Updated At
          ];

          // Configure row heights to accommodate multiline text
          const rowCount = data.length;
          ws['!rows'] = [];
          for (let i = 0; i < rowCount; i++) {
            ws['!rows'][i] = { hpt: 25 }; // Default row height
          }

          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, "Local Specialties");

          // Generate Excel file and trigger download
          const today = new Date().toISOString().slice(0, 10);
          const fileName = `local_specialties_${today}.xlsx`;
          XLSX.writeFile(wb, fileName);

          showTimedAlert(
            "Export Successful!",
            `${specialties.length} local specialties have been exported.`,
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
          "No local specialties found for export.",
          "warning",
          1000
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("API Error Details:", status, error);
      let errorMessage = "Could not retrieve local specialties data. Please check your connection or permissions.";
      if (xhr.status === 401) {
        errorMessage = "Unauthorized access. Please log in again.";
      } else if (xhr.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      }
      showTimedAlert("Export Error!", errorMessage, "error", 1000);
    }
  });
}
