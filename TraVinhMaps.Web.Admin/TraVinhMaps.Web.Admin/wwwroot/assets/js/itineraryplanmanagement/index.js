$(document).ready(function () {
  // ---------- 1. DataTable ----------
  const table = $("#basic-9").DataTable({
    destroy: true, // ← key line
    paging: true,
    ordering: true,
    info: true,
    searching: true,
    columnDefs: [
      { targets: 0, searchable: false, orderable: false },
      {
        targets: 4,
        render: (data, type) =>
          type === "filter" || type === "sort"
            ? $("<div>").html(data).text().trim()
            : data,
      },
    ],
  });

  // ---------- 2. Index column (STT) ----------
  table
    .on("order.dt search.dt draw.dt", function () {
      let i = 1;
      table
        .cells(null, 0, { search: "applied", order: "applied" })
        .every(function () {
          this.data(i++);
        });
    })
    .draw();

  // ---------- 3. Status filter ----------
  $("#statusFilter").on("change", () => table.draw());

  if (!$.fn.dataTable.ext.search.some((fn) => fn.name === "statusFilter")) {
    $.fn.dataTable.ext.search.push(function statusFilter(settings, data) {
      const filter = $("#statusFilter").val();
      const status = data[4];
      return filter === "inactive"
        ? status === "Inactive"
        : status === "Active";
    });
  }

  $("#statusFilter").val("active").trigger("change");

  // ---------- 4. Row‑UI helpers (delete / restore) ----------
  function updateRowUI($row, isActive, id) {
    const statusSpan = $row.find("td:eq(4) span");
    const actionCell = $row.find("td:last-child ul.action");

    if (isActive) {
      statusSpan
        .text("Active")
        .removeClass("badge-light-danger")
        .addClass("badge-light-primary");
      actionCell.find(".undelete-eventandfestival").replaceWith(`
                <a class="delete delete-eventandfestival" href="javascript:void(0)" data-id="${id}" title="Delete">
                    <i class="fa fa-trash"></i>
                </a>`);
    } else {
      statusSpan
        .text("Inactive")
        .removeClass("badge-light-primary")
        .addClass("badge-light-danger");
      actionCell.find(".delete-eventandfestival").replaceWith(`
                <a class="restore undelete-eventandfestival" href="javascript:void(0)" data-id="${id}" title="Restore">
                    <i class="fa fa-undo"></i>
                </a>`);
    }

    table.row($row).invalidate().draw(false);
  }

  // ---------- 5. Delete ----------
  $(document).on("click", ".delete-eventandfestival", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const $row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to delete this itinerary plan?",
      "Delete",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;
      $.ajax({
        url: "/Admin/ItineraryPlanManagement/DeleteItineraryPlan",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: (r) =>
          r.success
            ? (updateRowUI($row, false, id),
              showTimedAlert("Success!", r.message, "success", 1000))
            : showTimedAlert("Failed!", r.message, "error", 1000),
        error: (xhr) =>
          showTimedAlert(
            "Error!",
            xhr.responseJSON?.message || "Unknown error",
            "error",
            1000
          ),
      });
    });
  });

  // ---------- 6. Restore ----------
  $(document).on("click", ".undelete-eventandfestival", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const $row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to restore this itinerary plan?",
      "Restore",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;
      $.ajax({
        url: "/Admin/ItineraryPlanManagement/RestoreItineraryPlan",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: (r) =>
          r.success
            ? (updateRowUI($row, true, id),
              showTimedAlert("Success!", r.message, "success", 1000))
            : showTimedAlert("Failed", r.message, "error", 1000),
        error: (xhr) =>
          showTimedAlert(
            "Error!",
            xhr.responseJSON?.message || "Unknown error",
            "error",
            1000
          ),
      });
    });
  });
});

/* ===== Export Itineraries (with location details) ===== */
const sessionId = "@sessionId";

/* --- Helpers --- */
function stripHtml(html) {
  if (!html) return "—";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "—").replace(/\r\n?/g, "\n");
}

/* --- Click handler --- */
$("#itineraryExportBtn").on("click", () => {
  showInfoAlert(
    "Exporting Itineraries",
    "Retrieving all itineraries for export...",
    "OK",
    exportItinerariesToExcel
  );
});

/* --- Core --- */
function exportItinerariesToExcel() {
  $.ajax({
    url: window.apiBaseUrl + "api/ItineraryPlan/GetAllItineraryPlan",
    type: "GET",
    headers: {
      sessionId,
      "X-CSRF-TOKEN": $('input[name="__RequestVerificationToken"]').val()
    }
  })
    .done((res) => {
      const itineraries = Array.isArray(res) ? res : res?.data ?? [];
      if (!itineraries.length) {
        showTimedAlert("Export Warning!", "No itineraries found.", "warning", 1000);
        return;
      }

      buildExcel(itineraries); // Export trực tiếp
    })
    .fail((xhr, status, err) => {
      console.error("Get itineraries failed:", status, err, xhr.responseText);
      showTimedAlert("Export Error!", "Cannot retrieve itineraries.", "error", 1000);
    });
}

/* --- Build & download Excel --- */
function buildExcel(itineraries) {
  try {
    const wb = XLSX.utils.book_new();
    const header = [
      "No.",
      "ID",
      "Itinerary Name",
      "Duration",
      "Location IDs", // ✅ Chỉ giữ lại ID địa điểm
      "Estimated Cost",
      "Status",
      "Created At",
      "Updated At"
    ];
    const data = [header];

    itineraries.forEach((it, idx) => {
      const locationIds = (it.locations || []).join("\n") || "—";

      data.push([
        idx + 1,
        it.id ?? "—",
        stripHtml(it.name) ?? "—",
        it.duration ?? "—",
        locationIds,
        it.estimatedCost ?? "—",
        it.status ? "Active" : "Inactive",
        it.createdAt ? new Date(it.createdAt).toLocaleString() : "—",
        it.updateAt ? new Date(it.updateAt).toLocaleString() : "—"
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [
      { wch: 5 },   // No.
      { wch: 24 },  // ID
      { wch: 40 },  // Name
      { wch: 14 },  // Duration
      { wch: 36 },  // Location IDs
      { wch: 14 },  // Estimated Cost
      { wch: 10 },  // Status
      { wch: 22 },  // Created At
      { wch: 22 }   // Updated At
    ];
    ws["!rows"] = Array.from({ length: data.length }, () => ({ hpt: 24 }));

    XLSX.utils.book_append_sheet(wb, ws, "Itineraries");

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `itineraries_${today}.xlsx`);

    showTimedAlert(
      "Export Successful!",
      `${itineraries.length} itineraries exported.`,
      "success",
      1000
    );
  } catch (err) {
    console.error("Excel creation error:", err);
    showTimedAlert("Export Error", err.message, "error", 1000);
  }
}

