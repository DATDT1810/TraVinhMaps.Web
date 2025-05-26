$(document).ready(function () {
    // Hàm cập nhật hiển thị nút delete/restore theo trạng thái
    function updateActionButtons(row) {
        const statusText = row.find('span.badge').text().trim();
        if (statusText === "Active") {
            row.find('.delete').show();
            row.find('.restore').hide();
        } else {
            row.find('.delete').hide();
            row.find('.restore').show();
        }
    }

    // Khi load trang, cập nhật action buttons cho tất cả các dòng
    $('#basic-9 tbody tr').each(function () {
        updateActionButtons($(this));
    });

    // Delete Admin
    $(document).on('click', '.delete', function () {
        const id = $(this).data('id');
        showConfirmAlert(
            "Are you sure?",
            "Do you really want to delete this admin?",
            "Yes, delete it!",
            "Cancel"
        ).then((result) => {
            if (result) {
                $.ajax({
                    url: '/Admin/Delete',
                    type: 'POST',
                    data: {
                        id: id,
                        __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
                    },
                    success: function (res) {
                        if (res.success) {
                            showSuccessAlert("Deleted!", res.message);
                            const row = $(`tr[data-admin-id="${id}"]`);
                            // Cập nhật trạng thái và action
                            row.find('span.badge')
                                .removeClass('badge-light-primary')
                                .addClass('badge-light-danger')
                                .text('Inactive');
                            updateActionButtons(row);
                            // Nếu đang filter "active", ẩn dòng này đi
                            if ($('#statusFilter').val() === 'active') {
                                row.hide();
                            }
                        } else {
                            showErrorAlert("Delete failed!", res.message);
                        }
                    },
                    error: function () {
                        showErrorAlert("Delete failed!", "There was an error deleting the admin.");
                    }
                });
            }
        });
    });

    // Restore Admin
    $(document).on('click', '.restore', function () {
        const id = $(this).data('id');
        showConfirmAlert(
            "Are you sure?",
            "Do you want to restore this admin?",
            "Yes, restore it!",
            "Cancel"
        ).then((result) => {
            if (result) {
                $.ajax({
                    url: '/Admin/Restore',
                    type: 'POST',
                    data: {
                        id: id,
                        __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
                    },
                    success: function (res) {
                        if (res.success) {
                            showSuccessAlert("Restored!", res.message);
                            const row = $(`tr[data-admin-id="${id}"]`);
                            // Cập nhật trạng thái và action
                            row.find('span.badge')
                                .removeClass('badge-light-danger')
                                .addClass('badge-light-primary')
                                .text('Active');
                            updateActionButtons(row);
                            // Nếu đang filter "inactive", ẩn dòng này đi
                            if ($('#statusFilter').val() === 'inactive') {
                                row.hide();
                            }
                        } else {
                            showErrorAlert("Restore failed!", res.message);
                        }
                    },
                    error: function () {
                        showErrorAlert("Restore failed!", "There was an error restoring the admin.");
                    }
                });
            }
        });
    });

    // Status filter (Active, Inactive)
    $('#statusFilter').on('change', function () {
        const value = $(this).val();
        $('#basic-9 tbody tr').each(function () {
            const statusText = $(this).find('span.badge').text().trim();
            if (value === "active" && statusText === "Active") {
                $(this).show();
            } else if (value === "inactive" && statusText === "Inactive") {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Khi trang load, mặc định filter ở "Active"
    $('#statusFilter').val('active').trigger('change');
});