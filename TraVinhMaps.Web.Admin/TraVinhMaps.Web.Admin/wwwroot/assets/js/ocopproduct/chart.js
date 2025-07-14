// Global variables for chart data
let myAnalyticsChart = null;
let myDemographicsChart = null;
let myTopInteractionChart = null;
let myTopFavoriteChart = null;
let myCompareProductsChart = null;
let isInitialLoad = true;

// OCOP API URL
const ocopApi = "https://localhost:7162/api/OcopProduct/";

// Log utility for debugging
function logDebug(message, data = null) {
    console.log(`[OcopDashboard] ${message}`, data ? data : "");
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
    // Lookup the text in the global translation map. Fallback to the original text if not found.
    return window.translationMapForCharts?.[text] || text;
}
// ========= KẾT THÚC ĐOẠN CODE ÁNH XẠ VÀ DỊCH THUẬT =========


// Validate filter inputs
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

// Download chart (as PNG or CSV)
function downloadChart(chart, filename, type) {
    if (!chart) {
        showTimedAlert(t("Error"), t(`No chart available for download`), "error", 1000);
        return;
    }
    if (type === "png") {
        const canvas = chart.canvas;
        const whiteCanvas = document.createElement("canvas");
        whiteCanvas.width = canvas.width;
        whiteCanvas.height = canvas.height;
        const ctx = whiteCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        const link = document.createElement("a");
        link.href = whiteCanvas.toDataURL("image/png");
        link.download = filename;
        link.click();
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

// Draw Analytics Chart
function drawAnalyticsChart(data) {
    if (myAnalyticsChart) myAnalyticsChart.destroy();
    const ctx = document.getElementById("analyticsChart")?.getContext("2d");
    if (!ctx) return;
    myAnalyticsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [
                { label: t("View Count"), data: (data || []).map(item => item.viewCount || 0), backgroundColor: "rgba(75, 192, 192, 0.2)", borderColor: "rgba(75, 192, 192, 1)", borderWidth: 1 },
                { label: t("Interaction Count"), data: (data || []).map(item => item.interactionCount || 0), backgroundColor: "rgba(153, 102, 255, 0.2)", borderColor: "rgba(153, 102, 255, 1)", borderWidth: 1 },
                { label: t("Favorite Count"), data: (data || []).map(item => item.favoriteCount || 0), backgroundColor: "rgba(255, 159, 64, 0.2)", borderColor: "rgba(255, 159, 64, 1)", borderWidth: 1 },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("OCOP Product Analytics") },
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t("Count") } },
                x: { title: { display: true, text: t("Product Name") }, ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } },
            },
        },
    });
}

// Draw Demographics Chart
function drawDemographicsChart(data) {
    if (myDemographicsChart) myDemographicsChart.destroy();
    const ctx = document.getElementById("demographicsChart")?.getContext("2d");
    if (!ctx) return;
    
    myDemographicsChart = new Chart(ctx, {
        type: "bar",
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: t("OCOP User Demographics (Product – Hometown – Age Group)") },
                tooltip: {
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
                x: { stacked: true, title: { display: true, text: t("Product") }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } },
                y: { stacked: true, beginAtZero: true, title: { display: true, text: t("User Count") } },
            },
        }
    });

    if (Array.isArray(data) && data.length) {
        const products = [...new Set(data.map(item => t(item.productName || "Unknown")))];
        const ageGroups = [...new Set(data.map(item => item.ageGroup || "Unknown"))];
        const colorArr = ["rgba(255,99,132,0.7)", "rgba(54,162,235,0.7)", "rgba(255,206,86,0.7)", "rgba(75,192,192,0.7)", "rgba(153,102,255,0.7)", "rgba(255,159,64,0.7)"];
        
        const datasets = ageGroups.map((age, idx) => ({
            label: t(age),
            data: products.map(product =>
                data.filter(d => t(d.productName) === product && d.ageGroup === age).reduce((sum, d) => sum + (d.userCount || 0), 0)
            ),
            backgroundColor: colorArr[idx % colorArr.length],
            stack: "Stack 0"
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
    myTopInteractionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [{ label: t("Interaction Count"), data: (data || []).map(item => item.interactionCount || 0), backgroundColor: "rgba(54, 162, 235, 0.7)" }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" }, title: { display: true, text: t("Top Interacted OCOP Products") } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t("Interaction Count") } },
                x: { title: { display: true, text: t("Product Name") }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } }
            }
        }
    });
}

// Draw Top Favorite Chart
function drawTopFavoriteChart(data) {
    if (myTopFavoriteChart) myTopFavoriteChart.destroy();
    const ctx = document.getElementById("topFavoriteChart")?.getContext("2d");
    if (!ctx) return;
    myTopFavoriteChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [{ label: t("Favorite Count"), data: (data || []).map(item => item.favoriteCount || 0), backgroundColor: "rgba(255, 206, 86, 0.7)" }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" }, title: { display: true, text: t("Top Favorited OCOP Products") } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t("Favorite Count") } },
                x: { title: { display: true, text: t("Product Name") }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } }
            }
        }
    });
}

// Draw Compare Products Chart
function drawCompareProductsChart(data) {
    if (myCompareProductsChart) myCompareProductsChart.destroy();
    const ctx = document.getElementById("compareProductsChart")?.getContext("2d");
    if (!ctx) return;
    myCompareProductsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => t(item.productName || "Unknown")),
            datasets: [
                { label: t("View Count"), data: (data || []).map(item => item.viewCount || 0), backgroundColor: "rgba(75, 192, 192, 0.2)", borderColor: "rgba(75, 192, 192, 1)", borderWidth: 1 },
                { label: t("Interaction Count"), data: (data || []).map(item => item.interactionCount || 0), backgroundColor: "rgba(153, 102, 255, 0.2)", borderColor: "rgba(153, 102, 255, 1)", borderWidth: 1 },
                { label: t("Favorite Count"), data: (data || []).map(item => item.favoriteCount || 0), backgroundColor: "rgba(255, 159, 64, 0.2)", borderColor: "rgba(255, 159, 64, 1)", borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" }, title: { display: true, text: t("OCOP Product Comparison") } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t("Count") } },
                x: { title: { display: true, text: t("Product Name") }, ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } }
            }
        }
    });
}


// --- CÁC HÀM REFRESH ĐÃ ĐƯỢC CẬP NHẬT ---

async function refreshAnalyticsChart(showAlert = true) {
    const selectedValue = document.getElementById("analyticsTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("analyticsStartDate")?.value || "";
    const endDate = document.getElementById("analyticsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    let url = `${ocopApi}analytics?timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        const arr = raw.data ?? [];
        drawAnalyticsChart(arr);
        if (showAlert) showTimedAlert(t("Success!"), t("Analytics chart refreshed"), "success", 1000);
    } catch (err) {
        drawAnalyticsChart([]);
        logDebug("Analytics refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
    }
}

async function refreshDemographicsChart(showAlert = true) {
    const selectedValue = document.getElementById("demographicsTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("demographicsStartDate")?.value || "";
    const endDate = document.getElementById("demographicsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    let url = `${ocopApi}analytics-userdemographics?timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        const arr = raw.data ?? [];
        drawDemographicsChart(arr);
        if (showAlert) showTimedAlert(t("Success!"), t("Demographics chart refreshed"), "success", 1000);
    } catch (err) {
        drawDemographicsChart([]);
        logDebug("Demographics refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("An error occurred"), "error", 1000);
    }
}

async function refreshTopInteractionChart(showAlert = true) {
    const selectedValue = document.getElementById("topInteractionTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("topInteractionStartDate")?.value || "";
    const endDate = document.getElementById("topInteractionEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    let url = `${ocopApi}analytics-getTopProductsByInteractions?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        const arr = raw.data ?? [];
        drawTopInteractionChart(arr);
        if (showAlert) showTimedAlert(t("Success!"), t("Top Interaction refreshed"), "success", 1000);
    } catch (err) {
        drawTopInteractionChart([]);
        logDebug("Top Interaction refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("Failed to refresh top interaction"), "error", 1000);
    }
}

async function refreshTopFavoriteChart(showAlert = true) {
    const selectedValue = document.getElementById("topFavoriteTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("topFavoriteStartDate")?.value || "";
    const endDate = document.getElementById("topFavoriteEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;

    let url = `${ocopApi}analytics-getTopProductsByFavorites?top=5&timeRange=${encodeURIComponent(timeRangeForApi)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        const arr = raw.data ?? [];
        drawTopFavoriteChart(arr);
        if (showAlert) showTimedAlert(t("Success!"), t("Top Favorite refreshed"), "success", 1000);
    } catch (err) {
        drawTopFavoriteChart([]);
        logDebug("Top Favorite refresh error", err);
        if (showAlert) showTimedAlert(t("Error!"), t("Failed to refresh top favorites"), "error", 1000);
    }
}

async function refreshCompareProductsChart(productIds, showAlert = true) {
    const selectedValue = document.getElementById("compareTimeRange")?.value || "tháng";
    const timeRangeForApi = getApiTimeRange(selectedValue); // Ánh xạ giá trị

    const startDate = document.getElementById("compareStartDate")?.value || "";
    const endDate = document.getElementById("compareEndDate")?.value || "";

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
        drawCompareProductsChart(data.data ?? []);
        if (showAlert) showTimedAlert(t("Success!"), t("Comparison chart refreshed"), "success", 1000);
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
window.initializeOcopDashboard = initializeOcopDashboard;

// Event listeners for buttons and language change
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("analyticsRefreshChart")?.addEventListener("click", () => refreshAnalyticsChart());
    // Thêm các nút reset tương ứng nếu có trong HTML
    // Ví dụ: document.getElementById("analyticsResetFilter")?.addEventListener("click", () => { ... });

    document.getElementById("demographicsRefreshChart")?.addEventListener("click", () => refreshDemographicsChart());
    document.getElementById("topInteractionRefresh")?.addEventListener("click", () => refreshTopInteractionChart());
    document.getElementById("topFavoriteRefresh")?.addEventListener("click", () => refreshTopFavoriteChart());
    document.getElementById("compareProductsBtn")?.addEventListener("click", () => {
        const selectedProductIds = $("#compareProductsSelect").val() || [];
        refreshCompareProductsChart(selectedProductIds);
    });

    // *** LẮNG NGHE SỰ KIỆN THAY ĐỔI NGÔN NGỮ ***
    window.addEventListener('languageChanged', () => {
        console.log("Language changed event detected, refreshing charts...");

        // Tải lại dữ liệu và vẽ lại tất cả các biểu đồ để áp dụng bản dịch mới
        refreshAnalyticsChart(false);
        refreshDemographicsChart(false);
        refreshTopInteractionChart(false);
        refreshTopFavoriteChart(false);

        // Đối với biểu đồ so sánh, truyền lại các ID sản phẩm đã chọn
        const selectedProductIds = $("#compareProductsSelect").val() || [];
        refreshCompareProductsChart(selectedProductIds, false);
    });
});