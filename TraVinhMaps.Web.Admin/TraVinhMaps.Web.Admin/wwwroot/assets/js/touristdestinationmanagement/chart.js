// Global variables for chart data
let stats = window.stats || {};
let demographics = window.demographics || [];
let topViews = window.topViews || [];
let topFavorites = window.topFavorites || [];
let compareDestinations = window.compareDestinations || [];
let isInitialLoad = true;

// Chart instances
let analyticsChart, demographicsChart, topInteractionChart, topFavoritesChart, compareDestinationsChart;

// Base API URL
const destinationApi = window.DESTINATION_API_URL || "https://localhost:7162/api/TouristDestination/";

// Utility log
function logDebug(message, data = null) {
    console.log(`[DestinationDashboard] ${message}`, data ? data : "");
}

// Validate filter for all charts (end >= start, start/end <= today)
function validateFilterInputs(startDateStr, endDateStr) {
    const now = new Date();
    if (startDateStr) {
        const start = new Date(startDateStr);
        if (start > now) {
            showTimedAlert("Invalid Input", "Start date cannot be in the future.", "warning", 1000);
            return false;
        }
    }
    if (endDateStr) {
        const end = new Date(endDateStr);
        if (end > now) {
            showTimedAlert("Invalid Input", "End date cannot be in the future.", "warning", 1000);
            return false;
        }
    }
    if (startDateStr && endDateStr && new Date(endDateStr) < new Date(startDateStr)) {
        showTimedAlert("Invalid Input", "End date cannot be earlier than start date.", "warning", 1000);
        return false;
    }
    return true;
}

// DRAW CHARTS
function drawAnalyticsChart(data) {
    if (analyticsChart) analyticsChart.destroy();
    const ctx = document.getElementById("analyticsChart")?.getContext("2d");
    if (!ctx) return;
    analyticsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(d => d.locationName || "Unknown"),
            datasets: [
                {
                    label: "Views",
                    data: (data || []).map(d => d.viewCount || 0),
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
                {
                    label: "Interactions",
                    data: (data || []).map(d => d.interactionCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
                {
                    label: "Favorites",
                    data: (data || []).map(d => d.favoriteCount || 0),
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Destination Analytics" },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Count" },
                    ticks: {
                        callback: (value) => (value >= 1000 ? value / 1000 + "k" : value),
                    },
                },
                x: {
                    title: { display: true, text: "Destinations" },
                    ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 },
                },
            }
        }
    });
}

function drawDemographicsChart(data) {
    if (demographicsChart) demographicsChart.destroy();
    const ctx = document.getElementById("demographicsChart")?.getContext("2d");
    if (!ctx) return;
    demographicsChart = new Chart(ctx, {
        type: "bar",
        data: { labels: [], datasets: [] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "User Demographics (Location – Hometown – Age Group)" },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const location = context[0].label;
                            const hometown = (data || []).find(d => (d.locationName || "Unknown") === location)?.hometown || "N/A";
                            return `${location} (Users from ${hometown})`;
                        },
                        label: (context) => `Age Group: ${context.dataset.label} - User Count: ${context.parsed.y}`,
                    },
                },
            },
            scales: {
                x: { stacked: true, title: { display: true, text: "Location" }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
                y: { stacked: true, beginAtZero: true, title: { display: true, text: "User Count" }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
            },
        },
    });
    if (Array.isArray(data) && data.length) {
        const locations = [...new Set(data.map(item => item.locationName || "Unknown"))];
        const ageGroups = [...new Set(data.map(item => item.ageGroup || "Unknown"))];
        const colorArr = [
            "rgba(255,99,132,0.7)", "rgba(54,162,235,0.7)", "rgba(255,206,86,0.7)",
            "rgba(75,192,192,0.7)", "rgba(153,102,255,0.7)", "rgba(255,159,64,0.7)",
        ];
        const datasets = ageGroups.map((age, idx) => ({
            label: age,
            data: locations.map(location => {
                const total = data
                    .filter(d => (d.locationName || "Unknown") === location && (d.ageGroup || "Unknown") === age)
                    .reduce((sum, d) => sum + (d.userCount || 0), 0);
                return total;
            }),
            backgroundColor: colorArr[idx % colorArr.length],
            borderColor: colorArr[idx % colorArr.length].replace("0.7", "1"),
            borderWidth: 1,
            barThickness: 20,
            stack: "Stack 0",
        }));
        demographicsChart.data.labels = locations;
        demographicsChart.data.datasets = datasets;
        demographicsChart.update();
    }
}

function drawTopInteractionChart(data) {
    if (topInteractionChart) topInteractionChart.destroy();
    const ctx = document.getElementById("topInteractionChart")?.getContext("2d");
    if (!ctx) return;
    topInteractionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(d => d.locationName || "Unknown"),
            datasets: [
                {
                    label: "Interactions",
                    data: (data || []).map(d => d.interactionCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.7)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Top Interacted Destinations" },
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Interactions" }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
                x: { title: { display: true, text: "Top Destinations" }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
            }
        }
    });
}

function drawTopFavoritesChart(data) {
    if (topFavoritesChart) topFavoritesChart.destroy();
    const ctx = document.getElementById("topFavoritesChart")?.getContext("2d");
    if (!ctx) return;
    topFavoritesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(d => d.locationName || "Unknown"),
            datasets: [
                {
                    label: "Favorites",
                    data: (data || []).map(d => d.favoriteCount || 0),
                    backgroundColor: "rgba(255, 99, 132, 0.7)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Top Favorited Destinations" },
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Favorites" }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
                x: { title: { display: true, text: "Top Destinations" }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
            }
        }
    });
}

function drawCompareDestinationsChart(data) {
    if (compareDestinationsChart) compareDestinationsChart.destroy();
    const ctx = document.getElementById("compareDestinationsChart")?.getContext("2d");
    if (!ctx) return;
    compareDestinationsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(d => d.locationName || "Unknown"),
            datasets: [
                {
                    label: "Views",
                    data: (data || []).map(d => d.viewCount || 0),
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                },
                {
                    label: "Interactions",
                    data: (data || []).map(d => d.interactionCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                },
                {
                    label: "Favorites",
                    data: (data || []).map(d => d.favoriteCount || 0),
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Destination Comparison" }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Count" }
                },
                x: {
                    title: { display: true, text: "Compared Destinations" },
                    ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 }
                },
            }
        }
    });
}

// --- REFRESH/RESET ---
// Overview (analytics) filter
async function refreshAnalyticsChart(showAlert = true) {
    const timeRange = document.getElementById("analyticsTimeRange")?.value || "month";
    const startDate = document.getElementById("analyticsStartDate")?.value || "";
    const endDate = document.getElementById("analyticsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    const url = `${destinationApi}stats-overview?timeRange=${encodeURIComponent(timeRange)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        document.getElementById("analyticsRefreshChart").disabled = true;
        const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        const arr = (raw.data?.destinationDetails) ? raw.data.destinationDetails : [];
        if (!arr.length) {
            drawAnalyticsChart([]);
            if (showAlert) showTimedAlert("Warning", "No analytics data found", "warning", 1000);
            return;
        }
        stats = raw.data;
        drawAnalyticsChart(arr);
        if (showAlert) showTimedAlert("Success!", "Analytics chart refreshed", "success", 1000);
    } catch (error) {
        logDebug("Analytics refresh error", error);
        if (showAlert) showTimedAlert("Error", `Failed to refresh analytics data: ${error.message}`, "error", 1000);
    } finally {
        document.getElementById("analyticsRefreshChart").disabled = false;
    }
}
document.getElementById("analyticsRefreshChart")?.addEventListener("click", () => refreshAnalyticsChart());
document.getElementById("analyticsResetFilter")?.addEventListener("click", () => {
    document.getElementById("analyticsTimeRange").value = "month";
    document.getElementById("analyticsStartDate").value = "";
    document.getElementById("analyticsEndDate").value = "";
    refreshAnalyticsChart();
});

// Demographics filter
async function refreshDemographicsChart(showAlert = true) {
    const timeRange = document.getElementById("demographicsTimeRange")?.value || "month";
    const startDate = document.getElementById("demographicsStartDate")?.value || "";
    const endDate = document.getElementById("demographicsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    const url = `${destinationApi}stats-getUserDemographics?timeRange=${encodeURIComponent(timeRange)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        document.getElementById("demographicsRefreshChart").disabled = true;
        const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        const arr = raw.data || [];
        if (!arr.length) {
            drawDemographicsChart([]);
            if (showAlert) showTimedAlert("Warning", "No demographics data found", "warning", 1000);
            return;
        }
        demographics = arr;
        drawDemographicsChart(arr);
        if (showAlert) showTimedAlert("Success!", "Demographics chart refreshed", "success", 1000);
    } catch (error) {
        logDebug("Demographics refresh error", error);
        if (showAlert) showTimedAlert("Error", `Failed to refresh demographics data: ${error.message}`, "error", 1000);
    } finally {
        document.getElementById("demographicsRefreshChart").disabled = false;
    }
}
document.getElementById("demographicsRefreshChart")?.addEventListener("click", () => refreshDemographicsChart());
document.getElementById("demographicsResetFilter")?.addEventListener("click", () => {
    document.getElementById("demographicsTimeRange").value = "month";
    document.getElementById("demographicsStartDate").value = "";
    document.getElementById("demographicsEndDate").value = "";
    refreshDemographicsChart();
});

// Top Views with its own filter
async function refreshTopViewsChart(showAlert = true) {
    const timeRange = document.getElementById("topViewsTimeRange")?.value || "month";
    const startDate = document.getElementById("topViewsStartDate")?.value || "";
    const endDate = document.getElementById("topViewsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    const url = `${destinationApi}stats-getTopViewsDestinations?top=5&timeRange=${encodeURIComponent(timeRange)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        document.getElementById("topViewsRefresh").disabled = true;
        const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        const views = raw.data || [];
        if (!views.length) {
            drawTopInteractionChart([]);
            if (showAlert) showTimedAlert("Warning", "No data found", "warning", 1000);
            return;
        }
        topViews = views;
        drawTopInteractionChart(topViews);
        if (showAlert) showTimedAlert("Success!", "Top Views refreshed", "success", 1000);
    } catch (error) {
        logDebug("Top Views refresh error", error);
        if (showAlert) showTimedAlert("Error", "Failed to refresh top views", "error", 1000);
    } finally {
        document.getElementById("topViewsRefresh").disabled = false;
    }
}
document.getElementById("topViewsRefresh")?.addEventListener("click", () => refreshTopViewsChart());
document.getElementById("topViewsReset")?.addEventListener("click", () => {
    document.getElementById("topViewsTimeRange").value = "month";
    document.getElementById("topViewsStartDate").value = "";
    document.getElementById("topViewsEndDate").value = "";
    refreshTopViewsChart();
});

// Top Favorites with its own filter
async function refreshTopFavoritesChart(showAlert = true) {
    const timeRange = document.getElementById("topFavoritesTimeRange")?.value || "month";
    const startDate = document.getElementById("topFavoritesStartDate")?.value || "";
    const endDate = document.getElementById("topFavoritesEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    const url = `${destinationApi}stats-getTopFavoritesDestinations?top=5&timeRange=${encodeURIComponent(timeRange)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        document.getElementById("topFavoritesRefresh").disabled = true;
        const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        const favs = raw.data || [];
        if (!favs.length) {
            drawTopFavoritesChart([]);
            if (showAlert) showTimedAlert("Warning", "No data found", "warning", 1000);
            return;
        }
        topFavorites = favs;
        drawTopFavoritesChart(topFavorites);
        if (showAlert) showTimedAlert("Success!", "Top Favorites refreshed", "success", 1000);
    } catch (error) {
        logDebug("Top Favorites refresh error", error);
        if (showAlert) showTimedAlert("Error", "Failed to refresh top favorites", "error", 1000);
    } finally {
        document.getElementById("topFavoritesRefresh").disabled = false;
    }
}
document.getElementById("topFavoritesRefresh")?.addEventListener("click", () => refreshTopFavoritesChart());
document.getElementById("topFavoritesReset")?.addEventListener("click", () => {
    document.getElementById("topFavoritesTimeRange").value = "month";
    document.getElementById("topFavoritesStartDate").value = "";
    document.getElementById("topFavoritesEndDate").value = "";
    refreshTopFavoritesChart();
});

// Compare, Download, and other logic (unchanged)
async function refreshCompareDestinationsChart(showAlert = true) {
    const selectedIds = Array.from(document.getElementById("compareDestinationsSelect")?.selectedOptions || []).map(opt => opt.value);
    if (!selectedIds.length) {
        drawCompareDestinationsChart([]);
        return;
    }
    const url = `${destinationApi}stats-compare?${selectedIds.map(id => `destinationIds=${id}`).join("&")}&timeRange=month`;
    try {
        document.getElementById("compareDestinationsBtn")?.setAttribute("disabled", "true");
        const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        const cmp = raw.data || [];
        if (!cmp.length) {
            drawCompareDestinationsChart([]);
            if (showAlert) showTimedAlert("Warning", "No data found", "warning", 1000);
            return;
        }
        compareDestinations = cmp;
        drawCompareDestinationsChart(compareDestinations);
        if (showAlert) showTimedAlert("Success!", "Comparison chart refreshed", "success", 1000);
    } catch (error) {
        logDebug("Compare Destinations refresh error", error);
        if (showAlert) showTimedAlert("Error", `Failed to refresh comparison data: ${error.message}`, "error", 1000);
    } finally {
        document.getElementById("compareDestinationsBtn")?.removeAttribute("disabled");
    }
}
document.getElementById("compareDestinationsBtn")?.addEventListener("click", () => refreshCompareDestinationsChart());

// Download chart (unchanged)
function downloadChart(chart, filename, type) {
    if (!chart) { showTimedAlert("Error", `No ${filename} chart available for download`, "error", 1000); return; }
    if (type === "png") {
        const canvas = chart.canvas;
        const whiteCanvas = document.createElement("canvas");
        whiteCanvas.width = canvas.width; whiteCanvas.height = canvas.height;
        const ctx = whiteCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        const link = document.createElement("a");
        link.href = whiteCanvas.toDataURL("image/png");
        link.download = filename; link.click();
    } else if (type === "csv") {
        const labels = chart.data.labels;
        const datasets = chart.data.datasets;
        let csv = "\uFEFFLabel," + datasets.map(ds => ds.label).join(",") + "\n";
        labels.forEach((label, idx) => {
            const row = [label];
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
document.getElementById("analyticsDownloadChartBtn")?.addEventListener("click", () => downloadChart(analyticsChart, "destination_analytics.png", document.getElementById("analyticsDownloadType")?.value || "png"));
document.getElementById("demographicsDownloadChartBtn")?.addEventListener("click", () => downloadChart(demographicsChart, "demographics_chart.png", document.getElementById("demographicsDownloadType")?.value || "png"));
document.getElementById("topInteractionDownloadChartBtn")?.addEventListener("click", () => downloadChart(topInteractionChart, "top_interactions.png", document.getElementById("topInteractionDownloadType")?.value || "png"));
document.getElementById("topFavoritesDownloadChartBtn")?.addEventListener("click", () => downloadChart(topFavoritesChart, "top_favorites.png", document.getElementById("topFavoritesDownloadType")?.value || "png"));
document.getElementById("compareDestinationsDownloadChartBtn")?.addEventListener("click", () => downloadChart(compareDestinationsChart, "destination_comparison.png", document.getElementById("compareDownloadType")?.value || "png"));

// --- INITIALIZE ---
function initializeCharts() {
    if (stats.destinationDetails && Array.isArray(stats.destinationDetails)) drawAnalyticsChart(stats.destinationDetails); else refreshAnalyticsChart(false);
    if (Array.isArray(demographics) && demographics.length) drawDemographicsChart(demographics); else refreshDemographicsChart(false);
    refreshTopViewsChart(false);
    refreshTopFavoritesChart(false);
    if (Array.isArray(compareDestinations) && compareDestinations.length) drawCompareDestinationsChart(compareDestinations); else drawCompareDestinationsChart([]);
    isInitialLoad = false;
}
window.initializeDestinationDashboard = initializeCharts;
window.addEventListener("DOMContentLoaded", initializeCharts);