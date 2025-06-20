// Hàm vẽ chart
function drawChart(analyticsData) {
  if (myChart) myChart.destroy();

  // Lấy mảng analytics từ object
  const dataToUse = Array.isArray(analyticsData.analytics)
    ? analyticsData.analytics
    : [];
  if (!dataToUse.length) {
    console.warn("No analytics data available to draw chart");
    return;
  }

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dataToUse.map((item) => item.productName || "Unknown"),
      datasets: [
        {
          label: "View Count",
          data: dataToUse.map((item) => item.viewCount || 0),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Interaction Count",
          data: dataToUse.map((item) => item.interactionCount || 0),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
        {
          label: "Wishlist Count",
          data: dataToUse.map((item) => item.wishlistCount || 0),
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          type: "linear", // or 'logarithmic'
          beginAtZero: true,
          title: { display: true, text: "Count" },
          ticks: {
            callback: function (value) {
              return value >= 1000 ? value / 1000 + "k" : value;
            },
          },
        },
        x: {
          title: { display: true, text: "Product Name" },
          ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 },
        },
      },
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "OCOP Product Analytics" },
        datalabels: {
          anchor: "end",
          align: "top",
          color: "#000",
          font: { size: 10 },
          formatter: (value) =>
            value > 1000 ? `${(value / 1000).toFixed(1)}k` : value,
        },
      },
    },
  });
}

// Xử lý refresh khi thay đổi timeRange hoặc ngày
document.getElementById("refreshChart")?.addEventListener("click", async function () {
  const timeRange = document.getElementById("timeRange").value;
  const startDateStr = document.getElementById("startDate").value;
  const endDateStr = document.getElementById("endDate").value;

  let url = `https://localhost:7162/api/OcopProduct/analytics?timeRange=${encodeURIComponent(timeRange)}`;

  if (startDateStr) {
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0); // Bắt đầu ngày
    url += `&startDate=${encodeURIComponent(startDate.toISOString().split("T")[0])}`;
  }

  if (endDateStr) {
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999); // Kết thúc ngày
    url += `&endDate=${encodeURIComponent(endDate.toISOString().split("T")[0])}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log("Fetched data:", data);

    drawChart({ analytics: data.data });
  } catch (error) {
    console.error("Error refreshing chart:", error);
    showTimedAlert("Error!", "Failed to refresh chart. Check console for details.", "error", 1000);
  }
});

// Nút làm mới bộ lọc (reset về mặc định)
document.getElementById("resetFilter")?.addEventListener("click", () => {
  document.getElementById("timeRange").value = "month";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";

  document.getElementById("refreshChart").click(); // Tự động gọi lại API
});

