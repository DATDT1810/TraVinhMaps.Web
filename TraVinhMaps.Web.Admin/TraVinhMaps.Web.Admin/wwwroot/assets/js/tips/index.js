$(document).ready(function () {
    // Bộ lọc trạng thái
    $("#statusFilter").on("change", function () {
    const filter = $(this).val();
    let hasVisibleRows = false;
    $("table tbody tr:not(#no-items-row)").each(function () {
        const row = $(this);
        const tagId = String(row.data("tag-id") || "");
        const isActive = row.find('[id="delete-tips"]').length > 0;

        if (filter === "all") {
            if (isActive) {
                row.show();
                hasVisibleRows = true;
            } else {
                row.hide();
            }
        } else if (filter === "inactive") {
            if (!isActive) {
                row.show();
                hasVisibleRows = true;
            } else {
                row.hide();
            }
        } else {
            const tagIds = tagId.split(",");
            if (tagIds.includes(filter) && isActive) {
                row.show();
                hasVisibleRows = true;
            } else {
                row.hide();
            }
        }
    });
    if (hasVisibleRows) {
        $("#no-items-row").hide();
    } else {
        $("#no-items-row").show();
    }
});

    // Xóa tips
    $(document).on("click", "#delete-tips", function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var $row = $(this).closest("tr");
        var token = $('input[name="__RequestVerificationToken"]').val();

        showConfirmAlert(
            "Confirm delete",
            "Are you sure you want to delete this tip?",
            "Delete",
            "Cancel"
        ).then(function (confirmed) {
            if (confirmed) {
                $.ajax({
                    url: "/CommunityTips/Delete",
                    type: "POST",
                    data: {
                        __RequestVerificationToken: token,
                        id: id,
                    },
                    success: function (response) {
                        if (response.success) {
                            showTimedAlert("Success!", response.message, "success", 3000);
                            // Đổi nút delete sang restore
                            var $actionCell = $row.find('td:last');
                            $actionCell.find('.delete').parent().html(`
                                <a id="restore-tips" class="restore" href="javascript:void(0)"
                                    data-id="`+id+`" title="Restore">
                                    <i class="fa fa-undo"></i>
                                </a>
                            `);
                            $("#statusFilter").trigger("change");
                        } else {
                            showTimedAlert("Error!", response.message, "error", 3000);
                        }
                    },
                    error: function () {
                        showTimedAlert("Error!", "An error occurred while deleting the tip.", "error", 3000);
                    },
                });
            }
        });
    });

    // Khôi phục tips
    $(document).on("click", "#restore-tips", function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var $row = $(this).closest("tr");
        var token = $('input[name="__RequestVerificationToken"]').val();

        showConfirmAlert(
            "Restore Tip",
            "Are you sure you want to restore this tip?",
            "Restore",
            "Cancel"
        ).then(function (confirmed) {
            if (confirmed) {
                $.ajax({
                    url: "/CommunityTips/Restore",
                    type: "POST",
                    data: {
                        __RequestVerificationToken: token,
                        id: id,
                    },
                    success: function (response) {
                        if (response.success) {
                            showTimedAlert("Success!", response.message, "success", 3000);
                            // Đổi nút restore sang delete
                            var $actionCell = $row.find('td:last');
                            $actionCell.find('.restore').parent().html(`
                                <a id="delete-tips" class="delete" href="javascript:void(0)"
                                    data-id="`+id+`" title="Delete">
                                    <i class="fa fa-trash" aria-hidden="true"></i>
                                </a>
                            `);
                            $("#statusFilter").trigger("change");
                        } else {
                            showTimedAlert("Error!", response.message, "error", 3000);
                        }
                    },
                    error: function () {
                        showTimedAlert("Error!", "An error occurred while restoring the tip.", "error", 3000);
                    },
                });
            }
        });
    });

    // Gọi filter khi load trang
    $("#statusFilter").trigger("change");
});