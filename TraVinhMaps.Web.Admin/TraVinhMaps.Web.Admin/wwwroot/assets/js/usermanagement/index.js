$(document).ready(function () {
  const table = $("#project-status").DataTable({
    paging: true,
    ordering: true,
    info: true,
    searching: true,
    pageLength: 10,
    columnDefs: [
      { targets: 0, searchable: false, orderable: false },
      {
        targets: 4,
        render: (data, type) => {
          if (type === "filter" || type === "sort") {
            return $("<div>").html(data).text().trim();
          }
          return data;
        },
      },
    ],
    drawCallback: function (settings) {
      let api = this.api();
      // Number visible rows sequentially, considering the current filter and page
      api
        .rows({ page: "current", search: "applied" })
        .nodes()
        .each(function (row, i) {
          $(row)
            .find("td:first")
            .text(i + 1); // Set STT to 1, 2, 3, ...
        });
    },
  });

  // Custom filter
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    const filter = $("#statusFilter").val();
    const status = (data[4] || "").trim();
    if (filter === "inactive") {
      return status === "Inactive" || status === "Không hoạt động";
    }
    if (filter === "active") {
      return status === "Active" || status === "Hoạt động";
    }
    return true;
  });

  // Redraw table on filter change
  $("#statusFilter").on("change", function () {
    table.draw();
    updatePaginationInfo();
  });

  // Set default filter to active
  $("#statusFilter").val("active").trigger("change");

  // Update pagination info
  function updatePaginationInfo() {
    const info = table.page.info();
    const filteredCount = table.rows({ search: "applied" }).count();
    const totalPages = Math.ceil(filteredCount / table.page.len());
    const pagination = $(".dataTables_paginate");
    pagination.find(".pagination").empty();
    if (totalPages > 1) {
      for (let i = 1; i <= totalPages; i++) {
        $("<a>", {
          text: i,
          class: "paginate_button" + (i === info.page + 1 ? " current" : ""),
          href: "#",
          click: function (e) {
            e.preventDefault();
            table.page(i - 1).draw(false);
          },
        }).appendTo(pagination.find(".pagination"));
      }
    }
    pagination.toggle(totalPages > 1);
  }

  // Update row UI
  function updateRow(row, isActive, id) {
    const statusSpan = row.find("td:eq(4) span");
    const actionCell = row.find("td:last-child ul.action");
    let currentText = statusSpan.text().toLowerCase().trim();
    let statusText = isActive
      ? currentText.includes("hoạt")
        ? "Hoạt động"
        : "Active"
      : currentText.includes("hoạt")
      ? "Không hoạt động"
      : "Inactive";

    // Cập nhật status
    statusSpan
      .text(statusText)
      .removeClass("badge-light-danger badge-light-primary")
      .addClass(isActive ? "badge-light-primary" : "badge-light-danger");

    // Cập nhật nút hành động
    if (isActive) {
      actionCell.find(".unban-user").replaceWith(`
      <a class="delete ban-user" href="javascript:void(0)" data-id="${id}" title="Ban">
        <i class="fa fa-ban"></i>
      </a>
    `);
    } else {
      actionCell.find(".ban-user").replaceWith(`
      <a class="restore unban-user" href="javascript:void(0)" data-id="${id}" title="Unban">
        <i class="fa fa-unlock"></i>
      </a>
    `);
    }

    // Xóa dòng hiện tại khỏi bảng (bởi vì trạng thái đã đổi → không còn hợp filter hiện tại)
    table.row(row).remove();

    // Redraw lại toàn bảng (sẽ lọc lại đúng theo filter, và STT sẽ được cập nhật trong drawCallback)
    setTimeout(() => {
      table.draw(false);
      updatePaginationInfo();
    }, 100);
  }

  // Ban user
  $(document).on("click", ".ban-user", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to ban this user?",
      "Ban",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: window.apiBaseUrl + "/Admin/UserManagement/Delete",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: function (response) {
          if (response.success) {
            updateRow(row, false, id);
            showTimedAlert(
              "Success!",
              response.message || "User banned successfully.",
              "success",
              1000
            );
          } else {
            showTimedAlert(
              "Error!",
              response.message || "Failed to ban user.",
              "error",
              1000
            );
          }
        },
        error: function (xhr) {
          showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
        },
      });
    });
  });

  // Unban user
  $(document).on("click", ".unban-user", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const token = $('input[name="__RequestVerificationToken"]').val();
    const row = $(this).closest("tr");

    showConfirmAlert(
      "Confirmation",
      "Are you sure you want to unban this user?",
      "Unban",
      "Cancel"
    ).then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: window.apiBaseUrl + "/Admin/UserManagement/Restore",
        method: "POST",
        data: { id },
        headers: { RequestVerificationToken: token },
        success: function (response) {
          if (response.success) {
            updateRow(row, true, id);
            showTimedAlert(
              "Success!",
              response.message || "User unbanned successfully.",
              "success",
              1000
            );
          } else {
            showTimedAlert(
              "Error!",
              response.message || "Failed to unban user.",
              "error",
              1000
            );
          }
        },
        error: function (xhr) {
          showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
        },
      });
    });
  });

  // Excel export
  $("#exportBtn").on("click", function () {
    showInfoAlert(
      "Exporting Data",
      "Retrieving all user data for export...",
      "OK",
      exportTableToExcel
    );
  });

  // Get session ID from page
  const sessionId = "@sessionId";

  // Export table to Excel
  function exportTableToExcel() {
    $.ajax({
      url: window.apiBaseUrl + "/api/Users/all",
      type: "GET",
      headers: { sessionId: sessionId },
      success: function (response) {
        if (response && response.length > 0) {
          const wb = XLSX.utils.book_new();
          const headerRow = [
            "#",
            "User ID",
            "Username",
            "Email",
            "Phone Number",
            "Role ID",
            "Status",
            "Is Forbidden",
            "Created At",
            "Updated At",
            "Full Name",
            "Date of Birth",
            "Profile Phone",
            "Gender",
            "Address",
            "Avatar URL",
            "Favorites",
          ];
          const data = [headerRow];

          response.forEach((user, index) => {
            let favoritesData = "—";
            if (user.favorites && user.favorites.length > 0) {
              try {
                favoritesData = JSON.stringify(user.favorites);
              } catch (e) {
                favoritesData = "Invalid favorites data";
              }
            }
            const profile = user.profile || {};
            const rowData = [
              (index + 1).toString(),
              user.id || "—",
              user.username || "—",
              user.email || "—",
              user.phoneNumber || "—",
              user.roleId || "—",
              user.status ? "Active" : "Inactive",
              user.isForbidden ? "Yes" : "No",
              user.createdAt ? new Date(user.createdAt).toLocaleString() : "—",
              user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—",
              profile.fullName || "—",
              profile.dateOfBirth || "—",
              profile.phoneNumber || "—",
              profile.gender || "—",
              profile.address || "—",
              profile.avatar || "—",
              favoritesData,
            ];
            data.push(rowData);
          });

          const ws = XLSX.utils.aoa_to_sheet(data);
          ws["!cols"] = [
            { wch: 5 },
            { wch: 25 },
            { wch: 20 },
            { wch: 30 },
            { wch: 15 },
            { wch: 25 },
            { wch: 10 },
            { wch: 12 },
            { wch: 20 },
            { wch: 20 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 50 },
            { wch: 70 },
            { wch: 50 },
          ];
          XLSX.utils.book_append_sheet(wb, ws, "User List");
          const today = new Date().toISOString().slice(0, 10);
          const fileName = `user_list_${today}.xlsx`;
          XLSX.writeFile(wb, fileName);
          showTimedAlert(
            "Export Successful!",
            `${response.length} items have been exported to Excel.`,
            "success",
            1000
          );
        } else {
          showTimedAlert(
            "Export Error!",
            "No user data available for export.",
            "error",
            1000
          );
        }
      },
      error: function (xhr, status, error) {
        console.error("Error fetching user data:", error);
        showTimedAlert(
          "Export Error!",
          "Could not retrieve user data. Please check your connection or permissions.",
          "error",
          1000
        );
      },
    });
  }
});
