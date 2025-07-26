// $(document).ready(function () {
//   // Cập nhật nút delete/restore và STT khi load trang
//   $("#basic-9 tbody tr").each(function (index) {
//     const row = $(this);
//     const statusText = row.find("span.badge").text().trim();
//     row.find("td:first").text(index + 1); // STT

//     if (statusText === "Active") {
//       row.find(".delete").show();
//       row.find(".restore").hide();
//     } else {
//       row.find(".delete").hide();
//       row.find(".restore").show();
//     }
//   });

//   // Delete Admin
//   $(document).on("click", ".delete", function () {
//     const id = $(this).data("id");
//     showConfirmAlert(
//       "Are you sure?",
//       "Do you really want to delete this admin?",
//       "Yes, delete it!",
//       "Cancel"
//     ).then((result) => {
//       if (result) {
//         $.ajax({
//           url: "/Admin/Delete",
//           type: "POST",
//           data: {
//             id: id,
//             __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val(),
//           },
//           success: function (res) {
//             if (res.success) {
//               showTimedAlert("Deleted!", res.message, "success", 1000);
//               const row = $(`tr[data-admin-id="${id}"]`);
//               row.find("span.badge").removeClass("badge-light-primary").addClass("badge-light-danger").text("Inactive");
//               row.find(".delete").hide();
//               row.find(".restore").show();

//               if ($("#statusFilter").val() === "active") {
//                 row.hide();
//               }

//               // Cập nhật STT
//               let stt = 1;
//               $("#basic-9 tbody tr:visible").each(function () {
//                 $(this).find("td:first").text(stt++);
//               });

//               // Kiểm tra bảng rỗng
//               const visibleRows = $("#basic-9 tbody tr:visible");
//               $("#basic-9 tbody .empty-message-row").remove();
//               if (visibleRows.length === 0) {
//                 $("#basic-9 tbody").append(`<tr class="empty-message-row"><td colspan="7" class="text-center">No matching records found</td></tr>`);
//               }
//             } else {
//               showTimedAlert("Delete failed!", res.message, "error", 1000);
//             }
//           },
//           error: function () {
//             showTimedAlert("Delete failed!", "There was an error deleting the admin", "error", 1000);
//           },
//         });
//       }
//     });
//   });

//   // Restore Admin
//   $(document).on("click", ".restore", function () {
//     const id = $(this).data("id");
//     showConfirmAlert(
//       "Are you sure?",
//       "Do you want to restore this admin?",
//       "Yes, restore it!",
//       "Cancel"
//     ).then((result) => {
//       if (result) {
//         $.ajax({
//           url: "/Admin/Restore",
//           type: "POST",
//           data: {
//             id: id,
//             __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val(),
//           },
//           success: function (res) {
//             if (res.success) {
//               showTimedAlert("Restored!", res.message, "success", 1000);
//               const row = $(`tr[data-admin-id="${id}"]`);
//               row.find("span.badge").removeClass("badge-light-danger").addClass("badge-light-primary").text("Active");
//               row.find(".delete").show();
//               row.find(".restore").hide();

//               if ($("#statusFilter").val() === "inactive") {
//                 row.hide();
//               }

//               // Cập nhật STT
//               let stt = 1;
//               $("#basic-9 tbody tr:visible").each(function () {
//                 $(this).find("td:first").text(stt++);
//               });

//               // Kiểm tra bảng rỗng
//               const visibleRows = $("#basic-9 tbody tr:visible");
//               $("#basic-9 tbody .empty-message-row").remove();
//               if (visibleRows.length === 0) {
//                 $("#basic-9 tbody").append(`<tr class="empty-message-row"><td colspan="7" class="text-center">No matching records found</td></tr>`);
//               }
//             } else {
//               showTimedAlert("Restore failed!", res.message, "error", 1000);
//             }
//           },
//           error: function () {
//             showTimedAlert("Restore failed!", "There was an error restoring the admin.", "error", 1000);
//           },
//         });
//       }
//     });
//   });

//   // Status filter (Active, Inactive)
//   $("#statusFilter").on("change", function () {
//     const value = $(this).val();
//     let stt = 1;

//     $("#basic-9 tbody tr").each(function () {
//       const row = $(this);
//       const statusText = row.find("span.badge").text().trim();

//       if ((value === "active" && statusText === "Active") || (value === "inactive" && statusText === "Inactive")) {
//         row.show();
//         row.find("td:first").text(stt++);
//       } else {
//         row.hide();
//       }
//     });

//     // Kiểm tra bảng rỗng
//     const visibleRows = $("#basic-9 tbody tr:visible");
//     $("#basic-9 tbody .empty-message-row").remove();
//     if (visibleRows.length === 0) {
//       $("#basic-9 tbody").append(`<tr class="empty-message-row"><td colspan="7" class="text-center">No matching records found</td></tr>`);
//     }
//   });

//   // Khi trang load, mặc định filter ở "Active"
//   $("#statusFilter").val("active").trigger("change");
// });
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

  // Vẽ lại số thứ tự
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

  // BỘ LỌC COMBOBOX
  $("#statusFilter").on("change", () => table.draw());

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

  $("#statusFilter").val("active").trigger("change");

    // Hàm cập nhật lại giao diện hàng
    function updateRow(row, isActive, id) {
        const statusSpan = row.find("td:eq(3) span");
        const actionCell = row.find("td:last-child ul.action");

        // Lấy text hiện tại để xác định ngôn ngữ (Anh/Việt)
        let currentText = statusSpan.text().toLowerCase().trim();
        let statusText;

        if (currentText === "hoạt động" || currentText === "không hoạt động") {
            statusText = isActive ? "Hoạt động" : "Không hoạt động";
        } else {
            statusText = isActive ? "Active" : "Inactive";
        }

        statusSpan.text(statusText)
            .removeClass("badge-light-danger badge-light-primary")
            .addClass(isActive ? "badge-light-primary" : "badge-light-danger");

        if (isActive) {
            actionCell.find(".restore-admin").replaceWith(`
                <a class="delete delete-admin" href="javascript:void(0)" data-id="${id}" title="Delete">
                    <i class="fa fa-trash"></i>
                </a>
            `);
    } else {
      statusSpan
        .text("Inactive")
        .removeClass("badge-light-primary")
        .addClass("badge-light-danger");

      actionCell.find(".delete-admin").replaceWith(`
                <a class="restore restore-admin" href="javascript:void(0)" data-id="${id}" title="Restore">
                    <i class="fa fa-undo"></i>
                </a>
            `);
    }

    table.row(row).invalidate().draw(false);
  }

  // Delete
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

  // Restore
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