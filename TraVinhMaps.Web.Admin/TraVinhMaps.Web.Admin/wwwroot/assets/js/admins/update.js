$(document).ready(function () {
  const table = $("#project-status").DataTable({
    paging: true,
    ordering: true,
    info: true,
    searching: true,
    columnDefs: [
      {
        targets: 0,
        searchable: false,
        orderable: false,
      },
      {
        // Cột Status
        targets: 3,
        render: (data, type) => {
          if (type === "filter" || type === "sort") {
            return $("<div>").html(data).text().trim();
          }
          return data;
        },
      },
    ],
  });

  // Custom filter logic (Đặt filter sớm hơn)
  $.fn.dataTable.ext.search.push((settings, data) => {
    const filter = $("#statusFilter").val(); // all | inactive | active
    const status = (data[3] || "").trim();

    if (filter === "inactive") {
      return status === "Inactive" || status === "Không hoạt động";
    }
    if (filter === "active") {
      return status === "Active" || status === "Hoạt động";
    }
    return true; // all
  });

  // Đảm bảo vẽ lại STT đúng khi sort/search/draw
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

  // BỘ LỌC COMBOBOX (Đặt sau filter logic)
  $("#statusFilter").on("change", () => {
    table.page(0).draw(false); // Fix lỗi phân trang sai sau khi đổi filter
  });

  // Mặc định chọn "active"
  $("#statusFilter").val("active").trigger("change");

  // Hàm cập nhật giao diện hàng
  function updateRow(row, isActive, id) {
    const statusSpan = row.find("td:eq(3) span");
    const actionCell = row.find("td:last-child ul.action");

    const currentText = statusSpan.text().toLowerCase().trim();
    let statusText;

    if (currentText === "hoạt động" || currentText === "không hoạt động") {
      statusText = isActive ? "Hoạt động" : "Không hoạt động";
    } else {
      statusText = isActive ? "Active" : "Inactive";
    }

    statusSpan
      .text(statusText)
      .removeClass("badge-light-danger badge-light-primary")
      .addClass(isActive ? "badge-light-primary" : "badge-light-danger");

    if (isActive) {
      actionCell.find(".restore-admin").replaceWith(`
        <a class="delete delete-admin" href="javascript:void(0)" data-id="${id}" title="Delete">
          <i class="fa fa-trash"></i>
        </a>
      `);
    } else {
      actionCell.find(".delete-admin").replaceWith(`
        <a class="restore restore-admin" href="javascript:void(0)" data-id="${id}" title="Restore">
          <i class="fa fa-undo"></i>
        </a>
      `);
    }

    // Xoá row hiện tại nếu không còn phù hợp với filter → rồi vẽ lại
    table.row(row).remove();

    setTimeout(() => {
      table.draw(false);
    }, 100);
  }

  // Delete admin
  $(document).on("click", ".delete-admin", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to delete this admin?",
      "Delete",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: "/Admin/Delete",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: function (response) {
          if (response.success) {
            updateRow(row, false, id);
            showTimedAlert("Success!", response.message, "success", 1000);
          } else {
            showTimedAlert("Error!", response.message, "error", 1000);
          }
        },
        error: function (xhr) {
          showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
        },
      });
    });
  });

  // Restore admin
  $(document).on("click", ".restore-admin", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to restore this admin?",
      "Restore",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: "/Admin/Restore",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: function (response) {
          if (response.success) {
            updateRow(row, true, id);
            showTimedAlert("Success!", response.message, "success", 1000);
          } else {
            showTimedAlert("Error!", response.message, "error", 1000);
          }
        },
        error: function (xhr) {
          showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
        },
      });
    });
  });
});
