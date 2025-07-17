$(document).ready(function () {
  /* ========== DATATABLES ========== */
  const table = $("#project-status").DataTable({
    paging: true,
    ordering: true,
    info: true,
    searching: true,
    columnDefs: [
      {
        // Column Status
        targets: 4,
        render: (data, type) => {
          if (type === "filter" || type === "sort") {
            return $("<div>").html(data).text().trim(); // return text for filtering/sorting
          }
          return data; // No change for display
        },
      },
    ],
  });

   /* ========== Draw Order ========== */
    table.on('order.dt search.dt draw.dt', function () {
    let i = 1;
    table
      .cells(null, 0, { search: 'applied', order: 'applied' })
      .every(function () {
        this.data(i++);
      });
  }).draw();

  /* ========== FILLTER COMBOBOX ========== */
  $("#statusFilter").on("change", () => table.draw());

  // method filter
  $.fn.dataTable.ext.search.push((settings, data) => {
    const filter = $("#statusFilter").val(); // all | inactive
    const status = data[4]; // text content of the Status column

    if (filter === "inactive") return status === "Inactive";
    return status === "Active"; // "all" just show active
  });

  $("#statusFilter").val("all").trigger("change"); // default "all"

  /* ========== Update Row ========== */
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
    table.row(row).invalidate().draw(false); // No change row order
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
            const row = $(this).closest("tr"); // get the row containing the ban button
            // updaete  the button from Ban to Unban
            const banBtn = row.find(".ban-user");
            banBtn
              .removeClass("ban-user delete")
              .addClass("unban-user restore")
              .attr("title", "Unban");

            banBtn.find("i").removeClass("fa-ban").addClass("fa-unlock");

            if (banBtn.find("i").length === 0) {
              banBtn.html('<i class="fa fa-unlock"></i>');
            }

            // updateRow(row, false); 
            updateRow(row, false);
            showTimedAlert("Success!", message, "success", 1000);
          } else {
            showTimedAlert("Failed!", message, "error", 1000);
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
            const row = $(this).closest("tr"); // get the row containing the unban button
            // update the button from Unban to Ban
            const unbanBtn = row.find(".unban-user");
            unbanBtn
              .removeClass("unban-user restore")
              .addClass("ban-user delete")
              .attr("title", "Ban");

            // pdate icon from unlock to ban
            unbanBtn.find("i").removeClass("fa-unlock").addClass("fa-ban");

            // if (unbanBtn.find("i").length === 0) {
            if (unbanBtn.find("i").length === 0) {
              unbanBtn.html('<i class="fa fa-ban"></i>');
            }

            // updateRow(row, true);
            updateRow(row, true);
            showTimedAlert("Success!", message, "success", 1000);
          } else {
            showTimedAlert("Failed!", message, "error", 1000);
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

// Handle Excel export
$("#exportBtn").on("click", function () {
  showInfoAlert("Exporting Data", "Retrieving all user data for export...", "OK", exportTableToExcel);
});

// Get session ID from page
const sessionId = "@sessionId";

// Function to export table data to Excel
function exportTableToExcel() {
  // Fetch all user data directly from the API
  $.ajax({
    url: "https://localhost:7162/api/Users/all",
    type: "GET",
    headers: {
      sessionId: sessionId,
    },
    success: function (response) {
      if (response && response.length > 0) {
        // Create a workbook
        const wb = XLSX.utils.book_new();

        // Create header row with all fields and separate profile fields
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
          // Profile fields as separate columns
          "Full Name",
          "Date of Birth",
          "Profile Phone",
          "Gender",
          "Address",
          "Avatar URL",
          // Other data
          "Favorites",
        ];

        const data = [headerRow];

        // Process the data from the API
        response.forEach((user, index) => {
          // Format favorites if exists
          let favoritesData = "—";
          if (user.favorites && user.favorites.length > 0) {
            try {
              favoritesData = JSON.stringify(user.favorites);
            } catch (e) {
              favoritesData = "Invalid favorites data";
            }
          }

          // Extract profile data
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
            // Profile fields as separate values
            profile.fullName || "—",
            profile.dateOfBirth || "—",
            profile.phoneNumber || "—",
            profile.gender || "—",
            profile.address || "—",
            profile.avatar || "—",
            // Other data
            favoritesData,
          ];
          data.push(rowData);
        });

        // Create worksheet from data
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Set column widths for better readability
        ws["!cols"] = [
          { wch: 5 }, // #
          { wch: 25 }, // User ID
          { wch: 20 }, // Username
          { wch: 30 }, // Email
          { wch: 15 }, // Phone
          { wch: 25 }, // Role ID
          { wch: 10 }, // Status
          { wch: 12 }, // Is Forbidden
          { wch: 20 }, // Created At
          { wch: 20 }, // Updated At
          // Profile field widths
          { wch: 25 }, // Full Name
          { wch: 15 }, // Date of Birth
          { wch: 15 }, // Profile Phone
          { wch: 10 }, // Gender
          { wch: 50 }, // Address
          { wch: 70 }, // Avatar URL
          // Other data
          { wch: 50 }, // Favorites
        ];

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "User List");

        // Generate Excel file and trigger download
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

