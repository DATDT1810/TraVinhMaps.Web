// =========================================================================
// Dashboard Charts Scripts (Optimized for Light/Dark Mode and Translation)
// =========================================================================

// Global chart variables
let ageChart, genderChart, statusChart, hometownChart, timeChart, performanceChart;

// Theme-based color configuration
const THEME_COLORS = {
  light: {
    blue: '#4B8EF5',
    orange: '#FF9500',
    red: '#FF3B30',
    teal: '#26A69A',
    green: '#34C759',
    datalabel: '#1A1A1A',
    canvasBackground: '#F5F5F5', // Xám nhạt để không quá chói
    grid: '#CCCCCC',
    tooltipBg: 'rgba(0,0,0,0.8)',
    tooltipText: '#FFFFFF',
  },
  dark: {
    blue: '#7AB8FF',
    orange: '#FFB733',
    red: '#FF6B66',
    teal: '#4DB6AC',
    green: '#66D17A',
    datalabel: '#E6E6E6', // Chữ sáng để nổi trên nền đen
    canvasBackground: '#1A1A1A', // Nền đen đậm cho dark mode
    grid: '#444444',
    tooltipBg: 'rgba(255,255,255,0.15)', // Tooltip mờ để phù hợp nền đen
    tooltipText: '#FFFFFF',
  }
};

// Category configuration with dynamic colors
const CATEGORY_CONFIG = [
  { key: "Destination", color: () => getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue) },
  { key: "Ocop", color: () => getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange) },
  { key: "Local specialty", color: () => getChartColor(THEME_COLORS.light.green, THEME_COLORS.dark.green) },
  { key: "Tips", color: () => getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red) },
  { key: "Festivals", color: () => getChartColor(THEME_COLORS.light.teal, THEME_COLORS.dark.teal) },
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

// Helper Functions
function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

function getChartColor(light, dark) {
  return isDarkMode() ? dark : light;
}

function t(key) {
  if (translationCache.has(key)) return translationCache.get(key);
  const translated = window.translationMapForCharts?.[key] || window.translations?.[key] || key;
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

function showTimedAlert(title, message, type, duration) {
  if (typeof Swal !== "undefined") {
    Swal.fire({ title: t(title), text: t(message), icon: type, timer: duration, showConfirmButton: false });
  } else {
    alert(`${t(title)}: ${t(message)}`);
  }
}

// Core Chart Functions
function downloadChart(chart, chartId, filenamePrefix) {
  if (!chart) {
    showTimedAlert(t("Error!"), t("No chart data available to download!"), "error", 1000);
    return;
  }
  const canvas = chart.canvas;
  const targetCanvas = document.createElement("canvas");
  targetCanvas.width = canvas.width;
  targetCanvas.height = canvas.height;
  const ctx = targetCanvas.getContext("2d");
  ctx.fillStyle = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
  ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  ctx.drawImage(canvas, 0, 0);
  const imageLink = document.createElement("a");
  imageLink.href = targetCanvas.toDataURL("image/png");
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
  canvas.style.backgroundColor = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
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

function fetchChartData(chartId, timeRange, tags, callback) {
  const cacheKey = `${chartId}_${timeRange}_${tags?.join(",") || ""}`;
  if (chartDataCache.has(cacheKey)) {
    console.log(`Using cached data for ${cacheKey}`);
    callback(chartDataCache.get(cacheKey));
    return;
  }
  const noDataElement = document.getElementById(`${chartId}Chart-no-data`);
  const timeRangeForApi = getApiTimeRange(timeRange);
  const apiBaseUrl = window.apiBaseUrl.replace(/\/$/, '');
  const performanceTagsQuery = tags ? tags.map(t => `tags=${encodeURIComponent(t)}`).join("&") : "";
  const apiUrl = chartId === "performance"
    ? `${apiBaseUrl}/api/Users/performance-tags?timeRange=${timeRangeForApi}&${performanceTagsQuery}`
    :  `${apiBaseUrl}/api/Users/stats?groupBy=${chartId}&timeRange=${timeRangeForApi}`;
  fetch(apiUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((result) => {
      const data = chartId === "performance" ? (result.data || {}) : (result.data?.[chartId] || {});
      chartDataCache.set(cacheKey, data);
      callback(data);
    })
    .catch((error) => {
      console.error(`Failed to fetch stats for ${chartId}:`, error);
      if (noDataElement) noDataElement.style.display = "block";
      callback({});
    });
}

// Chart Update Functions
function updateAgeChart(data) {
  const canvas = document.getElementById('ageChart');
  const noDataElement = document.getElementById('ageChart-no-data');
  const hasData = data && Object.values(data).some(value => value > 0);
  if (canvas) canvas.style.display = 'block';
  if (noDataElement) noDataElement.style.display = hasData ? 'none' : 'block';
  const defaultLabels = ["0-18", "18-30", "30-50", "50+"];
  const chartValues = defaultLabels.map((label) => data?.[label] || 0);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: "Age Groups", color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        ticks: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Users", color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        ticks: { precision: 0, maxTicksLimit: 11, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
        titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
        bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
      },
      datalabels: {
        display: hasData,
        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
        font: { weight: "bold", size: 12 },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
          const percentage = total > 0 ? (value / total) * 100 : 0;
          return percentage > 0 ? `${percentage.toFixed(1)}%` : '';
        },
        anchor: "center",
        align: "center",
      },
    },
  };
  ageChart = initializeChart("ageChart", "bar", {
    labels: defaultLabels,
    datasets: [{
      label: "Number of Users",
      data: chartValues,
      backgroundColor: [getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue), getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange), getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red), getChartColor(THEME_COLORS.light.teal, THEME_COLORS.dark.teal)],
      borderColor: [getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue), getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange), getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red), getChartColor(THEME_COLORS.light.teal, THEME_COLORS.dark.teal)],
      borderWidth: 1,
    }],
  }, chartOptions);
}

function updatePieChart(chartInstance, chartId, data, options) {
  const canvas = document.getElementById(chartId);
  const noDataElement = document.getElementById(`${chartId}-no-data`);
  const hasData = data && Object.keys(data).length > 0 && Object.values(data).some(v => v > 0);
  if (canvas) canvas.style.display = 'block';
  if (noDataElement) noDataElement.style.display = hasData ? 'none' : 'block';
  let finalData, finalOptions;
  if (hasData) {
    finalData = options.getData(data);
    finalOptions = options.getOptions(true);
  } else {
    finalData = { labels: [], datasets: [{ data: [1], backgroundColor: ["#55555530"], borderWidth: 0 }] };
    finalOptions = options.getOptions(false);
  }
  return initializeChart(chartId, "pie", finalData, finalOptions);
}

function updateGenderChart(data) {
  genderChart = updatePieChart(genderChart, "genderChart", data, {
    getData: (d) => ({
      labels: Object.keys(d),
      datasets: [{
        label: "Gender",
        data: Object.values(d),
        backgroundColor: [getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue), getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red), getChartColor(THEME_COLORS.light.green, THEME_COLORS.dark.green)],
        borderColor: [getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue), getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red), getChartColor(THEME_COLORS.light.green, THEME_COLORS.dark.green)],
        borderWidth: 1,
      }],
    }),
    getOptions: (hasData) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: hasData,
          position: "top",
          labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        },
        tooltip: {
          enabled: hasData,
          backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
          titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
          bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
        },
        datalabels: {
          display: hasData,
          color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
          font: { weight: "bold", size: 12 },
          formatter: (value, context) => {
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
          },
        },
      },
    }),
  });
}

function updateStatusChart(data) {
  statusChart = updatePieChart(statusChart, "statusChart", data, {
    getData: (d) => ({
      labels: Object.keys(d),
      datasets: [{
        label: "Status",
        data: Object.values(d),
        backgroundColor: [getChartColor(THEME_COLORS.light.green, THEME_COLORS.dark.green), getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red), getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange)],
        borderColor: [getChartColor(THEME_COLORS.light.green, THEME_COLORS.dark.green), getChartColor(THEME_COLORS.light.red, THEME_COLORS.dark.red), getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange)],
        borderWidth: 1,
      }],
    }),
    getOptions: (hasData) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: hasData,
          position: "top",
          labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        },
        tooltip: {
          enabled: hasData,
          backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
          titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
          bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
        },
        datalabels: {
          display: hasData,
          color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
          font: { weight: "bold", size: 12 },
          formatter: (value, context) => {
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
          },
        },
      },
    }),
  });
}

function updatePerformanceChart(data) {
  const noDataElement = document.getElementById("performanceChart-no-data");
  const hasData = data && Object.keys(data).length > 0 && Object.values(data).some((d) => Object.keys(d).length > 0);
  if (noDataElement) noDataElement.style.display = hasData ? "none" : "block";
  const periods = hasData ? Object.keys(data[Object.keys(data)[0]] || {}) : [];
  const datasets = CATEGORY_CONFIG.map(({ key, color }) => ({
    label: key,
    data: periods.map((p) => data?.[key]?.[p] || 0),
    backgroundColor: color(),
    borderColor: Chart.helpers.color(color()).darken(0.2).rgbString(),
    borderWidth: 1,
  }));
  performanceChart = initializeChart("performanceChart", "bar", {
    labels: periods,
    datasets: datasets,
  }, {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
        title: { display: true, text: "Day of Week", color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        ticks: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: { display: true, text: "Number of Interactions", color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        ticks: { precision: 0, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
    },
    plugins: {
      legend: { position: "top", labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) } },
      title: { display: true, text: "Performance by Tag", color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
      tooltip: {
        backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
        titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
        bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
        callbacks: { label: (ctx) => `${t(ctx.dataset.label)}: ${ctx.raw}` },
      },
      datalabels: {
        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
        anchor: "center",
        align: "center",
        font: { weight: "bold" },
        formatter: (value) => (value > 0 ? value : null),
      },
    },
  });
}

function updateHometownChart(data) {
  const chartContainer = document.getElementById("hometownChart-container");
  const noDataElement = document.getElementById("hometownChart-no-data");
  const hasData = data && Object.keys(data).length > 0;
  if (!chartContainer) {
    console.error("Hometown chart container not found!");
    return;
  }
  chartContainer.style.display = "block";
  if (noDataElement) noDataElement.style.display = hasData ? "none" : "block";
  let chartLabels, chartDatasets;
  let maxValue = 0;
  if (hasData) {
    const chartData = data || {};
    let dataArray = Object.entries(chartData).sort((a, b) => b[1] - a[1]);
    maxValue = dataArray.length > 0 ? dataArray[0][1] : 0;
    const baseColor = getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue);
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
        title: { display: true, text: t("Number of Users"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        beginAtZero: true,
        ticks: { precision: 0, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
      y: {
        ticks: { autoSkip: false, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { display: false, color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasData,
        backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
        titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
        bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
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
        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
        font: { weight: 'bold' },
        formatter: (value) => {
          if (maxValue > 0 && value < maxValue * 0.1) return null;
          return value;
        },
        clamp: true,
      },
    },
    layout: { padding: { right: 20 } },
  };
  hometownChart = initializeChart("hometownChart", "bar", {
    labels: chartLabels,
    datasets: chartDatasets,
  }, chartOptions);
}

function updateTimeChart(data) {
  const noDataElement = document.getElementById("timeChart-no-data");
  const hasData = data && Object.keys(data).length > 0;
  if (noDataElement) noDataElement.style.display = hasData ? "none" : "block";
  const chartData = hasData ? data : {};
  const labels = hasData ? Object.keys(chartData) : [];
  const currentTimeRangeValue = document.getElementById("timeChartSelect")?.value || "tháng";
  const apiTimeRange = getApiTimeRange(currentTimeRangeValue);
  const translatedMonthsShort = [
    t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"), t("Jun"),
    t("Jul"), t("Aug"), t("Sep"), t("Oct"), t("Nov"), t("Dec"),
  ];
  timeChart = initializeChart("timeChart", "line", {
    labels: labels.map((label) => {
      switch (apiTimeRange) {
        case "week": return `${t("Week")} ${label.split("-W")[1]}`;
        case "year":
          const date = new Date(label + "-01");
          if (!isNaN(date)) {
            return `${translatedMonthsShort[date.getMonth()]} ${date.getFullYear()}`;
          }
          return label;
        case "day": return label;
        default: return label;
      }
    }),
    datasets: [{
      label: t("Number of Users"),
      data: Object.values(chartData),
      backgroundColor: getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue),
      borderColor: Chart.helpers.color(getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue)).darken(0.2).rgbString(),
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
        title: { display: true, text: t("Number of Users"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        ticks: { precision: 0, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
      x: {
        title: { display: true, text: t(currentTimeRangeValue.charAt(0).toUpperCase() + currentTimeRangeValue.slice(1)), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        ticks: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
        grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
      },
    },
    plugins: {
      datalabels: {
        display: hasData,
        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
        font: { weight: "bold", size: 10 },
        formatter: (value) => (value > 0 ? value : ""),
        align: "center",
        anchor: "center",
      },
      tooltip: {
        backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
        titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
        bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
      },
    },
  });
}

// Initialize and Bind Events
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

  chartConfigs.forEach(lazyLoadChart);
}

// Initialization Logic
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
    window.reRenderAllCharts();
  } else {
    tryInitializeAndRenderCharts();
  }
});

window.addEventListener("themeChanged", () => {
  console.log("Theme changed → Re-rendering charts with new colors...");
  window.reRenderAllCharts();
});

document.addEventListener("DOMContentLoaded", () => {
  console.time("DOMReady");
  isDomReady = true;
  tryInitializeAndRenderCharts();
  console.timeEnd("DOMReady");
});

// SignalR Real-time Integration
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
    .withUrl(window.apiBaseUrl + "dashboardHub")
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