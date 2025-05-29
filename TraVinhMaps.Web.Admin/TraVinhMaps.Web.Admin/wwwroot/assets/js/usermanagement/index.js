$(document).ready(function () {
  /* ========== 1. KHỞI TẠO DATATABLES ========== */
  const table = $("#project-status").DataTable({
    paging: true,
    ordering: true,
    info: true,
    searching: true,
    columnDefs: [
      {
        // Cột Status
        targets: 4,
        render: (data, type) => {
          if (type === "filter" || type === "sort") {
            return $("<div>").html(data).text().trim(); // Bóc text từ HTML
          }
          return data; // Giữ nguyên badge khi hiển thị
        },
      },
    ],
  });

  /* ========== 2. BỘ LỌC THEO COMBOBOX ========== */
  $("#statusFilter").on("change", () => table.draw());

  // Hàm filter
  $.fn.dataTable.ext.search.push((settings, data) => {
    const filter = $("#statusFilter").val(); // all | inactive
    const status = data[4]; // Text thuần nhờ render

    if (filter === "inactive") return status === "Inactive";
    return status === "Active"; // "all" chỉ hiển thị Active
  });

  $("#statusFilter").val("all").trigger("change"); // Mặc định

  /* ========== 3. HÀM CẬP NHẬT 1 HÀNG ========== */
  function updateRow(row, isActive) {
    const statusSpan = row.find("td:eq(4) span");
    if (isActive) {
      statusSpan
        .text("Active")
        .removeClass("badge-light-danger")
        .addClass("badge-light-primary");
    } else {
      statusSpan
        .text("Inactive")
        .removeClass("badge-light-primary")
        .addClass("badge-light-danger");
    }
    table.row(row).invalidate().draw(false); // Giữ nguyên trang
  }

  /* ========== 4. AJAX BAN ========== */
  $(document).on("click", ".ban-user", function (e) {
    e.preventDefault();
    const userId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to ban this user?",
      "Ban",
      "Cancel"
    ).then((ok) => {
      if (!ok) return;
      $.ajax({
        url: "/Admin/UserManagement/Delete",
        method: "POST",
        data: { id: userId },
        headers: { RequestVerificationToken: token },
        success: ({ success, message }) => {
          if (success) {
            const row = $(this).closest("tr"); // Lấy hàng chứa nút ban
            // Cập nhật nút Ban -> Unban
            const banBtn = row.find(".ban-user");
            banBtn
              .removeClass("ban-user delete")
              .addClass("unban-user restore")
              .attr("title", "Unban");

            banBtn.find("i").removeClass("fa-ban").addClass("fa-unlock");

            if (banBtn.find("i").length === 0) {
              banBtn.html('<i class="fa fa-unlock"></i>');
            }

            // Cập nhật trạng thái sang Inactive
            updateRow(row, false);
            showTimedAlert("Success!", message, "success", 3000);
          } else {
            showTimedAlert("Failed!", message, "error", 3000);
          }
        },
        error: (xhr) => {
          showErrorAlert(
            "Error",
            "An error occurred while banning the user: " +
              (xhr.responseJSON?.message || "Unknown error")
          );
        },
      });
    });
  });

  /* ========== 5. AJAX UNBAN ========== */
  $(document).on("click", ".unban-user", function (e) {
    e.preventDefault();
    const userId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to unban this user?",
      "Unban",
      "Cancel"
    ).then((ok) => {
      if (!ok) return;
      $.ajax({
        url: "/Admin/UserManagement/Restore",
        method: "POST",
        data: { id: userId },
        headers: { RequestVerificationToken: token },
        success: ({ success, message }) => {
          if (success) {
            const row = $(this).closest("tr"); // Lấy hàng chứa nút unban
            // Cập nhật nút Unban -> Ban
            const unbanBtn = row.find(".unban-user");
            unbanBtn
              .removeClass("unban-user restore")
              .addClass("ban-user delete")
              .attr("title", "Ban");

            // Cập nhật icon bên trong
            unbanBtn.find("i").removeClass("fa-unlock").addClass("fa-ban");

            // Nếu icon không có sẵn, thay bằng inner HTML
            if (unbanBtn.find("i").length === 0) {
              unbanBtn.html('<i class="fa fa-ban"></i>');
            }

            // Cập nhật trạng thái sang Active
            updateRow(row, true);
            showTimedAlert("Success!", message, "success", 3000);
          } else {
            showTimedAlert("Failed!", message, "error", 3000);
          }
        },
        error: (xhr) => {
          showErrorAlert(
            "Error",
            "An error occurred while unbanning the user: " +
              (xhr.responseJSON?.message || "Unknown error")
          );
        },
      });
    });
  });
});
