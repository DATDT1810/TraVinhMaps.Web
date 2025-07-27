let locationIndex = 0; // Sẽ được cập nhật từ View
// Function để thêm địa điểm mới
function addLocation() {
    const container = document.getElementById('locations-container');
    if (!container) {
        console.error('locations-container not found');
        return;
    }
    const locationHtml = `
    <div class="location-group mb-3">
        <div class="row">
            <div class="col-sm-4">
                <label>Name of Location</label>
                <input type="text" name="SellLocations[${locationIndex}].LocationName" class="form-control" placeholder="Location name" required />
                <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].LocationName" data-valmsg-replace="true"></span>
            </div>
            <div class="col-sm-4">
                <label>Address</label>
                <input type="text" name="SellLocations[${locationIndex}].LocationAddress" class="form-control" placeholder="Location name" required />
                <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].LocationAddress" data-valmsg-replace="true"></span>
            </div>
            <div class="col-sm-4">
                <label>Type</label>
                <select name="SellLocations[${locationIndex}].Type" class="form-select" required>
                    <option value="point" selected>Point</option>
                </select>
                <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].Type" data-valmsg-replace="true"></span>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <label>Longitude</label>
                <input type="text" name="SellLocations[${locationIndex}].Longitude" class="form-control" placeholder="Location name" required />
                <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].Longitude" data-valmsg-replace="true"></span>
            </div>
            <div class="col-sm-6">
                <label>Latitude</label>
                <input type="text" name="SellLocations[${locationIndex}].Latitude" class="form-control" placeholder="Location name" required />
                <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].Latitude" data-valmsg-replace="true"></span>
            </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm mt-2 remove-location">Remove</button>
    </div>`;
    container.insertAdjacentHTML('beforeend', locationHtml);
    locationIndex++;
}

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-location')) {
        e.target.parentElement.remove();
    }
});

// add sell location
$(document).ready(function () {
    $("#addLocationForm").on("submit", function (e) {
        e.preventDefault();
        var form = $(this);
        var token = $('input[name="__RequestVerificationToken"]').val();
        var formData = form.serialize();
        console.log("Add Location Form Data:", formData);
        console.log("CSRF Token:", token);

        $.ajax({
            url: "/Admin/OcopProduct/CreateSellLocation",
            type: "POST",
            data: formData,
            headers: {
                "X-CSRF-TOKEN": token
            },
            success: function (response) {
                console.log("AJAX Success Response:", response);
                if (response.success) {
                    showTimedAlert("Success!", response.message || "Location added successfully!", "success", 1000);
                    $("#addLocationModal").modal("hide");

                    // Load ngầm dữ liệu mới từ server
                    var ocopProductId = form.find('input[name="Id"]').val();
                    $.ajax({
                        url: `/Admin/OcopProduct/Detail/${ocopProductId}`,
                        type: "GET",
                        success: function (data) {
                            var newLocationList = $(data).find("#sellocation-list").html();
                            $("#sellocation-list").html(newLocationList);
                        },
                        error: function (xhr, status, error) {
                            console.log("Reload Error:", xhr.responseText);
                            showTimedAlert("Error!", "Failed to reload location data.", "error", 1000);
                        }
                    });
                } else {
                    showTimedAlert("Error!", response.message || "Failed to add location.", "error", 1000);
                }
            },
            error: function (xhr, status, error) {
                console.log("AJAX Error:", xhr.responseJSON || xhr.responseText);
                var errorMessage = xhr.responseJSON?.message || "An error occurred while adding the location.";
                showTimedAlert("Error!", errorMessage, "error", 1000);
            }
        });
    });
});
// edit sell location
$(document).ready(function () {
    // Populate Edit Location Modal
    $(document).on("click", ".edit-location-btn", function () {
        var button = $(this);
        console.log("Button Data:", button.data());
        $("#id").val(button.data("id") || "");
        $("#locationName").val(button.data("name") || "");
        $("#locationAddress").val(button.data("address") || "");
        $("#markerId").val(button.data("marker") || "68486609935049741c54a644");
        $("#type").val(button.data("type") || "Point");
        $("#longitude").val(button.data("longitude") || 0);
        $("#latitude").val(button.data("latitude") || 0);
    });

    // Handle Edit Location Form Submission
    $("#editLocationForm").on("submit", function (e) {
        e.preventDefault();
        var form = $(this);
        var token = $('input[name="__RequestVerificationToken"]').val();
        var formData = form.serialize();

        console.log("Form Data:", formData);

        $.ajax({
            url: "/Admin/OcopProduct/UpdateSellLocationPost", 
            type: "POST",
            data: formData,
            headers: {
                "RequestVerificationToken": token
            },
            success: function (response) {
                console.log("AJAX Success Response:", response);
                if (response.success) {
                    showTimedAlert("Success!", response.message || "Location updated successfully!", "success", 1000);
                    $("#editLocationModal").modal("hide");

                    window.location.reload(); // Reload the page to reflect changes
                    
                } 
            },
            error: function (xhr) {
                var errorMessage = xhr.responseJSON?.message || "An error occurred while updating the location.";
                showTimedAlert("Error!", errorMessage, "error", 1000);
            }
        });
    });
});

// add selling link
$(document).ready(function () {
    $("#addSellingLinkForm").on("submit", function (e) {
        e.preventDefault();
        var form = $(this);
        var token = $('input[name="__RequestVerificationToken"]').val();
        var formData = form.serialize();
        console.log("Add Location Form Data:", formData);
        console.log("CSRF Token:", token);

        $.ajax({
            url: "/Admin/OcopProduct/CreateSellingLink",
            type: "POST",
            data: formData,
            headers: {
                "X-CSRF-TOKEN": token
            },
            success: function (response) {
                console.log("AJAX Success Response:", response);
                if (response.success) {
                    showTimedAlert("Success!", response.message || "Location added successfully!", "success", 1000);
                    $("#addSellingLinkModal").modal("hide");

                    var ocopProductId = form.find('input[name="ProductId"]').val();
                    $.ajax({
                        url: `/Admin/OcopProduct/Detail/${ocopProductId}`,
                        type: "GET",
                        success: function (data) {
                            var newSellingLinkList = $(data).find("#sellinglink-list").html();
                            $("#sellinglink-list").html(newSellingLinkList);
                        },

                        error: function (xhr, status, error) {
                            console.log("Reload Error:", xhr.responseText);
                            showTimedAlert("Error!", "Failed to reload location data.", "error", 1000);
                        }
                    });
                } else {
                    showTimedAlert("Error!", response.message || "Failed to add location.", "error", 1000);
                }
            },
            error: function (xhr, status, error) {
                console.log("AJAX Error:", xhr.responseJSON || xhr.responseText);
                var errorMessage = xhr.responseJSON?.message || "An error occurred while adding the location.";
                showTimedAlert("Error!", errorMessage, "error", 1000);
            }
        });
    });
});
// edit selling link
$(document).ready(function () {
    $(document).on("click", ".edit-selling-link-btn", function (){
        var button = $(this);
        console.log("Button Data:", button.data());
         $("#productIdEdit").val(button.data("product-id"));
        $("#idEdit").val(button.data("id"));
        $("#titleEdit").val(button.data("title"));
        $("#linkEdit").val(button.data("link"));
    });

    // Handle Edit selling location Form Submission
    $("#editSellingLinkForm").on("submit", function (e) {
        e.preventDefault();
        var form = $(this);
        var token = $('input[name="__RequestVerificationToken"]').val();
        var formData = form.serialize();

        console.log("Form Data:", formData);

        $.ajax({
            url: "/Admin/OcopProduct/UpdateSellingLinkPost", 
            type: "POST",
            data: formData,
            headers: {
                "RequestVerificationToken": token
            },
            success: function (response) {
                console.log("AJAX Success Response:", response);
                if (response.success) {
                    showTimedAlert("Success!", response.message || "Selling link updated successfully!", "success", 1000);
                    $("#editSellingLinkModal").modal("hide");

                    // Reload location list dynamically
                    var ocopProductId = $("#productIdEdit").val();
                    $.ajax({
                        url: `/Admin/OcopProduct/Detail/${ocopProductId}`, 
                        type: "GET",
                        success: function (data) {
                            var editSellingLinkList = $(data).find("#sellinglink-list").html();
                            $("#sellinglink-list").html(editSellingLinkList);
                        },
                        error: function (xhr) {
                            showTimedAlert("Error!", "Failed to reload selling link data.", "error", 1000);
                        }
                    });
                } else {
                    showTimedAlert("Error!", response.message || "Failed to update selling link.", "error", 1000);
                }
            },
            error: function (xhr) {
                var errorMessage = xhr.responseJSON?.message || "An error occurred while updating the selling link.";
                showTimedAlert("Error!", errorMessage, "error", 1000);
            }
        });
    });
});
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
                    showTimedAlert("Success!", response.message || "Location deleted successfully!", "success", 1000);
                    $("#deleteLocationModal").modal("hide");

                    // Reload location list dynamically
                    var ocopProductId = $("#id").val();
                    $.ajax({
                        url: `/Admin/OcopProduct/Detail/${ocopProductId}`, 
                        type: "GET",
                        success: function (data) {
                            var editLocationList = $(data).find("#sellocation-list").html();
                            $("#sellocation-list").html(editLocationList);
                        },
                        error: function (xhr) {
                            showTimedAlert("Error!", "Failed to reload location data.", "error", 1000);
                        }
                    });
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
                    showTimedAlert("Success!", response.message || "Selling link updated successfully!", "success", 1000);
                    $("#deleteSellingLinkModal").modal("hide");

                    // Reload location list dynamically
                    var ocopProductId = $("#productIdEdit").val();
                    $.ajax({
                        url: `/Admin/OcopProduct/Detail/${ocopProductId}`, 
                        type: "GET",
                        success: function (data) {
                            var editSellingLinkList = $(data).find("#sellinglink-list").html();
                            $("#sellinglink-list").html(editSellingLinkList);
                        },
                        error: function (xhr) {
                            showTimedAlert("Error!", "Failed to reload selling link data.", "error", 1000);
                        }
                    });
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


    