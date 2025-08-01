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
        targets: 3,
        render: (data, type) => {
          if (type === "filter" || type === "sort") {
            return $("<div>").html(data).text().trim();
          }
          return data;
        },
      },
    ],
  });

  // Vẽ lại số thứ tự
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

  // BỘ LỌC COMBOBOX
  $("#statusFilter").on("change", () => table.draw());

    $.fn.dataTable.ext.search.push((settings, data) => {
        const filter = $("#statusFilter").val(); // all | inactive | active
        const status = (data[3] || "").trim();

        if (filter === "inactive") {
            return status === "Inactive" || status === "Không hoạt động";
        }
        if (filter === "active") {
            return status === "Active" || status === "Hoạt động";
        }
        return true; // all
    });

  $("#statusFilter").val("active").trigger("change");

    // Hàm cập nhật lại giao diện hàng
    function updateRow(row, isActive, id) {
        const statusSpan = row.find("td:eq(3) span");
        const actionCell = row.find("td:last-child ul.action");

        // Lấy text hiện tại để xác định ngôn ngữ (Anh/Việt)
        let currentText = statusSpan.text().toLowerCase().trim();
        let statusText;

        if (currentText === "hoạt động" || currentText === "không hoạt động") {
            statusText = isActive ? "Hoạt động" : "Không hoạt động";
        } else {
            statusText = isActive ? "Active" : "Inactive";
        }

        statusSpan.text(statusText)
            .removeClass("badge-light-danger badge-light-primary")
            .addClass(isActive ? "badge-light-primary" : "badge-light-danger");

        if (isActive) {
            actionCell.find(".undelete-ocop-product").replaceWith(`
                <a class="delete delete-ocop-product" href="javascript:void(0)" data-id="${id}" title="Delete">
                    <i class="fa fa-trash"></i>
                </a>
            `);
    } else {
      statusSpan
        .text("Inactive")
        .removeClass("badge-light-primary")
        .addClass("badge-light-danger");

      actionCell.find(".delete-ocop-product").replaceWith(`
                <a class="restore undelete-ocop-product" href="javascript:void(0)" data-id="${id}" title="Restore">
                    <i class="fa fa-undo"></i>
                </a>
            `);
    }

    table.row(row).invalidate().draw(false);
  }

  // Delete
  $(document).on("click", ".delete-ocop-product", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to delete this ocop product?",
      "Delete",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: window.apiBaseUrl + "/Admin/OcopProduct/DeleteOcopProduct",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: function (response) {
          if (response.success) {
            updateRow(row, false, id);
            showTimedAlert("Success!", response.message, "success", 1000);
          } else {
            showTimedAlert("Error!", response.message, "error", 1000);
          }
        },
        error: function (xhr) {
          showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
        },
      });
    });
  });

  // Restore
  $(document).on("click", ".undelete-ocop-product", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to restore this ocop product?",
      "Restore",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: window.apiBaseUrl + "/Admin/OcopProduct/RestoreOcopProduct",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: function (response) {
          if (response.success) {
            updateRow(row, true, id);
            showTimedAlert("Success!", response.message, "success", 1000);
          } else {
            showTimedAlert("Error!", response.message, "error", 1000);
          }
        },
        error: function (xhr) {
          showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
        },
      });
    });
  });
});

// Export OCOP products to Excel
// Get session ID
const sessionId = "@sessionId";

// Handle Excel export button click
$("#exportOcopBtn").on("click", function () {
  showInfoAlert(
    "Exporting Data",
    "Retrieving OCOP product data for export...",
    "OK",
    exportOcopProductsToExcel
  );
});


// Function to export OCOP products to Excel
function exportOcopProductsToExcel() {
  // Debug: Check if sessionId exists
  if (!sessionId) {
    console.error("Error: sessionId is missing or undefined");
    showTimedAlert(
      "Export Error",
      "Session ID is missing. Please log in again."
    );
    return;
  }

  // Fetch all OCOP product data from API
  $.ajax({
    url: window.apiBaseUrl + "/api/OcopProduct/GetAllOcopProduct",
    type: "GET",
    headers: {
      sessionId: sessionId,
    },
    success: function (response) {
      console.log("API response received:", response);

      // Extract products from the data field in the response
      const products = response.data || [];

      if (products.length > 0) {
        try {
          // Create a workbook
          const wb = XLSX.utils.book_new();

          // Create header row with all fields
          const headerRow = [
            "#",
            "Product ID",
            "Product Name",
            "Product Description",
            "Product Price",
            "Status",
            "OCOP Year Release",
            "OCOP Point",
            "OCOP Type ID",
            "Company ID",
            "Created At",
            "Updated At",
            "Tag ID",
            "Product Images",
            "Sell Locations",
            "Coordinates",
          ];

          const data = [headerRow];

          // Process the product data from the API
          products.forEach((product, index) => {
            // Format images array
            let imagesStr = "—";
            if (product.productImage && product.productImage.length > 0) {
              imagesStr = product.productImage.join("\n");
            }

            // Format sell locations
            let sellLocationsStr = "—";
            let coordinatesStr = "—";

            if (product.sellocations && product.sellocations.length > 0) {
              const locationNames = [];
              const locationAddresses = [];
              const coordinates = [];

              product.sellocations.forEach((loc) => {
                if (loc.locationName) {
                  locationNames.push(loc.locationName);
                }

                if (loc.locationAddress) {
                  locationAddresses.push(loc.locationAddress);
                }

                if (
                  loc.location &&
                  loc.location.coordinates &&
                  loc.location.coordinates.length >= 2
                ) {
                  coordinates.push(
                    `[${loc.location.coordinates[0]}, ${loc.location.coordinates[1]}]`
                  );
                }
              });

              if (locationNames.length > 0) {
                const combinedLocations = [];

                for (let i = 0; i < locationNames.length; i++) {
                  combinedLocations.push(
                    `${locationNames[i]}: ${
                      locationAddresses[i] || "No address"
                    }`
                  );
                }

                sellLocationsStr = combinedLocations.join("\n");
              }

              if (coordinates.length > 0) {
                coordinatesStr = coordinates.join("\n");
              }
            }

            const rowData = [
              (index + 1).toString(),
              product.id || "—",
              product.productName || "—",
              product.productDescription || "—",
              product.productPrice || "—",
              product.status ? "Active" : "Inactive",
              product.ocopYearRelease || "—",
              product.ocopPoint || "—",
              product.ocopTypeId || "—",
              product.companyId || "—",
              product.createdAt
                ? new Date(product.createdAt).toLocaleString()
                : "—",
              product.updateAt
                ? new Date(product.updateAt).toLocaleString()
                : "—",
              product.tagId || "—",
              imagesStr,
              sellLocationsStr,
              coordinatesStr,
            ];

            data.push(rowData);
          });

          // Create worksheet from data
          const ws = XLSX.utils.aoa_to_sheet(data);

          // Set column widths for better readability
          ws["!cols"] = [
            { wch: 5 }, // #
            { wch: 25 }, // Product ID
            { wch: 30 }, // Product Name
            { wch: 60 }, // Product Description
            { wch: 15 }, // Product Price
            { wch: 10 }, // Status
            { wch: 15 }, // OCOP Year Release
            { wch: 15 }, // OCOP Point
            { wch: 25 }, // OCOP Type ID
            { wch: 25 }, // Company ID
            { wch: 20 }, // Created At
            { wch: 20 }, // Updated At
            { wch: 25 }, // Tag ID
            { wch: 100 }, // Product Images
            { wch: 100 }, // Sell Locations
            { wch: 40 }, // Coordinates
          ];

          // Configure row heights to accommodate multiline text
          const rowCount = data.length;
          ws["!rows"] = [];
          for (let i = 0; i < rowCount; i++) {
            ws["!rows"][i] = { hpt: 25 }; // Default row height
          }

          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, "OCOP Products");

          // Generate Excel file and trigger download
          const today = new Date().toISOString().slice(0, 10);
          const fileName = `ocop_products_${today}.xlsx`;
          XLSX.writeFile(wb, fileName);

          showTimedAlert(
            "Export Successful",
            `${products.length} Items have been exported to Excel.`,
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
          "Export Error",
          "No OCOP product data available for export.",
          "error",
          1000
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("API Error Details:", status, error);
      showTimedAlert(
        "Export Error",
        "Could not retrieve product data. Please check your connection or permissions.",
        "error",
        1000
      );
    },
  });
}
