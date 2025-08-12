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
                // Cột Created At
                targets: 2,
                render: (data, type) => {
                    if (type === "filter" || type === "sort") {
                        return $("<div>").html(data).text().trim();
                    }
                    return data;
                }
            }
        ]
    });

    // Vẽ lại số thứ tự khi sắp xếp, tìm kiếm
    table.on('order.dt search.dt draw.dt', function () {
        let i = 1;
        table
            .cells(null, 0, { search: 'applied', order: 'applied' })
            .every(function () {
                this.data(i++);
            });
    }).draw();
});


// Export OCOP type to Excel
const sessionId = "@sessionId";

// Handle Excel export button click
$("#exportOcopTypeBtn").on("click", function () {
  showInfoAlert(
    "Exporting Data",
    "Retrieving OCOP type data for export...",
    "OK",
    exportOcopProductsToExcel
  );
});

function exportOcopProductsToExcel() {
  if (!sessionId) {
    console.error("Error: sessionId is missing or undefined");
    showTimedAlert(
      "Export Error",
      "Session ID is missing. Please log in again.",
      "error",
      1000
    );
    return;
  }

  $.ajax({
    url: window.apiBaseUrl + "api/OcopType/GetAllOcopType",
    type: "GET",
    headers: { sessionId: sessionId },
    success: function (response) {
      console.log("API response received:", response);

      const ocopType = Array.isArray(response?.data) ? response.data : [];

      // Nếu không có dữ liệu → thông báo giống yêu cầu
      if (ocopType.length === 0) {
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
        const headerRow = ["#", "ID", "Ocop Type Name", "Created At", "Updated At"];
        const data = [headerRow];

        ocopType.forEach((type, index) => {
          const rowData = [
            (index + 1).toString(),
            type.id || "—",
            type.ocopTypeName || "—",
            type.createdAt ? new Date(type.createdAt).toLocaleString() : "—",
            type.updateAt ? new Date(type.updateAt).toLocaleString() : "—",
          ];
          data.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws["!cols"] = [
          { wch: 5 },
          { wch: 25 },
          { wch: 30 },
          { wch: 20 },
          { wch: 20 },
        ];
        ws["!rows"] = data.map(() => ({ hpt: 25 }));

        XLSX.utils.book_append_sheet(wb, ws, "OCOP Products");
        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `ocop_products_${today}.xlsx`);

        showTimedAlert(
          "Export Successful",
          `${ocopType.length} items exported to Excel.`,
          "success",
          1000
        );
      } catch (ex) {
        console.error("Error during Excel creation:", ex);
        showTimedAlert("Export Error", ex.message, "error", 1000);
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

