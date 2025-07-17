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
                }
            }
        ]
    });

    // Vẽ lại số thứ tự
    table.on('order.dt search.dt draw.dt', function () {
        let i = 1;
        table
            .cells(null, 0, { search: 'applied', order: 'applied' })
            .every(function () {
                this.data(i++);
            });
    }).draw();

    // BỘ LỌC COMBOBOX
    $("#statusFilter").on("change", () => table.draw());

    $.fn.dataTable.ext.search.push((settings, data) => {
        const filter = $("#statusFilter").val(); // all | inactive
        const status = data[3]; // Cột 4: Status

        if (filter === "inactive") return status === "Inactive";
        return status === "Active";
    });

    $("#statusFilter").val("active").trigger("change");

    // Hàm cập nhật lại giao diện hàng
    function updateRow(row, isActive, id) {
        const statusSpan = row.find("td:eq(4) span");
        const actionCell = row.find("td:last-child ul.action");

        if (isActive) {
            statusSpan.text("Active")
                .removeClass("badge-light-danger")
                .addClass("badge-light-primary");

            actionCell.find(".undelete-ocop-product").replaceWith(`
                <a class="delete delete-ocop-product" href="javascript:void(0)" data-id="${id}" title="Delete">
                    <i class="fa fa-trash"></i>
                </a>
            `);
        } else {
            statusSpan.text("Inactive")
                .removeClass("badge-light-primary")
                .addClass("badge-light-danger");

            actionCell.find(".delete-ocop-product").replaceWith(`
                <a class="restore undelete-ocop-product" href="javascript:void(0)" data-id="${id}" title="Restore">
                    <i class="fa fa-undo"></i>
                </a>
            `);
        }

        table.row(row).invalidate().draw(false);
    }

    // Delete
    $(document).on("click", ".delete-ocop-product", function (e) {
        e.preventDefault();
        const id = $(this).data("id");
        const token = $('input[name="__RequestVerificationToken"]').val();
        const row = $(this).closest("tr");

        showConfirmAlert("Confirmation", "Are you sure you want to delete this ocop product?", "Delete", "Cancel")
            .then((confirmed) => {
                if (!confirmed) return;

                $.ajax({
                    url: "/Admin/OcopProduct/DeleteOcopProduct",
                    method: "POST",
                    data: { id },
                    headers: { "RequestVerificationToken": token },
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
                    }
                });
            });
    });

    // Restore
    $(document).on("click", ".undelete-ocop-product", function (e) {
        e.preventDefault();
        const id = $(this).data("id");
        const token = $('input[name="__RequestVerificationToken"]').val();
        const row = $(this).closest("tr");

        showConfirmAlert("Confirmation", "Are you sure you want to restore this ocop product?", "Restore", "Cancel")
            .then((confirmed) => {
                if (!confirmed) return;

                $.ajax({
                    url: "/Admin/OcopProduct/RestoreOcopProduct",
                    method: "POST",
                    data: { id },
                    headers: { "RequestVerificationToken": token },
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
                    }
                });
            });
    });
});
