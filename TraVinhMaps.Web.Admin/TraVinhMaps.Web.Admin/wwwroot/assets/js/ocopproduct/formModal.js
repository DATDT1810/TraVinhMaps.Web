﻿$(document).ready(function () {
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


//Delete Sell Location
    $(document).on("click", ".delete-sell-location", function (e) {
    e.preventDefault();

    const button = $(this);
    const row = button.closest(".sellocation-item");
    const productId = button.data("product-id");
    const locationName = button.data("location-name");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
        "Confirmation",
        `Are you sure you want to delete "${locationName}"?`,
        "Delete",
        "Cancel"
    ).then((confirmed) => {
        if (!confirmed) return;

        $.ajax({
            url: `/Admin/OcopProduct/DeleteSellLocation/${productId}/${locationName}`,
            method: "DELETE",
            headers: {
                "RequestVerificationToken": token,
                "Content-Type": "application/json"
            },
            success: function (response) {
                if (response.success) {
                    row.remove();

                    showTimedAlert("Success!", "success", 3000);

                    setTimeout(() => {
                        window.location.href = `/Admin/OcopProduct/Detail/${productId}`;
                    }, 2000);
                } else {
                    showTimedAlert("Error!", response.message, "error", 1000);
                }
            },
            error: function (xhr) {
                showTimedAlert(
                    "Error",
                    "An error occurred while deleting the sell location: " +
                        (xhr.responseJSON?.message || "Unknown error"),
                    "error",
                    3000
                );
            }
        });
    });
});
    
//Delete Selling Link
    $(document).on("click", ".delete-selling-link", function (e) {
    e.preventDefault();

    const button = $(this);
    const row = button.closest(".sellinglink-item");
    const sellingLinkId = button.data("id");
    const productId = button.data("product-id");
    const token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
        "Confirmation",
        "Are you sure you want to delete this selling link?",
        "Delete",
        "Cancel"
    ).then((confirmed) => {
        if (!confirmed) return;

        $.ajax({
            url: `/Admin/OcopProduct/DeleteSellingLink/${sellingLinkId}`,
            method: "DELETE",
            headers: {
                "RequestVerificationToken": token,
                "Content-Type": "application/json"
            },
            success: function (response) {
                if (response.success) {
                    row.remove();

                    showTimedAlert("Success!", response.message, "success", 3000);

                    setTimeout(() => {
                        window.location.href = `/Admin/OcopProduct/Detail/${productId}`;
                    }, 2000);
                } else {
                    showTimedAlert("Error!", response.message, "error", 1000);
                }
            },
            error: function (xhr) {
                showTimedAlert(
                    "Error",
                    "An error occurred while deleting the selling link: " +
                        (xhr.responseJSON?.message || "Unknown error"),
                    "error",
                    3000
                );
            }
        });
    });
});   
// AJAX Ban user with SweetAlert2
    $(document).on("click", ".delete-ocop-product", function (e) {
        e.preventDefault();
        const ocopProductId = $(this).data("id");
        const token = $('input[name="__RequestVerificationToken"]').val();
        showConfirmAlert(
            "Confirmation",
            "Are you sure you want to delete this ocop product?",
            "Delete",
            "Cancel"
        ).then((confirmed) => {
            if (confirmed) {
                $.ajax({
                    url: "/Admin/OcopProduct/DeleteOcopProduct",
                    method: "POST",
                    data: { id: ocopProductId },
                    headers: {
                        "RequestVerificationToken": token
                    },
                    success: function (response) {
                        if (response.success) {
                            const row = $('a[data-id="' + ocopProductId + '"]').closest("tr");
                            row
                                .find("td:eq(4) span")
                                .text("Inactive")
                                .removeClass("badge-light-primary")
                                .addClass("badge-light-danger");
                            // Update action dropdown from Ban -> Unban
                            const actionCell = row.find("td:last-child ul.action");
                            actionCell.find(".delete-ocop-product").replaceWith(
                                `<a class="restore undelete-ocop-product" href="javascript:void(0)" data-id="${ocopProductId}" title="Restore"><i class="fa fa-undo"></i>
                  </a>`
                            );
                            table.row(row).invalidate().draw(false);
                            showTimedAlert("Success!", response.message, "success", 1000);
                        } else {
                            showTimedAlert("Error!", response.message, "error", 1000);
                        }
                    },
                    error: function (xhr) {
                        showErrorAlert(
                            "Error",
                            "An error occurred while delete the ocop product: " +
                            (xhr.responseJSON?.message || "Unknown error")
                        );
                    },
                });
            }
        });
    });

    // AJAX Unban user with SweetAlert2
    $(document).on("click", ".undelete-ocop-product", function (e) {
        e.preventDefault();
        const ocopProductId = $(this).data("id");
        const token = $('input[name="__RequestVerificationToken"]').val();

        showConfirmAlert(
            "Confirmation",
            "Are you sure you want to restore this ocop product?",
            "Restore",
            "Cancel"
        ).then((confirmed) => {
            if (confirmed) {
                $.ajax({
                    url: "/Admin/OcopProduct/RestoreOcopProduct",
                    method: "POST",
                    data: { id: ocopProductId },
                    headers: {
                        RequestVerificationToken: token,
                    },
                    success: function (response) {
                        if (response.success) {
                            const row = $('a[data-id="' + ocopProductId + '"]').closest("tr");

                            row
                                .find("td:eq(4) span")
                                .text("Active")
                                .removeClass("badge-light-danger")
                                .addClass("badge-light-primary");

                            // Update action dropdown from Unban -> Ban
                            const actionCell = row.find("td:last-child ul.action");
                            actionCell.find(".undelete-ocop-product").replaceWith(
                                `<a class="delete delete-ocop-product" href="javascript:void(0)" data-id="${ocopProductId}" title="Delete"><i class="fa fa-trash"></i> 
                  </a>`
                            );

                            table.row(row).invalidate().draw(false);
                            showTimedAlert("Success!", response.message, "success", 1000);
                        } else {
                            showTimedAlert("Error!", response.message, "error", 1000);
                        }
                    },
                    error: function (xhr) {
                        showErrorAlert(
                            "Error",
                            "An error occurred while restore the ocop product: " +
                            (xhr.responseJSON?.message || "Unknown error")
                        );
                    },
                });
            }
        });
    });
    // Toggle sellocation items
    const toggleButton = document.getElementById('toggle-sellocation');
    const locationItems = document.querySelectorAll('.sellocation-item');
    if (toggleButton) {
        toggleButton.addEventListener('click', function () {
            const isExpanded = toggleButton.getAttribute('data-expanded') === 'true';
            locationItems.forEach((item, index) => {
                if (index > 0) {
                    item.classList.toggle('d-none', isExpanded);
                }
            });
            toggleButton.textContent = isExpanded ? 'Xem thêm' : 'Thu gọn';
            toggleButton.setAttribute('data-expanded', (!isExpanded).toString());
        });
    }

});
