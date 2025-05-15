$(document).ready(function () {
  var table = $("#project-status").DataTable({
    paging: true,
    ordering: true,
    info: true,
    searching: true,
    columnDefs: [
      {
        targets: 4,
        render: function (data, type, row) {
          if (type === "filter" || type === "sort") {
            return $(data).text();
          }
          return data;
        },
      },
    ],
  });

  // Custom filter for status
  $("#statusFilter").on("change", function () {
    var status = $(this).val();
    if (status === "all") {
      table.column(4).search("").draw();
    } else if (status === "inactive") {
      table.column(4).search("Inactive").draw();
    }
  });

  // AJAX Ban user with SweetAlert2
  $(document).on("click", ".ban-user", function (e) {
    e.preventDefault();
    const userId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to ban this user?",
      "Ban",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        $.ajax({
          url: "/Admin/UserManagement/Delete",
          method: "POST",
          data: { id: userId },
          headers: {
            RequestVerificationToken: token,
          },
          success: function (response) {
            if (response.success) {
              const row = $(`a[data-id="${userId}"]`).closest("tr");
              row
                .find("td:eq(4) span")
                .text("Inactive")
                .removeClass("badge-light-primary")
                .addClass("badge-light-danger");
              // Update action dropdown from Ban -> Unban
              const actionCell = row.find("td:last-child ul.dropdown-menu");
              actionCell.find(".ban-user").replaceWith(
                `<a class="dropdown-item unban-user" href="javascript:void(0)" data-id="${userId}">
                    <i class="fa fa-unlock"></i> Unban
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
              "An error occurred while banning the user: " +
                (xhr.responseJSON?.message || "Unknown error")
            );
          },
        });
      }
    });
  });

  // AJAX Unban user with SweetAlert2
  $(document).on("click", ".unban-user", function (e) {
    e.preventDefault();
    const userId = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to unban this user?",
      "Unban",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        $.ajax({
          url: "/Admin/UserManagement/Restore",
          method: "POST",
          data: { id: userId },
          headers: {
            RequestVerificationToken: token,
          },
          success: function (response) {
            if (response.success) {
              const row = $(`a[data-id="${userId}"]`).closest("tr");
              row
                .find("td:eq(4) span")
                .text("Active")
                .removeClass("badge-light-danger")
                .addClass("badge-light-primary");

              // Update action dropdown from Unban -> Ban
              const actionCell = row.find("td:last-child ul.dropdown-menu");
              actionCell.find(".unban-user").replaceWith(
                `<a class="dropdown-item ban-user" href="javascript:void(0)" data-id="${userId}">
                    <i class="fa fa-ban"></i> Ban
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
