let ageChart, genderChart, statusChart, hometownChart, timeChart;

function initializeCharts(initialData) {
  if (typeof Chart === "undefined") {
    console.error(
      "Chart.js failed to load. Check the script source or network."
    );
    showTimedAlert(
      "Error!",
      "Failed to load charting library. Please refresh the page.",
      "error",
      2000
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
      2000
    );
  }

  // Register the datalabels plugin
  Chart.register(ChartDataLabels);

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

  function fetchChartData(chartId, timeRange, callback) {
    const loadingElement = document.getElementById(`${chartId}-loading`);
    if (loadingElement) loadingElement.style.display = "block";

    // Use a relative URL to avoid hardcoding the host/port/protocol
    const apiUrl = "https://localhost:7162/api/Users/stats";
    const url = `${apiUrl}?groupBy=${chartId}&timeRange=${timeRange}`;
    console.log(`Fetching data from: ${url}`);

    fetch(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
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
        if (
          result.status === "success" &&
          result.data &&
          result.data[chartId]
        ) {
          const data = result.data[chartId];
          if (Object.keys(data).length === 0) {
            console.warn(
              `No data returned for ${chartId} with time range ${timeRange}`
            );
            callback({}); // Handle empty data
          } else {
            callback(data);
            console.log(`Successfully updated ${chartId} with new data:`, data);
          }
        } else {
          console.error(`Invalid response for ${chartId}:`, result);
          showTimedAlert(
            "Error!",
            `Failed to update ${chartId} chart: ${
              result.message || "Invalid response format"
            }`,
            "error",
            2000
          );
        }
      })
      .catch((error) => {
        console.error(`Failed to fetch statistics for ${chartId}:`, error);
        showTimedAlert(
          "Error",
          `Failed to update ${chartId} chart: ${error.message}`,
          "error",
          3000
        );
      })
      .finally(() => {
        if (loadingElement) loadingElement.style.display = "none";
      });
  }

  // Age Chart (Bar)
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
        layout: {
          padding: {
            top: 30,
            bottom: 10,
          },
        },
        scales: {
          x: { title: { display: true, text: "Age Groups" } },
        },
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
          legend: {
            display: false,
          },
        },
      }
    );
  }

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

  // Hometown Chart (Horizontal Bar)
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
    const baseColor = "#173878"; // Dark Blue
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
        indexAxis: "y", // Horizontal bar
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
            font: { weight: "bold", size: 10 },
            formatter: (value) =>
              `${value} (${((value / total) * 100).toFixed(2)}%)`,
            clamp: true,
            clip: true,
          },
        },
        elements: {
          bar: {
            barThickness: 26, // Increase bar height
          },
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

        // Draw white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        // Save image
        const link = document.createElement("a");
        link.href = whiteCanvas.toDataURL("image/png");
        link.download = "hometown_chart.png";
        link.click();

        // ====== CSV EXPORT ======
        const csvContent = "\uFEFF" +  [
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

  function updateTimeChart(data) {
    const labels = Object.keys(data).map((label) => {
      if (initialTimeRange === "week") {
        return `Week ${label.split("-W")[1]}`; // Format as "Week 23"
      } else if (initialTimeRange === "year") {
        return new Date(label + "-01").toLocaleString("default", {
          month: "short",
          year: "numeric",
        }); // e.g., "Jan 2025"
      } else if (initialTimeRange === "day") {
        return label.split(" ")[1]; // Show only hour, e.g., "14:00"
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
            pointRadius: 4,
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
      }
    );
  }

  // Initialize charts with initial data
  console.log("Initial data loaded:", initialData);
  updateAgeChart(initialData.age);
  updateGenderChart(initialData.gender);
  updateStatusChart(initialData.status);
  updateHometownChart(initialData.hometown);
  updateTimeChart(initialData.time);

  // Pre-select dropdowns based on initial time range
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
  ];

  charts.forEach(({ selectId, updateFn, chartId }) => {
    const select = document.getElementById(selectId);
    if (select) {
      // Pre-select the dropdown based on initialTimeRange
      select.value = initialTimeRange;
      select.addEventListener("change", (e) => {
        fetchChartData(chartId, e.target.value, updateFn);
      });
    } else {
      console.error(`Element with ID "${selectId}" not found in DOM.`);
    }
  });
}
