$(document).ready(function () {
  // Hàm cập nhật hiển thị nút delete/restore theo trạng thái
  function updateActionButtons(row) {
    const statusText = row.find("span.badge").text().trim();
    if (statusText === "Active") {
      row.find(".delete").show();
      row.find(".restore").hide();
    } else {
      row.find(".delete").hide();
      row.find(".restore").show();
    }
  }

  // Hàm kiểm tra và hiển thị thông báo nếu bảng trống
  function checkEmptyTable() {
    const visibleRows = $("#basic-9 tbody tr:visible");
    const tbody = $("#basic-9 tbody");

    // Xóa dòng thông báo cũ nếu có
    tbody.find(".empty-message-row").remove();

    if (visibleRows.length === 0) {
      tbody.append(`
                <tr class="empty-message-row">
                    <td colspan="7" class="text-center">No matching records found</td>
                </tr>
            `);
    }
  }

  // Khi load trang, cập nhật action buttons cho tất cả các dòng
  $("#basic-9 tbody tr").each(function () {
    updateActionButtons($(this));
  });

  // Delete Admin
  $(document).on("click", ".delete", function () {
    const id = $(this).data("id");
    showConfirmAlert(
      "Are you sure?",
      "Do you really want to delete this admin?",
      "Yes, delete it!",
      "Cancel"
    ).then((result) => {
      if (result) {
        $.ajax({
          url: "/Admin/Delete",
          type: "POST",
          data: {
            id: id,
            __RequestVerificationToken: $(
              'input[name="__RequestVerificationToken"]'
            ).val(),
          },
          success: function (res) {
            if (res.success) {
              showTimedAlert("Deleted!", res.message, "success", 3000);
              const row = $(`tr[data-admin-id="${id}"]`);
              row
                .find("span.badge")
                .removeClass("badge-light-primary")
                .addClass("badge-light-danger")
                .text("Inactive");
              updateActionButtons(row);
              if ($("#statusFilter").val() === "active") {
                row.hide();
                checkEmptyTable();
              }
            } else {
              showTimedAlert("Delete failed!", res.message, "error", 3000);
            }
          },
          error: function () {
            showTimedAlert(
              "Delete failed!",
              "There was an error deleting the admin",
              "error",
              3000
            );
          },
        });
      }
    });
  });

  // Restore Admin
  $(document).on("click", ".restore", function () {
    const id = $(this).data("id");
    showConfirmAlert(
      "Are you sure?",
      "Do you want to restore this admin?",
      "Yes, restore it!",
      "Cancel"
    ).then((result) => {
      if (result) {
        $.ajax({
          url: "/Admin/Restore",
          type: "POST",
          data: {
            id: id,
            __RequestVerificationToken: $(
              'input[name="__RequestVerificationToken"]'
            ).val(),
          },
          success: function (res) {
            if (res.success) {
              showTimedAlert("Restored!", res.message, "success", 3000);
              const row = $(`tr[data-admin-id="${id}"]`);
              row
                .find("span.badge")
                .removeClass("badge-light-danger")
                .addClass("badge-light-primary")
                .text("Active");
              updateActionButtons(row);
              if ($("#statusFilter").val() === "inactive") {
                row.hide();
                checkEmptyTable();
              }
            } else {
              showTimedAlert("Restore failed!", res.message, "error", 3000);
            }
          },
          error: function () {
            showTimedAlert(
              "Restore failed!",
              "There was an error restoring the admin.",
              "error",
              3000
            );
          },
        });
      }
    });
  });

  // Status filter (Active, Inactive)
  $("#statusFilter").on("change", function () {
    const value = $(this).val();
    $("#basic-9 tbody tr").each(function () {
      const statusText = $(this).find("span.badge").text().trim();
      if (value === "active" && statusText === "Active") {
        $(this).show();
      } else if (value === "inactive" && statusText === "Inactive") {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
    checkEmptyTable();
  });

  // Khi trang load, mặc định filter ở "Active"
  $("#statusFilter").val("active").trigger("change");
});
