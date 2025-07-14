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

// ========= BẮT ĐẦU ĐOẠN CODE ÁNH XẠ VÀ DỊCH THUẬT =========

// 1. TẠO ĐỐI TƯỢNG ÁNH XẠ (TỪ ĐIỂN)
// Ánh xạ các giá trị "value" từ tiếng Việt trong HTML sang tiếng Anh mà API yêu cầu.
const timeRangeMap = {
    'ngày': 'day',
    'tuần': 'week',
    'tháng': 'month',
    'năm': 'year',
    'all': 'all' // Giữ nguyên cho các trường hợp khác
};

// 2. HÀM TRỢ GIÚP LẤY GIÁ TRỊ TIẾNG ANH
// Hàm này sẽ nhận giá trị tiếng Việt và trả về giá trị tiếng Anh tương ứng.
function getApiTimeRange(vietnameseValue) {
    // Nếu tìm thấy giá trị trong map, trả về giá trị tiếng Anh.
    // Nếu không, trả về chính giá trị gốc (giúp code an toàn hơn).
    return timeRangeMap[vietnameseValue] || vietnameseValue;
}

// 3. HÀM DỊCH THUẬT (Giữ nguyên của bạn)
function t(text) {
    // Tra cứu văn bản trong bản đồ dịch thuật toàn cục. Quay trở lại văn bản gốc nếu không tìm thấy.
    return window.translationMapForCharts?.[text] || text;
}
// ========= KẾT THÚC ĐOẠN CODE ÁNH XẠ VÀ DỊCH THUẬT =========


// Validate filter for all charts (end >= start, start/end <= today)
function validateFilterInputs(startDateStr, endDateStr) {
    const now = new Date();
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

// DRAW CHARTS
// (Các hàm vẽ biểu đồ được giữ nguyên)
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
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("Destination Analytics") },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: t("Count") },
                    ticks: {
                        callback: (value) => (value >= 1000 ? value / 1000 + "k" : value),
                    },
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
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("User Demographics (Location – Hometown – Age Group)") },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const location = context[0].label;
                            const hometown = (data || []).find(d => (d.locationName || "Unknown") === location)?.hometown || "N/A";
                            return `${location} (${t("Users from ")}${hometown})`;
                        },
                        label: (context) => `${t("Age Group: ")}${context.dataset.label} - ${t("User Count: ")}${context.parsed.y}`,
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
        const locations = [...new Set(data.map(item => item.locationName || "Unknown"))];
        const ageGroups = [...new Set(data.map(item => t(item.ageGroup || "Unknown")))];
        const colorArr = [
            "rgba(255,99,132,0.7)", "rgba(54,162,235,0.7)", "rgba(255,206,86,0.7)",
            "rgba(75,192,192,0.7)", "rgba(153,102,255,0.7)", "rgba(255,159,64,0.7)",
        ];
        const datasets = ageGroups.map((age, idx) => ({
            label: age,
            data: locations.map(location => {
                const total = data
                    .filter(d => (d.locationName || "Unknown") === location && t(d.ageGroup || "Unknown") === age)
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
            responsive: true, maintainAspectRatio: false,
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
            labels: (data || []).map(d => d.locationName || "Unknown"),
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
            responsive: true, maintainAspectRatio: false,
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
            labels: (data || []).map(d => d.locationName || "Unknown"),
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
                y: {
                    beginAtZero: true,
                    title: { display: true, text: t("Count") }
                },
                x: {
                    title: { display: true, text: t("Compared Destinations") },
                    ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 }
                },
            }
        }
    });
}

// --- REFRESH/RESET (CÁC HÀM NÀY ĐÃ ĐƯỢC CẬP NHẬT) ---

async function refreshAnalyticsChart(showAlert = true) {
    const selectedValue = document.getElementById("analyticsTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("analyticsStartDate")?.value || "";
    const endDate = document.getElementById("analyticsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    const url = `${destinationApi}stats-overview?timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
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
document.getElementById("analyticsRefreshChart")?.addEventListener("click", () => refreshAnalyticsChart());
document.getElementById("analyticsResetFilter")?.addEventListener("click", () => {
    document.getElementById("analyticsTimeRange").value = "tháng"; // Reset về giá trị tiếng Việt
    document.getElementById("analyticsStartDate").value = "";
    document.getElementById("analyticsEndDate").value = "";
    refreshAnalyticsChart();
});

async function refreshDemographicsChart(showAlert = true) {
    const selectedValue = document.getElementById("demographicsTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("demographicsStartDate")?.value || "";
    const endDate = document.getElementById("demographicsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    const url = `${destinationApi}stats-getUserDemographics?timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
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
document.getElementById("demographicsRefreshChart")?.addEventListener("click", () => refreshDemographicsChart());
document.getElementById("demographicsResetFilter")?.addEventListener("click", () => {
    document.getElementById("demographicsTimeRange").value = "tháng"; // Reset về giá trị tiếng Việt
    document.getElementById("demographicsStartDate").value = "";
    document.getElementById("demographicsEndDate").value = "";
    refreshDemographicsChart();
});

async function refreshTopViewsChart(showAlert = true) {
    const selectedValue = document.getElementById("topViewsTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("topViewsStartDate")?.value || "";
    const endDate = document.getElementById("topViewsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    const url = `${destinationApi}stats-getTopViewsDestinations?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        const views = raw.data || [];
        if (!views.length && showAlert) showTimedAlert(t("Warning"), t("No data found"), "warning", 1000);
        topViews = views;
        drawTopInteractionChart(topViews);
        if (views.length && showAlert) showTimedAlert(t("Success!"), t("Top Views refreshed"), "success", 1000);
    } catch (error) {
        drawTopInteractionChart([]);
        logDebug("Top Views refresh error", error);
        if (showAlert) showTimedAlert(t("Error"), t("Failed to refresh top views"), "error", 1000);
    }
}
document.getElementById("topViewsRefresh")?.addEventListener("click", () => refreshTopViewsChart());
document.getElementById("topViewsReset")?.addEventListener("click", () => {
    document.getElementById("topViewsTimeRange").value = "tháng"; // Reset về giá trị tiếng Việt
    document.getElementById("topViewsStartDate").value = "";
    document.getElementById("topViewsEndDate").value = "";
    refreshTopViewsChart();
});

async function refreshTopFavoritesChart(showAlert = true) {
    const selectedValue = document.getElementById("topFavoritesTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("topFavoritesStartDate")?.value || "";
    const endDate = document.getElementById("topFavoritesEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    const url = `${destinationApi}stats-getTopFavoritesDestinations?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const raw = await response.json();
        const favs = raw.data || [];
        if (!favs.length && showAlert) showTimedAlert(t("Warning"), t("No data found"), "warning", 1000);
        topFavorites = favs;
        drawTopFavoritesChart(topFavorites);
        if (favs.length && showAlert) showTimedAlert(t("Success!"), t("Top Favorites refreshed"), "success", 1000);
    } catch (error) {
        drawTopFavoritesChart([]);
        logDebug("Top Favorites refresh error", error);
        if (showAlert) showTimedAlert(t("Error"), t("Failed to refresh top favorites"), "error", 1000);
    }
}
document.getElementById("topFavoritesRefresh")?.addEventListener("click", () => refreshTopFavoritesChart());
document.getElementById("topFavoritesReset")?.addEventListener("click", () => {
    document.getElementById("topFavoritesTimeRange").value = "tháng"; // Reset về giá trị tiếng Việt
    document.getElementById("topFavoritesStartDate").value = "";
    document.getElementById("topFavoritesEndDate").value = "";
    refreshTopFavoritesChart();
});

async function refreshCompareDestinationsChart(showAlert = true) {
    const selectedIds = $("#compareDestinationsSelect").val() || [];
    const selectedValue = document.getElementById("compareTimeRange")?.value || "all";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("compareStartDate")?.value || "";
    const endDate = document.getElementById("compareEndDate")?.value || "";
    if (!selectedIds.length) {
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
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const { data = [] } = await response.json();
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
document.getElementById("compareDestinationsBtn")?.addEventListener("click", () => refreshCompareDestinationsChart());
document.getElementById("compareDestinationsReset")?.addEventListener("click", () => {
    document.getElementById("compareTimeRange").value = "tháng"; // Reset về giá trị tiếng Việt
    document.getElementById("compareStartDate").value = "";
    document.getElementById("compareEndDate").value = "";
    $("#compareDestinationsSelect").val(null).trigger("change");
    drawCompareDestinationsChart([]);
    showTimedAlert(t("Success!"), t("Filters have been reset"), "success", 1000);
});

function downloadChart(chart, filename, type) {
    if (!chart) { showTimedAlert(t("Error"), t("No chart available for download", { filename }), "error", 1000); return; }
    if (type === "png") {
        const link = document.createElement("a");
        link.href = chart.toBase64Image();
        link.download = filename; link.click();
    } else if (type === "csv") {
        const labels = chart.data.labels;
        const datasets = chart.data.datasets;
        let csv = `\uFEFF"${t('Label')}",` + datasets.map(ds => `"${t(ds.label)}"`).join(",") + "\n";
        labels.forEach((label, idx) => {
            const row = [`"${label}"`];
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
    refreshAnalyticsChart(false);
    refreshDemographicsChart(false);
    refreshTopViewsChart(false);
    refreshTopFavoritesChart(false);
    drawCompareDestinationsChart([]);
    isInitialLoad = false;
}

// Lắng nghe sự kiện DOMContentLoaded để khởi tạo
window.addEventListener("DOMContentLoaded", () => {
    initializeCharts();

    // *** THÊM TRÌNH LẮNG NGHE SỰ KIỆN languageChanged ***
    window.addEventListener('languageChanged', () => {
        console.log("Destination dashboard: Language changed event detected, refreshing all charts...");

        // Vẽ lại tất cả các biểu đồ để áp dụng bản dịch mới
        refreshAnalyticsChart(false);
        refreshDemographicsChart(false);
        refreshTopViewsChart(false);
        refreshTopFavoritesChart(false);

        // Đối với biểu đồ so sánh, cần truyền lại các ID đã chọn
        const selectedIds = $("#compareDestinationsSelect").val() || [];
        // Chuyển `showAlert` thành `false` để không hiện thông báo khi chỉ đổi ngôn ngữ
        refreshCompareDestinationsChart(false, selectedIds);
    });
});