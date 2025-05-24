$(document).ready(function () {
    $("#statusFilter").on("change", function () {
        const filter = $(this).val();
        let hasVisibleRows = false; // Theo dõi có hàng hiển thị hay không

        $("table tbody tr:not(#no-items-row)").each(function () {
            const row = $(this);
            const tagId = row.data("tag-id") || "";
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
                if (tagId && tagId === filter && isActive) {
                    row.show();
                    hasVisibleRows = true;
                } else {
                    row.hide();
                }
            }
        });

        // Hiển thị/ẩn thông báo "No items found"
        if (hasVisibleRows) {
            $("#no-items-row").hide();
        } else {
            $("#no-items-row").show();
        }
    });

    // DELETE
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
                            showSuccessAlert("Success!", response.message);
                            $row.fadeOut(400, function () {
                                $(this).remove();
                                // Kích hoạt lại bộ lọc sau khi xóa
                                $("#statusFilter").trigger("change");
                            });
                        } else {
                            showErrorAlert("Error", response.message);
                        }
                    },
                    error: function () {
                        showErrorAlert(
                            "Error",
                            "An error occurred while deleting the tip."
                        );
                    },
                });
            }
        });
    });

    // RESTORE
    $(document).on("click", "#restore-tips", function (e) {
        e.preventDefault();
        var id = $(this).data("id");
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
                            showSuccessAlert("Success!", response.message);
                            location.reload(); // Tải lại trang để cập nhật trạng thái
                        } else {
                            showErrorAlert("Error", response.message);
                        }
                    },
                    error: function () {
                        showErrorAlert(
                            "Error",
                            "An error occurred while restoring the tip."
                        );
                    },
                });
            }
        });
    });

    $("#statusFilter").trigger("change");
});