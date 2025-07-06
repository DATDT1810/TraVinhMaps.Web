/************************************************************
 *  Dashboard Charts Scripts – full code (with new additions)
 ************************************************************/
let ageChart,
  genderChart,
  statusChart,
  hometownChart,
  timeChart,
  performanceChart;

/* === NEW: danh sách category cố định & màu sắc ============= */
const CATEGORY_CONFIG = [
  { key: "Destination", color: "#4E79A7" }, // Blue
  { key: "Ocop", color: "#F28E2B" }, // Orange
  { key: "Local specialty", color: "#59A14F" }, // Green
  { key: "Tips", color: "#E15759" }, // Red
  { key: "Festivals", color: "#76B7B2" }, // Teal
];
/* =========================================================== */

function initializeCharts(initialData) {
  if (typeof Chart === "undefined") {
    console.error(
      "Chart.js failed to load. Check the script source or network."
    );
    showTimedAlert(
      "Error!",
      "Failed to load charting library. Please refresh the page.",
      "error",
      1000
    );
  }
  if (typeof ChartDataLabels === "undefined") {
    console.error(
      "ChartDataLabels plugin failed to load. Check the script source or network."
    );
    showTimedAlert(
      "Error!",
      "Failed to load chart plugins. Please refresh the page.",
      "error",
      1000
    );
  }

  // Register the datalabels plugin
  Chart.register(ChartDataLabels);

  /* ---------- helper khởi tạo chart ---------- */
  function initializeChart(chartId, chartType, data, options) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.error(`Canvas element for ${chartId} not found in DOM.`);
      return null;
    }
    let chart = Chart.getChart(chartId);
    if (chart) chart.destroy();
    return new Chart(canvas, {
      type: chartType,
      data: data,
      options: options,
    });
  }

  /* ---------- helper lấy tag đã chọn (fallback tất cả) ---------- */
  function getSelectedTags() {
    const select = document.getElementById("tagSelect");
    if (!select) return CATEGORY_CONFIG.map((c) => c.key); // không có thẻ select
    const selected = Array.from(select.selectedOptions).map((o) => o.value);
    return selected.length ? selected : CATEGORY_CONFIG.map((c) => c.key);
  }

  /* ---------- helper lấy dữ liệu ---------- */
  function fetchChartData(chartId, timeRange, tagName, callback) {
    const loadingElement = document.getElementById(`${chartId}-loading`);
    if (loadingElement) loadingElement.style.display = "block";

    // Use a relative URL to avoid hardcoding the host/port/protocol
    const apiUrl =
      chartId === "performance"
        ? "https://localhost:7162/api/Users/performance-tags"
        : "https://localhost:7162/api/Users/stats";

    let url = apiUrl;
    if (chartId === "performance") {
      const tagValues = getSelectedTags();

      const params = new URLSearchParams();
      tagValues.forEach((tag) => params.append("tags", tag));

      params.append("includeOcop", "true");
      params.append("includeDestination", "true");
      params.append("includeLocalSpecialty", "true");
      params.append("includeTips", "true");
      params.append("includeFestivals", "true");
      params.append("timeRange", timeRange);

      url += `?${params.toString()}`;
    } else {
      url += `?groupBy=${chartId}&timeRange=${timeRange}`;
    }

    console.log(`Fetching data from: ${url}`);

    fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status}, URL: ${url}`
          );
        }
        return response.json();
      })
      .then((result) => {
        console.log(`Raw response for ${chartId}:`, result);
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
          console.error(`Invalid response for ${chartId}:`, result);
          showTimedAlert(
            "Error!",
            `Failed to update ${chartId} chart: ${
              result.message || "Invalid response format"
            }`,
            "error",
            1000
          );
          return;
        }
        if (Object.keys(data).length === 0) {
          console.warn(
            `No data returned for ${chartId} with time range ${timeRange}`
          );
          callback({});
        } else {
          callback(data);
          console.log(`Successfully updated ${chartId} with new data:`, data);
        }
      })
      .catch((error) => {
        console.error(`Failed to fetch statistics for ${chartId}:`, error);
        showTimedAlert(
          "Error",
          `Failed to update ${chartId} chart: ${error.message}`,
          "error",
          1000
        );
      })
      .finally(() => {
        if (loadingElement) loadingElement.style.display = "none";
      });
  }

  /* ---------- Age Chart (Bar) ---------- */
  function updateAgeChart(data) {
    ageChart = initializeChart(
      "ageChart",
      "bar",
      {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Number of Users",
            data: Object.values(data),
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
        aspectRatio: 1,
        layout: { padding: { top: 30, bottom: 10 } },
        scales: { x: { title: { display: true, text: "Age Groups" } } },
        plugins: {
          datalabels: {
            color: "#51BB25",
            font: { weight: "bold", size: 12 },
            formatter: (value, context) => {
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              return total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "";
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
    const genderColors = ["#173878", "#DC3545", "#51BB25"];
    const genderBorders = ["#0F244F", "#A71D2A", "#3A8F1D"];
    genderChart = initializeChart(
      "genderChart",
      "pie",
      {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Gender",
            data: Object.values(data),
            backgroundColor: genderColors.slice(),
            borderColor: genderBorders,
            borderWidth: new Array(Object.values(data).length).fill(1),
          },
        ],
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
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              return total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "";
            },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const dataset = genderChart.data.datasets[0];
            dataset.backgroundColor = genderColors.map((color, i) =>
              i === index
                ? color
                : Chart.helpers.color(color).alpha(0.3).rgbString()
            );
            dataset.borderWidth = genderColors.map((_, i) =>
              i === index ? 2 : 1
            );
            genderChart.update();
          }
        },
        onHover: (event, elements) => {
          const chartArea = genderChart.chartArea;
          if (
            event.x >= chartArea.left &&
            event.x <= chartArea.right &&
            event.y >= chartArea.top &&
            event.y <= chartArea.bottom
          ) {
            if (elements.length > 0) {
              const index = elements[0].index;
              genderChart.data.datasets[0].backgroundColor = genderColors.map(
                (color, i) =>
                  i === index
                    ? color
                    : Chart.helpers.color(color).alpha(0.3).rgbString()
              );
              genderChart.update();
            } else {
              genderChart.data.datasets[0].backgroundColor =
                genderColors.slice();
              genderChart.update();
            }
          }
        },
      }
    );
  }

  /* ---------- Status Chart (Pie) ---------- */
  function updateStatusChart(data) {
    statusChart = initializeChart(
      "statusChart",
      "pie",
      {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Status",
            data: Object.values(data),
            backgroundColor: ["#51BB25", "#DC3545", "#F8D62B"],
            borderColor: ["#3A8F1D", "#A71D2A", "#D4B800"],
            borderWidth: 1,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: "#fff",
            font: { weight: "bold", size: 12 },
            formatter: (value, context) => {
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              return total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "";
            },
          },
        },
      }
    );
  }

  /* ---------- Hometown Chart (Horizontal Bar) ---------- */
  function updateHometownChart(data) {
    // Prepare data: sort by value in descending order
    let labels = Object.keys(data);
    let values = Object.values(data);
    const total = values.reduce((acc, val) => acc + val, 0);

    // Sort data by value in descending order
    let dataArray = labels.map((label, i) => ({ label, value: values[i] }));
    dataArray.sort((a, b) => b.value - a.value);
    labels = dataArray.map((item) => item.label);
    values = dataArray.map((item) => item.value);

    // Define a monochromatic color palette (shades of blue)
    const baseColor = "#173878";
    const colors = values.map((_, i) =>
      Chart.helpers
        .color(baseColor)
        .alpha(1 - i * 0.02)
        .rgbString()
    );

    hometownChart = initializeChart(
      "hometownChart",
      "bar",
      {
        labels: labels,
        datasets: [
          {
            label: "Number of Users",
            data: values,
            backgroundColor: colors,
            borderColor: baseColor,
            borderWidth: 1,
          },
        ],
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
                const value = context.raw;
                const percentage = ((value / total) * 100).toFixed(2) + "%";
                return `${context.label}: ${value} users (${percentage})`;
              },
            },
          },
          datalabels: {
            anchor: "end",
            align: "start",
            color: "#fff",
            font: { weight: "bold", size: 8 },
            formatter: (value) =>
              `${value} (${((value / total) * 100).toFixed(2)}%)`,
            clamp: true,
            clip: true,
          },
        },
        elements: {
          bar: { barThickness: 48 },
        },
        scales: {
          x: {
            title: { display: true, text: "Number of Users" },
            beginAtZero: true,
            grid: { display: true },
          },
        },
        onHover: (event, elements) => {
          if (elements.length > 0) {
            const dataset = hometownChart.data.datasets[0];
            dataset.backgroundColor = values.map((_, i) =>
              i === elements[0].index
                ? baseColor
                : Chart.helpers.color(baseColor).alpha(0.7).rgbString()
            );
            hometownChart.update();
          } else {
            hometownChart.data.datasets[0].backgroundColor = colors;
            hometownChart.update();
          }
        },
      }
    );

    // Add download functionality
    const downloadButton = document.getElementById("downloadHometownChart");
    if (downloadButton) {
      downloadButton.addEventListener("click", () => {
        // ====== PNG WITH WHITE BACKGROUND ======
        const canvas = hometownChart.canvas;
        const whiteCanvas = document.createElement("canvas");
        whiteCanvas.width = canvas.width;
        whiteCanvas.height = canvas.height;
        const ctx = whiteCanvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        const link = document.createElement("a");
        link.href = whiteCanvas.toDataURL("image/png");
        link.download = "hometown_chart.png";
        link.click();

        // ====== CSV EXPORT ======
        const csvContent =
          "\uFEFF" +
          [
            "Hometown,Number of Users,Percentage",
            ...labels.map((label, i) => {
              const percentage = ((values[i] / total) * 100).toFixed(2);
              return `"${label}",${values[i]},${percentage}%`;
            }),
          ].join("\n");
        const csvBlob = new Blob([csvContent], { type: "text/csv" });
        const csvLink = document.createElement("a");
        csvLink.href = URL.createObjectURL(csvBlob);
        csvLink.download = "hometown_data.csv";
        csvLink.click();
      });
    }
  }

  /* ---------- User over time (Line) ---------- */
  function updateTimeChart(data) {
    const labels = Object.keys(data).map((label) => {
      if (initialTimeRange === "week") {
        return `Week ${label.split("-W")[1]}`;
      } else if (initialTimeRange === "year") {
        return new Date(label + "-01").toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      } else if (initialTimeRange === "day") {
        return label.split(" ")[1];
      }
      return label;
    });

    timeChart = initializeChart(
      "timeChart",
      "line",
      {
        labels: labels,
        datasets: [
          {
            label: "Number of Users",
            data: Object.values(data),
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
            title: { display: true, text: "Number of Users" },
          },
          x: {
            title: {
              display: true,
              text:
                initialTimeRange.charAt(0).toUpperCase() +
                initialTimeRange.slice(1),
            },
          },
        },
        plugins: {
          datalabels: {
            display: true,
            color: "#ffffff",
            font: { weight: "bold", size: 10 },
            formatter: (value) => value,
            align: "center",
            anchor: "center",
          },
        },
      }
    );
  }

  /* ---------- NEW: Performance Chart (Stacked Bar) ---------- */
  function updatePerformanceChart(data) {
    const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const datasets = CATEGORY_CONFIG.map(({ key, color }) => ({
      label: key,
      data: allDays.map((day) => (data[key] && data[key][day]) || 0),
      backgroundColor: Chart.helpers.color(color).alpha(0.85).rgbString(),
      borderColor: color,
      borderWidth: 1,
    }));

    performanceChart = initializeChart(
      "performanceChart",
      "bar",
      { labels: allDays, datasets },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: false,
            title: { display: true, text: "Day of Week" },
            categoryPercentage: 1.0,
            barPercentage: 1.0,
          },
          y: {
            stacked: false,
            beginAtZero: false,
            suggestedMin: 0.1,
            suggestedMax: 0.2,
            title: { display: true, text: "Number of Interactions" },
            ticks: { stepSize: 0.1 },
          },
        },
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Performance by Tag" },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}`,
            },
          },
        },
      }
    );

    const downloadButton = document.getElementById("downloadPerformanceChart");
    if (downloadButton && !downloadButton.dataset.bound) {
      downloadButton.dataset.bound = "true"; // Đánh dấu đã gắn

      downloadButton.addEventListener("click", () => {
        // ===== PNG with white background =====
        const canvas = performanceChart.canvas;
        const whiteCanvas = document.createElement("canvas");
        whiteCanvas.width = canvas.width;
        whiteCanvas.height = canvas.height;
        const ctx = whiteCanvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        const link = document.createElement("a");
        link.href = whiteCanvas.toDataURL("image/png");
        link.download = "Performance_chart.png";
        link.click();

        // ===== CSV Export =====
        const chartData = performanceChart.data;
        const csvRows = [
          ["Day", ...chartData.datasets.map((ds) => ds.label)].join(","),
        ];

        chartData.labels.forEach((label, idx) => {
          const row = [label, ...chartData.datasets.map((ds) => ds.data[idx])];
          csvRows.push(row.join(","));
        });

        const csvBlob = new Blob(["\uFEFF" + csvRows.join("\n")], {
          type: "text/csv",
        });
        const csvLink = document.createElement("a");
        csvLink.href = URL.createObjectURL(csvBlob);
        csvLink.download = "Performance_data.csv";
        csvLink.click();
      });
    }
  }

  /* ---------- Khởi tạo ban đầu ---------- */
  console.log("Initial data loaded:", initialData);
  updateAgeChart(initialData.age);
  updateGenderChart(initialData.gender);
  updateStatusChart(initialData.status);
  updateHometownChart(initialData.hometown);
  updateTimeChart(initialData.time);
  const initialTags = getSelectedTags(); 
  const initialTime = initialTimeRange;
  fetchChartData(
    "performance",
    initialTime,
    initialTags,
    updatePerformanceChart
  );

  const charts = [
    { selectId: "ageChartSelect", updateFn: updateAgeChart, chartId: "age" },
    {
      selectId: "genderChartSelect",
      updateFn: updateGenderChart,
      chartId: "gender",
    },
    {
      selectId: "statusChartSelect",
      updateFn: updateStatusChart,
      chartId: "status",
    },
    {
      selectId: "hometownChartSelect",
      updateFn: updateHometownChart,
      chartId: "hometown",
    },
    { selectId: "timeChartSelect", updateFn: updateTimeChart, chartId: "time" },
    {
      selectId: "timeChartSelectPerformance",
      updateFn: updatePerformanceChart,
      chartId: "performance",
    },
  ];

  charts.forEach(({ selectId, updateFn, chartId }) => {
    const select = document.getElementById(selectId);
    if (select) {
      select.value = initialTimeRange;
      select.addEventListener("change", (e) => {
        const tagSelect =
          chartId === "performance"
            ? document.getElementById("tagSelect")
            : null;
        const tagName = tagSelect ? tagSelect.value : null;
        fetchChartData(chartId, e.target.value, tagName, updateFn);
      });
    } else {
      console.error(`Element with ID "${selectId}" not found in DOM.`);
    }
  });

  const tagSelect = document.getElementById("tagSelect");
  if (tagSelect) {
    tagSelect.value = initialTag;
    tagSelect.addEventListener("change", () => {
      const timeSelect = document.getElementById("timeChartSelectPerformance");
      const timeRange = timeSelect ? timeSelect.value : initialTimeRange;
      fetchChartData("performance", timeRange, null, updatePerformanceChart);
    });
  }

  /* ---------- Helpers ---------- */
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++)
      color += letters[Math.floor(Math.random() * 16)];
    return color + "80";
  }

  function showTimedAlert(title, message, type, duration) {
    console.log(`${title}: ${message} (${type}, ${duration}ms)`);
  }
}
/* ===================== END initializeCharts ===================== */
