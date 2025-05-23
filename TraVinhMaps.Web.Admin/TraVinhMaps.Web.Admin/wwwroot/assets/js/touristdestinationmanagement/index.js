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
          targets: 4,
          render: (data, type) => {
            if (type === "filter" || type === "sort") {
              return $("<div>").html(data).text().trim(); // Bóc text từ HTML
            }
            return data; // Giữ nguyên badge khi hiển thị
          }
        }
      ]
    });

    /* ========== Vẽ lại số thứ tự No. ========== */
    table.on('order.dt search.dt draw.dt', function () {
    let i = 1;
    table
      .cells(null, 0, { search: 'applied', order: 'applied' })
      .every(function () {
        this.data(i++);
      });
  }).draw();

    /* ========== 2. BỘ LỌC THEO COMBOBOX ========== */
    $("#statusFilter").on("change", () => table.draw());

    // Hàm filter
    $.fn.dataTable.ext.search.push((settings, data) => {
      const filter = $("#statusFilter").val(); // all | inactive
      const status = data[4]; // Text thuần nhờ render

      if (filter === "inactive") return status === "Inactive";
      return status === "Active"; // "all" chỉ hiển thị Active
    });

    $("#statusFilter").val("active").trigger("change"); // Mặc định

    /* ========== 3. HÀM CẬP NHẬT 1 HÀNG ========== */
    function updateRow(row, isActive) {
      const statusSpan = row.find("td:eq(4) span");
      if (isActive) {
        statusSpan.text("Active")
                  .removeClass("badge-light-danger")
                  .addClass("badge-light-primary");
      } else {
        statusSpan.text("Inactive")
                  .removeClass("badge-light-primary")
                  .addClass("badge-light-danger");
      }
      table.row(row).invalidate().draw(false); // Giữ nguyên trang
    }

    // AJAX Ban user with SweetAlert2
    $(document).on("click", ".delete-destination", function (e) {
      e.preventDefault();
      const destinationId = $(this).data("id");
      const token = $('input[name="__RequestVerificationToken"]').val();

      showConfirmAlert(
        "Confirmation",
        "Are you sure you want to delete this destination?",
        "Delete",
        "Cancel"
      ).then((confirmed) => {
        if (confirmed) {
          $.ajax({
            url: "/Admin/TouristDestinationManagement/DeleteDestination",
            method: "POST",
            data: { id: destinationId },
            headers: {
              "RequestVerificationToken": token
            },
            success: function (response) {
              if (response.success) {
                // const row = $(`a[data-id="${destinationId}"]`).closest("tr");
                const row = $('a[data-id="' + destinationId + '"]').closest("tr");
                row
                  .find("td:eq(4) span")
                  .text("Inactive")
                  .removeClass("badge-light-primary")
                  .addClass("badge-light-danger");
                // Update action dropdown from Ban -> Unban
                const actionCell = row.find("td:last-child ul.action");
                actionCell.find(".delete-destination").replaceWith(
                  `<a class="undelete-destination" href="javascript:void(0)" data-id="${destinationId}">
                      <i class="fa fa-unlock"></i> Restore
                  </a>`
                );
                table.row(row).invalidate().draw(false);
                showSuccessAlert("Success", response.message);
              } else {
                showErrorAlert("Failed", response.message);
              }
            },
            error: function (xhr) {
              showErrorAlert(
                "Error",
                "An error occurred while banning the destination: " +
                  (xhr.responseJSON?.message || "Unknown error")
              );
            },
          });
        }
      });
    });

    // AJAX Unban user with SweetAlert2
    $(document).on("click", ".undelete-destination", function (e) {
      e.preventDefault();
      const destinationId = $(this).data("id");
      const token = $('input[name="__RequestVerificationToken"]').val();

      showConfirmAlert(
        "Confirmation",
        "Are you sure you want to restore this destination?",
        "restore",
        "Cancel"
      ).then((confirmed) => {
        if (confirmed) {
          $.ajax({
            url: "/Admin/TouristDestinationManagement/RestoreDestination",
            method: "POST",
            data: { id: destinationId },
            headers: {
              RequestVerificationToken: token,
            },
            success: function (response) {
              if (response.success) {
                // const row = $(`a[data-id="${destinationId}"]`).closest("tr");
                const row = $('a[data-id="' + destinationId + '"]').closest("tr");

                row
                  .find("td:eq(4) span")
                  .text("Active")
                  .removeClass("badge-light-danger")
                  .addClass("badge-light-primary");

                // Update action dropdown from Unban -> Ban
                const actionCell = row.find("td:last-child ul.action");
                actionCell.find(".undelete-destination").replaceWith(
                  `<a class="delete-destination" href="javascript:void(0)" data-id="${destinationId}">
                      <i class="fa fa-ban"></i> Delete
                  </a>`
                );

                table.row(row).invalidate().draw(false);
                showSuccessAlert("Success", response.message);
              } else {
                showErrorAlert("Failed", response.message);
              }
            },
            error: function (xhr) {
              showErrorAlert(
                "Error",
                "An error occurred while unbanning the user: " +
                  (xhr.responseJSON?.message || "Unknown error")
              );
            },
          });
        }
      });
    });
  });
