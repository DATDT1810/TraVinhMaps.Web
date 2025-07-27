$("#reviewExportBtn").on("click", function () {
  showInfoAlert("Exporting Data", "Retrieving all review data for export...", "OK", exportReviewToExcel);
});

function exportReviewToExcel() {
  const sessionId = localStorage.getItem("sessionId") || "@sessionId"; 
  console.log("Session ID:", sessionId);

  $.ajax({
    url: "https://localhost:7162/api/Review/GetAllReview",
    type: "GET",
    headers: {
      sessionId: sessionId,
    },
    success: function (response) {
      console.log("API Response:", response);
      let reviews = Array.isArray(response) ? response : response.data || [];

      if (reviews && reviews.length > 0) {
        const wb = XLSX.utils.book_new();
        const headerRow = [
          "#",
          "User Name",
          "Destination",
          "Rating",
          "Comment",
          "Created At"
        ];
        const data = [headerRow];

        reviews.forEach((review, index) => {
          const rowData = [
            index + 1,
            review.userName || "—",
            review.destinationName || "—",
            review.rating?.toString() || "—",
            review.comment || "—",
            review.createdAt
              ? new Date(review.createdAt).toLocaleString()
              : "—",
          ];
          data.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws["!cols"] = [
          { wch: 5 },
          { wch: 25 },
          { wch: 25 },
          { wch: 10 },
          { wch: 50 },
          { wch: 20 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Review List");
        const today = new Date().toISOString().slice(0, 10);
        const fileName = `review_list_${today}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showTimedAlert(
          "Export Successful!",
          `${reviews.length} reviews exported to Excel.`,
          "success",
          1000
        );
      } else {
        showTimedAlert("Export Error!", "No reviews found for export.", "error", 1000);
      }
    },
    error: function (xhr, status, error) {
      console.error("Export error:", {
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.responseText,
        error: error
      });
      showTimedAlert(
        "Export Error!",
        `Could not export reviews. Error: ${xhr.status} ${xhr.statusText}`,
        "error",
        1000
      );
    },
  });
}