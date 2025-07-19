// Global variables for chart data
let stats = window.stats || {};
let demographics = window.demographics || [];
let topViews = window.topViews || [];
let topFavorites = window.topFavorites || [];
let compareDestinations = window.compareDestinations || [];
let isInitialLoad = true;

// Chart instances
let analyticsChart, demographicsChart, topInteractionChart, topFavoritesChart, compareDestinationsChart;

// Cache for chart data
const chartDataCache = new Map();

// Base API URL
const destinationApi = window.DESTINATION_API_URL || "https://localhost:7162/api/TouristDestination/";

// Utility log
function logDebug(message, data = null) {
    console.log(`[DestinationDashboard] ${message}`, data ? data : "");
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
    if (type === "png") {
        const canvas = chart.canvas;
        const ctx = canvas.getContext('2d');
        // Save the current canvas state
        const originalBackground = ctx.fillStyle;
        // Set white background
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Generate image
        const link = document.createElement("a");
        link.href = chart.toBase64Image();
        link.download = filename;
        link.click();
        // Restore the original canvas state
        ctx.restore();
        ctx.fillStyle = originalBackground;
        chart.update(); // Ensure chart is redrawn correctly
    } else if (type === "csv") {
        const labels = chart.data.labels;
        const datasets = chart.data.datasets;
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

// Draw chart functions
function drawAnalyticsChart(data) {
    if (analyticsChart) analyticsChart.destroy();
    const ctx = document.getElementById("analyticsChart")?.getContext("2d");
    if (!ctx) return;
    analyticsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(d => t(d.locationName || "Unknown")),
            datasets: [
                {
                    label: t("Views"),
                    data: (data || []).map(d => d.viewCount || 0),
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
                {
                    label: t("Interactions"),
                    data: (data || []).map(d => d.interactionCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
                {
                    label: t("Favorites"),
                    data: (data || []).map(d => d.favoriteCount || 0),
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("Destination Analytics") },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: t("Count") },
                    ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) },
                },
                x: {
                    title: { display: true, text: t("Destinations") },
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
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("User Demographics (Location – Hometown – Age Group)") },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const location = context[0].label;
                            const hometown = (data || []).find(d => t(d.locationName || "Unknown") === location)?.hometown || t("N/A");
                            return `${location} (${t("Users from")} ${hometown})`;
                        },
                        label: (context) => `${t("Age Group")}: ${context.dataset.label} - ${t("User Count")}: ${context.parsed.y}`,
                    },
                },
            },
            scales: {
                x: { stacked: true, title: { display: true, text: t("Location") }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
                y: { stacked: true, beginAtZero: true, title: { display: true, text: t("User Count") }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
            },
        },
    });
    if (Array.isArray(data) && data.length) {
        const locations = [...new Set(data.map(item => t(item.locationName || "Unknown")))];
        const ageGroups = [...new Set(data.map(item => t(item.ageGroup || "Unknown")))];
        const colorArr = [
            "rgba(255,99,132,0.7)", "rgba(54,162,235,0.7)", "rgba(255,206,86,0.7)",
            "rgba(75,192,192,0.7)", "rgba(153,102,255,0.7)", "rgba(255,159,64,0.7)",
        ];
        const datasets = ageGroups.map((age, idx) => ({
            label: age,
            data: locations.map(location =>
                data.filter(d => t(d.locationName || "Unknown") === location && t(d.ageGroup || "Unknown") === age)
                    .reduce((sum, d) => sum + (d.userCount || 0), 0)
            ),
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
            labels: (data || []).map(d => t(d.locationName || "Unknown")),
            datasets: [
                {
                    label: t("Interactions"),
                    data: (data || []).map(d => d.interactionCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.7)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("Top Interacted Destinations") },
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t("Interactions") }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
                x: { title: { display: true, text: t("Top Destinations") }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
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
            labels: (data || []).map(d => t(d.locationName || "Unknown")),
            datasets: [
                {
                    label: t("Favorites"),
                    data: (data || []).map(d => d.favoriteCount || 0),
                    backgroundColor: "rgba(255, 99, 132, 0.7)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("Top Favorited Destinations") },
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t("Favorites") }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
                x: { title: { display: true, text: t("Top Destinations") }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
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
            labels: (data || []).map(d => t(d.locationName || "Unknown")),
            datasets: [
                {
                    label: t("Views"),
                    data: (data || []).map(d => d.viewCount || 0),
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                },
                {
                    label: t("Interactions"),
                    data: (data || []).map(d => d.interactionCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                },
                {
                    label: t("Favorites"),
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
                title: { display: true, text: t("Destination Comparison") }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t("Count") } },
                x: { title: { display: true, text: t("Compared Destinations") }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
            }
        }
    });
}

// Refresh functions with caching
async function fetchWithCache(url, cacheKey) {
    if (chartDataCache.has(cacheKey)) {
        logDebug(`Cache hit for ${cacheKey}`);
        return chartDataCache.get(cacheKey);
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        chartDataCache.set(cacheKey, data);
        return data;
    } catch (error) {
        logDebug(`Fetch error for ${cacheKey}`, error);
        throw error;
    }
}

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
    const url = `${destinationApi}stats-overview?timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    const cacheKey = `analytics_${timeRangeForApi}_${startDate}_${endDate}`;
    try {
        const raw = await fetchWithCache(url, cacheKey);
        const arr = (raw.data?.destinationDetails) ? raw.data.destinationDetails : [];
        if (!arr.length && showAlert) showTimedAlert(t("Warning"), t("No analytics data found"), "warning", 1000);
        stats = raw.data;
        drawAnalyticsChart(arr);
        if (arr.length && showAlert) showTimedAlert(t("Success!"), t("Analytics chart refreshed"), "success", 1000);
    } catch (error) {
        drawAnalyticsChart([]);
        logDebug("Analytics refresh error", error);
        if (showAlert) showTimedAlert(t("Error"), t("Failed to refresh analytics data"), "error", 1000);
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
    const url = `${destinationApi}stats-getUserDemographics?timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    const cacheKey = `demographics_${timeRangeForApi}_${startDate}_${endDate}`;
    try {
        const raw = await fetchWithCache(url, cacheKey);
        const arr = raw.data || [];
        if (!arr.length && showAlert) showTimedAlert(t("Warning"), t("No demographics data found"), "warning", 1000);
        demographics = arr;
        drawDemographicsChart(arr);
        if (arr.length && showAlert) showTimedAlert(t("Success!"), t("Demographics chart refreshed"), "success", 1000);
    } catch (error) {
        drawDemographicsChart([]);
        logDebug("Demographics refresh error", error);
        if (showAlert) showTimedAlert(t("Error"), t("Failed to refresh demographics data"), "error", 1000);
    }
}

async function refreshTopViewsChart(showAlert = true) {
    const selectedValue = document.getElementById("topViewsTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(selectedValue);
    let startDate = document.getElementById("topViewsStartDate")?.value || "";
    let endDate = document.getElementById("topViewsEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    const url = `${destinationApi}stats-getTopViewsDestinations?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    const cacheKey = `topViews_${timeRangeForApi}_${startDate}_${endDate}`;
    try {
        const raw = await fetchWithCache(url, cacheKey);
        const views = raw.data || [];
        if (!views.length && showAlert) showTimedAlert(t("Warning"), t("No data found"), "warning", 1000);
        topViews = views;
        drawTopInteractionChart(views);
        if (views.length && showAlert) showTimedAlert(t("Success!"), t("Top Views refreshed"), "success", 1000);
 EQUAL
    } catch (error) {
        drawTopInteractionChart([]);
        logDebug("Top Views refresh error", error);
        if (showAlert) showTimedAlert(t("Error"), t("Failed to refresh top views"), "error", 1000);
    }
}

async function refreshTopFavoritesChart(showAlert = true) {
    const selectedValue = document.getElementById("topFavoritesTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(selectedValue);
    let startDate = document.getElementById("topFavoritesStartDate")?.value || "";
    let endDate = document.getElementById("topFavoritesEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    const url = `${destinationApi}stats-getTopFavoritesDestinations?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    const cacheKey = `topFavorites_${timeRangeForApi}_${startDate}_${endDate}`;
    try {
        const raw = await fetchWithCache(url, cacheKey);
        const favs = raw.data || [];
        if (!favs.length && showAlert) showTimedAlert(t("Warning"), t("No data found"), "warning", 1000);
        topFavorites = favs;
        drawTopFavoritesChart(favs);
        if (favs.length && showAlert) showTimedAlert(t("Success!"), t("Top Favorites refreshed"), "success", 1000);
    } catch (error) {
        drawTopFavoritesChart([]);
        logDebug("Top Favorites refresh error", error);
        if (showAlert) showTimedAlert(t("Error"), t("Failed to refresh top favorites"), "error", 1000);
    }
}

async function refreshCompareDestinationsChart(selectedIds, showAlert = true) {
    const timeRangeValue = document.getElementById("compareTimeRange")?.value || "month";
    const timeRangeForApi = getApiTimeRange(timeRangeValue);
    let startDate = document.getElementById("compareStartDate")?.value || "";
    let endDate = document.getElementById("compareEndDate")?.value || "";
    if (timeRangeForApi === 'day' && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    }
    if (!selectedIds || selectedIds.length === 0) {
        drawCompareDestinationsChart([]);
        if (showAlert) showTimedAlert(t("Warning"), t("Please choose at least one destination"), "warning", 1000);
        return;
    }
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${destinationApi}stats-compare?` +
        selectedIds.map(id => `destinationIds=${encodeURIComponent(id)}`).join("&") +
        `&timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    const cacheKey = `compare_${selectedIds.join('_')}_${timeRangeForApi}_${startDate}_${endDate}`;
    try {
        const { data = [] } = await fetchWithCache(url, cacheKey);
        compareDestinations = Array.isArray(data) ? data : [];
        drawCompareDestinationsChart(compareDestinations);
        if (!compareDestinations.length && showAlert)
            showTimedAlert(t("Warning"), t("No data found"), "warning", 1000);
        else if (showAlert)
            showTimedAlert(t("Success!"), t("Comparison chart refreshed"), "success", 1000);
    } catch (error) {
        drawCompareDestinationsChart([]);
        logDebug("Compare Destinations refresh error", error);
        if (showAlert) showTimedAlert(t("Error"), t("Failed to refresh comparison data"), "error", 1000);
    }
}

// Initialize charts
function initializeCharts() {
    refreshAnalyticsChart(false);
    refreshDemographicsChart(false);
    refreshTopViewsChart(false);
    refreshTopFavoritesChart(false);
    drawCompareDestinationsChart([]);
    isInitialLoad = false;
}

// Consolidated DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
    // Initialize multiselect dropdown if needed
    const compareSelect = document.getElementById("compareDestinationsSelect");
    if (compareSelect && typeof multiselect === "function") {
        multiselect({
            element: compareSelect,
            maxItems: 5,
            search: true,
            selectAll: true
        });
    }

    initializeCharts();

    // Analytics Chart
    document.getElementById("analyticsRefreshChart")?.addEventListener("click", () => refreshAnalyticsChart(true));
    document.getElementById("analyticsResetFilter")?.addEventListener("click", () => {
        document.getElementById("analyticsTimeRange").value = "month";
        document.getElementById("analyticsStartDate").value = "";
        document.getElementById("analyticsEndDate").value = "";
        refreshAnalyticsChart(false);
    });
    document.getElementById("analyticsDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("analyticsDownloadType")?.value || "png";
        downloadChart(analyticsChart, "destination_analytics.png", type);
    });

    // Demographics Chart
    document.getElementById("demographicsRefreshChart")?.addEventListener("click", () => refreshDemographicsChart(true));
    document.getElementById("demographicsResetFilter")?.addEventListener("click", () => {
        document.getElementById("demographicsTimeRange").value = "month";
        document.getElementById("demographicsStartDate").value = "";
        document.getElementById("demographicsEndDate").value = "";
        refreshDemographicsChart(false);
    });
    document.getElementById("demographicsDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("demographicsDownloadType")?.value || "png";
        downloadChart(demographicsChart, "demographics_chart.png", type);
    });

    // Top Views Chart
    document.getElementById("topViewsRefresh")?.addEventListener("click", () => refreshTopViewsChart(true));
    document.getElementById("topViewsReset")?.addEventListener("click", () => {
        document.getElementById("topViewsTimeRange").value = "month";
        document.getElementById("topViewsStartDate").value = "";
        document.getElementById("topViewsEndDate").value = "";
        refreshTopViewsChart(false);
    });
    document.getElementById("topInteractionDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("topInteractionDownloadType")?.value || "png";
        downloadChart(topInteractionChart, "top_interactions.png", type);
    });

    // Top Favorites Chart
    document.getElementById("topFavoritesRefresh")?.addEventListener("click", () => refreshTopFavoritesChart(true));
    document.getElementById("topFavoritesReset")?.addEventListener("click", () => {
        document.getElementById("topFavoritesTimeRange").value = "month";
        document.getElementById("topFavoritesStartDate").value = "";
        document.getElementById("topFavoritesEndDate").value = "";
        refreshTopFavoritesChart(false);
    });
    document.getElementById("topFavoritesDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("topFavoritesDownloadType")?.value || "png";
        downloadChart(topFavoritesChart, "top_favorites.png", type);
    });

    // Compare Destinations Chart
    document.getElementById("compareDestinationsBtn")?.addEventListener("click", () => {
        const select = document.getElementById("compareDestinationsSelect");
        const selectedIds = Array.from(select?.selectedOptions || []).map(option => option.value);
        refreshCompareDestinationsChart(selectedIds, true);
    });
    document.getElementById("compareDestinationsReset")?.addEventListener("click", () => {
        const select = document.getElementById("compareDestinationsSelect");
        if (select) {
            // Deselect all options
            Array.from(select.options).forEach(option => option.selected = false);
            // Trigger change event to update multiselect UI
            select.dispatchEvent(new Event('change'));
        }
        document.getElementById("compareTimeRange").value = "month";
        document.getElementById("compareStartDate").value = "";
        document.getElementById("compareEndDate").value = "";
        compareDestinations = [];
        drawCompareDestinationsChart([]);
        showTimedAlert(t("Success!"), t("Filters and selections have been reset"), "success", 1000);
    });
    document.getElementById("compareDestinationsDownloadChartBtn")?.addEventListener("click", () => {
        const type = document.getElementById("compareDestinationsDownloadType")?.value || "png";
        downloadChart(compareDestinationsChart, "destination_comparison.png", type);
    });

    // Language Change Event
    window.addEventListener('languageChanged', () => {
        console.log("Destination dashboard: Language changed event detected, refreshing all charts...");
        // Clear cache on language change to ensure translated labels are updated
        chartDataCache.clear();
        refreshAnalyticsChart(false);
        refreshDemographicsChart(false);
        refreshTopViewsChart(false);
        refreshTopFavoritesChart(false);
        const select = document.getElementById("compareDestinationsSelect");
        const selectedIds = Array.from(select?.selectedOptions || []).map(option => option.value);
        if (selectedIds.length > 0) {
            refreshCompareDestinationsChart(selectedIds, false);
        } else {
            drawCompareDestinationsChart([]);
        }
    });
});