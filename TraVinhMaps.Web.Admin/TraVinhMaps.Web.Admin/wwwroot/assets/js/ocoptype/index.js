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
// Get session ID
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


// Function to export OCOP type to Excel
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

  // Fetch all OCOP type data from API
  $.ajax({
    url: "https://localhost:7162/api/OcopType/GetAllOcopType",
    type: "GET",
    headers: {
      sessionId: sessionId,
    },
    success: function (response) {
      console.log("API response received:", response);

      // Extract ocop type from the data field in the response
      const ocopType = response.data || [];

      if (ocopType.length > 0) {
        try {
          // Create a workbook
          const wb = XLSX.utils.book_new();

          // Create header row with all fields
          const headerRow = [
            "#",
            "ID",
            "Ocop Type Name",
            "Created At",
            "Updated At",
          ];

          const data = [headerRow];

          // Process the ocop type data from the API
          ocopType.forEach((type, index) => {

            const rowData = [
              (index + 1).toString(),
              type.id || "—",
              type.ocopTypeName || "—",
              type.createdAt
                ? new Date(type.createdAt).toLocaleString()
                : "—",
              type.updateAt
                ? new Date(type.updateAt).toLocaleString()
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
            { wch: 30 }, // Ocop Type Name
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
          XLSX.utils.book_append_sheet(wb, ws, "OCOP Products");

          // Generate Excel file and trigger download
          const today = new Date().toISOString().slice(0, 10);
          const fileName = `ocop_products_${today}.xlsx`;
          XLSX.writeFile(wb, fileName);

          showTimedAlert(
            "Export Successful",
            `${ocopType.length} Items have been exported to Excel.`,
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
          "No OCOP type data available for export.",
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
