// ============================================================================
// OCOP Dashboard Charts Scripts (Optimized for Light/Dark Mode and Translation)
// ============================================================================

// Global variables for chart data
let myAnalyticsChart = null;
let myDemographicsChart = null;
let myTopInteractionChart = null;
let myTopFavoriteChart = null;
let myCompareProductsChart = null;
let isInitialLoad = true;

// OCOP API URL
const ocopApi = window.apiBaseUrl + "api/OcopProduct/";

// Theme-based color configuration
const THEME_COLORS = {
  light: {
    cyan: "rgba(75, 192, 192, 0.7)",
    purple: "rgba(153, 102, 255, 0.7)",
    orange: "rgba(255, 159, 64, 0.7)",
    red: "rgba(255, 99, 132, 0.7)",
    blue: "rgba(54, 162, 235, 0.7)",
    yellow: "rgba(255, 206, 86, 0.7)",
    datalabel: "#1A1A1A",
    canvasBackground: "#F5F5F5",
    grid: "#CCCCCC",
    tooltipBg: "rgba(0, 0, 0, 0.8)",
    tooltipText: "#FFFFFF",
  },
  dark: {
    cyan: "rgba(75, 192, 192, 0.7)",
    purple: "rgba(153, 102, 255, 0.7)",
    orange: "rgba(255, 159, 64, 0.7)",
    red: "rgba(255, 99, 132, 0.7)",
    blue: "rgba(54, 162, 235, 0.7)",
    yellow: "rgba(255, 206, 86, 0.7)",
    datalabel: "#E6E6E6",
    canvasBackground: "#1A1A1A",
    grid: "#444444",
    tooltipBg: "rgba(255, 255, 255, 0.15)",
    tooltipText: "#FFFFFF",
  },
};

// Utility functions
function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}
function getChartColor(light, dark) {
  return isDarkMode() ? dark : light;
}
function logDebug(message, data = null) {
  console.log(`[OcopDashboard] ${message}`, data ? data : "");
}
const timeRangeMap = {
  ngày: "day",
  tuần: "week",
  tháng: "month",
  năm: "year",
  all: "all",
};
function getApiTimeRange(v) {
  return timeRangeMap[v] || v;
}
function t(text) {
  return window.translationMapForCharts?.[text] || text;
}

function validateFilterInputs(startDateStr, endDateStr) {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  if (startDateStr && new Date(startDateStr) > now) {
    showTimedAlert(
      t("Invalid Input"),
      t("Start date cannot be in the future."),
      "warning",
      1000
    );
    return false;
  }
  if (endDateStr && new Date(endDateStr) > now) {
    showTimedAlert(
      t("Invalid Input"),
      t("End date cannot be in the future."),
      "warning",
      1000
    );
    return false;
  }
  if (
    startDateStr &&
    endDateStr &&
    new Date(endDateStr) < new Date(startDateStr)
  ) {
    showTimedAlert(
      t("Invalid Input"),
      t("End date cannot be earlier than start date."),
      "warning",
      1000
    );
    return false;
  }
  return true;
}

function downloadChart(chart, filename, type) {
  if (!chart || !chart.canvas) {
    showTimedAlert(
      t("Error"),
      t("No chart available for download"),
      "error",
      1000
    );
    return;
  }
  const hasData =
    chart.data.labels?.length > 0 &&
    chart.data.datasets.some((ds) => ds.data?.some((v) => v > 0));
  if (!hasData) {
    showTimedAlert(
      t("Warning"),
      t("No data available to download."),
      "warning",
      1000
    );
    return;
  }
  if (type === "png") {
    const canvas = chart.canvas;
    const target = document.createElement("canvas");
    target.width = canvas.width;
    target.height = canvas.height;
    const ctx = target.getContext("2d");
    ctx.fillStyle = getChartColor(
      THEME_COLORS.light.canvasBackground,
      THEME_COLORS.dark.canvasBackground
    );
    ctx.fillRect(0, 0, target.width, target.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement("a");
    link.href = target.toDataURL("image/png");
    link.download = filename;
    link.click();
  } else if (type === "csv") {
    const labels = chart.data.labels;
    const datasets = chart.data.datasets;
    const esc = (v) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };
    let csv =
      "\uFEFF" +
      esc(t("Label")) +
      "," +
      datasets.map((ds) => esc(ds.label)).join(",") +
      "\n";
    labels.forEach((lab, i) => {
      const row = [esc(lab)];
      datasets.forEach((ds) => row.push(ds.data[i] ?? 0));
      csv += row.join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename.replace(".png", ".csv");
    link.click();
  }
}

// =======================
// === Draw ChartFuncs ===
// =======================

function drawAnalyticsChart(data) {
  if (myAnalyticsChart) myAnalyticsChart.destroy();
  const ctx = document.getElementById("analyticsChart")?.getContext("2d");
  if (!ctx) return;
  ctx.canvas.style.backgroundColor = getChartColor(
    THEME_COLORS.light.canvasBackground,
    THEME_COLORS.dark.canvasBackground
  );
  myAnalyticsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((i) => t(i.productName || "Unknown")),
      datasets: [
        {
          label: t("View Count"),
          data: data.map((i) => i.viewCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.cyan,
            THEME_COLORS.dark.cyan
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.cyan,
            THEME_COLORS.dark.cyan
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
        {
          label: t("Interaction Count"),
          data: data.map((i) => i.interactionCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.purple,
            THEME_COLORS.dark.purple
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.purple,
            THEME_COLORS.dark.purple
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
        {
          label: t("Favorite Count"),
          data: data.map((i) => i.favoriteCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.orange,
            THEME_COLORS.dark.orange
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.orange,
            THEME_COLORS.dark.orange
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
        },
        title: {
          display: true,
          text: t("OCOP Product Analytics"),
          color: getChartColor(
            THEME_COLORS.light.datalabel,
            THEME_COLORS.dark.datalabel
          ),
        },
        tooltip: {
          backgroundColor: getChartColor(
            THEME_COLORS.light.tooltipBg,
            THEME_COLORS.dark.tooltipBg
          ),
          titleColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
          bodyColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: t("Count"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            stepSize: 1,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
            callback: (v) => (Number.isInteger(v) ? v : null),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
        x: {
          title: {
            display: true,
            text: t("Product Name"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 45,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
      },
    },
  });
}

function drawDemographicsChart(data) {
  if (myDemographicsChart) myDemographicsChart.destroy();
  const ctx = document.getElementById("demographicsChart")?.getContext("2d");
  if (!ctx) return;
  ctx.canvas.style.backgroundColor = getChartColor(
    THEME_COLORS.light.canvasBackground,
    THEME_COLORS.dark.canvasBackground
  );
  myDemographicsChart = new Chart(ctx, {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
        },
        title: {
          display: true,
          text: t("OCOP User Demographics (Product – Hometown – Age Group)"),
          color: getChartColor(
            THEME_COLORS.light.datalabel,
            THEME_COLORS.dark.datalabel
          ),
        },
        tooltip: {
          backgroundColor: getChartColor(
            THEME_COLORS.light.tooltipBg,
            THEME_COLORS.dark.tooltipBg
          ),
          titleColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
          bodyColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
          callbacks: {
            title: (ctxArr) => {
              const prod = ctxArr[0].label;
              const hometown =
                data.find((d) => t(d.productName) === prod)?.hometown ||
                t("N/A");
              return `${prod} (${t("Users from")} ${hometown})`;
            },
            label: (ctxItem) => {
              const age = ctxItem.dataset.label;
              const v = ctxItem.parsed.y;
              return `${t("Age Group")}: ${age} - ${t("User Count")}: ${v}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: t("Product"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            autoSkip: false,
            maxRotation: 60,
            minRotation: 30,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: t("User Count"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            stepSize: 1,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
            callback: (v) => (Number.isInteger(v) ? v : null),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
      },
    },
  });

  if (Array.isArray(data) && data.length) {
    const products = [
      ...new Set(data.map((i) => t(i.productName || "Unknown"))),
    ];
    const ageGroups = [...new Set(data.map((i) => i.ageGroup || "Unknown"))];
    const colorArr = [
      getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red),
      getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue),
      getChartColor(THEME_COLORS.light.yellow, THEME_COLORS.dark.yellow),
      getChartColor(THEME_COLORS.light.cyan, THEME_COLORS.dark.cyan),
      getChartColor(THEME_COLORS.light.purple, THEME_COLORS.dark.purple),
      getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange),
    ];
    const datasets = ageGroups.map((age, idx) => ({
      label: t(age),
      data: products.map((prod) =>
        data
          .filter((d) => t(d.productName) === prod && d.ageGroup === age)
          .reduce((s, d) => s + (d.userCount || 0), 0)
      ),
      backgroundColor: colorArr[idx % colorArr.length],
      borderColor: colorArr[idx % colorArr.length].replace("0.7", "1"),
      borderWidth: 1,
      barThickness: 20,
      stack: "Stack 0",
    }));
    myDemographicsChart.data.labels = products;
    myDemographicsChart.data.datasets = datasets;
    myDemographicsChart.update();
  }
}

function drawTopInteractionChart(data) {
  if (myTopInteractionChart) myTopInteractionChart.destroy();
  const ctx = document.getElementById("topInteractionChart")?.getContext("2d");
  if (!ctx) return;
  ctx.canvas.style.backgroundColor = getChartColor(
    THEME_COLORS.light.canvasBackground,
    THEME_COLORS.dark.canvasBackground
  );
  myTopInteractionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((i) => t(i.productName || "Unknown")),
      datasets: [
        {
          label: t("Interaction Count"),
          data: data.map((i) => i.interactionCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.blue,
            THEME_COLORS.dark.blue
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.blue,
            THEME_COLORS.dark.blue
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
        },
        title: {
          display: true,
          text: t("Top Interacted OCOP Products"),
          color: getChartColor(
            THEME_COLORS.light.datalabel,
            THEME_COLORS.dark.datalabel
          ),
        },
        tooltip: {
          backgroundColor: getChartColor(
            THEME_COLORS.light.tooltipBg,
            THEME_COLORS.dark.tooltipBg
          ),
          titleColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
          bodyColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: t("Interaction Count"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            stepSize: 1,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
            callback: (v) => (Number.isInteger(v) ? v : null),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
        x: {
          title: {
            display: true,
            text: t("Product Name"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            autoSkip: false,
            maxRotation: 60,
            minRotation: 30,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
      },
    },
  });
}

function drawTopFavoriteChart(data) {
  if (myTopFavoriteChart) myTopFavoriteChart.destroy();
  const ctx = document.getElementById("topFavoriteChart")?.getContext("2d");
  if (!ctx) return;
  ctx.canvas.style.backgroundColor = getChartColor(
    THEME_COLORS.light.canvasBackground,
    THEME_COLORS.dark.canvasBackground
  );
  myTopFavoriteChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((i) => t(i.productName || "Unknown")),
      datasets: [
        {
          label: t("Favorite Count"),
          data: data.map((i) => i.favoriteCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.yellow,
            THEME_COLORS.dark.yellow
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.yellow,
            THEME_COLORS.dark.yellow
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
        },
        title: {
          display: true,
          text: t("Top Favorited OCOP Products"),
          color: getChartColor(
            THEME_COLORS.light.datalabel,
            THEME_COLORS.dark.datalabel
          ),
        },
        tooltip: {
          backgroundColor: getChartColor(
            THEME_COLORS.light.tooltipBg,
            THEME_COLORS.dark.tooltipBg
          ),
          titleColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
          bodyColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: t("Favorite Count"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            stepSize: 1,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
            callback: (v) => (Number.isInteger(v) ? v : null),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
        x: {
          title: {
            display: true,
            text: t("Product Name"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            autoSkip: false,
            maxRotation: 60,
            minRotation: 30,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
      },
    },
  });
}

function drawCompareProductsChart(data) {
  if (myCompareProductsChart) myCompareProductsChart.destroy();
  const ctx = document.getElementById("compareProductsChart")?.getContext("2d");
  if (!ctx) return;
  ctx.canvas.style.backgroundColor = getChartColor(
    THEME_COLORS.light.canvasBackground,
    THEME_COLORS.dark.canvasBackground
  );
  myCompareProductsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((i) => t(i.productName || "Unknown")),
      datasets: [
        {
          label: t("View Count"),
          data: data.map((i) => i.viewCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.cyan,
            THEME_COLORS.dark.cyan
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.cyan,
            THEME_COLORS.dark.cyan
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
        {
          label: t("Interaction Count"),
          data: data.map((i) => i.interactionCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.purple,
            THEME_COLORS.dark.purple
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.purple,
            THEME_COLORS.dark.purple
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
        {
          label: t("Favorite Count"),
          data: data.map((i) => i.favoriteCount || 0),
          backgroundColor: getChartColor(
            THEME_COLORS.light.orange,
            THEME_COLORS.dark.orange
          ),
          borderColor: getChartColor(
            THEME_COLORS.light.orange,
            THEME_COLORS.dark.orange
          ).replace("0.7", "1"),
          borderWidth: 1,
          barThickness: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
        },
        title: {
          display: true,
          text: t("OCOP Product Comparison"),
          color: getChartColor(
            THEME_COLORS.light.datalabel,
            THEME_COLORS.dark.datalabel
          ),
        },
        tooltip: {
          backgroundColor: getChartColor(
            THEME_COLORS.light.tooltipBg,
            THEME_COLORS.dark.tooltipBg
          ),
          titleColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
          bodyColor: getChartColor(
            THEME_COLORS.light.tooltipText,
            THEME_COLORS.dark.tooltipText
          ),
        },
        annotation: {
          annotations:
            data.length === 0
              ? [
                  {
                    type: "label",
                    content: t("No data available"),
                    position: "center",
                    font: { size: 16 },
                    color: getChartColor(
                      THEME_COLORS.light.datalabel,
                      THEME_COLORS.dark.datalabel
                    ),
                  },
                ]
              : [],
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: t("Count"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            stepSize: 1,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
            callback: (v) => (Number.isInteger(v) ? v : null),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
        x: {
          title: {
            display: true,
            text: t("Product Name"),
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 45,
            color: getChartColor(
              THEME_COLORS.light.datalabel,
              THEME_COLORS.dark.datalabel
            ),
          },
          grid: {
            color: getChartColor(
              THEME_COLORS.light.grid,
              THEME_COLORS.dark.grid
            ),
          },
        },
      },
    },
  });
}

// ============= Refresh & Init =============

async function refreshAnalyticsChart(showAlert = true) {
  const sel = document.getElementById("analyticsTimeRange")?.value || "month";
  const tr = getApiTimeRange(sel);
  let sd = document.getElementById("analyticsStartDate")?.value || "";
  let ed = document.getElementById("analyticsEndDate")?.value || "";
  if (tr === "day" && !sd && !ed) {
    const today = new Date().toISOString().split("T")[0];
    sd = today;
    ed = today;
  }
  if (!validateFilterInputs(sd, ed)) return;
  let url = `${ocopApi}analytics?timeRange=${encodeURIComponent(tr)}`;
  if (sd) url += `&startDate=${encodeURIComponent(sd)}`;
  if (ed) url += `&endDate=${encodeURIComponent(ed)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const raw = await res.json();
    drawAnalyticsChart(raw.data || []);
    if (showAlert)
      showTimedAlert(
        t("Success!"),
        t("Analytics chart refreshed"),
        "success",
        1500
      );
  } catch (err) {
    drawAnalyticsChart([]);
    logDebug("Analytics refresh error", err);
    if (showAlert)
      showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
  }
}

async function refreshDemographicsChart(showAlert = true) {
  const sel =
    document.getElementById("demographicsTimeRange")?.value || "month";
  const tr = getApiTimeRange(sel);
  let sd = document.getElementById("demographicsStartDate")?.value || "";
  let ed = document.getElementById("demographicsEndDate")?.value || "";
  if (tr === "day" && !sd && !ed) {
    const today = new Date().toISOString().split("T")[0];
    sd = today;
    ed = today;
  }
  if (!validateFilterInputs(sd, ed)) return;
  let url = `${ocopApi}analytics-userdemographics?timeRange=${encodeURIComponent(
    tr
  )}`;
  if (sd) url += `&startDate=${encodeURIComponent(sd)}`;
  if (ed) url += `&endDate=${encodeURIComponent(ed)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const raw = await res.json();
    drawDemographicsChart(raw.data || []);
    if (showAlert)
      showTimedAlert(
        t("Success!"),
        t("Demographics chart refreshed"),
        "success",
        1500
      );
  } catch (err) {
    drawDemographicsChart([]);
    logDebug("Demographics refresh error", err);
    if (showAlert)
      showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
  }
}

async function refreshTopInteractionChart(showAlert = true) {
  const sel =
    document.getElementById("topInteractionTimeRange")?.value || "month";
  const tr = getApiTimeRange(sel);
  let sd = document.getElementById("topInteractionStartDate")?.value || "";
  let ed = document.getElementById("topInteractionEndDate")?.value || "";
  if (tr === "day" && !sd && !ed) {
    const today = new Date().toISOString().split("T")[0];
    sd = today;
    ed = today;
  }
  if (!validateFilterInputs(sd, ed)) return;
  let url = `${ocopApi}analytics-getTopProductsByInteractions?top=5&timeRange=${encodeURIComponent(
    tr
  )}`;
  if (sd) url += `&startDate=${encodeURIComponent(sd)}`;
  if (ed) url += `&endDate=${encodeURIComponent(ed)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const raw = await res.json();
    drawTopInteractionChart(raw.data || []);
    if (showAlert)
      showTimedAlert(
        t("Success!"),
        t("Top Interaction refreshed"),
        "success",
        1500
      );
  } catch (err) {
    drawTopInteractionChart([]);
    logDebug("Top Interaction refresh error", err);
    if (showAlert)
      showTimedAlert(
        t("Error!"),
        t("Failed to refresh top interaction"),
        "error",
        1000
      );
  }
}

async function refreshTopFavoriteChart(showAlert = true) {
  const sel = document.getElementById("topFavoriteTimeRange")?.value || "month";
  const tr = getApiTimeRange(sel);
  let sd = document.getElementById("topFavoriteStartDate")?.value || "";
  let ed = document.getElementById("topFavoriteEndDate")?.value || "";
  if (tr === "day" && !sd && !ed) {
    const today = new Date().toISOString().split("T")[0];
    sd = today;
    ed = today;
  }
  if (!validateFilterInputs(sd, ed)) return;
  let url = `${ocopApi}analytics-getTopProductsByFavorites?top=5&timeRange=${encodeURIComponent(
    tr
  )}`;
  if (sd) url += `&startDate=${encodeURIComponent(sd)}`;
  if (ed) url += `&endDate=${encodeURIComponent(ed)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const raw = await res.json();
    drawTopFavoriteChart(raw.data || []);
    if (showAlert)
      showTimedAlert(
        t("Success!"),
        t("Top Favorite refreshed"),
        "success",
        1500
      );
  } catch (err) {
    drawTopFavoriteChart([]);
    logDebug("Top Favorite refresh error", err);
    if (showAlert)
      showTimedAlert(
        t("Error!"),
        t("Failed to refresh top favorites"),
        "error",
        1000
      );
  }
}

async function refreshCompareProductsChart(productIds, showAlert = true) {
  const sel = document.getElementById("compareTimeRange")?.value || "month";
  const tr = getApiTimeRange(sel);
  let sd = document.getElementById("compareStartDate")?.value || "";
  let ed = document.getElementById("compareEndDate")?.value || "";
  if (tr === "day" && !sd && !ed) {
    const today = new Date().toISOString().split("T")[0];
    sd = today;
    ed = today;
  }
  if (!validateFilterInputs(sd, ed)) return;
  if (!productIds?.length) {
    drawCompareProductsChart([]);
    if (showAlert)
      showTimedAlert(
        t("Warning!"),
        t("Please select products to compare"),
        "warning",
        1000
      );
    return;
  }
  let url = `${ocopApi}analytics-compareproducts?`;
  productIds.forEach((id) => (url += `productIds=${encodeURIComponent(id)}&`));
  url += `timeRange=${encodeURIComponent(tr)}`;
  if (sd) url += `&startDate=${encodeURIComponent(sd)}`;
  if (ed) url += `&endDate=${encodeURIComponent(ed)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const raw = await res.json();
    const chartData = raw.data || [];
    drawCompareProductsChart(chartData);
    if (chartData.length === 0) {
      if (showAlert)
        showTimedAlert(
          t("Warning!"),
          t("No data available for the selected period."),
          "warning",
          1000
        );
    } else if (showAlert) {
      showTimedAlert(
        t("Success!"),
        t("Comparison chart refreshed"),
        "success",
        1500
      );
    }
  } catch (err) {
    drawCompareProductsChart([]);
    logDebug("Compare Products refresh error", err);
    if (showAlert)
      showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
  }
}

// Initialize
function initializeOcopDashboard() {
  console.log("Initializing OCOP Dashboard");
  refreshAnalyticsChart(false);
  refreshDemographicsChart(false);
  refreshTopInteractionChart(false);
  refreshTopFavoriteChart(false);
  drawCompareProductsChart([]);
}

document.addEventListener("DOMContentLoaded", () => {
  initializeOcopDashboard();
  // Analytics controls
  document
    .getElementById("analyticsRefreshChart")
    ?.addEventListener("click", () => refreshAnalyticsChart(true));
  document
    .getElementById("analyticsResetFilter")
    ?.addEventListener("click", () => {
      document.getElementById("analyticsTimeRange").value = "month";
      document.getElementById("analyticsStartDate").value = "";
      document.getElementById("analyticsEndDate").value = "";
      refreshAnalyticsChart(false);
    });
  document
    .getElementById("analyticsDownloadChartBtn")
    ?.addEventListener("click", () => {
      const type = document.getElementById("analyticsDownloadType").value;
      downloadChart(myAnalyticsChart, "analytics-chart.png", type);
    });
  // Demographics controls
  document
    .getElementById("demographicsRefreshChart")
    ?.addEventListener("click", () => refreshDemographicsChart(true));
  document
    .getElementById("demographicsResetFilter")
    ?.addEventListener("click", () => {
      document.getElementById("demographicsTimeRange").value = "month";
      document.getElementById("demographicsStartDate").value = "";
      document.getElementById("demographicsEndDate").value = "";
      refreshDemographicsChart(false);
    });
  document
    .getElementById("demographicsDownloadChartBtn")
    ?.addEventListener("click", () => {
      const type = document.getElementById("demographicsDownloadType").value;
      downloadChart(myDemographicsChart, "demographics-chart.png", type);
    });
  // Top Interaction controls
  document
    .getElementById("topInteractionRefresh")
    ?.addEventListener("click", () => refreshTopInteractionChart(true));
  document
    .getElementById("topInteractionReset")
    ?.addEventListener("click", () => {
      document.getElementById("topInteractionTimeRange").value = "month";
      document.getElementById("topInteractionStartDate").value = "";
      document.getElementById("topInteractionEndDate").value = "";
      refreshTopInteractionChart(false);
    });
  document
    .getElementById("topInteractionDownloadChartBtn")
    ?.addEventListener("click", () => {
      const type = document.getElementById("topInteractionDownloadType").value;
      downloadChart(myTopInteractionChart, "top-interactions-chart.png", type);
    });
  // Top Favorite controls
  document
    .getElementById("topFavoriteRefresh")
    ?.addEventListener("click", () => refreshTopFavoriteChart(true));
  document.getElementById("topFavoriteReset")?.addEventListener("click", () => {
    document.getElementById("topFavoriteTimeRange").value = "month";
    document.getElementById("topFavoriteStartDate").value = "";
    document.getElementById("topFavoriteEndDate").value = "";
    refreshTopFavoriteChart(false);
  });
  document
    .getElementById("topFavoriteDownloadChartBtn")
    ?.addEventListener("click", () => {
      const type = document.getElementById("topFavoriteDownloadType").value;
      downloadChart(myTopFavoriteChart, "top-favorites-chart.png", type);
    });
  // Compare Products controls
  document
    .getElementById("compareProductsBtn")
    ?.addEventListener("click", () => {
      const select = document.getElementById("compareProductsSelect");
      const productIds = Array.from(select.selectedOptions).map(
        (opt) => opt.value
      );
      refreshCompareProductsChart(productIds, true);
    });
  document
    .getElementById("compareProductsReset")
    ?.addEventListener("click", () => {
      const select = document.getElementById("compareProductsSelect");
      select.selectedIndex = -1;
      document.getElementById("compareTimeRange").value = "month";
      document.getElementById("compareStartDate").value = "";
      document.getElementById("compareEndDate").value = "";
      drawCompareProductsChart([]);
    });
  document
    .getElementById("compareProductsDownloadChartBtn")
    ?.addEventListener("click", () => {
      const type = document.getElementById("compareProductsDownloadType").value;
      downloadChart(myCompareProductsChart, "compare-products-chart.png", type);
    });
  // Listeners for dynamic changes
  window.addEventListener("languageChanged", () => {
    refreshAnalyticsChart(false);
    refreshDemographicsChart(false);
    refreshTopInteractionChart(false);
    refreshTopFavoriteChart(false);
    const select = document.getElementById("compareProductsSelect");
    const ids = Array.from(select.selectedOptions).map((o) => o.value);
    ids.length
      ? refreshCompareProductsChart(ids, false)
      : drawCompareProductsChart([]);
  });
  window.addEventListener("themeChanged", () => {
    refreshAnalyticsChart(false);
    refreshDemographicsChart(false);
    refreshTopInteractionChart(false);
    refreshTopFavoriteChart(false);
    const select = document.getElementById("compareProductsSelect");
    const ids = Array.from(select.selectedOptions).map((o) => o.value);
    ids.length
      ? refreshCompareProductsChart(ids, false)
      : drawCompareProductsChart([]);
  });
});

// ==========================
// === SignalR Real-time ====
// ==========================
(function () {
  if (typeof signalR === "undefined") {
    console.error("SignalR client library not found. Real-time disabled.");
    return;
  }
  function refreshAll() {
    refreshAnalyticsChart(false);
    refreshDemographicsChart(false);
    refreshTopInteractionChart(false);
    refreshTopFavoriteChart(false);
    const select = document.getElementById("compareProductsSelect");
    const ids = select
      ? Array.from(select.selectedOptions).map((o) => o.value)
      : [];
    ids.length
      ? refreshCompareProductsChart(ids, false)
      : drawCompareProductsChart([]);
  }
  window.refreshAllOcopCharts = refreshAll;
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(window.apiBaseUrl + "dashboardHub")
    .withAutomaticReconnect()
    .build();

  conn.on("ChartAnalytics", () => {
   console.log("[SignalR] ChartAnalytics received.", new Date().toISOString());
    setTimeout(() => {
      window.refreshAllOcopCharts();
    }, 500);
  });


  async function start() {
    try {
      await conn.start();
      console.log("[SignalR] Connected.");
      const role = document.body.dataset.userRole?.toLowerCase();
      if (role === "admin" || role === "super-admin") {
        conn.invoke("JoinAdminGroup", role).catch((err) => console.error(err));
      }
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
    }
  }
  start();
})();
