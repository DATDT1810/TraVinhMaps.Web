$(document).ready(function () {
  // Cập nhật nút delete/restore và STT khi load trang
  $("#basic-9 tbody tr").each(function (index) {
    const row = $(this);
    const statusText = row.find("span.badge").text().trim();
    row.find("td:first").text(index + 1); // STT

    if (statusText === "Active") {
      row.find(".delete").show();
      row.find(".restore").hide();
    } else {
      row.find(".delete").hide();
      row.find(".restore").show();
    }
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
            __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val(),
          },
          success: function (res) {
            if (res.success) {
              showTimedAlert("Deleted!", res.message, "success", 1000);
              const row = $(`tr[data-admin-id="${id}"]`);
              row.find("span.badge").removeClass("badge-light-primary").addClass("badge-light-danger").text("Inactive");
              row.find(".delete").hide();
              row.find(".restore").show();

              if ($("#statusFilter").val() === "active") {
                row.hide();
              }

              // Cập nhật STT
              let stt = 1;
              $("#basic-9 tbody tr:visible").each(function () {
                $(this).find("td:first").text(stt++);
              });

              // Kiểm tra bảng rỗng
              const visibleRows = $("#basic-9 tbody tr:visible");
              $("#basic-9 tbody .empty-message-row").remove();
              if (visibleRows.length === 0) {
                $("#basic-9 tbody").append(`<tr class="empty-message-row"><td colspan="7" class="text-center">No matching records found</td></tr>`);
              }
            } else {
              showTimedAlert("Delete failed!", res.message, "error", 1000);
            }
          },
          error: function () {
            showTimedAlert("Delete failed!", "There was an error deleting the admin", "error", 1000);
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
            __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val(),
          },
          success: function (res) {
            if (res.success) {
              showTimedAlert("Restored!", res.message, "success", 1000);
              const row = $(`tr[data-admin-id="${id}"]`);
              row.find("span.badge").removeClass("badge-light-danger").addClass("badge-light-primary").text("Active");
              row.find(".delete").show();
              row.find(".restore").hide();

              if ($("#statusFilter").val() === "inactive") {
                row.hide();
              }

              // Cập nhật STT
              let stt = 1;
              $("#basic-9 tbody tr:visible").each(function () {
                $(this).find("td:first").text(stt++);
              });

              // Kiểm tra bảng rỗng
              const visibleRows = $("#basic-9 tbody tr:visible");
              $("#basic-9 tbody .empty-message-row").remove();
              if (visibleRows.length === 0) {
                $("#basic-9 tbody").append(`<tr class="empty-message-row"><td colspan="7" class="text-center">No matching records found</td></tr>`);
              }
            } else {
              showTimedAlert("Restore failed!", res.message, "error", 1000);
            }
          },
          error: function () {
            showTimedAlert("Restore failed!", "There was an error restoring the admin.", "error", 1000);
          },
        });
      }
    });
  });

  // Status filter (Active, Inactive)
  $("#statusFilter").on("change", function () {
    const value = $(this).val();
    let stt = 1;

    $("#basic-9 tbody tr").each(function () {
      const row = $(this);
      const statusText = row.find("span.badge").text().trim();

      if ((value === "active" && statusText === "Active") || (value === "inactive" && statusText === "Inactive")) {
        row.show();
        row.find("td:first").text(stt++);
      } else {
        row.hide();
      }
    });

    // Kiểm tra bảng rỗng
    const visibleRows = $("#basic-9 tbody tr:visible");
    $("#basic-9 tbody .empty-message-row").remove();
    if (visibleRows.length === 0) {
      $("#basic-9 tbody").append(`<tr class="empty-message-row"><td colspan="7" class="text-center">No matching records found</td></tr>`);
    }
  });

  // Khi trang load, mặc định filter ở "Active"
  $("#statusFilter").val("active").trigger("change");
});
