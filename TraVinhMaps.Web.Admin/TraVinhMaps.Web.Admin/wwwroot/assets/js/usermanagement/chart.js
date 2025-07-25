/************************************************************
 *  Dashboard Charts Scripts (Optimized)
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
    const originalLabels = chart.options?.plugins?.originalLabels || labels;
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
      plugins: { originalLabels: data.labels },
    });
  }

  function getSelectedTags() {
    const select = document.getElementById("tagSelect");
    if (!select) return CATEGORY_CONFIG.map((c) => c.key);
    const selectedValues = Array.from(select.selectedOptions).map((opt) => tReverse(opt.value));
    return selectedValues.length ? selectedValues : CATEGORY_CONFIG.map((c) => c.key);
  }

  function fetchChartData(chartId, timeRange, tagName, callback) {
    const cacheKey = `${chartId}_${timeRange}_${tagName?.join(",") || ""}`;
    if (chartDataCache.has(cacheKey)) {
      console.log(`Using cached data for ${cacheKey}`);
      callback(chartDataCache.get(cacheKey));
      return;
    }
    const noDataElement = document.getElementById(`${chartId}-no-data`);
    const timeRangeForApi = getApiTimeRange(timeRange);
    const apiUrl = chartId === "performance"
      ? `https://localhost:7162/api/Users/performance-tags?timeRange=${timeRangeForApi}&${tagName ? tagName.map(t => `tags=${t}`).join("&") : ""}`
      : `https://localhost:7162/api/Users/stats?groupBy=${chartId}&timeRange=${timeRangeForApi}`;
    fetch(apiUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        let data = chartId === "performance" ? (result.data || {}) : (result.data?.[chartId] || {});
        chartDataCache.set(cacheKey, data);
        callback(data);
        if (noDataElement) noDataElement.style.display = Object.keys(data).length ? "none" : "block";
      })
      .catch((error) => {
        console.error(`Failed to fetch stats for ${chartId}:`, error);
        if (noDataElement) noDataElement.style.display = "block";
        callback({});
      });
  }

  function fetchAllChartData(statTimeRange, performanceTimeRange, tags, callback) {
    const cacheKey = `all_${statTimeRange}_${performanceTimeRange}_${tags.join(",")}`;
    if (chartDataCache.has(cacheKey)) {
      console.log(`Using cached data for ${cacheKey}`);
      callback(chartDataCache.get(cacheKey));
      return;
    }
    const apiUrl = `https://localhost:7162/api/Users/all-stats?timeRange=${getApiTimeRange(statTimeRange)}&performanceTimeRange=${getApiTimeRange(performanceTimeRange)}&tags=${tags.join(",")}`;
    fetch(apiUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        const data = result.data || {};
        chartDataCache.set(cacheKey, data);
        callback(data);
      })
      .catch((error) => {
        console.error("Failed to fetch all chart data:", error);
        callback({});
      });
  }

  /* ---------- Age Chart (Bar) ---------- */
  function updateAgeChart(data) {
    const noDataElement = document.getElementById("ageChart-no-data");
    const defaultLabels = ["0-18", "18-30", "30-50", "50+"];
    const hasData = data && Object.keys(data).length > 0;
    noDataElement.style.display = hasData ? "none" : "block";
    const chartValues = defaultLabels.map((label) => data?.[label] || 0);
    ageChart = initializeChart(
      "ageChart",
      "bar",
      {
        labels: defaultLabels,
        datasets: [
          {
            label: "Number of Users",
            data: chartValues,
            backgroundColor: ["#007bff", "#28a745", "#dc3545", "#ffc107"],
            borderColor: ["#0056b3", "#218838", "#c82333", "#e0a800"],
            borderWidth: 1,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Age Groups" } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Number of Users" },
            ticks: { precision: 0, maxTicksLimit: 11 },
          },
        },
        plugins: {
          legend: { display: false },
          datalabels: {
            color: "#FFFFFF",
            font: { weight: "bold", size: 12 },
            formatter: (value, context) => {
              const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
              const percentage = total > 0 ? (value / total) * 100 : 0;
              return `${percentage.toFixed(1)}%`;
            },
            anchor: "center",
            align: "center",
          },
        },
      }
    );
  }

  /* ---------- Pie/Doughnut Chart (Gender, Status) ---------- */
  function updatePieChart(chartInstance, chartId, data, options) {
    const noDataElement = document.getElementById(`${chartId}-no-data`);
    const hasData = data && Object.keys(data).length > 0;
    noDataElement.style.display = hasData ? "none" : "block";
    let finalData, finalOptions;
    if (hasData) {
      finalData = options.getData(data);
      finalOptions = options.getOptions(true);
    } else {
      finalData = { labels: [""], datasets: [{ data: [1], backgroundColor: ["#55555530"], borderColor: "#55555550", borderWidth: 1 }] };
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
          backgroundColor: ["#173878", "#DC3545", "#51BB25"].slice(0, Object.keys(d).length),
          borderColor: ["#0F244F", "#A71D2A", "#3A8F1D"].slice(0, Object.keys(d).length),
          borderWidth: 1,
        }],
      }),
      getOptions: (hasData) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: hasData, position: "top" },
          tooltip: { enabled: hasData },
          datalabels: {
            display: hasData,
            color: "#fff",
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
          backgroundColor: ["#51BB25", "#DC3545", "#F8D62B"],
          borderColor: ["#3A8F1D", "#A71D2A", "#D4B800"],
          borderWidth: 1,
        }],
      }),
      getOptions: (hasData) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: hasData, position: "top" },
          tooltip: { enabled: hasData },
          datalabels: {
            display: hasData,
            color: "#fff",
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

  /* ---------- Performance Chart (Bar) ---------- */
  function updatePerformanceChart(data) {
    const noDataElement = document.getElementById("performanceChart-no-data");
    const hasData = data && Object.keys(data).length > 0 && Object.values(data).some((d) => Object.keys(d).length > 0);
    noDataElement.style.display = hasData ? "none" : "block";
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

  /* ---------- Hometown & Time Charts ---------- */
    /* ---------- Hometown Chart (Horizontal Bar) - OPTIMIZED ---------- */
  /* ---------- Hometown Chart (Horizontal Bar) - Tối ưu, không dùng helper function ---------- */
function updateHometownChart(data) {
  const chartContainer = document.getElementById("hometownChart-container");
  const noDataElement = document.getElementById("hometownChart-no-data");
  const hasData = data && Object.keys(data).length > 0;

  if (!chartContainer) {
    console.error("Hometown chart container not found!");
    return;
  }

  // Luôn hiển thị container của biểu đồ, chỉ ẩn/hiện thông báo "no-data"
  chartContainer.style.display = "block";
  noDataElement.style.display = hasData ? "none" : "block";

  // Khai báo các biến sẽ được sử dụng để xây dựng biểu đồ
  let chartLabels, chartDatasets;
  let maxValue = 0; // Giá trị lớn nhất, dùng cho logic của datalabels

  if (hasData) {
    // --- XỬ LÝ KHI CÓ DỮ LIỆU ---
    const chartData = data || {};
    let dataArray = Object.entries(chartData).sort((a, b) => b[1] - a[1]);
    maxValue = dataArray.length > 0 ? dataArray[0][1] : 0; // Lấy giá trị lớn nhất

    const baseColor = "#173878";
    const colors = dataArray.map((_, i) => {
      const alpha = Math.max(0.6, 1 - i * 0.015);
      return Chart.helpers.color(baseColor).alpha(alpha).rgbString();
    });

    // Điều chỉnh chiều cao động
    chartContainer.style.height = `${Math.max(300, dataArray.length * 25)}px`;

    // Chuẩn bị dữ liệu cho biểu đồ
    chartLabels = dataArray.map((item) => item[0]);
    chartDatasets = [{
      label: t("Number of Users"),
      data: dataArray.map((item) => item[1]),
      backgroundColor: colors,
      borderColor: baseColor,
      borderWidth: 1,
    }];

  } else {
    // --- XỬ LÝ KHI KHÔNG CÓ DỮ LIỆU ---
    // Đặt lại chiều cao mặc định
    chartContainer.style.height = '400px';

    // Chuẩn bị dữ liệu rỗng
    chartLabels = [];
    chartDatasets = [{ label: t("Number of Users"), data: [] }];
  }

  // --- XÂY DỰNG CẤU HÌNH (OPTIONS) ---
  // Cấu hình được định nghĩa ở đây để có thể sử dụng biến 'hasData' và 'maxValue'
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
      // Kích hoạt tooltip chỉ khi có dữ liệu
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
      // Kích hoạt và cấu hình datalabels tùy thuộc vào dữ liệu
      datalabels: {
        display: hasData, 
        anchor: 'center',
        align: 'center',
        color: '#FFFFFF',
        font: { weight: 'bold' },
        formatter: (value) => {
          // Ẩn nhãn nếu giá trị quá nhỏ để đọc
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

  // Khởi tạo hoặc cập nhật biểu đồ với cấu hình đã chuẩn bị
  hometownChart = initializeChart("hometownChart", "bar",
    {
      labels: chartLabels,
      datasets: chartDatasets,
    },
    chartOptions
  );
}

  function lightenColor(color, percent) {
    let r, g, b;
    if (color.startsWith("rgb")) {
      const rgba = color.match(/\d+/g).map(Number);
      [r, g, b] = rgba;
    } else if (color.startsWith("#")) {
      const num = parseInt(color.slice(1), 16);
      r = (num >> 16) & 255;
      g = (num >> 8) & 255;
      b = num & 255;
    }
    r = Math.min(255, r + Math.round(2.55 * percent));
    g = Math.min(255, g + Math.round(2.55 * percent));
    b = Math.min(255, b + Math.round(2.55 * percent));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function updateTimeChart(data) {
    const noDataElement = document.getElementById("timeChart-no-data");
    const hasData = data && Object.keys(data).length > 0;
    noDataElement.style.display = hasData ? "none" : "block";
    const chartData = hasData ? data : {};
    const labels = hasData ? Object.keys(chartData) : [];
    const timeRange = document.getElementById("timeChartSelect")?.value || "tháng";
    const translatedMonthsShort = [
      t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"), t("Jun"),
      t("Jul"), t("Aug"), t("Sep"), t("Oct"), t("Nov"), t("Dec"),
    ];
    timeChart = initializeChart("timeChart", "line", {
      labels: labels.map((label) => {
        switch (timeRange) {
          case "tuần": return `${t("Week")} ${label.split("-W")[1]}`;
          case "năm": const date = new Date(label + "-01"); return `${translatedMonthsShort[date.getMonth()]} ${date.getFullYear()}`;
          case "ngày": return label;
          default: return label;
        }
      }),
      datasets: [{
        label: "Number of Users",
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
          title: { display: true, text: "Number of Users" },
          ticks: { precision: 0 },
        },
        x: {
          title: { display: true, text: t(timeRange.charAt(0).toUpperCase() + timeRange.slice(1)) },
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
  function reRenderAllCharts() {
    const statTimeRange = document.getElementById("ageChartSelect")?.value || "month";
    const performanceTimeRange = document.getElementById("timeChartSelectPerformance")?.value || "month";
    const tags = getSelectedTags();
    fetchAllChartData(statTimeRange, performanceTimeRange, tags, (data) => {
      updateAgeChart(data.age || {});
      updateGenderChart(data.gender || {});
      updateStatusChart(data.status || {});
      updateHometownChart(data.hometown || {});
      updateTimeChart(data.time || {});
      updatePerformanceChart(data.performance || {});
      chartConfigs.forEach(({ id }) => {
        const noDataElement = document.getElementById(`${id}Chart-no-data`);
        if (noDataElement) noDataElement.style.display = Object.keys(data[id] || {}).length ? "none" : "block";
      });
    });
  }

  window.reRenderAllCharts = reRenderAllCharts;

  const chartConfigs = [
    { id: "age", updateFn: updateAgeChart, selectId: "ageChartSelect" },
    { id: "gender", updateFn: updateGenderChart, selectId: "genderChartSelect" },
    { id: "status", updateFn: updateStatusChart, selectId: "statusChartSelect" },
    { id: "hometown", updateFn: updateHometownChart, selectId: "hometownChartSelect" },
    { id: "time", updateFn: updateTimeChart, selectId: "timeChartSelect" },
    { id: "performance", updateFn: updatePerformanceChart, selectId: "timeChartSelectPerformance" },
  ];

  function lazyLoadChart(chartConfig) {
    const canvas = document.getElementById(`${chartConfig.id}Chart`);
    if (!canvas) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const timeRange = document.getElementById(chartConfig.selectId)?.value || "month";
          const tagName = chartConfig.id === "performance" ? getSelectedTags() : null;
          fetchChartData(chartConfig.id, timeRange, tagName, chartConfig.updateFn);
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
        const tagName = id === "performance" ? getSelectedTags() : null;
        fetchChartData(id, value, tagName, updateFn);
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