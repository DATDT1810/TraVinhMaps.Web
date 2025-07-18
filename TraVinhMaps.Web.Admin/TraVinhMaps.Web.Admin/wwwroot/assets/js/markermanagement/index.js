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
                targets: 4,
                render: (data, type) => {
                    if (type === "filter" || type === "sort") {
                        return $("<div>").html(data).text().trim(); // Lấy text thuần từ HTML
                    }
                    return data;
                }
            }
        ]
    });

    // Cập nhật STT
    table.on('order.dt search.dt draw.dt', function () {
        let i = 1;
        table
            .cells(null, 0, { search: 'applied', order: 'applied' })
            .every(function () {
                this.data(i++);
            });
    }).draw();

    // Lọc theo combobox
    $("#statusFilter").on("change", () => table.draw());

    $.fn.dataTable.ext.search.push((settings, data) => {
        const filter = $("#statusFilter").val();
        const status = data[4];

        if (filter === "inactive") return status === "Inactive";
        return status === "Active"; // "all" coi như active
    });

    $("#statusFilter").val("active").trigger("change");

    // Hàm cập nhật lại trạng thái + CSS + nút hành động
    function updateRowUI($row, isActive, id) {
        const statusSpan = $row.find("td:eq(4) span");
        const actionCell = $row.find("td:last-child ul.action");

        if (isActive) {
            statusSpan.text("Active")
                .removeClass("badge-light-danger")
                .addClass("badge-light-primary");

            actionCell.find(".undelete-eventandfestival").replaceWith(`
                <a title="Delete" class="delete delete-eventandfestival" href="javascript:void(0)" data-id="${id}">
                    <i class="fa fa-trash"></i>
                </a>
            `);
        } else {
            statusSpan.text("Inactive")
                .removeClass("badge-light-primary")
                .addClass("badge-light-danger");

            actionCell.find(".delete-eventandfestival").replaceWith(`
                <a title="Restore" class="restore undelete-eventandfestival" href="javascript:void(0)" data-id="${id}">
                    <i class="fa fa-undo"></i>
                </a>
            `);
        }

        table.row($row).invalidate().draw(false); // Cập nhật lại hàng, giữ nguyên trang
    }

    // Delete
    $(document).on("click", ".delete-eventandfestival", function (e) {
        e.preventDefault();
        const id = $(this).data("id");
        const token = $('input[name="__RequestVerificationToken"]').val();
        const $row = $(this).closest("tr");

        showConfirmAlert("Confirmation", "Are you sure you want to delete this marker?", "Delete", "Cancel")
            .then((confirmed) => {
                if (!confirmed) return;

                $.ajax({
                    url: "/Admin/MarkerManagement/DeleteMarker",
                    method: "POST",
                    data: { id },
                    headers: { "RequestVerificationToken": token },
                    success: function (response) {
                        if (response.success) {
                            updateRowUI($row, false, id);
                            showSuccessAlert("Success", response.message);
                        } else {
                            showErrorAlert("Failed", response.message);
                        }
                    },
                    error: function (xhr) {
                        showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
                    }
                });
            });
    });

    // Restore
    $(document).on("click", ".undelete-eventandfestival", function (e) {
        e.preventDefault();
        const id = $(this).data("id");
        const token = $('input[name="__RequestVerificationToken"]').val();
        const $row = $(this).closest("tr");

        showConfirmAlert("Confirmation", "Are you sure you want to restore this Marker?", "Restore", "Cancel")
            .then((confirmed) => {
                if (!confirmed) return;

                $.ajax({
                    url: "/Admin/MarkerManagement/RestoreMarker",
                    method: "POST",
                    data: { id },
                    headers: { "RequestVerificationToken": token },
                    success: function (response) {
                        if (response.success) {
                            updateRowUI($row, true, id);
                            showSuccessAlert("Success", response.message);
                        } else {
                            showErrorAlert("Failed", response.message);
                        }
                    },
                    error: function (xhr) {
                        showErrorAlert("Error", xhr.responseJSON?.message || "Unknown error");
                    }
                });
            });
    });
});
