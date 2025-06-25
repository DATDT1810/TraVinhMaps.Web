// ocop-dashboard.js
let myAnalyticsChart = null;
let myDemographicsChart = null;
let myTopInteractionChart = null;
let myTopWishlistChart = null;
let myCompareProductsChart = null;
let isInitialLoad = true;

// Log utility for debugging
function logDebug(message, data = null) {
  console.log(`[OcopDashboard] ${message}`, data ? data : "");
}

// Validate filter inputs
function validateFilterInputs(startDateStr, endDateStr) {
  if (
    startDateStr &&
    endDateStr &&
    new Date(endDateStr) < new Date(startDateStr)
  ) {
    showTimedAlert(
      "Invalid Input",
      "End date cannot be earlier than start date.",
      "warning",
      1000
    );
    return false;
  }
  return true;
}

// Draw Analytics Chart
function drawAnalyticsChart(data) {
  if (myAnalyticsChart) myAnalyticsChart.destroy();
  const ctx = document.getElementById("analyticsChart").getContext("2d");
  myAnalyticsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((item) => item.productName || "Unknown"),
      datasets: [
        {
          label: "View Count",
          data: data.map((item) => item.viewCount || 0),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Interaction Count",
          data: data.map((item) => item.interactionCount || 0),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
        {
          label: "Wishlist Count",
          data: data.map((item) => item.wishlistCount || 0),
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Count" },
          ticks: {
            callback: (value) => (value >= 1000 ? value / 1000 + "k" : value),
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
      },
    },
  });
}

// Draw Demographics Chart
function drawDemographicsChart(data) {
  if (myDemographicsChart) myDemographicsChart.destroy();
  const ctx = document.getElementById("demographicsChart").getContext("2d");
  myDemographicsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: "OCOP User Demographics (Product – Hometown – Age Group)",
        },
        tooltip: {
          callbacks: {
            title: (context) => {
              const product = context[0].label;
              const hometown =
                data.find((d) => d.productName === product)?.hometown || "N/A";
              return `${product} (Users from ${hometown})`;
            },
            label: (context) => {
              const age = context.dataset.label;
              const value = context.parsed.y;
              return `Age Group: ${age} - User Count: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: "Product" },
          ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: "User Count" },
        },
      },
    },
  });
  if (Array.isArray(data) && data.length) {
    const products = [...new Set(data.map((item) => item.productName))];
    const ageGroups = [...new Set(data.map((item) => item.ageGroup))];
    const labels = products;
    const colorArr = [
      "rgba(255,99,132,0.7)",
      "rgba(54,162,235,0.7)",
      "rgba(255,206,86,0.7)",
      "rgba(75,192,192,0.7)",
      "rgba(153,102,255,0.7)",
      "rgba(255,159,64,0.7)",
    ];
    const datasets = ageGroups.map((age, idx) => ({
      label: age,
      data: labels.map((product) => {
        const total = data
          .filter((d) => d.productName === product && d.ageGroup === age)
          .reduce((sum, d) => sum + (d.userCount || 0), 0);
        return total;
      }),
      backgroundColor: colorArr[idx % colorArr.length],
      borderColor: colorArr[idx % colorArr.length].replace("0.7", "1"),
      borderWidth: 1,
      barThickness: 20,
      stack: "Stack 0",
    }));
    myDemographicsChart.data.labels = labels;
    myDemographicsChart.data.datasets = datasets;
    myDemographicsChart.update();
  }
}

// Draw Top Interaction Chart
function drawTopInteractionChart(data) {
  if (myTopInteractionChart) myTopInteractionChart.destroy();
  const ctx = document.getElementById("topInteractionChart").getContext("2d");
  myTopInteractionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((item) => item.productName || "Unknown"),
      datasets: [
        {
          label: "Interaction Count",
          data: data.map((item) => item.interactionCount || 0),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          barThickness: 20,
          stack: "Stack 0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Interaction Count" },
          ticks: {
            callback: (value) => (value >= 1000 ? value / 1000 + "k" : value),
          },
        },
        x: {
          title: { display: true, text: "Product Name" },
          ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 },
        },
      },
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Top Interacted OCOP Products" },
      },
    },
  });
}

// Draw Top Wishlist Chart
function drawTopWishlistChart(data) {
  if (myTopWishlistChart) myTopWishlistChart.destroy();
  const ctx = document.getElementById("topWishlistChart").getContext("2d");
  myTopWishlistChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((item) => item.productName || "Unknown"),
      datasets: [
        {
          label: "Wishlist Count",
          data: data.map((item) => item.wishlistCount || 0),
          backgroundColor: "rgba(255, 206, 86, 0.7)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
          barThickness: 20,
          stack: "Stack 0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Wishlist Count" },
          ticks: {
            callback: (value) => (value >= 1000 ? value / 1000 + "k" : value),
          },
        },
        x: {
          title: { display: true, text: "Product Name" },
          ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 },
        },
      },
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Top Wishlisted OCOP Products" },
      },
    },
  });
}

// Draw Compare Products Chart
function drawCompareProductsChart(data) {
  if (myCompareProductsChart) myCompareProductsChart.destroy();
  const ctx = document.getElementById("compareProductsChart").getContext("2d");
  myCompareProductsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((item) => item.productName || "Unknown"),
      datasets: [
        {
          label: "View Count",
          data: data.map((item) => item.viewCount || 0),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Interaction Count",
          data: data.map((item) => item.interactionCount || 0),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
        {
          label: "Wishlist Count",
          data: data.map((item) => item.wishlistCount || 0),
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Count" },
          ticks: {
            callback: (value) => (value >= 1000 ? value / 1000 + "k" : value),
          },
        },
        x: {
          title: { display: true, text: "Product Name" },
          ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 },
        },
      },
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "OCOP Product Comparison" },
      },
    },
  });
}

// Refresh Analytics Chart
async function refreshAnalyticsChart(showAlert = true) {
  logDebug("Refreshing Analytics Chart");
  const timeRange =
    document.getElementById("analyticsTimeRange")?.value || "month";
  const startDate = document.getElementById("analyticsStartDate")?.value || "";
  const endDate = document.getElementById("analyticsEndDate")?.value || "";

  if (!validateFilterInputs(startDate, endDate)) {
    logDebug("Invalid analytics filter inputs");
    return;
  }

  let url = `https://localhost:7162/api/OcopProduct/analytics?timeRange=${encodeURIComponent(
    timeRange
  )}`;
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
  logDebug("Analytics API URL", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) {
      logDebug("No analytics data available");
      if (showAlert)
        showTimedAlert("Warning!", "No data found", "warning", 1000);
      drawAnalyticsChart([]);
      return;
    }
    if (!res.ok) {
      logDebug("API error occurred", res.status);
      if (showAlert)
        showTimedAlert("Error!", "An error occurred", "error", 1000);
      return;
    }
    const data = await res.json();
    logDebug("Analytics API response", data);
    drawAnalyticsChart(data.data ?? []);
    if (showAlert)
      showTimedAlert("Success!", "Analytics chart refreshed", "success", 1000);
  } catch (err) {
    logDebug("Analytics refresh error", err);
    if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
  }
}

// Refresh Demographics Chart
async function refreshDemographicsChart(showAlert = true) {
  logDebug("Refreshing Demographics Chart");
  const timeRange =
    document.getElementById("demographicsTimeRange")?.value || "month";
  const startDate =
    document.getElementById("demographicsStartDate")?.value || "";
  const endDate = document.getElementById("demographicsEndDate")?.value || "";

  if (!validateFilterInputs(startDate, endDate)) {
    logDebug("Invalid demographics filter inputs");
    return;
  }

  let url = `https://localhost:7162/api/OcopProduct/analytics-userdemographics?timeRange=${encodeURIComponent(
    timeRange
  )}`;
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
  logDebug("Demographics API URL", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) {
      logDebug("No demographics data available");
      if (showAlert)
        showTimedAlert("Warning!", "No data found", "warning", 1000);
      drawDemographicsChart([]);
      return;
    }
    if (!res.ok) {
      logDebug("API error occurred", res.status);
      if (showAlert)
        showTimedAlert("Error!", "An error occurred", "error", 1000);
      return;
    }
    const data = await res.json();
    logDebug("Demographics API response", data);
    drawDemographicsChart(data.data ?? []);
    if (showAlert)
      showTimedAlert(
        "Success!",
        "Demographics chart refreshed",
        "success",
        1000
      );
  } catch (err) {
    logDebug("Demographics refresh error", err);
    if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
  }
}

// Refresh Top Interaction Chart
async function refreshTopInteractionChart(showAlert = true) {
  logDebug("Refreshing Top Interaction Chart");
  const timeRange =
    document.getElementById("analyticsTimeRange")?.value || "month";
  const startDate = document.getElementById("analyticsStartDate")?.value || "";
  const endDate = document.getElementById("analyticsEndDate")?.value || "";

  if (!validateFilterInputs(startDate, endDate)) {
    logDebug("Invalid top interaction filter inputs");
    return;
  }

  let url = `https://localhost:7162/api/OcopProduct/top-interactions?top=5&timeRange=${encodeURIComponent(
    timeRange
  )}`;
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
  logDebug("Top Interaction API URL", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) {
      logDebug("No top interaction data available");
      if (showAlert)
        showTimedAlert("Warning!", "No data found", "warning", 1000);
      drawTopInteractionChart([]);
      return;
    }
    if (!res.ok) {
      logDebug("API error occurred", res.status);
      if (showAlert)
        showTimedAlert("Error!", "An error occurred", "error", 1000);
      return;
    }
    const data = await res.json();
    logDebug("Top Interaction API response", data);
    drawTopInteractionChart(data.data ?? []);
    if (showAlert)
      showTimedAlert(
        "Success!",
        "Top Interaction chart refreshed",
        "success",
        1000
      );
  } catch (err) {
    logDebug("Top Interaction refresh error", err);
    if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
  }
}

// Refresh Top Wishlist Chart
async function refreshTopWishlistChart(showAlert = true) {
  logDebug("Refreshing Top Wishlist Chart");
  const timeRange =
    document.getElementById("analyticsTimeRange")?.value || "month";
  const startDate = document.getElementById("analyticsStartDate")?.value || "";
  const endDate = document.getElementById("analyticsEndDate")?.value || "";

  if (!validateFilterInputs(startDate, endDate)) {
    logDebug("Invalid top wishlist filter inputs");
    return;
  }

  let url = `https://localhost:7162/api/OcopProduct/top-favorites?top=5&timeRange=${encodeURIComponent(
    timeRange
  )}`;
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
  logDebug("Top Wishlist API URL", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) {
      logDebug("No top wishlist data available");
      if (showAlert)
        showTimedAlert("Warning!", "No data found", "warning", 1000);
      drawTopWishlistChart([]);
      return;
    }
    if (!res.ok) {
      logDebug("API error occurred", res.status);
      if (showAlert)
        showTimedAlert("Error!", "An error occurred", "error", 1000);
      return;
    }
    const data = await res.json();
    logDebug("Top Wishlist API response", data);
    drawTopWishlistChart(data.data ?? []);
    if (showAlert)
      showTimedAlert(
        "Success!",
        "Top Wishlist chart refreshed",
        "success",
        1000
      );
  } catch (err) {
    logDebug("Top Wishlist refresh error", err);
    if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
  }
}

// Refresh Compare Products Chart
async function refreshCompareProductsChart(productIds, showAlert = true) {
  logDebug("Refreshing Compare Products Chart", productIds);
  const timeRange =
    document.getElementById("analyticsTimeRange")?.value || "month";
  const startDate = document.getElementById("analyticsStartDate")?.value || "";
  const endDate = document.getElementById("analyticsEndDate")?.value || "";

  if (!validateFilterInputs(startDate, endDate)) {
    logDebug("Invalid compare products filter inputs");
    return;
  }

  if (!productIds || productIds.length === 0) {
    logDebug("No products selected for comparison");
    if (showAlert)
      showTimedAlert(
        "Warning!",
        "Please select products to compare",
        "warning",
        1000
      );
    drawCompareProductsChart([]);
    return;
  }

  let url = `https://localhost:7162/api/OcopProduct/analytics-compareproducts?timeRange=${encodeURIComponent(
    timeRange
  )}`;
  productIds.forEach((id) => (url += `&productIds=${encodeURIComponent(id)}`));
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
  logDebug("Compare Products API URL", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) {
      logDebug("No comparison data available");
      if (showAlert)
        showTimedAlert("Warning!", "No data found", "warning", 1000);
      drawCompareProductsChart([]);
      return;
    }
    if (!res.ok) {
      logDebug("API error occurred", res.status);
      if (showAlert)
        showTimedAlert("Error!", "An error occurred", "error", 1000);
      return;
    }
    const data = await res.json();
    logDebug("Compare Products API response", data);
    drawCompareProductsChart(data.data ?? []);
    if (showAlert)
      showTimedAlert("Success!", "Comparison chart refreshed", "success", 1000);
  } catch (err) {
    logDebug("Compare Products refresh error", err);
    if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
  }
}

// Download Chart
function downloadChart(chart, name) {
  if (!chart) {
    showTimedAlert(
      "Error!",
      `No ${name} chart available for download`,
      "error",
      1000
    );
    return;
  }

  const canvas = chart.canvas;
  const whiteCanvas = document.createElement("canvas");
  whiteCanvas.width = canvas.width;
  whiteCanvas.height = canvas.height;
  const ctx = whiteCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
  ctx.drawImage(canvas, 0, 0);

  // PNG
  const link = document.createElement("a");
  link.href = whiteCanvas.toDataURL("image/png");
  link.download = `ocop_${name}_chart.png`;
  link.click();

  // CSV
  const labels = chart.data.labels;
  const datasets = chart.data.datasets;
  let csv = "\uFEFFLabel," + datasets.map((ds) => ds.label).join(",") + "\n";
  labels.forEach((label, idx) => {
    const row = [label];
    datasets.forEach((ds) => row.push(ds.data[idx] ?? 0));
    csv += row.join(",") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const csvLink = document.createElement("a");
  csvLink.href = URL.createObjectURL(blob);
  csvLink.download = `ocop_${name}_data.csv`;
  csvLink.click();
}

// Initialize Charts
function initializeCharts(
  analyticsData,
  demographicsData,
  topInteractionData,
  topWishlistData,
  compareProductsData
) {
  logDebug("Initial chart rendering");

  // Draw initial charts with data from global variables
  if (analyticsData && Array.isArray(analyticsData)) {
    drawAnalyticsChart(analyticsData);
  } else {
    refreshAnalyticsChart(false);
  }

  if (demographicsData && Array.isArray(demographicsData)) {
    drawDemographicsChart(demographicsData);
  } else {
    refreshDemographicsChart(false);
  }

  if (topInteractionData && Array.isArray(topInteractionData)) {
    drawTopInteractionChart(topInteractionData);
  } else {
    refreshTopInteractionChart(false);
  }

  if (topWishlistData && Array.isArray(topWishlistData)) {
    drawTopWishlistChart(topWishlistData);
  } else {
    refreshTopWishlistChart(false);
  }

  if (compareProductsData && Array.isArray(compareProductsData)) {
    drawCompareProductsChart(compareProductsData);
  } else {
    drawCompareProductsChart([]);
  }

  isInitialLoad = false;

  // Event Listeners
  document
    .getElementById("analyticsRefreshChart")
    ?.addEventListener("click", () => {
      logDebug("Analytics Filter Button Clicked");
      refreshAnalyticsChart();
      refreshTopInteractionChart(false);
      refreshTopWishlistChart(false);
    });

  document
    .getElementById("analyticsResetFilter")
    ?.addEventListener("click", () => {
      logDebug("Analytics Reset Button Clicked");
      document.getElementById("analyticsTimeRange").value = "month";
      document.getElementById("analyticsStartDate").value = "";
      document.getElementById("analyticsEndDate").value = "";
      refreshAnalyticsChart();
      refreshTopInteractionChart(false);
      refreshTopWishlistChart(false);
    });

  document
    .getElementById("demographicsRefreshChart")
    ?.addEventListener("click", () => {
      logDebug("Demographics Filter Button Clicked");
      refreshDemographicsChart();
    });

  document
    .getElementById("demographicsResetFilter")
    ?.addEventListener("click", () => {
      logDebug("Demographics Reset Button Clicked");
      document.getElementById("demographicsTimeRange").value = "month";
      document.getElementById("demographicsStartDate").value = "";
      document.getElementById("demographicsEndDate").value = "";
      refreshDemographicsChart();
    });

  document
    .getElementById("analyticsDownloadChartBtn")
    ?.addEventListener("click", () => {
      logDebug("Analytics Download Button Clicked");
      downloadChart(myAnalyticsChart, "analytics");
    });

  document
    .getElementById("demographicsDownloadChartBtn")
    ?.addEventListener("click", () => {
      logDebug("Demographics Download Button Clicked");
      downloadChart(myDemographicsChart, "demographics");
    });

  document
    .getElementById("topInteractionDownloadChartBtn")
    ?.addEventListener("click", () => {
      logDebug("Top Interaction Download Button Clicked");
      downloadChart(myTopInteractionChart, "top_interaction");
    });

  document
    .getElementById("topWishlistDownloadChartBtn")
    ?.addEventListener("click", () => {
      logDebug("Top Wishlist Download Button Clicked");
      downloadChart(myTopWishlistChart, "top_wishlist");
    });

  document
    .getElementById("compareProductsDownloadChartBtn")
    ?.addEventListener("click", () => {
      logDebug("Compare Products Download Button Clicked");
      downloadChart(myCompareProductsChart, "compare_products");
    });

  document
    .getElementById("compareProductsBtn")
    ?.addEventListener("click", () => {
      logDebug("Compare Products Button Clicked");
      const select = document.getElementById("compareProductsSelect");
      const productIds = Array.from(select.selectedOptions).map(
        (option) => option.value
      );
      refreshCompareProductsChart(productIds);
    });
}

// Export the initialize function for use in the Razor view
window.initializeOcopDashboard = initializeCharts;
