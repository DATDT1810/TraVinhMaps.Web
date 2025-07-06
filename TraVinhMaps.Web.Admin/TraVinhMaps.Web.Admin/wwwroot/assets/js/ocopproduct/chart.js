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

// Validate filter inputs
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

// Download chart
function downloadChart(chart, filename, type) {
    if (!chart) {
        showTimedAlert("Error", `No ${filename} chart available for download`, "error", 1000);
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
        let csv = "\uFEFFLabel," + datasets.map(ds => escapeCsv(ds.label)).join(",") + "\n";
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
    console.log("Drawing Analytics Chart with:", data);
    if (myAnalyticsChart) myAnalyticsChart.destroy();
    const ctx = document.getElementById("analyticsChart")?.getContext("2d");
    if (!ctx) {
        console.error("Canvas element 'analyticsChart' not found");
        return;
    }
    myAnalyticsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => item.productName || "Unknown"),
            datasets: [
                {
                    label: "View Count",
                    data: (data || []).map(item => item.viewCount || item.ViewCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Interaction Count",
                    data: (data || []).map(item => item.interactionCount || item.InteractionCount || 0),
                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                    borderColor: "rgba(153, 102, 255, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Favorite Count",
                    data: (data || []).map(item => item.favoriteCount || item.FavoriteCount || 0),
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                    borderColor: "rgba(255, 159, 64, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "OCOP Product Analytics" },
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
                    title: { display: true, text: "Product Name" },
                    ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 },
                },
            },
        },
    });
}

// Draw Demographics Chart
function drawDemographicsChart(data) {
    console.log("Drawing Demographics Chart with:", data);
    if (myDemographicsChart) myDemographicsChart.destroy();
    const ctx = document.getElementById("demographicsChart")?.getContext("2d");
    if (!ctx) {
        console.error("Canvas element 'demographicsChart' not found");
        return;
    }
    myDemographicsChart = new Chart(ctx, {
        type: "bar",
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: "OCOP User Demographics (Product – Hometown – Age Group)",
                },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const product = context[0].label;
                            const hometown = (data || []).find(d => d.productName === product)?.hometown || "N/A";
                            return `${product} (Users from ${hometown})`;
                        },
                        label: (context) => {
                            const age = context.dataset.label;
                            const value = context.parsed.y;
                            return `Age Group: ${age} - User Count: ${value}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: "Product" },
                    ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 },
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: "User Count" },
                    ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) }
                },
            },
        },
    });
    if (Array.isArray(data) && data.length) {
        const products = [...new Set(data.map(item => item.productName || "Unknown"))];
        const ageGroups = [...new Set(data.map(item => item.ageGroup || "Unknown"))];
        const colorArr = [
            "rgba(255,99,132,0.7)", "rgba(54,162,235,0.7)", "rgba(255,206,86,0.7)",
            "rgba(75,192,192,0.7)", "rgba(153,102,255,0.7)", "rgba(255,159,64,0.7)"
        ];
        const datasets = ageGroups.map((age, idx) => ({
            label: age,
            data: products.map(product =>
                data
                    .filter(d => d.productName === product && d.ageGroup === age)
                    .reduce((sum, d) => sum + (d.userCount || 0), 0)
            ),
            backgroundColor: colorArr[idx % colorArr.length],
            borderColor: colorArr[idx % colorArr.length].replace("0.7", "1"),
            borderWidth: 1,
            barThickness: 20,
            stack: "Stack 0"
        }));
        myDemographicsChart.data.labels = products;
        myDemographicsChart.data.datasets = datasets;
        myDemographicsChart.update();
    }
}

// Draw Top Interaction Chart
function drawTopInteractionChart(data) {
    console.log("Drawing Top Interaction Chart with:", data);
    if (myTopInteractionChart) myTopInteractionChart.destroy();
    const ctx = document.getElementById("topInteractionChart")?.getContext("2d");
    if (!ctx) {
        console.error("Canvas element 'topInteractionChart' not found");
        return;
    }
    myTopInteractionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => item.productName || "Unknown"),
            datasets: [
                {
                    label: "Interaction Count",
                    data: (data || []).map(item => item.interactionCount || item.InteractionCount || 0),
                    backgroundColor: "rgba(54, 162, 235, 0.7)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                    stack: "Stack 0"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Top Interacted OCOP Products" }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Interaction Count" }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
                x: { title: { display: true, text: "Product Name" }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } }
            }
        }
    });
}

// Draw Top Favorite Chart
function drawTopFavoriteChart(data) {
    console.log("Top Favorite Chart Data:", data);
    if (myTopFavoriteChart) myTopFavoriteChart.destroy();
    const ctx = document.getElementById("topFavoriteChart")?.getContext("2d");
    if (!ctx) {
        console.error("Canvas element 'topFavoriteChart' not found");
        return;
    }
    myTopFavoriteChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => item.productName || "Unknown"),
            datasets: [
                {
                    label: "Favorite Count",
                    data: (data || []).map(item => item.favoriteCount || item.FavoriteCount || 0),
                    backgroundColor: "rgba(255, 206, 86, 0.7)",
                    borderColor: "rgba(255, 206, 86, 1)",
                    borderWidth: 1,
                    barThickness: 20,
                    stack: "Stack 0"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Top Favorited OCOP Products" }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Favorite Count" }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
                x: { title: { display: true, text: "Product Name" }, ticks: { autoSkip: false, maxRotation: 60, minRotation: 30 } }
            }
        }
    });
}

// Draw Compare Products Chart
function drawCompareProductsChart(data) {
    console.log("Drawing Compare Products Chart with:", data);
    if (myCompareProductsChart) myCompareProductsChart.destroy();
    const ctx = document.getElementById("compareProductsChart")?.getContext("2d");
    if (!ctx) {
        console.error("Canvas element 'compareProductsChart' not found");
        return;
    }
    myCompareProductsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data || []).map(item => item.productName || "Unknown"),
            datasets: [
                {
                    label: "View Count",
                    data: (data || []).map(item => item.viewCount || item.ViewCount || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                },
                {
                    label: "Interaction Count",
                    data: (data || []).map(item => item.interactionCount || item.InteractionCount || 0),
                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                    borderColor: "rgba(153, 102, 255, 1)",
                    borderWidth: 1
                },
                {
                    label: "Favorite Count",
                    data: (data || []).map(item => item.favoriteCount || item.FavoriteCount || 0),
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                    borderColor: "rgba(255, 159, 64, 1)",
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "OCOP Product Comparison" }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Count" }, ticks: { callback: (value) => (value >= 1000 ? value / 1000 + "k" : value) } },
                x: { title: { display: true, text: "Product Name" }, ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } }
            }
        }
    });
}

// Refresh Analytics Chart
async function refreshAnalyticsChart(showAlert = true) {
    const timeRange = document.getElementById("analyticsTimeRange")?.value || "month";
    const startDate = document.getElementById("analyticsStartDate")?.value || "";
    const endDate = document.getElementById("analyticsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics?timeRange=${encodeURIComponent(timeRange)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    console.log("Fetching Analytics Data from:", url);
    try {
        document.getElementById("analyticsRefreshChart").disabled = true;
        const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        console.log("Analytics API Response:", raw);
        const arr = raw.data ?? [];
        if (!arr.length) {
            drawAnalyticsChart([]);
            if (showAlert) showTimedAlert("Warning!", "No analytics data found", "warning", 1000);
            return;
        }
        drawAnalyticsChart(arr);
        if (showAlert) showTimedAlert("Success!", "Analytics chart refreshed", "success", 1000);
    } catch (err) {
        logDebug("Analytics refresh error", err);
        if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
    } finally {
        document.getElementById("analyticsRefreshChart").disabled = false;
    }
}

// Refresh Demographics Chart
async function refreshDemographicsChart(showAlert = true) {
    const timeRange = document.getElementById("demographicsTimeRange")?.value || "month";
    const startDate = document.getElementById("demographicsStartDate")?.value || "";
    const endDate = document.getElementById("demographicsEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics-userdemographics?timeRange=${encodeURIComponent(timeRange)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    console.log("Fetching Demographics Data from:", url);
    try {
        document.getElementById("demographicsRefreshChart").disabled = true;
        const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        console.log("Demographics API Response:", raw);
        const arr = raw.data ?? [];
        if (!arr.length) {
            drawDemographicsChart([]);
            if (showAlert) showTimedAlert("Warning!", "No demographics data found", "warning", 1000);
            return;
        }
        drawDemographicsChart(arr);
        if (showAlert) showTimedAlert("Success!", "Demographics chart refreshed", "success", 1000);
    } catch (err) {
        logDebug("Demographics refresh error", err);
        if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
    } finally {
        document.getElementById("demographicsRefreshChart").disabled = false;
    }
}

// Refresh Top Interaction Chart
async function refreshTopInteractionChart(showAlert = true) {
    const timeRange = document.getElementById("topInteractionTimeRange")?.value || "month";
    const startDate = document.getElementById("topInteractionStartDate")?.value || "";
    const endDate = document.getElementById("topInteractionEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics-getTopProductsByInteractions?top=5&timeRange=${encodeURIComponent(timeRange)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    console.log("Fetching Top Interaction Data from:", url);
    try {
        document.getElementById("topInteractionRefresh").disabled = true;
        const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        console.log("Top Interaction API Response:", raw);
        const arr = raw.data ?? [];
        if (!arr.length) {
            drawTopInteractionChart([]);
            if (showAlert) showTimedAlert("Warning!", "No data found", "warning", 1000);
            return;
        }
        drawTopInteractionChart(arr);
        if (showAlert) showTimedAlert("Success!", "Top Interaction refreshed", "success", 1000);
    } catch (err) {
        logDebug("Top Interaction refresh error", err);
        if (showAlert) showTimedAlert("Error!", "Failed to refresh top interaction", "error", 1000);
    } finally {
        document.getElementById("topInteractionRefresh").disabled = false;
    }
}

// Refresh Top Favorite Chart
async function refreshTopFavoriteChart(showAlert = true) {
    const timeRange = document.getElementById("topFavoriteTimeRange")?.value || "month";
    const startDate = document.getElementById("topFavoriteStartDate")?.value || "";
    const endDate = document.getElementById("topFavoriteEndDate")?.value || "";
    if (!validateFilterInputs(startDate, endDate)) return;
    let url = `${ocopApi}analytics-getTopProductsByFavorites?top=5&timeRange=${encodeURIComponent(timeRange)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    console.log("Fetching Top Favorite Data from:", url);
    try {
        document.getElementById("topFavoriteRefresh").disabled = true;
        const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.json();
        console.log("Top Favorite API Response:", raw);
        const arr = raw.data ?? [];
        console.log("Top Favorite Data:", arr);
        if (!arr.length) {
            drawTopFavoriteChart([]);
            if (showAlert) showTimedAlert("Warning!", "No data found", "warning", 1000);
            return;
        }
        drawTopFavoriteChart(arr);
        if (showAlert) showTimedAlert("Success!", "Top Favorite refreshed", "success", 1000);
    } catch (err) {
        logDebug("Top Favorite refresh error", err);
        if (showAlert) showTimedAlert("Error!", "Failed to refresh top favorites", "error", 1000);
    } finally {
        document.getElementById("topFavoriteRefresh").disabled = false;
    }
}

// Refresh Compare Products Chart
// Refresh Compare Products Chart
async function refreshCompareProductsChart(productIds, showAlert = true) {
    logDebug("Refreshing Compare Products Chart", productIds);

    const timeRange = document.getElementById("compareTimeRange")?.value || "month";
    const startDate = document.getElementById("compareStartDate")?.value || "";
    const endDate = document.getElementById("compareEndDate")?.value || "";

    if (!validateFilterInputs(startDate, endDate)) {
        logDebug("Invalid compare products filter inputs");
        return;
    }

    if (!productIds || productIds.length === 0) {
        logDebug("No products selected for comparison");
        if (showAlert)
            showTimedAlert("Warning!", "Please select products to compare", "warning", 1000);
        drawCompareProductsChart([]);
        return;
    }

    // Build URL
    let url = `${ocopApi}analytics-compareproducts?`;
    productIds.forEach((id) => (url += `productIds=${encodeURIComponent(id)}&`));

    if (startDate || endDate) {
        if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
        if (endDate) url += `endDate=${encodeURIComponent(endDate)}&`;
        // Do not include timeRange if custom dates are provided
    } else {
        url += `timeRange=${encodeURIComponent(timeRange)}&`;
    }

    console.log("Fetching Compare Products Data from:", url);

    try {
        const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (res.status === 404) {
            logDebug("No comparison data available");
            if (showAlert)
                showTimedAlert("Warning!", "No data found", "warning", 1000);
            drawCompareProductsChart([]);
            return;
        }
        if (!res.ok) {
            logDebug("API error occurred", res.status);
            if (showAlert)
                showTimedAlert("Error!", "An error occurred", "error", 1000);
            return;
        }

        const data = await res.json();
        console.log("Compare Products API Response:", data);
        drawCompareProductsChart(data.data ?? []);
        if (showAlert)
            showTimedAlert("Success!", "Comparison chart refreshed", "success", 1000);
    } catch (err) {
        logDebug("Compare Products refresh error", err);
        if (showAlert) showTimedAlert("Error!", "An error occurred", "error", 1000);
    }
}


// Initialize Charts
function initializeOcopDashboard(
    analyticsData,
    demographicsData,
    topInteractionData,
    topFavoriteData,
    compareProductsData
) {
    console.log("Initializing OCOP Dashboard");
    if (analyticsData && Array.isArray(analyticsData)) {
        console.log("Drawing Analytics Chart with:", analyticsData);
        drawAnalyticsChart(analyticsData);
    } else {
        refreshAnalyticsChart(false);
    }
    if (demographicsData && Array.isArray(demographicsData)) {
        console.log("Drawing Demographics Chart with:", demographicsData);
        drawDemographicsChart(demographicsData);
    } else {
        refreshDemographicsChart(false);
    }
    if (topInteractionData && Array.isArray(topInteractionData)) {
        console.log("Drawing Top Interaction Chart with:", topInteractionData);
        drawTopInteractionChart(topInteractionData);
    } else {
        refreshTopInteractionChart(false);
    }
    if (topFavoriteData && Array.isArray(topFavoriteData)) {
        console.log("Drawing Top Favorite Chart with:", topFavoriteData);
        drawTopFavoriteChart(topFavoriteData);
    } else {
        console.log("No initial Top Favorite Data, refreshing...");
        refreshTopFavoriteChart(false);
    }
    if (compareProductsData && Array.isArray(compareProductsData)) {
        console.log("Drawing Compare Products Chart with:", compareProductsData);
        drawCompareProductsChart(compareProductsData);
    } else {
        drawCompareProductsChart([]);
    }
    isInitialLoad = false;
}
window.initializeOcopDashboard = initializeOcopDashboard;

// Event Listeners
document.getElementById("analyticsRefreshChart")?.addEventListener("click", () => refreshAnalyticsChart());
document.getElementById("analyticsResetFilter")?.addEventListener("click", () => {
    document.getElementById("analyticsTimeRange").value = "month";
    document.getElementById("analyticsStartDate").value = "";
    document.getElementById("analyticsEndDate").value = "";
    refreshAnalyticsChart();
});
document.getElementById("analyticsDownloadChartBtn")?.addEventListener("click", () => 
    downloadChart(myAnalyticsChart, "ocop_analytics.png", document.getElementById("analyticsDownloadType")?.value || "png"));

document.getElementById("demographicsRefreshChart")?.addEventListener("click", () => refreshDemographicsChart());
document.getElementById("demographicsResetFilter")?.addEventListener("click", () => {
    document.getElementById("demographicsTimeRange").value = "month";
    document.getElementById("demographicsStartDate").value = "";
    document.getElementById("demographicsEndDate").value = "";
    refreshDemographicsChart();
});
document.getElementById("demographicsDownloadChartBtn")?.addEventListener("click", () => 
    downloadChart(myDemographicsChart, "ocop_demographics.png", document.getElementById("demographicsDownloadType")?.value || "png"));

document.getElementById("topInteractionRefresh")?.addEventListener("click", () => refreshTopInteractionChart());
document.getElementById("topInteractionReset")?.addEventListener("click", () => {
    document.getElementById("topInteractionTimeRange").value = "month";
    document.getElementById("topInteractionStartDate").value = "";
    document.getElementById("topInteractionEndDate").value = "";
    refreshTopInteractionChart();
});
document.getElementById("topInteractionDownloadChartBtn")?.addEventListener("click", () => 
    downloadChart(myTopInteractionChart, "ocop_top_interaction.png", document.getElementById("topInteractionDownloadType")?.value || "png"));

document.getElementById("topFavoriteRefresh")?.addEventListener("click", () => refreshTopFavoriteChart());
document.getElementById("topFavoriteReset")?.addEventListener("click", () => {
    document.getElementById("topFavoriteTimeRange").value = "month";
    document.getElementById("topFavoriteStartDate").value = "";
    document.getElementById("topFavoriteEndDate").value = "";
    refreshTopFavoriteChart();
});
document.getElementById("topFavoriteDownloadChartBtn")?.addEventListener("click", () => 
    downloadChart(myTopFavoriteChart, "ocop_top_favorite.png", document.getElementById("topFavoriteDownloadType")?.value || "png"));

document.getElementById("compareProductsBtn")?.addEventListener("click", () => {
    const selectedProductIds = $("#compareProductsSelect").val() || [];
    logDebug("Selected Product IDs", selectedProductIds);
    refreshCompareProductsChart(selectedProductIds);
});
document.getElementById("compareProductsDownloadChartBtn")?.addEventListener("click", () => 
    downloadChart(myCompareProductsChart, "ocop_compare_products.png", document.getElementById("compareProductsDownloadType")?.value || "png"));

// Reset Compare Products Filters
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("compareProductsReset")?.addEventListener("click", () => {
        document.getElementById("compareTimeRange").value = "month";
        document.getElementById("compareStartDate").value = "";
        document.getElementById("compareEndDate").value = "";

        const productSelect = document.getElementById("compareProductsSelect");
        if (productSelect) {
            productSelect.value = null;
            if ($(productSelect).hasClass("select2-hidden-accessible")) {
                $(productSelect).val(null).trigger("change"); // Reset Select2 UI
            }
        }

        drawCompareProductsChart([]); // Clear chart
        showTimedAlert("Success!", "Filters have been reset", "success", 1000);
    });
});
