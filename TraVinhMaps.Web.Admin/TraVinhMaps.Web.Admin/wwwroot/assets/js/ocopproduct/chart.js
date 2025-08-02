// =========================================================================
// OCOP Dashboard Charts Scripts (Optimized for Light/Dark Mode and Translation)
// =========================================================================

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
    cyan: 'rgba(75, 192, 192, 0.7)',
    purple: 'rgba(153, 102, 255, 0.7)',
    orange: 'rgba(255, 159, 64, 0.7)',
    red: 'rgba(255, 99, 132, 0.7)',
    blue: 'rgba(54, 162, 235, 0.7)',
    yellow: 'rgba(255, 206, 86, 0.7)',
    datalabel: '#1A1A1A',
    canvasBackground: '#F5F5F5', // Light gray for less glare
    grid: '#CCCCCC',
    tooltipBg: 'rgba(0, 0, 0, 0.8)',
    tooltipText: '#FFFFFF',
  },
  dark: {
    cyan: 'rgba(75, 192, 192, 0.7)',
    purple: 'rgba(153, 102, 255, 0.7)',
    orange: 'rgba(255, 159, 64, 0.7)',
    red: 'rgba(255, 99, 132, 0.7)',
    blue: 'rgba(54, 162, 235, 0.7)',
    yellow: 'rgba(255, 206, 86, 0.7)',
    datalabel: '#E6E6E6', // Light gray for contrast
    canvasBackground: '#1A1A1A', // Dark background for dark mode
    grid: '#444444',
    tooltipBg: 'rgba(255, 255, 255, 0.15)', // Semi-transparent white
    tooltipText: '#FFFFFF',
  }
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

// Translation and time range mapping
const timeRangeMap = {
    'ngày': 'day',
    'tuần': 'week',
    'tháng': 'month',
    'năm': 'year',
    'all': 'all'
};

function getApiTimeRange(vietnameseValue) {
    return timeRangeMap[vietnameseValue] || vietnameseValue;
}

function t(text) {
    return window.translationMapForCharts?.[text] || text;
}

// Validate filter inputs
function validateFilterInputs(startDateStr, endDateStr) {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (startDateStr) {
        const start = new Date(startDateStr);
        if (start > now) {
            showTimedAlert(t("Invalid Input"), t("Start date cannot be in the future."), "warning", 1000);
            return false;
        }
    }
    if (endDateStr) {
        const end = new Date(endDateStr);
        if (end > now) {
            showTimedAlert(t("Invalid Input"), t("End date cannot be in the future."), "warning", 1000);
            return false;
        }
    }
    if (startDateStr && endDateStr && new Date(endDateStr) < new Date(startDateStr)) {
        showTimedAlert(t("Invalid Input"), t("End date cannot be earlier than start date."), "warning", 1000);
        return false;
    }
    return true;
}

// Download chart
function downloadChart(chart, filename, type) {
    if (!chart || !chart.canvas) {
        showTimedAlert(t("Error"), t("No chart available for download"), "error", 1000);
        return;
    }
    if (!chart.data.labels || chart.data.labels.length === 0) {
        showTimedAlert(t("Warning"), t("No data available to download."), "warning", 1000);
        return;
    }
    if (chart === myCompareProductsChart && (!chart.data.datasets[0].data || chart.data.datasets[0].data.every(val => val === 0))) {
        showTimedAlert(t("Warning"), t("No data available to download."), "warning", 1000);
        return;
    }
    if (type === "png") {
        const canvas = chart.canvas;
        const targetCanvas = document.createElement("canvas");
        targetCanvas.width = canvas.width;
        targetCanvas.height = canvas.height;
        const ctx = targetCanvas.getContext("2d");
        ctx.fillStyle = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        const link = document.createElement("a");
        link.href = targetCanvas.toDataURL("image/png");
        link.download = filename;
        link.click();
    } else if (type === "csv") {
        const labels = chart.data.labels;
        const datasets = chart.data.datasets;
        if (!labels || labels.length === 0) {
            showTimedAlert(t("Warning"), t("No data available to download."), "warning", 1000);
            return;
        }
        const escapeCsv = (value) => {
            if (value == null) return "";
            const str = String(value).replace(/"/g, '""');
            return `"${str}"`;
        };
        let csv = "\uFEFF" + escapeCsv(t("Label")) + "," + datasets.map(ds => escapeCsv(ds.label)).join(",") + "\n";
        labels.forEach((label, idx) => {
            const row = [escapeCsv(label)];
            datasets.forEach(ds => row.push(ds.data[idx] ?? 0));
            csv += row.join(",") + "\n";
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename.replace(".png", ".csv");
        link.click();
    }
}

// Draw Analytics Chart
function drawAnalyticsChart(data) {
    if (myAnalyticsChart) myAnalyticsChart.destroy();
    const ctx = document.getElementById("analyticsChart")?.getContext("2d");
    if (!ctx) return;
    ctx.canvas.style.backgroundColor = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
    myAnalyticsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [
                {
                    label: t("View Count"),
                    data: (data || []).map(item => item.viewCount || 0),
                    backgroundColor: getChartColor(THEME_COLORS.light.cyan, THEME_COLORS.dark.cyan),
                    borderColor: getChartColor(THEME_COLORS.light.cyan, THEME_COLORS.dark.cyan).replace("0.7", "1"),
                    borderWidth: 1,
                },
                {
                    label: t("Interaction Count"),
                    data: (data || []).map(item => item.interactionCount || 0),
                    backgroundColor: getChartColor(THEME_COLORS.light.purple, THEME_COLORS.dark.purple),
                    borderColor: getChartColor(THEME_COLORS.light.purple, THEME_COLORS.dark.purple).replace("0.7", "1"),
                    borderWidth: 1,
                },
                {
                    label: t("Favorite Count"),
                    data: (data || []).map(item => item.favoriteCount || 0),
                    backgroundColor: getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange),
                    borderColor: getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange).replace("0.7", "1"),
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) } },
                title: { display: true, text: t("OCOP Product Analytics"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                tooltip: {
                    backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
                    titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                    bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: t("Count"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: {
                        stepSize: 1,
                        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
                        callback: function (value) {
                            return Number.isInteger(value) ? value : null;
                        },
                    },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
                x: {
                    title: { display: true, text: t("Product Name"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: { autoSkip: false, maxRotation: 90, minRotation: 45, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
            },
        },
    });
}

// Draw Demographics Chart
function drawDemographicsChart(data) {
    if (myDemographicsChart) myDemographicsChart.destroy();
    const ctx = document.getElementById("demographicsChart")?.getContext("2d");
    if (!ctx) return;
    ctx.canvas.style.backgroundColor = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
    myDemographicsChart = new Chart(ctx, {
        type: "bar",
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) } },
                title: { display: true, text: t("OCOP User Demographics (Product – Hometown – Age Group)"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                tooltip: {
                    backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
                    titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                    bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                    callbacks: {
                        title: (context) => {
                            const product = context[0].label;
                            const hometown = (data || []).find(d => t(d.productName) === product)?.hometown || t("N/A");
                            return `${product} (${t("Users from")} ${hometown})`;
                        },
                        label: (context) => {
                            const age = context.dataset.label;
                            const value = context.parsed.y;
                            return `${t("Age Group")}: ${age} - ${t("User Count")}: ${value}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: t("Product"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: { autoSkip: false, maxRotation: 60, minRotation: 30, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: t("User Count"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: {
                        stepSize: 1,
                        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
                        callback: function (value) {
                            return Number.isInteger(value) ? value : null;
                        },
                    },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
            },
        },
    });
    if (Array.isArray(data) && data.length) {
        const products = [...new Set(data.map(item => t(item.productName || "Unknown")))];
        const ageGroups = [...new Set(data.map(item => item.ageGroup || "Unknown"))];
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
            data: products.map(product =>
                data.filter(d => t(d.productName) === product && d.ageGroup === age).reduce((sum, d) => sum + (d.userCount || 0), 0)
            ),
            backgroundColor: colorArr[idx % colorArr.length],
            stack: "Stack 0",
        }));
        myDemographicsChart.data.labels = products;
        myDemographicsChart.data.datasets = datasets;
        myDemographicsChart.update();
    }
}

// Draw Top Interaction Chart
function drawTopInteractionChart(data) {
    if (myTopInteractionChart) myTopInteractionChart.destroy();
    const ctx = document.getElementById("topInteractionChart")?.getContext("2d");
    if (!ctx) return;
    ctx.canvas.style.backgroundColor = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
    myTopInteractionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [{
                label: t("Interaction Count"),
                data: (data || []).map(item => item.interactionCount || 0),
                backgroundColor: getChartColor(THEME_COLORS.light.blue, THEME_COLORS.dark.blue),
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) } },
                title: { display: true, text: t("Top Interacted OCOP Products"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                tooltip: {
                    backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
                    titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                    bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: t("Interaction Count"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: {
                        stepSize: 1,
                        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
                        callback: function (value) {
                            return Number.isInteger(value) ? value : null;
                        },
                    },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
                x: {
                    title: { display: true, text: t("Product Name"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: { autoSkip: false, maxRotation: 60, minRotation: 30, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
            },
        },
    });
}

// Draw Top Favorite Chart
function drawTopFavoriteChart(data) {
    if (myTopFavoriteChart) myTopFavoriteChart.destroy();
    const ctx = document.getElementById("topFavoriteChart")?.getContext("2d");
    if (!ctx) return;
    ctx.canvas.style.backgroundColor = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
    myTopFavoriteChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [{
                label: t("Favorite Count"),
                data: (data || []).map(item => item.favoriteCount || 0),
                backgroundColor: getChartColor(THEME_COLORS.light.yellow, THEME_COLORS.dark.yellow),
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) } },
                title: { display: true, text: t("Top Favorited OCOP Products"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                tooltip: {
                    backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
                    titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                    bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: t("Favorite Count"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: {
                        stepSize: 1,
                        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
                        callback: function (value) {
                            return Number.isInteger(value) ? value : null;
                        },
                    },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
                x: {
                    title: { display: true, text: t("Product Name"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: { autoSkip: false, maxRotation: 60, minRotation: 30, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
            },
        },
    });
}

// Draw Compare Products Chart
function drawCompareProductsChart(data) {
    if (myCompareProductsChart) myCompareProductsChart.destroy();
    const ctx = document.getElementById("compareProductsChart")?.getContext("2d");
    if (!ctx) return;
    ctx.canvas.style.backgroundColor = getChartColor(THEME_COLORS.light.canvasBackground, THEME_COLORS.dark.canvasBackground);
    myCompareProductsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [
                {
                    label: t("View Count"),
                    data: (data || []).map(item => item.viewCount || 0),
                    backgroundColor: getChartColor(THEME_COLORS.light.cyan, THEME_COLORS.dark.cyan),
                    borderColor: getChartColor(THEME_COLORS.light.cyan, THEME_COLORS.dark.cyan).replace("0.7", "1"),
                    borderWidth: 1,
                },
                {
                    label: t("Interaction Count"),
                    data: (data || []).map(item => item.interactionCount || 0),
                    backgroundColor: getChartColor(THEME_COLORS.light.purple, THEME_COLORS.dark.purple),
                    borderColor: getChartColor(THEME_COLORS.light.purple, THEME_COLORS.dark.purple).replace("0.7", "1"),
                    borderWidth: 1,
                },
                {
                    label: t("Favorite Count"),
                    data: (data || []).map(item => item.favoriteCount || 0),
                    backgroundColor: getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange),
                    borderColor: getChartColor(THEME_COLORS.light.orange, THEME_COLORS.dark.orange).replace("0.7", "1"),
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) } },
                title: { 
                    display: true, 
                    text: t("OCOP Product Comparison"), 
                    color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) 
                },
                tooltip: {
                    backgroundColor: getChartColor(THEME_COLORS.light.tooltipBg, THEME_COLORS.dark.tooltipBg),
                    titleColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                    bodyColor: getChartColor(THEME_COLORS.light.tooltipText, THEME_COLORS.dark.tooltipText),
                },
                annotation: {
                    annotations: data.length === 0 ? [{
                        type: 'label',
                        content: t("No data available"),
                        position: 'center',
                        font: { size: 16 },
                        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel)
                    }] : []
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: t("Count"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: {
                        stepSize: 1,
                        color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel),
                        callback: function (value) {
                            return Number.isInteger(value) ? value : null;
                        },
                    },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
                x: {
                    title: { display: true, text: t("Product Name"), color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    ticks: { autoSkip: false, maxRotation: 90, minRotation: 45, color: getChartColor(THEME_COLORS.light.datalabel, THEME_COLORS.dark.datalabel) },
                    grid: { color: getChartColor(THEME_COLORS.light.grid, THEME_COLORS.dark.grid) },
                },
            },
        },
    });
}

// Refresh functions
async function refreshAnalyticsChart(showAlert = true) {
    const selectedValue = document.getElementById("analyticsTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(selectedValue);
    let startDate = document.getElementById("analyticsStartDate")?.value || "";
    let endDate = document.getElementById("analyticsEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics?timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        drawAnalyticsChart(raw.data ?? []);
        if (showAlert) showTimedAlert(t("Success!"), t("Analytics chart refreshed"), "success", 1500);
    } catch (err) {
        drawAnalyticsChart([]);
        logDebug("Analytics refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
    }
}

async function refreshDemographicsChart(showAlert = true) {
    const selectedValue = document.getElementById("demographicsTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(selectedValue);
    let startDate = document.getElementById("demographicsStartDate")?.value || "";
    let endDate = document.getElementById("demographicsEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics-userdemographics?timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        drawDemographicsChart(raw.data ?? []);
        if (showAlert) showTimedAlert(t("Success!"), t("Demographics chart refreshed"), "success", 1500);
    } catch (err) {
        drawDemographicsChart([]);
        logDebug("Demographics refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
    }
}

async function refreshTopInteractionChart(showAlert = true) {
    const selectedValue = document.getElementById("topInteractionTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(selectedValue);
    let startDate = document.getElementById("topInteractionStartDate")?.value || "";
    let endDate = document.getElementById("topInteractionEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics-getTopProductsByInteractions?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        drawTopInteractionChart(raw.data ?? []);
        if (showAlert) showTimedAlert(t("Success!"), t("Top Interaction refreshed"), "success", 1500);
    } catch (err) {
        drawTopInteractionChart([]);
        logDebug("Top Interaction refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("Failed to refresh top interaction"), "error", 1000);
    }
}

async function refreshTopFavoriteChart(showAlert = true) {
    const selectedValue = document.getElementById("topFavoriteTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(selectedValue);
    let startDate = document.getElementById("topFavoriteStartDate")?.value || "";
    let endDate = document.getElementById("topFavoriteEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics-getTopProductsByFavorites?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        drawTopFavoriteChart(raw.data ?? []);
        if (showAlert) showTimedAlert(t("Success!"), t("Top Favorite refreshed"), "success", 1500);
    } catch (err) {
        drawTopFavoriteChart([]);
        logDebug("Top Favorite refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("Failed to refresh top favorites"), "error", 1000);
    }
}

async function refreshCompareProductsChart(productIds, showAlert = true) {
    const selectedValue = document.getElementById("compareTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(selectedValue);
    let startDate = document.getElementById("compareStartDate")?.value || "";
    let endDate = document.getElementById("compareEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    if (!productIds || productIds.length === 0) {
        drawCompareProductsChart([]);
        if (showAlert) showTimedAlert(t("Warning!"), t("Please select products to compare"), "warning", 1000);
        return;
    }
    let url = `${ocopApi}analytics-compareproducts?`;
    productIds.forEach((id) => (url += `productIds=${encodeURIComponent(id)}&`));
    url += `timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const chartData = data.data ?? [];
        drawCompareProductsChart(chartData);
        if (chartData.length === 0) {
            if (showAlert) showTimedAlert(t("Warning!"), t("No data available for the selected period."), "warning", 1000);
        } else if (showAlert) {
            showTimedAlert(t("Success!"), t("Comparison chart refreshed"), "success", 1500);
        }
    } catch (err) {
        drawCompareProductsChart([]);
        logDebug("Compare Products refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
    }
}

// Initialize OCOP Dashboard
function initializeOcopDashboard() {
    console.log("Initializing OCOP Dashboard");
    refreshAnalyticsChart(false);
    refreshDemographicsChart(false);
    refreshTopInteractionChart(false);
    refreshTopFavoriteChart(false);
    drawCompareProductsChart([]);
}

// Consolidated DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
    initializeOcopDashboard();

    document.getElementById("analyticsRefreshChart")?.addEventListener("click", () => refreshAnalyticsChart(true));
    document.getElementById("analyticsResetFilter")?.addEventListener("click", () => {
        document.getElementById("analyticsTimeRange").value = "month";
        document.getElementById("analyticsStartDate").value = "";
        document.getElementById("analyticsEndDate").value = "";
        refreshAnalyticsChart(false);
    });
    document.getElementById("analyticsDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("analyticsDownloadType").value;
        downloadChart(myAnalyticsChart, "analytics-chart.png", type);
    });

    document.getElementById("demographicsRefreshChart")?.addEventListener("click", () => refreshDemographicsChart(true));
    document.getElementById("demographicsResetFilter")?.addEventListener("click", () => {
        document.getElementById("demographicsTimeRange").value = "month";
        document.getElementById("demographicsStartDate").value = "";
        document.getElementById("demographicsEndDate").value = "";
        refreshDemographicsChart(false);
    });
    document.getElementById("demographicsDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("demographicsDownloadType").value;
        downloadChart(myDemographicsChart, "demographics-chart.png", type);
    });

    document.getElementById("topInteractionRefresh")?.addEventListener("click", () => refreshTopInteractionChart(true));
    document.getElementById("topInteractionReset")?.addEventListener("click", () => {
        document.getElementById("topInteractionTimeRange").value = "month";
        document.getElementById("topInteractionStartDate").value = "";
        document.getElementById("topInteractionEndDate").value = "";
        refreshTopInteractionChart(false);
    });
    document.getElementById("topInteractionDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("topInteractionDownloadType").value;
        downloadChart(myTopInteractionChart, "top-interactions-chart.png", type);
    });

    document.getElementById("topFavoriteRefresh")?.addEventListener("click", () => refreshTopFavoriteChart(true));
    document.getElementById("topFavoriteReset")?.addEventListener("click", () => {
        document.getElementById("topFavoriteTimeRange").value = "month";
        document.getElementById("topFavoriteStartDate").value = "";
        document.getElementById("topFavoriteEndDate").value = "";
        refreshTopFavoriteChart(false);
    });
    document.getElementById("topFavoriteDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("topFavoriteDownloadType").value;
        downloadChart(myTopFavoriteChart, "top-favorites-chart.png", type);
    });

    document.getElementById("compareProductsBtn")?.addEventListener("click", () => {
        const select = document.getElementById("compareProductsSelect");
        const productIds = Array.from(select.selectedOptions).map(option => option.value);
        refreshCompareProductsChart(productIds, true);
    });
    document.getElementById("compareProductsReset")?.addEventListener("click", () => {
        const select = document.getElementById("compareProductsSelect");
        select.selectedIndex = -1;
        document.getElementById("compareTimeRange").value = "month";
        document.getElementById("compareStartDate").value = "";
        document.getElementById("compareEndDate").value = "";
        drawCompareProductsChart([]);
    });
    document.getElementById("compareProductsDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("compareProductsDownloadType").value;
        downloadChart(myCompareProductsChart, "compare-products-chart.png", type);
    });

    window.addEventListener('languageChanged', () => {
        console.log("Language changed event detected, refreshing charts...");
        refreshAnalyticsChart(false);
        refreshDemographicsChart(false);
        refreshTopInteractionChart(false);
        refreshTopFavoriteChart(false);
        const select = document.getElementById("compareProductsSelect");
        const productIds = Array.from(select.selectedOptions).map(option => option.value);
        if (productIds.length > 0) {
            refreshCompareProductsChart(productIds, false);
        } else {
            drawCompareProductsChart([]);
        }
    });

    window.addEventListener('themeChanged', () => {
        console.log("Theme changed event detected, refreshing charts...");
        refreshAnalyticsChart(false);
        refreshDemographicsChart(false);
        refreshTopInteractionChart(false);
        refreshTopFavoriteChart(false);
        const select = document.getElementById("compareProductsSelect");
        const productIds = Array.from(select.selectedOptions).map(option => option.value);
        if (productIds.length > 0) {
            refreshCompareProductsChart(productIds, false);
        } else {
            drawCompareProductsChart([]);
        }
    });
});

// SignalR Real-time Integration for OCOP Analytics
(function () {
    if (typeof signalR === 'undefined') {
        console.error("SignalR client library not found. Real-time updates will be disabled for OCOP page.");
        return;
    }

    function refreshAllOcopChartsForRealtime() {
        console.log("[Real-time] Refreshing all OCOP charts...");
        refreshAnalyticsChart(false);
        refreshDemographicsChart(false);
        refreshTopInteractionChart(false);
        refreshTopFavoriteChart(false);
        const compareSelect = document.getElementById("compareProductsSelect");
        if (compareSelect && compareSelect.selectedOptions.length > 0) {
            const productIds = Array.from(compareSelect.selectedOptions).map(option => option.value);
            refreshCompareProductsChart(productIds, false);
        }
    }

    window.refreshAllOcopCharts = refreshAllOcopChartsForRealtime;

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(window.apiBaseUrl + "dashboardHub")
        .withAutomaticReconnect()
        .build();

    connection.on("ChartAnalytics", function () {
        console.log("[SignalR] Received 'ChartAnalytics' signal on OCOP page. Updating OCOP charts...");
        if (typeof window.refreshAllOcopCharts === 'function') {
            window.refreshAllOcopCharts();
        } else {
            console.error("Function 'refreshAllOcopCharts' is not available to update OCOP charts.");
        }
    });

    async function startSignalRConnection() {
        try {
            await connection.start();
            console.log("[SignalR] OCOP page connected successfully.");
            const userRole = document.body.dataset.userRole?.toLowerCase();
            if (userRole === "super-admin" || userRole === "admin") {
                connection.invoke("JoinAdminGroup", userRole).catch(function (err) {
                    console.error("[SignalR] OCOP page failed to join group:", err.toString());
                });
            }
        } catch (err) {
            console.error("[SignalR] OCOP page connection failed: ", err);
        }
    }

    startSignalRConnection();
})();
