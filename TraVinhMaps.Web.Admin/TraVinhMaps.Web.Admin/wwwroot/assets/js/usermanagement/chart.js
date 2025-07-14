/************************************************************
 *  Dashboard Charts Scripts
 *  Enhanced version: Combines robust chart rendering with consistent translation
 ************************************************************/

// Global chart variables
let ageChart, genderChart, statusChart, hometownChart, timeChart, performanceChart;

// Fixed category configuration & colors
const CATEGORY_CONFIG = [
  { key: "Destination", color: "#4E79A7" }, // Blue
  { key: "Ocop", color: "#F28E2B" }, // Orange
  { key: "Local specialty", color: "#59A14F" }, // Green
  { key: "Tips", color: "#E15759" }, // Red
  { key: "Festivals", color: "#76B7B2" }, // Teal
];

// Time range mapping for Vietnamese to English
const timeRangeMap = {
  'ngày': 'day',
  'tuần': 'week',
  'tháng': 'month',
  'năm': 'year',
  'all': 'all'
};

// Translation function
function t(key) {
  return window.translations?.[key] || window.translationMapForCharts?.[key] || key;
}

// Translate chart data
function translateChartData(data) {
  if (!data) return data;
  const translated = { ...data };
  if (Array.isArray(data.labels)) {
    translated.labels = data.labels.map(l => t(l));
  }
  if (Array.isArray(data.datasets)) {
    translated.datasets = data.datasets.map(ds => ({
      ...ds,
      label: ds.label ? t(ds.label) : undefined,
    }));
  }
  return translated;
}

// Translate chart options
function translateChartOptions(options) {
  if (!options) return options;
  const translated = { ...options };
  if (translated.plugins?.title?.text) {
    translated.plugins.title.text = t(translated.plugins.title.text);
  }
  if (translated.plugins?.legend?.title?.text) {
    translated.plugins.legend.title.text = t(translated.plugins.legend.title.text);
  }
  if (translated.scales) {
    for (const axisKey in translated.scales) {
      const axis = translated.scales[axisKey];
      if (axis.title?.text) axis.title.text = t(axis.title.text);
    }
  }
  return translated;
}

// Map Vietnamese time range to English
function getApiTimeRange(vietnameseValue) {
  return timeRangeMap[vietnameseValue] || vietnameseValue;
}

// Refresh all visible charts
function reRenderAllCharts() {
  const statTimeRange = document.getElementById("ageChartSelect")?.value || 'tháng';
  const performanceTimeRange = document.getElementById("timeChartSelectPerformance")?.value || 'tháng';
  
  fetchChartData("age", statTimeRange, null, updateAgeChart);
  fetchChartData("gender", statTimeRange, null, updateGenderChart);
  fetchChartData("status", statTimeRange, null, updateStatusChart);
  fetchChartData("hometown", statTimeRange, null, updateHometownChart);
  fetchChartData("time", statTimeRange, null, updateTimeChart);
  fetchChartData("performance", performanceTimeRange, null, updatePerformanceChart);
}

function initializeCharts(initialData = {}) {
  if (typeof Chart === "undefined") {
    console.error("Chart.js not loaded.");
    showTimedAlert(t("Error!"), t("Failed to load charting library. Please refresh the page."), "error", 1000);
    return;
  }
  if (typeof ChartDataLabels === "undefined") {
    console.error("ChartDataLabels plugin not loaded.");
    showTimedAlert(t("Error!"), t("Failed to load chart plugins. Please refresh the page."), "error", 1000);
    return;
  }
  Chart.register(ChartDataLabels);

  /* ---------- Reusable Download Function ---------- */
  function downloadChart(chart, chartId, filenamePrefix) {
    if (!chart) {
      showTimedAlert(t("Error!"), t("No chart data available to download!"), "error", 1000);
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
    const imageLink = document.createElement("a");
    imageLink.href = whiteCanvas.toDataURL("image/png");
    imageLink.download = `${filenamePrefix}_chart.png`;
    imageLink.click();

    const labels = chart.data.labels;
    const datasets = chart.data.datasets;
    let csvContent = "\uFEFF";
    if (datasets.length === 1) {
      csvContent += `"${t("Label")}","${t("Value")}"\n`;
      labels.forEach((label, i) => {
        csvContent += `"${label}",${datasets[0].data[i] || 0}\n`;
      });
    } else {
      csvContent += [`"${t("Day")}"`, ...datasets.map(ds => `"${t(ds.label)}"`)].join(",") + "\n";
      labels.forEach((label, idx) => {
        const row = [`"${label}"`, ...datasets.map(ds => ds.data[idx] || 0)];
        csvContent += row.join(",") + "\n";
      });
    }
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const csvLink = document.createElement("a");
    csvLink.href = URL.createObjectURL(csvBlob);
    csvLink.download = `${filenamePrefix}_data.csv`;
    csvLink.click();
    URL.revokeObjectURL(csvLink.href);
  }

  /* ---------- Initialize Chart Helper ---------- */
  function initializeChart(chartId, chartType, data, options) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.error(`Canvas element for ${chartId} not found.`);
      return null;
    }
    let chart = Chart.getChart(chartId);
    if (chart) chart.destroy();
    return new Chart(canvas, {
      type: chartType,
      data: translateChartData(data),
      options: translateChartOptions(options),
    });
  }

  /* ---------- Get Selected Tags Helper ---------- */
  function getSelectedTags() {
    const select = document.getElementById("tagSelect");
    if (!select) return CATEGORY_CONFIG.map(c => c.key);
    const selected = Array.from(select.selectedOptions).map(o => o.value);
    return selected.length ? selected : CATEGORY_CONFIG.map(c => c.key);
  }

  /* ---------- Fetch Chart Data Helper ---------- */
  function fetchChartData(chartId, timeRange, tagName, callback) {
    const loadingElement = document.getElementById(`${chartId}-loading`);
    const noDataElement = document.getElementById(`${chartId}-no-data`);
    const canvasElement = document.getElementById(chartId);

    if (loadingElement) loadingElement.style.display = "block";
    if (noDataElement) noDataElement.style.display = "none";
    if (canvasElement) canvasElement.style.display = "none";

    const timeRangeForApi = getApiTimeRange(timeRange);
    const apiUrl = chartId === "performance"
      ? "https://localhost:7162/api/Users/performance-tags"
      : "https://localhost:7162/api/Users/stats";

    let url = apiUrl;
    if (chartId === "performance") {
      const params = new URLSearchParams({ timeRange: timeRangeForApi });
      getSelectedTags().forEach(tag => params.append("tags", tag));
      params.append("includeOcop", "true");
      params.append("includeDestination", "true");
      params.append("includeLocalSpecialty", "true");
      params.append("includeTips", "true");
      params.append("includeFestivals", "true");
      url += `?${params.toString()}`;
    } else {
      url += `?groupBy=${chartId}&timeRange=${timeRangeForApi}`;
    }

    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(result => {
        let data;
        if (chartId === "performance") {
          data = result.data || {};
        } else if (result.status === "success" && result.data && result.data[chartId]) {
          data = result.data[chartId];
        } else {
          showTimedAlert(t("Error!"), t("Failed to update chart: Invalid response format"), "error", 1000);
          data = {};
        }

        if (Object.keys(data).length === 0) {
          if (noDataElement) noDataElement.style.display = "block";
          if (canvasElement) canvasElement.style.display = "none";
          const downloadButton = document.getElementById(`download${chartId.charAt(0).toUpperCase() + chartId.slice(1)}`);
          if (downloadButton) downloadButton.disabled = true;
        } else {
          if (noDataElement) noDataElement.style.display = "none";
          if (canvasElement) canvasElement.style.display = "block";
          const downloadButton = document.getElementById(`download${chartId.charAt(0).toUpperCase() + chartId.slice(1)}`);
          if (downloadButton) downloadButton.disabled = false;
        }
        callback(data);
      })
      .catch(error => {
        console.error(`Failed to fetch stats for ${chartId}:`, error);
        showTimedAlert(t("Error"), t("Failed to fetch statistics"), "error", 1000);
        if (noDataElement) noDataElement.style.display = "block";
        if (canvasElement) canvasElement.style.display = "none";
        const downloadButton = document.getElementById(`download${chartId.charAt(0).toUpperCase() + chartId.slice(1)}`);
        if (downloadButton) downloadButton.disabled = true;
        callback({});
      })
      .finally(() => {
        if (loadingElement) loadingElement.style.display = "none";
      });
  }

  /* ---------- Age Chart (Bar) ---------- */
  function updateAgeChart(data) {
    if (!data || Object.keys(data).length === 0) {
      if (ageChart) ageChart.destroy();
      ageChart = null;
      const noDataElement = document.getElementById("ageChart-no-data");
      const canvasElement = document.getElementById("ageChart");
      const downloadButton = document.getElementById("downloadAgeChart");
      if (noDataElement) noDataElement.style.display = "block";
      if (canvasElement) canvasElement.style.display = "none";
      if (downloadButton) downloadButton.disabled = true;
      return;
    }

    ageChart = initializeChart(
      "ageChart",
      "bar",
      {
        labels: Object.keys(data),
        datasets: [{
          label: "Number of Users",
          data: Object.values(data),
          backgroundColor: ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6f42c1", "#fd7e14"],
          borderColor: ["#0056b3", "#218838", "#c82333", "#e0a800", "#138496", "#5a32a3", "#e06c00"],
          borderWidth: 1,
        }],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Age Groups" } },
          y: { beginAtZero: true },
        },
        plugins: {
          datalabels: {
            color: "#51BB25",
            font: { weight: "bold", size: 12 },
            formatter: (value, context) => {
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
            },
            anchor: "end",
            align: "top",
            clip: false,
          },
          legend: { display: false },
        },
      }
    );
  }

  /* ---------- Gender Chart (Pie) ---------- */
  function updateGenderChart(data) {
    if (!data || Object.keys(data).length === 0) {
      if (genderChart) genderChart.destroy();
      genderChart = null;
      const noDataElement = document.getElementById("genderChart-no-data");
      const canvasElement = document.getElementById("genderChart");
      if (noDataElement) noDataElement.style.display = "block";
      if (canvasElement) canvasElement.style.display = "none";
      return;
    }

    const genderColors = ["#173878", "#DC3545", "#51BB25"];
    const genderBorders = ["#0F244F", "#A71D2A", "#3A8F1D"];
    genderChart = initializeChart(
      "genderChart",
      "pie",
      {
        labels: Object.keys(data),
        datasets: [{
          label: "Gender",
          data: Object.values(data),
          backgroundColor: genderColors.slice(0, Object.keys(data).length),
          borderColor: genderBorders.slice(0, Object.keys(data).length),
          borderWidth: 1,
        }],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: { enabled: true },
          datalabels: {
            color: "#fff",
            font: { weight: "bold", size: 12 },
            formatter: (value, context) => {
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
            },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const dataset = genderChart.data.datasets[0];
            dataset.backgroundColor = genderColors.map((color, i) =>
              i === index ? color : Chart.helpers.color(color).alpha(0.3).rgbString()
            );
            dataset.borderWidth = genderColors.map((_, i) => (i === index ? 2 : 1));
            genderChart.update();
          }
        },
        onHover: (event, elements) => {
          const chartArea = genderChart.chartArea;
          if (event.x >= chartArea.left && event.x <= chartArea.right && event.y >= chartArea.top && event.y <= chartArea.bottom) {
            if (elements.length > 0) {
              const index = elements[0].index;
              genderChart.data.datasets[0].backgroundColor = genderColors.map(
                (color, i) => i === index ? color : Chart.helpers.color(color).alpha(0.3).rgbString()
              );
              genderChart.update();
            } else {
              genderChart.data.datasets[0].backgroundColor = genderColors.slice(0, Object.keys(data).length);
              genderChart.update();
            }
          }
        },
      }
    );
  }

  /* ---------- Status Chart (Pie) ---------- */
  function updateStatusChart(data) {
    if (!data || Object.keys(data).length === 0) {
      if (statusChart) statusChart.destroy();
      statusChart = null;
      const noDataElement = document.getElementById("statusChart-no-data");
      const canvasElement = document.getElementById("statusChart");
      if (noDataElement) noDataElement.style.display = "block";
      if (canvasElement) canvasElement.style.display = "none";
      return;
    }

    statusChart = initializeChart(
      "statusChart",
      "pie",
      {
        labels: Object.keys(data),
        datasets: [{
          label: "Status",
          data: Object.values(data),
          backgroundColor: ["#51BB25", "#DC3545", "#F8D62B"],
          borderColor: ["#3A8F1D", "#A71D2A", "#D4B800"],
          borderWidth: 1,
        }],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: "#fff",
            font: { weight: "bold", size: 12 },
            formatter: (value, context) => {
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
            },
          },
        },
      }
    );
  }

  /* ---------- Hometown Chart (Horizontal Bar) ---------- */
  function updateHometownChart(data) {
    if (!data || Object.keys(data).length === 0) {
      if (hometownChart) hometownChart.destroy();
      hometownChart = null;
      const noDataElement = document.getElementById("hometownChart-no-data");
      const canvasElement = document.getElementById("hometownChart");
      if (noDataElement) noDataElement.style.display = "block";
      if (canvasElement) canvasElement.style.display = "none";
      return;
    }

    let dataArray = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const baseColor = "#173878";
    const colors = dataArray.map((_, i) => Chart.helpers.color(baseColor).alpha(1 - i * 0.02).rgbString());

    hometownChart = initializeChart(
      "hometownChart",
      "bar",
      {
        labels: dataArray.map(item => item[0]),
        datasets: [{
          label: "Number of Users",
          data: dataArray.map(item => item[1]),
          backgroundColor: colors,
          borderColor: baseColor,
          borderWidth: 1,
        }],
      },
      {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                return `${context.label}: ${context.raw} ${t("users")} (${((context.raw / total) * 100).toFixed(2)}%)`;
              },
            },
          },
          datalabels: {
            anchor: "end",
            align: "start",
            color: "#fff",
            font: { weight: "bold", size: 8 },
            formatter: (value) => {
              const total = dataArray.reduce((sum, item) => sum + item[1], 0);
              return total > 0 ? `${value} (${((value / total) * 100).toFixed(2)}%)` : "";
            },
            clamp: true,
            clip: true,
          },
        },
        elements: { bar: { barThickness: 48 } },
        scales: {
          x: { title: { display: true, text: "Number of Users" }, beginAtZero: true, grid: { display: true } },
        },
        onHover: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            hometownChart.data.datasets[0].backgroundColor = colors.map((color, i) =>
              i === index ? baseColor : Chart.helpers.color(baseColor).alpha(0.7).rgbString()
            );
            hometownChart.update();
          } else {
            hometownChart.data.datasets[0].backgroundColor = colors;
            hometownChart.update();
          }
        },
      }
    );
  }

  /* ---------- Time Chart (Line) ---------- */
  function updateTimeChart(data) {
    if (!data || Object.keys(data).length === 0) {
      if (timeChart) timeChart.destroy();
      timeChart = null;
      const noDataElement = document.getElementById("timeChart-no-data");
      const canvasElement = document.getElementById("timeChart");
      if (noDataElement) noDataElement.style.display = "block";
      if (canvasElement) canvasElement.style.display = "none";
      return;
    }

    const labels = Object.keys(data).map(label => {
      const timeRange = document.getElementById("timeChartSelect")?.value || 'tháng';
      if (timeRange === "tuần") return `${t("Week")} ${label.split("-W")[1]}`;
      if (timeRange === "năm") return new Date(label + "-01").toLocaleString("default", { month: "short", year: "numeric" });
      if (timeRange === "ngày") return label.split(" ")[1];
      return label;
    });

    timeChart = initializeChart(
      "timeChart",
      "line",
      {
        labels: labels,
        datasets: [{
          label: "Number of Users",
          data: Object.values(data),
          backgroundColor: "#007bff",
          borderColor: "#0056b3",
          borderWidth: 2,
          fill: false,
          pointRadius: 8,
          pointHoverRadius: 6,
          tension: 0.4,
        }],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Users" } },
          x: {
            title: {
              display: true,
              text: t((document.getElementById("timeChartSelect")?.value || 'tháng').replace(/^\w/, c => c.toUpperCase())),
            },
          },
        },
        plugins: {
          datalabels: {
            display: true,
            color: "#ffffff",
            font: { weight: "bold", size: 10 },
            formatter: value => (value > 0 ? value : ""),
            align: "center",
            anchor: "center",
          },
        },
      }
    );
  }

  /* ---------- Performance Chart (Bar) ---------- */
  function updatePerformanceChart(data) {
    if (!data || Object.keys(data).length === 0) {
      if (performanceChart) performanceChart.destroy();
      performanceChart = null;
      const noDataElement = document.getElementById("performanceChart-no-data");
      const canvasElement = document.getElementById("performanceChart");
      if (noDataElement) noDataElement.style.display = "block";
      if (canvasElement) canvasElement.style.display = "none";
      return;
    }

    const periods = Object.keys(data[CATEGORY_CONFIG[0].key] || {});
    const datasets = CATEGORY_CONFIG.map(({ key, color }) => ({
      label: key,
      data: periods.map(p => (data[key] && data[key][p]) || 0),
      backgroundColor: Chart.helpers.color(color).alpha(0.85).rgbString(),
      borderColor: color,
      borderWidth: 1,
    }));

    performanceChart = initializeChart(
      "performanceChart",
      "bar",
      {
        labels: periods,
        datasets: datasets,
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: false, title: { display: true, text: "Day of Week" } },
          y: { stacked: false, beginAtZero: true, title: { display: true, text: "Number of Interactions" } },
        },
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Performance by Tag" },
          tooltip: {
            callbacks: {
              label: ctx => `${t(ctx.dataset.label)}: ${ctx.raw}`,
            },
          },
          datalabels: {
            color: "#fff",
            anchor: "end",
            align: "start",
            font: { weight: "bold" },
            formatter: value => value,
          },
        },
      }
    );
  }

  /* ---------- Initialize and Bind Events ---------- */
  const initialTimeRange = initialData.initialTimeRange || "tháng";
  const initialTag = initialData.initialTag || "";

  const chartConfigs = [
    { id: "age", updateFn: updateAgeChart, selectId: "ageChartSelect" },
    { id: "gender", updateFn: updateGenderChart, selectId: "genderChartSelect" },
    { id: "status", updateFn: updateStatusChart, selectId: "statusChartSelect" },
    { id: "hometown", updateFn: updateHometownChart, selectId: "hometownChartSelect" },
    { id: "time", updateFn: updateTimeChart, selectId: "timeChartSelect" },
    { id: "performance", updateFn: updatePerformanceChart, selectId: "timeChartSelectPerformance" },
  ];

  chartConfigs.forEach(({ id, updateFn, selectId }) => {
    const select = document.getElementById(selectId);
    if (select) {
      // Đặt giá trị mặc định là "tháng"
      select.value = initialTimeRange;
      // Gọi fetchChartData ngay lập tức với giá trị mặc định
      fetchChartData(id, initialTimeRange, id === "performance" ? getSelectedTags() : null, updateFn);
      // Thêm sự kiện change
      select.addEventListener("change", e => {
        const tagName = id === "performance" ? getSelectedTags() : null;
        fetchChartData(id, e.target.value, tagName, updateFn);
      });
    }
  });

  const tagSelect = document.getElementById("tagSelect");
  if (tagSelect) {
    tagSelect.value = initialTag;
    tagSelect.addEventListener("change", () => {
      const timeRange = document.getElementById("timeChartSelectPerformance")?.value || initialTimeRange;
      fetchChartData("performance", timeRange, getSelectedTags(), updatePerformanceChart);
    });
    // Khởi tạo performance chart với tag mặc định
    fetchChartData("performance", initialTimeRange, getSelectedTags(), updatePerformanceChart);
  }

  const downloadButtons = [
    { id: "downloadAgeChart", chart: () => ageChart, filename: "age_distribution" },
    { id: "downloadGenderChart", chart: () => genderChart, filename: "gender_distribution" },
    { id: "downloadStatusChart", chart: () => statusChart, filename: "status_distribution" },
    { id: "downloadHometownChart", chart: () => hometownChart, filename: "hometown_distribution" },
    { id: "downloadTimeChart", chart: () => timeChart, filename: "user_creation_time" },
    { id: "downloadPerformanceChart", chart: () => performanceChart, filename: "performance_by_tag" },
  ];

  downloadButtons.forEach(({ id, chart, filename }) => {
    const button = document.getElementById(id);
    if (button && !button.dataset.bound) {
      button.dataset.bound = "true";
      button.addEventListener("click", () => downloadChart(chart(), id.replace("download", "").toLowerCase(), filename));
    }
  });

  const downloadUserStatBtn = document.getElementById("downloadUserStatChart");
  const downloadUserStatSelect = document.getElementById("downloadUserStatSelect");
  if (downloadUserStatBtn && downloadUserStatSelect) {
    downloadUserStatBtn.addEventListener("change", () => {
      const selected = downloadUserStatSelect.value;
      const chartMap = {
        ageChart: { chart: ageChart, prefix: "age" },
        genderChart: { chart: genderChart, prefix: "gender" },
        statusChart: { chart: statusChart, prefix: "status" },
      };
      const { chart, prefix } = chartMap[selected] || {};
      if (chart) downloadChart(chart, selected, prefix);
    });
  }

  // Language change listener
  window.addEventListener('languageChanged', reRenderAllCharts);
}

function showTimedAlert(title, message, type, duration) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: t(title),
      text: t(message),
      icon: type,
      timer: duration,
      showConfirmButton: false,
    });
  } else {
    alert(`${t(title)}: ${t(message)}`);
  }
}

// Run initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeCharts(window.initialData || {});
});

window.reRenderAllCharts = reRenderAllCharts;