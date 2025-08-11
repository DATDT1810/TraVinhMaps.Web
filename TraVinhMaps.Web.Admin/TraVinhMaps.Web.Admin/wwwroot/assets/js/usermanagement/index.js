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
  // Update row UI
function updateRow(row, isActive, id) {
  const dtRow = table.row(row);
  const rowData = dtRow.data(); // Lấy dữ liệu của dòng

  // 1. Cập nhật ô Trạng thái (Status)
  const isVietnamese = (rowData[4] || "").includes("hoạt");
  const newStatusText = isActive
    ? isVietnamese ? "Hoạt động" : "Active"
    : isVietnamese ? "Không hoạt động" : "Inactive";
  const newStatusClass = isActive
    ? "badge-light-primary"
    : "badge-light-danger";
  const newStatusHtml = `<span class="badge ${newStatusClass}">${newStatusText}</span>`;
  
  // Cập nhật dữ liệu trạng thái trong DataTables
  dtRow.cell(row, 4).data(newStatusHtml);

  // 2. Cập nhật ô Hành động (Action) - SỬA LỖI TẠI ĐÂY
  // Thay vì thay thế toàn bộ HTML, chúng ta chỉ thay thế nút cụ thể
  const actionCell = $(row).find("td:last-child");

  if (isActive) {
    // Người dùng vừa được UNBAN -> trạng thái là ACTIVE
    // Tìm nút "unban-user" và thay nó bằng nút "ban-user"
    const unbanLink = actionCell.find(".unban-user");
    if (unbanLink.length > 0) {
      unbanLink.parent().replaceWith(`
        <li>
          <a class="delete ban-user" href="javascript:void(0)" data-id="${id}" title="Ban">
            <i class="fa fa-ban"></i>
          </a>
        </li>
      `);
    }
  } else {
    // Người dùng vừa bị BAN -> trạng thái là INACTIVE
    // Tìm nút "ban-user" và thay nó bằng nút "unban-user"
    const banLink = actionCell.find(".ban-user");
    if (banLink.length > 0) {
      banLink.parent().replaceWith(`
        <li>
          <a class="restore unban-user" href="javascript:void(0)" data-id="${id}" title="Unban">
            <i class="fa fa-unlock"></i>
          </a>
        </li>
      `);
    }
  }

  // Cập nhật HTML của ô hành động trong DataTables sau khi đã thay đổi
  dtRow.cell(row, -1).data(actionCell.html());

  // 3. Vẽ lại bảng để áp dụng bộ lọc
  // Dòng này sẽ tự động bị ẩn đi vì trạng thái không còn khớp với bộ lọc hiện tại
  table.draw(false);

  // Cập nhật lại thông tin phân trang
  updatePaginationInfo();
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
        url: "/Admin/UserManagement/Delete",
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
        url: "/Admin/UserManagement/Restore",
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
      url: window.apiBaseUrl + "api/Users/all",
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
