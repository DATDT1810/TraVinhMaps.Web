/************************************************************
 *  Dashboard Charts Scripts (Optimized & Corrected)
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
  ngày: "day",
  tuần: "week",
  tháng: "month",
  năm: "year",
  all: "all",
};

// Caches for API responses and translations
const chartDataCache = new Map();
const translationCache = new Map();

// --- Helper Functions (Translation, etc.) ---
function t(key) {
  if (translationCache.has(key)) return translationCache.get(key);
  const translated = window.translations?.[key] || window.translationMapForCharts?.[key] || key;
  translationCache.set(key, translated);
  return translated;
}

function tReverse(translated) {
  for (const key in window.translationMapForCharts) {
    if (window.translationMapForCharts[key] === translated) return key;
  }
  return translated;
}

function translateChartData(data) {
  if (!data) return data;
  const translated = { ...data };
  if (Array.isArray(data.labels)) {
    translated.labels = data.labels.map((l) => t(l));
  }
  if (Array.isArray(data.datasets)) {
    translated.datasets = data.datasets.map((ds) => ({
      ...ds,
      label: ds.label ? t(ds.label) : undefined,
    }));
  }
  return translated;
}

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

function getApiTimeRange(vietnameseValue) {
  return timeRangeMap[vietnameseValue] || vietnameseValue;
}

function initializeCharts(initialData = {}) {
  if (typeof Chart === "undefined" || typeof ChartDataLabels === "undefined") {
    console.error("Chart.js or plugins not loaded.");
    return;
  }
  Chart.register(ChartDataLabels);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // --- Core Functions (Download, Initialize, Fetch) ---
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
      csvContent += [`"${t("Day")}"`, ...datasets.map((ds) => `"${t(ds.label)}"`)].join(",") + "\n";
      labels.forEach((label, idx) => {
        const row = [`"${label}"`, ...datasets.map((ds) => ds.data[idx] || 0)];
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

  function initializeChart(chartId, chartType, data, options) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.error(`Canvas element for ${chartId} not found.`);
      return null;
    }
    let chart = Chart.getChart(chartId);
    if (chart) {
      chart.data = translateChartData(data);
      chart.options = translateChartOptions(options);
      chart.update();
      return chart;
    }
    return new Chart(canvas, {
      type: chartType,
      data: translateChartData(data),
      options: translateChartOptions(options),
    });
  }

  function getSelectedTags() {
    const select = document.getElementById("tagSelect");
    if (!select) return CATEGORY_CONFIG.map((c) => c.key);
    const selectedValues = Array.from(select.selectedOptions).map((opt) => tReverse(opt.value));
    return selectedValues.length ? selectedValues : CATEGORY_CONFIG.map((c) => c.key);
  }

  /* ---------- fetchChartData - ĐÃ SỬA LỖI ---------- */
function fetchChartData(chartId, timeRange, tags, callback) {
    const cacheKey = `${chartId}_${timeRange}_${tags?.join(",") || ""}`;
    if (chartDataCache.has(cacheKey)) {
        console.log(`Using cached data for ${cacheKey}`);
        callback(chartDataCache.get(cacheKey));
        return;
    }
    
    // Đã loại bỏ logic hiển thị noDataElement khỏi đây
    const timeRangeForApi = getApiTimeRange(timeRange);
    const performanceTagsQuery = tags ? tags.map(t => `tags=${encodeURIComponent(t)}`).join("&") : "";
    const apiUrl = chartId === "performance"
      ? `https://localhost:7162/api/Users/performance-tags?timeRange=${timeRangeForApi}&${performanceTagsQuery}`
      : `https://localhost:7162/api/Users/stats?groupBy=${chartId}&timeRange=${timeRangeForApi}`;
      
    fetch(apiUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        const data = chartId === "performance" ? (result.data || {}) : (result.data?.[chartId] || {});
        chartDataCache.set(cacheKey, data);
        callback(data); // Chỉ gọi callback
      })
      .catch((error) => {
        console.error(`Failed to fetch stats for ${chartId}:`, error);
        // Khi lỗi, vẫn gọi callback với dữ liệu rỗng để các hàm update xử lý
        const noDataElement = document.getElementById(`${chartId}Chart-no-data`);
        if (noDataElement) noDataElement.style.display = "block"; 
        callback({});
      });
}

  /* ---------- Age Chart (Bar) ---------- */
function updateAgeChart(data) {
    const canvas = document.getElementById('ageChart');
    const noDataElement = document.getElementById('ageChart-no-data'); 
    
    const hasData = data && Object.values(data).some(value => value > 0);

    // Luôn hiển thị canvas, chỉ ẩn/hiện thông báo "No data"
    if (canvas) canvas.style.display = 'block';
    if (noDataElement) noDataElement.style.display = hasData ? 'none' : 'block';

    const defaultLabels = ["0-18", "18-30", "30-50", "50+"];
    // Dữ liệu sẽ tự động là [0, 0, 0, 0] nếu không có data, điều này sẽ vẽ một biểu đồ trống
    const chartValues = defaultLabels.map((label) => data?.[label] || 0);

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { title: { display: true, text: "Age Groups" } }, y: { beginAtZero: true, title: { display: true, text: "Number of Users" }, ticks: { precision: 0, maxTicksLimit: 11 }, }, },
        plugins: {
            legend: { display: false },
            // Chỉ hiển thị nhãn dữ liệu khi có dữ liệu thực sự
            datalabels: {
                display: hasData, // Ẩn hoàn toàn khi không có dữ liệu
                color: "#FFFFFF", font: { weight: "bold", size: 12 },
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                    const percentage = total > 0 ? (value / total) * 100 : 0;
                    return `${percentage.toFixed(1)}%`;
                },
                anchor: "center", align: "center",
            },
        },
    };

    ageChart = initializeChart("ageChart", "bar",
        {
            labels: defaultLabels,
            datasets: [{ label: "Number of Users", data: chartValues, backgroundColor: ["#007bff", "#28a745", "#dc3545", "#ffc107"], borderColor: ["#0056b3", "#218838", "#c82333", "#e0a800"], borderWidth: 1, }],
        },
        chartOptions
    );
}

  /* ---------- Pie/Doughnut Chart (Gender, Status) ---------- */
function updatePieChart(chartInstance, chartId, data, options) {
    const canvas = document.getElementById(chartId);
    const noDataElement = document.getElementById(`${chartId}-no-data`);

    const hasData = data && Object.keys(data).length > 0 && Object.values(data).some(v => v > 0);

    // Luôn hiển thị canvas, chỉ ẩn/hiện thông báo "No data"
    if (canvas) canvas.style.display = 'block';
    if (noDataElement) noDataElement.style.display = hasData ? 'none' : 'block';

    let finalData, finalOptions;

    if (hasData) {
        // Nếu có dữ liệu, sử dụng dữ liệu thật
        finalData = options.getData(data);
        finalOptions = options.getOptions(true); // Bật legend, tooltip
    } else {
        // Nếu KHÔNG có dữ liệu, vẽ một vòng tròn giữ chỗ màu xám
        finalData = { labels: [], datasets: [{ data: [1], backgroundColor: ["#55555530"], borderWidth: 0 }] };
        finalOptions = options.getOptions(false); // Tắt legend, tooltip
    }
    
    // Luôn gọi initializeChart để vẽ biểu đồ (hoặc biểu đồ giữ chỗ)
    return initializeChart(chartId, "pie", finalData, finalOptions);
}

  function updateGenderChart(data) {
      genderChart = updatePieChart(genderChart, "genderChart", data, {
          getData: (d) => ({
              labels: Object.keys(d),
              datasets: [{ label: "Gender", data: Object.values(d), backgroundColor: ["#173878", "#DC3545", "#51BB25"].slice(0, Object.keys(d).length), borderColor: ["#0F244F", "#A71D2A", "#3A8F1D"].slice(0, Object.keys(d).length), borderWidth: 1, }],
          }),
          getOptions: (hasData) => ({
              responsive: true, maintainAspectRatio: false,
              plugins: {
                  legend: { display: hasData, position: "top" },
                  tooltip: { enabled: hasData },
                  datalabels: { display: hasData, color: "#fff", font: { weight: "bold", size: 12 }, formatter: (value, context) => { const total = context.dataset.data.reduce((acc, val) => acc + val, 0); return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : ""; },},
              },
          }),
      });
  }

  function updateStatusChart(data) {
      statusChart = updatePieChart(statusChart, "statusChart", data, {
          getData: (d) => ({
              labels: Object.keys(d),
              datasets: [{ label: "Status", data: Object.values(d), backgroundColor: ["#51BB25", "#DC3545", "#F8D62B"], borderColor: ["#3A8F1D", "#A71D2A", "#D4B800"], borderWidth: 1, }],
          }),
          getOptions: (hasData) => ({
              responsive: true, maintainAspectRatio: false,
              plugins: {
                  legend: { display: hasData, position: "top" },
                  tooltip: { enabled: hasData },
                  datalabels: { display: hasData, color: "#fff", font: { weight: "bold", size: 12 }, formatter: (value, context) => { const total = context.dataset.data.reduce((acc, val) => acc + val, 0); return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : ""; },},
              },
          }),
      });
  }

  /* ---------- Performance Chart (Bar) ---------- */
  function updatePerformanceChart(data) {
    const hasData = data && Object.keys(data).length > 0 && Object.values(data).some((d) => Object.keys(d).length > 0);
    const periods = hasData ? Object.keys(data[Object.keys(data)[0]] || {}) : [];
    const datasets = CATEGORY_CONFIG.map(({ key, color }) => ({
      label: key,
      data: periods.map((p) => data?.[key]?.[p] || 0),
      backgroundColor: Chart.helpers.color(color).alpha(0.85).rgbString(),
      borderColor: color,
      borderWidth: 1,
    }));
    performanceChart = initializeChart("performanceChart", "bar", {
      labels: periods,
      datasets: datasets,
    }, {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: false, title: { display: true, text: "Day of Week" } },
        y: {
          stacked: false,
          beginAtZero: true,
          title: { display: true, text: "Number of Interactions" },
          ticks: { precision: 0 },
        },
      },
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Performance by Tag" },
        tooltip: { callbacks: { label: (ctx) => `${t(ctx.dataset.label)}: ${ctx.raw}` } },
        datalabels: {
          color: "#36454F",
          anchor: "center",
          align: "center",
          font: { weight: "bold" },
          formatter: (value) => (value > 0 ? value : null),
        },
      },
    });
  }

  /* ---------- Hometown Chart ---------- */
  function updateHometownChart(data) {
    const chartContainer = document.getElementById("hometownChart-container");
    const noDataElement = document.getElementById("hometownChart-no-data");
    const hasData = data && Object.keys(data).length > 0;

    if (!chartContainer) {
      console.error("Hometown chart container not found!");
      return;
    }
    
    chartContainer.style.display = "block";
    noDataElement.style.display = hasData ? "none" : "block";

    let chartLabels, chartDatasets;
    let maxValue = 0;

    if (hasData) {
      const chartData = data || {};
      let dataArray = Object.entries(chartData).sort((a, b) => b[1] - a[1]);
      maxValue = dataArray.length > 0 ? dataArray[0][1] : 0;

      const baseColor = "#173878";
      const colors = dataArray.map((_, i) => {
        const alpha = Math.max(0.6, 1 - i * 0.015);
        return Chart.helpers.color(baseColor).alpha(alpha).rgbString();
      });
      
      chartContainer.style.height = `${Math.max(300, dataArray.length * 25)}px`;
      
      chartLabels = dataArray.map((item) => item[0]);
      chartDatasets = [{
        label: t("Number of Users"),
        data: dataArray.map((item) => item[1]),
        backgroundColor: colors,
        borderColor: baseColor,
        borderWidth: 1,
      }];

    } else {
      chartContainer.style.height = '400px';
      chartLabels = [];
      chartDatasets = [{ label: t("Number of Users"), data: [] }];
    }

    const chartOptions = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: t("Number of Users") },
          beginAtZero: true,
          ticks: { precision: 0 },
        },
        y: {
          ticks: { autoSkip: false },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: hasData,
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              if (total === 0) return `${context.label}: 0`;
              return `${context.label}: ${context.raw} ${t('users')} (${((context.raw / total) * 100).toFixed(2)}%)`;
            },
          },
        },
        datalabels: {
          display: hasData, 
          anchor: 'center',
          align: 'center',
          color: '#FFFFFF',
          font: { weight: 'bold' },
          formatter: (value) => {
            if (maxValue > 0 && value < maxValue * 0.1) {
              return null;
            }
            return value;
          },
          clamp: true,
        },
      },
      layout: {
        padding: {
          right: 20
        }
      }
    };

    hometownChart = initializeChart("hometownChart", "bar",
      {
        labels: chartLabels,
        datasets: chartDatasets,
      },
      chartOptions
    );
  }

  /* ---------- Time Chart (Corrected for Year Filter) ---------- */
  function updateTimeChart(data) {
    const noDataElement = document.getElementById("timeChart-no-data");
    const hasData = data && Object.keys(data).length > 0;
    noDataElement.style.display = hasData ? "none" : "block";

    const chartData = hasData ? data : {};
    const labels = hasData ? Object.keys(chartData) : [];
    const currentTimeRangeValue = document.getElementById("timeChartSelect")?.value || "tháng";
    
    // Convert time range value to English for consistent processing
    const apiTimeRange = getApiTimeRange(currentTimeRangeValue); 

    const translatedMonthsShort = [
      t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"), t("Jun"),
      t("Jul"), t("Aug"), t("Sep"), t("Oct"), t("Nov"), t("Dec"),
    ];
    
    timeChart = initializeChart("timeChart", "line", {
      labels: labels.map((label) => {
        // Always use the normalized English value for checking
        switch (apiTimeRange) { 
          case "week": return `${t("Week")} ${label.split("-W")[1]}`;
          case "year": 
            const date = new Date(label + "-01");
            // Check for invalid date before getting month/year
            if (!isNaN(date)) {
                return `${translatedMonthsShort[date.getMonth()]} ${date.getFullYear()}`;
            }
            return label; // Return original label if date is invalid
          case "day": return label;
          default: return label; // Default is for 'month'
        }
      }),
      datasets: [{
        label: t("Number of Users"),
        data: Object.values(chartData),
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 2,
        fill: false,
        pointRadius: 8,
        pointHoverRadius: 6,
        tension: 0.4,
      }],
    }, {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: t("Number of Users") },
          ticks: { precision: 0 },
        },
        x: {
          // Use the original dropdown value for the title to show the correct language
          title: { display: true, text: t(currentTimeRangeValue.charAt(0).toUpperCase() + currentTimeRangeValue.slice(1)) },
        },
      },
      plugins: {
        datalabels: {
          display: true,
          color: "#ffffff",
          font: { weight: "bold", size: 10 },
          formatter: (value) => (value > 0 ? value : ""),
          align: "center",
          anchor: "center",
        },
      },
    });
  }

  /* ---------- Initialize and Bind Events ---------- */
  const chartConfigs = [
    { id: "age", updateFn: updateAgeChart, selectId: "ageChartSelect" },
    { id: "gender", updateFn: updateGenderChart, selectId: "genderChartSelect" },
    { id: "status", updateFn: updateStatusChart, selectId: "statusChartSelect" },
    { id: "hometown", updateFn: updateHometownChart, selectId: "hometownChartSelect" },
    { id: "time", updateFn: updateTimeChart, selectId: "timeChartSelect" },
    { id: "performance", updateFn: updatePerformanceChart, selectId: "timeChartSelectPerformance" },
  ];
  
  function reRenderAllCharts() {
      console.log("Re-rendering all charts with individual fetch calls.");
      chartDataCache.clear();

      const statTimeRange = document.getElementById("ageChartSelect")?.value || "month";
      const performanceTimeRange = document.getElementById("timeChartSelectPerformance")?.value || "month";
      const tags = getSelectedTags();

      fetchChartData("age", statTimeRange, null, updateAgeChart);
      fetchChartData("gender", statTimeRange, null, updateGenderChart);
      fetchChartData("status", statTimeRange, null, updateStatusChart);
      fetchChartData("hometown", statTimeRange, null, updateHometownChart);
      fetchChartData("time", statTimeRange, null, updateTimeChart);

      fetchChartData("performance", performanceTimeRange, tags, updatePerformanceChart);
  }

  window.reRenderAllCharts = reRenderAllCharts;

  function lazyLoadChart(chartConfig) {
    const canvas = document.getElementById(`${chartConfig.id}Chart`);
    if (!canvas) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const timeRange = document.getElementById(chartConfig.selectId)?.value || "month";
          const tags = chartConfig.id === "performance" ? getSelectedTags() : null;
          fetchChartData(chartConfig.id, timeRange, tags, chartConfig.updateFn);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(canvas);
  }

  chartConfigs.forEach(({ id, selectId, updateFn }) => {
    const select = document.getElementById(selectId);
    if (select) {
      const debouncedFetch = debounce((value) => {
        const tags = id === "performance" ? getSelectedTags() : null;
        fetchChartData(id, value, tags, updateFn);
      }, 350);
      select.addEventListener("change", (e) => debouncedFetch(e.target.value));
    }
  });

  const tagSelect = document.getElementById("tagSelect");
  if (tagSelect) {
    const debouncedPerformanceUpdate = debounce(() => {
      const timeRange = document.getElementById("timeChartSelectPerformance")?.value || "month";
      fetchChartData("performance", timeRange, getSelectedTags(), updatePerformanceChart);
    }, 350);
    tagSelect.addEventListener("change", debouncedPerformanceUpdate);
  }

  function setupDownloadButton(buttonId, getChart, filenamePrefix) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => {
        const chartInstance = getChart();
        if (chartInstance) {
          downloadChart(chartInstance, buttonId.replace("download", "").toLowerCase(), filenamePrefix);
        } else {
          showTimedAlert(t("Error!"), t("Chart not ready or has no data."), "error", 1000);
        }
      });
    }
  }

  requestIdleCallback(() => {
    setupDownloadButton("downloadPerformanceChart", () => performanceChart, "performance_by_tag");
    setupDownloadButton("downloadHometownChart", () => hometownChart, "hometown_distribution");
    setupDownloadButton("downloadTimeChart", () => timeChart, "new_users_over_time");

    const downloadDemographicsBtn = document.getElementById("downloadUserStatChart");
    const demographicsSelect = document.getElementById("downloadUserStatSelect");
    if (downloadDemographicsBtn && demographicsSelect) {
      downloadDemographicsBtn.addEventListener("click", () => {
        const selectedOption = demographicsSelect.options[demographicsSelect.selectedIndex];
        const selectedChartId = selectedOption.dataset.chartId;
        let chartToDownload, filename;
        switch (selectedChartId) {
          case "ageChart": chartToDownload = ageChart; filename = "age_distribution"; break;
          case "genderChart": chartToDownload = genderChart; filename = "gender_distribution"; break;
          case "statusChart": chartToDownload = statusChart; filename = "status_distribution"; break;
          default: showTimedAlert(t("Error"), t("Invalid chart selection."), "error", 1500); return;
        }
        if (chartToDownload) {
          downloadChart(chartToDownload, selectedChartId, filename);
        } else {
          showTimedAlert(t("Error!"), t("Chart not ready or has no data."), "error", 1000);
        }
      });
    }
  });

  function showTimedAlert(title, message, type, duration) {
    if (typeof Swal !== "undefined") {
      Swal.fire({ title: t(title), text: t(message), icon: type, timer: duration, showConfirmButton: false });
    } else {
      alert(`${t(title)}: ${t(message)}`);
    }
  }

  /* ---------- Lazy Load Charts ---------- */
  chartConfigs.forEach(lazyLoadChart);
}

/************************************************************
 *  Phần Cải Tiến - Logic Khởi Tạo Đồng Bộ
 ************************************************************/

let isDomReady = false;
let areTranslationsReady = false;
let chartsHaveBeenInitialized = false;

function tryInitializeAndRenderCharts() {
  if (isDomReady && areTranslationsReady && !chartsHaveBeenInitialized) {
    console.time("ChartsInitialized");
    console.log("✅ Conditions met (DOM + Translations ready) → Initializing charts...");
    chartsHaveBeenInitialized = true;
    initializeCharts(window.initialData || {});
    console.timeEnd("ChartsInitialized");
  } else {
    console.log("⏳ Waiting for all conditions to be met...", { isDomReady, areTranslationsReady, chartsHaveBeenInitialized });
  }
}

window.addEventListener("languageChanged", () => {
  areTranslationsReady = true;
  translationCache.clear();
  
  if (chartsHaveBeenInitialized) {
    console.log("Language changed by user → Re-rendering charts with new translations...");
    if (typeof window.reRenderAllCharts === "function") {
      window.reRenderAllCharts();
    }
  } else {
    tryInitializeAndRenderCharts();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.time("DOMReady");
  isDomReady = true;
  tryInitializeAndRenderCharts();
  console.timeEnd("DOMReady");
});

/************************************************************
 *  SignalR Real-time Integration
 ************************************************************/

(function () {
  if (typeof signalR === "undefined") {
    console.error("SignalR client library not found. Real-time updates will be disabled.");
    return;
  }

  function getUserRoleFromYourSystem() {
    const role = document.body.dataset.userRole;
    return role ? role.toLowerCase() : null;
  }

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7162/dashboardHub")
    .configureLogging(signalR.LogLevel.Error)
    .withAutomaticReconnect()
    .build();

  connection.on("ChartAnalytics", () => {
    console.log("[SignalR] Received 'ChartAnalytics' signal. Fetching new chart data...");
    if (typeof window.reRenderAllCharts === "function") {
      window.reRenderAllCharts();
    } else {
      console.error("Function 'reRenderAllCharts' is not available to update charts.");
    }
  });

  async function startSignalRConnection() {
    try {
      await connection.start();
      console.log("[SignalR] Connected successfully.");
      const userRole = getUserRoleFromYourSystem();
      if (userRole === "super-admin" || userRole === "admin") {
        console.log(`[SignalR] User role is '${userRole}'. Joining group.`);
        connection.invoke("JoinAdminGroup", userRole).catch((err) => {
          console.error("[SignalR] Error joining group:", err.toString());
        });
      } else {
        console.warn(`[SignalR] User role is '${userRole || "not defined"}'. Not joining admin groups.`);
      }
    } catch (err) {
      console.error("[SignalR] Connection failed: ", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    requestIdleCallback(startSignalRConnection);
  });
})();