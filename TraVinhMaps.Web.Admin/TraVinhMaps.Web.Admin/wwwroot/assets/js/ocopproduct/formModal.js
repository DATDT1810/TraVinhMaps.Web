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
        url: "/Admin/OcopProduct/DeleteOcopProduct",
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
        url: "/Admin/OcopProduct/RestoreOcopProduct",
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
const sessionId = "@sessionId";

$("#exportOcopBtn").on("click", function () {
  showInfoAlert(
    "Exporting Data",
    "Retrieving OCOP product data for export...",
    "OK",
    exportOcopProductsToExcel
  );
});

function exportOcopProductsToExcel() {
  if (!sessionId) {
    console.error("Error: sessionId is missing or undefined");
    showTimedAlert("Export Error", "Session ID is missing. Please log in again.");
    return;
  }

  $.ajax({
    url: window.apiBaseUrl + "api/OcopProduct/GetAllOcopProduct",
    type: "GET",
    headers: { sessionId: sessionId },
    success: function (response) {
      console.log("API response received:", response);
      const products = Array.isArray(response?.data) ? response.data : [];

      // Check rỗng trước khi export
      if (products.length === 0) {
        showTimedAlert(
          "No Data Available",
          "No reviews available for export.",
          "error",
          1500
        );
        return;
      }

      try {
        const wb = XLSX.utils.book_new();
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

        products.forEach((product, index) => {
          let imagesStr = product.productImage?.length
            ? product.productImage.join("\n")
            : "—";

          let sellLocationsStr = "—";
          let coordinatesStr = "—";
          if (product.sellocations?.length) {
            const locationNames = [];
            const locationAddresses = [];
            const coordinates = [];

            product.sellocations.forEach((loc) => {
              if (loc.locationName) locationNames.push(loc.locationName);
              if (loc.locationAddress) locationAddresses.push(loc.locationAddress);
              if (loc.location?.coordinates?.length >= 2) {
                coordinates.push(`[${loc.location.coordinates[0]}, ${loc.location.coordinates[1]}]`);
              }
            });

            if (locationNames.length) {
              const combinedLocations = locationNames.map((name, i) =>
                `${name}: ${locationAddresses[i] || "No address"}`
              );
              sellLocationsStr = combinedLocations.join("\n");
            }
            if (coordinates.length) coordinatesStr = coordinates.join("\n");
          }

          data.push([
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
            product.createdAt ? new Date(product.createdAt).toLocaleString() : "—",
            product.updateAt ? new Date(product.updateAt).toLocaleString() : "—",
            product.tagId || "—",
            imagesStr,
            sellLocationsStr,
            coordinatesStr,
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws["!cols"] = [
          { wch: 5 }, { wch: 25 }, { wch: 30 }, { wch: 60 }, { wch: 15 },
          { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 25 },
          { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 100 }, { wch: 100 }, { wch: 40 }
        ];
        ws["!rows"] = data.map(() => ({ hpt: 25 }));

        XLSX.utils.book_append_sheet(wb, ws, "OCOP Products");
        XLSX.writeFile(wb, `ocop_products_${new Date().toISOString().slice(0, 10)}.xlsx`);

        showTimedAlert(
          "Export Successful",
          `${products.length} Items have been exported to Excel.`,
          "success",
          1000
        );
      } catch (ex) {
        console.error("Error during Excel creation:", ex);
        showTimedAlert("Export Error", `Error creating Excel file: ${ex.message}`, "error", 1000);
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
