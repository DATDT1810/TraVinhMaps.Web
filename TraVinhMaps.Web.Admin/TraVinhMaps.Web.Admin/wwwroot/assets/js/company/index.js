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


// Get session ID
const sessionId = "@sessionId";

// Handle Excel export button click
$("#exportCompanyBtn").on("click", () => {
  showInfoAlert(
    "Exporting Companies",
    "Retrieving all company data for export...",
    "OK",
    exportCompaniesToExcel
  );
});

// Function to export companies to Excel
function exportCompaniesToExcel() {
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
    url: window.apiBaseUrl + "api/Company/GetAllCompany",
    type: "GET",
    headers: {
      sessionId: sessionId,
    },
    success: function (response) {
      const companies = response?.data || [];

      if (companies.length === 0) {
        showTimedAlert("Export Error", "No company data available.", "error", 1000);
        return;
      }

      try {
        const wb = XLSX.utils.book_new();
        const headerRow = [
          "#", "ID", "Company Name", "Address",
          "Contact Name", "Contact Email", "Contact Phone",
          "Location Names", "Created At", "Updated At"
        ];

        const data = [headerRow];

        companies.forEach((company, index) => {
          const locationNames = (company.locations || [])
            .map(loc => loc.locationName || "—")
            .join(", ");

          data.push([
            (index + 1).toString(),
            company.id || "—",
            company.name || "—",
            company.address || "—",
            company.contact?.contactName || "—",
            company.contact?.email || "—",
            company.contact?.phone || "—",
            locationNames || "—",
            company.createdAt ? new Date(company.createdAt).toLocaleString() : "—",
            company.updateAt ? new Date(company.updateAt).toLocaleString() : "—"
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws["!cols"] = [
          { wch: 5 }, { wch: 25 }, { wch: 30 }, { wch: 40 },
          { wch: 25 }, { wch: 30 }, { wch: 20 },
          { wch: 50 }, { wch: 20 }, { wch: 20 }
        ];
        ws["!rows"] = Array.from({ length: data.length }, () => ({ hpt: 25 }));

        XLSX.utils.book_append_sheet(wb, ws, "Companies");

        const fileName = `companies_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showTimedAlert(
          "Export Successful",
          `${companies.length} companies have been exported to Excel.`,
          "success",
          1200
        );
      } catch (ex) {
        console.error("Excel generation error:", ex);
        showTimedAlert("Export Error", `Failed to create Excel: ${ex.message}`, "error", 1000);
      }
    },
    error: function (xhr, status, error) {
      console.error("Export API error:", status, error);
      showTimedAlert(
        "Export Error",
        "Failed to fetch company data. Please check your connection.",
        "error",
        1000
      );
    },
  });
}

