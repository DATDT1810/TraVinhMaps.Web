/************************************************************
 *  Dashboard Charts Scripts
 ************************************************************/

// Global chart variables
let ageChart,
  genderChart,
  statusChart,
  hometownChart,
  timeChart,
  performanceChart;

// Fixed category configuration & colors (Original)
const CATEGORY_CONFIG = [
  { key: "Destination", color: "#4E79A7" }, // Blue
  { key: "Ocop", color: "#F28E2B" }, // Orange
  { key: "Local specialty", color: "#59A14F" }, // Green
  { key: "Tips", color: "#E15759" }, // Red
  { key: "Festivals", color: "#76B7B2" }, // Teal
];

// Time range mapping for Vietnamese to English (Original)
const timeRangeMap = {
  ngày: "day",
  tuần: "week",
  tháng: "month",
  năm: "year",
  all: "all",
};

// --- Helper Functions (Translation, etc.) ---
function t(key) {
  return (
    window.translations?.[key] || window.translationMapForCharts?.[key] || key
  );
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
    translated.plugins.legend.title.text = t(
      translated.plugins.legend.title.text
    );
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

// BƯỚC 1: Xóa hàm reRenderAllCharts ở đây

function initializeCharts(initialData = {}) {
  if (typeof Chart === "undefined" || typeof ChartDataLabels === "undefined") {
    console.error("Chart.js or plugins not loaded.");
    return;
  }
  Chart.register(ChartDataLabels);

  // CHANGE: Thêm hàm debounce để tối ưu hóa việc gọi API
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

  // --- Core Functions (Download, Initialize, Fetch - Kept as original) ---
  function downloadChart(chart, chartId, filenamePrefix) {
    if (!chart) {
      showTimedAlert(
        t("Error!"),
        t("No chart data available to download!"),
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
      csvContent +=
        [`"${t("Day")}"`, ...datasets.map((ds) => `"${t(ds.label)}"`)].join(
          ","
        ) + "\n";
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
    if (chart) chart.destroy();
    return new Chart(canvas, {
      type: chartType,
      data: translateChartData(data),
      options: translateChartOptions(options),
      plugins: {
        ...translateChartOptions(options).plugins,
        originalLabels: data.labels, // Lưu lại label gốc
      },
    });
  }
  function getSelectedTags() {
    const select = document.getElementById("tagSelect");
    if (!select) return CATEGORY_CONFIG.map((c) => c.key);

    const selectedValues = Array.from(select.selectedOptions).map((opt) =>
      tReverse(opt.value)
    );
    return selectedValues.length
      ? selectedValues
      : CATEGORY_CONFIG.map((c) => c.key);
  }

  function fetchChartData(chartId, timeRange, tagName, callback) {
    const noDataElement = document.getElementById(`${chartId}-no-data`);
    const timeRangeForApi = getApiTimeRange(timeRange);
    const apiUrl =
      chartId === "performance"
        ? "https://localhost:7162/api/Users/performance-tags"
        : "https://localhost:7162/api/Users/stats";
    let url = apiUrl;
    if (chartId === "performance") {
      const params = new URLSearchParams({ timeRange: timeRangeForApi });
      getSelectedTags().forEach((tag) => params.append("tags", tag));
      url += `?${params.toString()}`;
    } else {
      url += `?groupBy=${chartId}&timeRange=${timeRangeForApi}`;
    }
    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        let data;
        if (chartId === "performance") {
          data = result.data || {};
        } else if (
          result.status === "success" &&
          result.data &&
          result.data[chartId]
        ) {
          data = result.data[chartId];
        } else {
          data = {};
        }
        callback(data);
      })
      .catch((error) => {
        console.error(`Failed to fetch stats for ${chartId}:`, error);
        if (noDataElement) noDataElement.style.display = "block";
        callback({});
      });
  }

  /* ---------- Age Chart (Bar) ---------- */
  function updateAgeChart(data) {
    if (ageChart) ageChart.destroy();

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
            backgroundColor: [
              "#007bff",
              "#28a745",
              "#dc3545",
              "#ffc107",
              "#17a2b8",
              "#6f42c1",
              "#fd7e14",
            ],
            borderColor: [
              "#0056b3",
              "#218838",
              "#c82333",
              "#e0a800",
              "#138496",
              "#5a32a3",
              "#e06c00",
            ],
            borderWidth: 1,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Age Groups" } },
          y: { beginAtZero: true, ticks: { maxTicksLimit: 11 } },
        },
        plugins: {
          legend: { display: false },
          datalabels: {
            color: "#FFFFFF",
            font: { weight: "bold", size: 12 },
            formatter: (value, context) => {
              const total = context.chart.data.datasets[0].data.reduce(
                (acc, val) => acc + val,
                0
              );
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
    if (chartInstance) chartInstance.destroy();

    const noDataElement = document.getElementById(`${chartId}-no-data`);
    const hasData = data && Object.keys(data).length > 0;

    noDataElement.style.display = hasData ? "none" : "block";

    let finalData, finalOptions;
    if (hasData) {
      finalData = options.getData(data);
      finalOptions = options.getOptions(true);
    } else {
      finalData = {
        labels: [""],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#55555530"],
            borderColor: "#55555550",
            borderWidth: 1,
          },
        ],
      };
      finalOptions = options.getOptions(false);
    }

    return initializeChart(chartId, "pie", finalData, finalOptions);
  }

  function updateGenderChart(data) {
    genderChart = updatePieChart(genderChart, "genderChart", data, {
      getData: (d) => ({
        labels: Object.keys(d),
        datasets: [
          {
            label: "Gender",
            data: Object.values(d),
            backgroundColor: ["#173878", "#DC3545", "#51BB25"].slice(
              0,
              Object.keys(d).length
            ),
            borderColor: ["#0F244F", "#A71D2A", "#3A8F1D"].slice(
              0,
              Object.keys(d).length
            ),
            borderWidth: 1,
          },
        ],
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
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
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
        datasets: [
          {
            label: "Status",
            data: Object.values(d),
            backgroundColor: ["#51BB25", "#DC3545", "#F8D62B"],
            borderColor: ["#3A8F1D", "#A71D2A", "#D4B800"],
            borderWidth: 1,
          },
        ],
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
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
            },
          },
        },
      }),
    });
  }

  /* ---------- Performance Chart (Bar) ---------- */
  function updatePerformanceChart(data) {
    if (performanceChart) performanceChart.destroy();

    const noDataElement = document.getElementById("performanceChart-no-data");
    const hasData =
      data &&
      Object.keys(data).length > 0 &&
      Object.values(data).some((d) => Object.keys(d).length > 0);
    noDataElement.style.display = hasData ? "none" : "block";

    const periods = hasData
      ? Object.keys(data[Object.keys(data)[0]] || {})
      : [];

    const datasets = CATEGORY_CONFIG.map(({ key, color }) => ({
      label: key,
      data: periods.map((p) => data?.[key]?.[p] || 0),
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
          y: {
            stacked: false,
            beginAtZero: true,
            title: { display: true, text: "Number of Interactions" },
          },
        },
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Performance by Tag" },
          tooltip: {
            callbacks: {
              label: (ctx) => `${t(ctx.dataset.label)}: ${ctx.raw}`,
            },
          },
          datalabels: {
            color: "#36454F",
            anchor: "center",
            align: "center",
            font: { weight: "bold" },
            formatter: (value) => (value > 0 ? value : null),
          },
        },
      }
    );
  }

  /* ---------- Hometown & Time Charts ---------- */
  /**
 * Updates the hometown distribution chart with new data.
 * Ensures that bars have appropriate sizes, data labels are displayed inside the bars in white,
 * and Y-axis labels (province/city names) are aligned and clearly spaced.
 * @param {object} data Data to display on the chart, with keys as hometown names and values as user counts.
 */
function updateHometownChart(data) {
    // If the chart already exists, destroy it before creating a new one
    if (hometownChart) hometownChart.destroy();

    const noDataElement = document.getElementById("hometownChart-no-data");
    const hasData = data && Object.keys(data).length > 0;
    
    // Display or hide the "no data" message
    noDataElement.style.display = hasData ? "none" : "block";
    const chartData = hasData ? data : {};

    // Convert data to an array of [key, value] pairs and sort in descending order by value
    let dataArray = Object.entries(chartData).sort((a, b) => b[1] - a[1]);

    // Define the base color and create a color gradient for the bars
    const baseColor = "#173878"; // Dark blue color
    const colors = dataArray.map((_, i) => {
        // Use Chart.helpers.color to adjust the transparency (alpha) for each bar.
        // The alpha value is calculated to ensure a minimum transparency,
        // preventing bars from becoming too faint, especially for smaller data points.
        const alpha = Math.max(0.6, 1 - i * 0.015); // Adjusted alpha decay rate and added minimum alpha of 0.6
        return Chart.helpers.color(baseColor).alpha(alpha).rgbString();
    });
    // Create hover colors (lighter than the base color)
    const hoverColors = colors.map((c) => lightenColor(c, 20));

    // Calculate dynamic height for the chart based on the number of data entries.
    // Each bar is assumed to have a minimum height of 30px to ensure enough space for labels.
    const minBarHeight = 40; 
    // The overall chart height will be a minimum of 300px or enough to contain all bars.
    const desiredChartHeight = Math.max(300, dataArray.length * minBarHeight); 
    
    // Set the height for the canvas element containing the chart.
    // Ensure your HTML canvas element has the id 'hometownChart'.
    const chartCanvas = document.getElementById("hometownChart");
    if (chartCanvas) {
        chartCanvas.style.height = `${desiredChartHeight}px`;
    }

    // Initialize a new chart
    hometownChart = initializeChart(
        "hometownChart", // ID of the canvas element
        "bar",           // Chart type: horizontal bar
        {
            // Labels for the Y-axis (hometown names)
            labels: dataArray.map((item) => item[0]),
            datasets: [
                {
                    label: "Number of Users", // Dataset label
                    data: dataArray.map((item) => item[1]), // User count data
                    backgroundColor: colors,        // Background color of the bars
                    hoverBackgroundColor: hoverColors, // Background color on hover
                    borderColor: baseColor,         // Border color of the bars
                    borderWidth: 1,                 // Border width
                },
            ],
        },
        {
            indexAxis: "y", // Set Y-axis as the index axis (creates a horizontal bar chart)
            responsive: true, // Chart will automatically adjust its size to the container
            maintainAspectRatio: false, // Do not maintain aspect ratio, allows dynamic height
            hover: {
                mode: "nearest", // Hover mode: nearest
                axis: "y",       // Only activate hover on the Y-axis
                intersect: true, // Activate hover when the cursor intersects with the bar
            },
            plugins: {
                legend: { display: false }, // Hide the legend
                tooltip: {
                    enabled: true, // Enable tooltips on hover
                    callbacks: {
                        label: function (context) {
                            // Format tooltip content: "Name: Number of users (Percentage%)"
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            return `${context.label}: ${context.raw} users (${(
                                (context.raw / total) *
                                100
                            ).toFixed(2)}%)`;
                        },
                    },
                },
                datalabels: {
                    anchor: "end", // Label anchor position: end of the bar
                    align: "start", // Label alignment: start from the end of the bar (right side) to be inside the bar
                    color: "#FFFFFF", // Data label text color: White
                    font: { weight: "bold", size: 9 }, // Font size and weight
                    formatter: (value) => {
                        // Format data label displayed on the bar: "Count (Percentage%)"
                        const total = dataArray.reduce((sum, item) => sum + item[1], 0);
                        return total > 0
                            ? `${value} (${((value / total) * 100).toFixed(2)}%)`
                            : "";
                    },
                    // Adjust padding so data labels are not too close to the bar edge
                    padding: {
                        left: 5,
                        right: 5
                    },
                    clamp: true, // Clamp labels within the chart area
                    clip: true,  // Clip labels if they extend beyond the chart area
                },
            },
            elements: {
                bar: {
                    // barThickness: 48, // Can be adjusted or uncommented if fixed bar thickness control is desired
                    // maxBarThickness: 40 // Or limit the maximum bar thickness
                },
            },
            scales: {
                x: {
                    title: { display: true, text: "Number of Users" }, // X-axis title
                    beginAtZero: true, // Start X-axis from 0
                    grid: { display: true }, // Display X-axis grid
                    ticks: {
                        color: '#666' // Text color for X-axis labels
                    }
                },
                y: {
                    ticks: {
                        autoSkip: false, 
                        maxRotation: 0,  
                        minRotation: 0,  
                        color: '#666',   
                        padding: 15,     
                    },
                    grid: {
                        display: false 
                    }
                }
            },
            layout: {
                padding: {
                    right: 20 
                }
            }
        }
    );
}

/**
 * Helper function to lighten a color.
 * @param {string} color Original color (rgb or hex).
 * @param {number} percent Percentage to lighten (0-100).
 * @returns {string} Lightened color in rgb format.
 */
function lightenColor(color, percent) {
    let r, g, b;

    // Extract RGB values from rgb(...) or rgba(...) format
    if (color.startsWith("rgb")) {
        const rgba = color.match(/\d+/g).map(Number);
        [r, g, b] = rgba;
    } else if (color.startsWith("#")) {
        // Extract RGB values from hex format
        const num = parseInt(color.slice(1), 16);
        r = (num >> 16) & 255;
        g = (num >> 8) & 255;
        b = num & 255;
    }

    // Increase RGB values to lighten the color, capping at 255
    r = Math.min(255, r + Math.round(2.55 * percent));
    g = Math.min(255, g + Math.round(2.55 * percent));
    b = Math.min(255, b + Math.round(2.55 * percent));

    return `rgb(${r}, ${g}, ${b})`;
}

  // /* ---------- Time Chart (Line) ---------- */
  function lightenColor(color, percent) {
    let r, g, b;

    // Tách từ rgb(...) hoặc rgba(...)
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

  // CHANGE: Sửa lại hàm updateTimeChart để dịch thuật chính xác
  function updateTimeChart(data) {
    if (timeChart) timeChart.destroy();
    const noDataElement = document.getElementById("timeChart-no-data");
    const hasData = data && Object.keys(data).length > 0;
    noDataElement.style.display = hasData ? "none" : "block";

    const chartData = hasData ? data : {};
    const labels = hasData ? Object.keys(chartData) : [];
    const timeRange = document.getElementById("timeChartSelect")?.value || "tháng";

    // Mảng các tháng đã được dịch để sử dụng cho chế độ xem 'năm'
    const translatedMonthsShort = [
      t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"), t("Jun"),
      t("Jul"), t("Aug"), t("Sep"), t("Oct"), t("Nov"), t("Dec")
    ];

    timeChart = initializeChart(
      "timeChart",
      "line",
      {
        labels: labels.map((label) => {
          switch (timeRange) {
            case "tuần":
              return `${t("Week")} ${label.split("-W")[1]}`;
            case "năm":
              const date = new Date(label + "-01");
              return `${translatedMonthsShort[date.getMonth()]} ${date.getFullYear()}`;
            case "ngày":
              return label; // Giả sử API trả về định dạng ngày đã phù hợp
            default:
              return label; // 'tháng' và các trường hợp khác
          }
        }),
        datasets: [
          {
            label: "Number of Users", // Sẽ được dịch bởi `translateChartData`
            data: Object.values(chartData),
            backgroundColor: "#007bff",
            borderColor: "#0056b3",
            borderWidth: 2,
            fill: false,
            pointRadius: 8,
            pointHoverRadius: 6,
            tension: 0.4,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Number of Users" }, // Sẽ được dịch bởi `translateChartOptions`
          },
          x: {
            title: {
              display: true,
              // Truyền key dịch thuật, ví dụ: "Tháng", "Năm"...
              text: t(timeRange.charAt(0).toUpperCase() + timeRange.slice(1))
            },
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
      }
    );
  }


  /* ---------- Initialize and Bind Events ---------- */

  //  --- Re-render all charts function ---
  function reRenderAllCharts() {
    const statTimeRange =
      document.getElementById("ageChartSelect")?.value || "month";
    const performanceTimeRange =
      document.getElementById("timeChartSelectPerformance")?.value || "month";

    fetchChartData("age", statTimeRange, null, updateAgeChart);
    fetchChartData("gender", statTimeRange, null, updateGenderChart);
    fetchChartData("status", statTimeRange, null, updateStatusChart);
    fetchChartData("hometown", statTimeRange, null, updateHometownChart);
    fetchChartData("time", statTimeRange, null, updateTimeChart);
    fetchChartData(
      "performance",
      performanceTimeRange,
      getSelectedTags(),
      updatePerformanceChart
    );
  }

  // --- Expose reRenderAllCharts globally ---
  // This allows the function to be called from outside this script, e.g., on language
  window.reRenderAllCharts = reRenderAllCharts;

  // --- Initial Data Fetch ---
  reRenderAllCharts();

  // --- Bind Select Change Events for Each Chart ---
  const chartConfigs = [
    { id: "age", updateFn: updateAgeChart, selectId: "ageChartSelect" },
    { id: "gender", updateFn: updateGenderChart, selectId: "genderChartSelect" },
    { id: "status", updateFn: updateStatusChart, selectId: "statusChartSelect" },
    { id: "hometown", updateFn: updateHometownChart, selectId: "hometownChartSelect" },
    { id: "time", updateFn: updateTimeChart, selectId: "timeChartSelect" },
    { id: "performance", updateFn: updatePerformanceChart, selectId: "timeChartSelectPerformance" },
  ];

  // CHANGE: Áp dụng debounce cho các sự kiện 'change'
  chartConfigs.forEach(({ id, updateFn, selectId }) => {
    const select = document.getElementById(selectId);
    if (select) {
      const debouncedFetch = debounce((value) => {
        const tagName = id === "performance" ? getSelectedTags() : null;
        fetchChartData(id, value, tagName, updateFn);
      }, 350); // Delay 350ms

      select.addEventListener("change", (e) => {
        debouncedFetch(e.target.value);
      });
    }
  });

  const tagSelect = document.getElementById("tagSelect");
  if (tagSelect) {
    const debouncedPerformanceUpdate = debounce(() => {
        const timeRange = document.getElementById("timeChartSelectPerformance")?.value || "month";
        fetchChartData("performance", timeRange, getSelectedTags(), updatePerformanceChart);
    }, 350); // Delay 350ms

    tagSelect.addEventListener("change", debouncedPerformanceUpdate);
  }


  const downloadDemographicsBtn = document.getElementById(
    "downloadUserStatChart"
  );
  const demographicsSelect = document.getElementById("downloadUserStatSelect");
  if (downloadDemographicsBtn && demographicsSelect) {
    downloadDemographicsBtn.addEventListener("click", () => {
      const selectedOption =
        demographicsSelect.options[demographicsSelect.selectedIndex];
      const selectedChartId = selectedOption.dataset.chartId; // fetch the chart ID from data attribute
      let chartToDownload;
      let filename;
      switch (selectedChartId) {
        case "ageChart":
          chartToDownload = ageChart;
          filename = "age_distribution";
          break;
        case "genderChart":
          chartToDownload = genderChart;
          filename = "gender_distribution";
          break;
        case "statusChart":
          chartToDownload = statusChart;
          filename = "status_distribution";
          break;
        default:
          showTimedAlert(
            t("Error"),
            t("Invalid chart selection."),
            "error",
            1500
          );
          return;
      }
      if (chartToDownload) {
        downloadChart(chartToDownload, selectedChartId, filename);
      } else {
        showTimedAlert(
          t("Error!"),
          t("Chart not ready or has no data."),
          "error",
          1000
        );
      }
    });
  }
  function setupDownloadButton(buttonId, getChart, filenamePrefix) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => {
        const chartInstance = getChart();
        if (chartInstance) {
          downloadChart(
            chartInstance,
            buttonId.replace("download", "").toLowerCase(),
            filenamePrefix
          );
        } else {
          showTimedAlert(
            t("Error!"),
            t("Chart not ready or has no data."),
            "error",
            1000
          );
        }
      });
    }
  }

  setupDownloadButton(
    "downloadPerformanceChart",
    () => performanceChart,
    "performance_by_tag"
  );
  setupDownloadButton(
    "downloadHometownChart",
    () => hometownChart,
    "hometown_distribution"
  );
  setupDownloadButton(
    "downloadTimeChart",
    () => timeChart,
    "new_users_over_time"
  );
}
// --- End of Core Functions ---
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

let isFirstRenderDone = false;

window.addEventListener("languageChanged", () => {
  if (typeof window.reRenderAllCharts === "function" && isFirstRenderDone) {
    console.log("Language changed → re-rendering charts...");
    window.reRenderAllCharts();
  }
});

function isFilterReady() {
  return document.getElementById("ageChartSelect") &&
         document.getElementById("genderChartSelect") &&
         document.getElementById("statusChartSelect") &&
         document.getElementById("hometownChartSelect") &&
         document.getElementById("timeChartSelectPerformance") &&
         document.getElementById("downloadUserStatSelect") &&
         document.getElementById("tagSelect");
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCharts(window.initialData || {});

  setTimeout(() => {
    if (isFilterReady() && typeof window.reRenderAllCharts === "function") {
      console.log("Initial render → rendering all charts...");
      window.reRenderAllCharts();
      isFirstRenderDone = true;
    } else {
      console.warn("Chart filters not ready, skipping initial render.");
    }
  }, 500);
});
