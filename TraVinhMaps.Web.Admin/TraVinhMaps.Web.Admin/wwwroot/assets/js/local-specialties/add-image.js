function deleteImage(button) {
  var id = $(button).data("id");
  var imageUrl = $(button).data("image-url");
  var token = $('input[name="__RequestVerificationToken"]').val();

  showConfirmAlert(
    "Confirm Deletion",
    "Are you sure you want to delete this image?",
    "Delete",
    "Cancel"
  ).then((confirmed) => {
    if (confirmed) {
      $.ajax({
        url: "/LocalSpecialties/DeleteLocalSpecialtiesImage",
        type: "POST",
        data: {
          __RequestVerificationToken: token,
          Id: id,
          ImageUrl: imageUrl,
        },
        success: function (response) {
          if (response.success) {
            showTimedAlert(
              "Success!",
              "Image deleted successfully!",
              "success",
              1000
            );

            // Xóa ảnh trong carousel sync1
            var $sync1 = $("#sync1");
            var $items1 = $sync1.find(".item");
            $items1.each(function (index) {
              var $img = $(this).find("img");
              if ($img.attr("src") === imageUrl) {
                $sync1
                  .trigger("remove.owl.carousel", [index])
                  .trigger("refresh.owl.carousel");
                return false; // dừng vòng lặp
              }
            });

            // Xóa ảnh trong carousel sync2
            var $sync2 = $("#sync2");
            var $items2 = $sync2.find(".item");
            $items2.each(function (index) {
              var $img = $(this).find("img");
              if ($img.attr("src") === imageUrl) {
                $sync2
                  .trigger("remove.owl.carousel", [index])
                  .trigger("refresh.owl.carousel");
                return false; // dừng vòng lặp
              }
            });

            // Xóa phần tử nút xóa trong DOM (nếu còn)
            $(button).closest(".item").remove();
          } else {
            showTimedAlert(
              "Error!",
              response.message || "Failed to delete image.",
              "error",
              1000
            );
          }
        },
        error: function (xhr, status, error) {
          var errorMessage =
            xhr.responseJSON?.message ||
            "An error occurred while deleting the image.";
          showTimedAlert("Error!", errorMessage, "error", 1000);
        },
      });
    }
  });
}

$(document).ready(function () {
  // Trigger file input click khi click vào "+"
  $("#uploadPlaceholder").on("click", function () {
    $("#imageInput").click();
  });

  // Xử lý chọn file và upload
  $("#imageInput").on("change", function () {
    var files = this.files;
    var maxImages = 5;
    var maxFileSize = 5 * 1024 * 1024; // 5 MB
    var allowedExtensions = ["jpg", "jpeg", "png"];

    // Validate client-side
    if (files.length > maxImages) {
      showTimedAlert(
        "Error!",
        `You can upload a maximum of ${maxImages} images.`,
        "error",
        1000
      );
      this.value = ""; // Clear input
      return;
    }

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        showTimedAlert(
          "Error!",
          `File ${
            file.name
          } has an unsupported format. Allowed formats: ${allowedExtensions.join(
            ", "
          )}.`,
          "error",
          1000
        );
        this.value = "";
        return;
      }
      if (file.size > maxFileSize) {
        showTimedAlert(
          "Error!",
          `File ${file.name} exceeds the maximum size of 5 MB.`,
          "error",
          1000
        );
        this.value = "";
        return;
      }
    }

    // Prepare form data
    var formData = new FormData($("#addImageForm")[0]);
    var token = $('input[name="__RequestVerificationToken"]').val();

    // AJAX upload
    $.ajax({
      url: "/LocalSpecialties/AddLocalSpecialtiesImage",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      headers: {
        "X-CSRF-TOKEN": token,
      },
      success: function (response) {
        if (response.success) {
          showTimedAlert("Success!", response.message, "success", 1000);
          // Thêm ảnh mới vào carousel bằng API add.owl.carousel
          response.imageUrls.forEach(function (imageUrl) {
            // Thêm ảnh vào carousel chính sync1
            $("#sync1")
              .trigger("add.owl.carousel", [
                `<div class="item" style="height: 400px;">
                  <img src="${imageUrl}" alt="image" style="width: 100%; height: 400px;" />
                </div>`,
              ])
              .trigger("refresh.owl.carousel");

            // Thêm ảnh vào carousel thumbnail sync2
            $("#sync2")
              .trigger("add.owl.carousel", [
                `<div class="item" style="height: 90px; width: 70px; position: relative;">
                  <img src="${imageUrl}" alt="image"
                    style="width: 100%; height: 100%; object-fit: cover; display: block;">
                  <button type="button" class="delete-button-image delete-image-btn"
                          data-id="${$(
                            '#addImageForm input[name="id"]'
                          ).val()}" 
                          data-image-url="${imageUrl}"
                          onclick="deleteImage(this)">
                      ×
                  </button>
                </div>`,
              ])
              .trigger("refresh.owl.carousel");
          });
          // Clear input file
          $("#imageInput").val("");
        } else {
          showTimedAlert("Error!", response.message, "error", 1000);
          $("#imageInput").val("");
        }
      },
      error: function (xhr, status, error) {
        var errorMessage =
          xhr.responseJSON?.message ||
          "An error occurred while uploading the images.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
        $("#imageInput").val("");
      },
    });
  });
});

$(document).ready(function () {
  // Populate Edit Location Modal
  $(".edit-location-btn").on("click", function () {
    var button = $(this);
    console.log("Button Data:", button.data());
    $("#editId").val(button.data("id") || "");
    $("#editLocationId").val(button.data("location-id") || "");
    $("#editName").val(button.data("name") || "");
    $("#editAddress").val(button.data("address") || "");
    $("#editType").val(button.data("type") || "Point");
    $("#editLongitude").val(button.data("longitude") || 0);
    $("#editLatitude").val(button.data("latitude") || 0);
  });

  // Handle Edit Location Form Submission
  $("#editLocationForm").on("submit", function (e) {
    e.preventDefault();
    var form = $(this);
    var token = $('input[name="__RequestVerificationToken"]').val();
    var formData = form.serialize();
    console.log("Form Data:", formData);
    console.log("CSRF Token:", token);

    $.ajax({
      url: "/LocalSpecialties/UpdateSellLocation",
      type: "POST",
      data: formData,
      headers: {
        "X-CSRF-TOKEN": token,
      },
      success: function (response) {
        console.log("AJAX Success Response:", response);
        if (response.success) {
          showTimedAlert(
            "Success!",
            response.message || "Location updated successfully!",
            "success",
            1000
          );
          $("#editLocationModal").modal("hide");

          // Load ngầm dữ liệu mới từ server
          var localSpecialtyId = $("#editId").val();
          $.ajax({
            url: `/LocalSpecialties/Details/${localSpecialtyId}`,
            type: "GET",
            success: function (data) {
              console.log("Reload Data:", data);
              // Cập nhật phần danh sách địa điểm
              var newLocationList = $(data).find("#locationList").html();
              $("#locationList").html(newLocationList);
            },
            error: function (xhr, status, error) {
              console.log("Reload Error:", xhr.responseText);
              showTimedAlert(
                "Error!",
                "Failed to reload location data.",
                "error",
                1000
              );
            },
          });
        } else {
          showTimedAlert(
            "Error!",
            response.message || "Failed to update location.",
            "error",
            1000
          );
        }
      },
      error: function (xhr, status, error) {
        console.log("AJAX Error:", xhr.responseJSON || xhr.responseText);
        var errorMessage =
          xhr.responseJSON?.message ||
          "An error occurred while updating the location.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
      },
    });
  });
});

// Add Sell Location
$(document).ready(function () {
  // Handle Add Location Form Submission
  $("#addLocationForm").on("submit", function (e) {
    e.preventDefault();
    var form = $(this);
    var token = $('input[name="__RequestVerificationToken"]').val();
    var formData = form.serialize();
    console.log("Add Location Form Data:", formData);
    console.log("CSRF Token:", token);

    $.ajax({
      url: "/LocalSpecialties/CreatePointOfSell",
      type: "POST",
      data: formData,
      headers: {
        "X-CSRF-TOKEN": token,
      },
      success: function (response) {
        console.log("AJAX Success Response:", response);
        if (response.success) {
          showTimedAlert(
            "Success!",
            response.message || "Location added successfully!",
            "success",
            1000
          );
          $("#addLocationModal").modal("hide");

          // Load ngầm dữ liệu mới từ server
          var localSpecialtyId = form.find('input[name="Id"]').val();
          $.ajax({
            url: `/LocalSpecialties/Details/${localSpecialtyId}`,
            type: "GET",
            success: function (data) {
              console.log("Reload Data:", data);
              // Cập nhật phần danh sách địa điểm
              var newLocationList = $(data).find("#locationList").html();
              $("#locationList").html(newLocationList);
              // Reset form
              form[0].reset();
            },
            error: function (xhr, status, error) {
              console.log("Reload Error:", xhr.responseText);
              showTimedAlert(
                "Error!",
                "Failed to reload location data.",
                "error",
                1000
              );
            },
          });
        } else {
          showTimedAlert(
            "Error!",
            response.message || "Failed to add location.",
            "error",
            1000
          );
        }
      },
      error: function (xhr, status, error) {
        console.log("AJAX Error:", xhr.responseJSON || xhr.responseText);
        var errorMessage =
          xhr.responseJSON?.message ||
          "An error occurred while adding the location.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
      },
    });
  });
});

// Delete Sell Location
$(document).ready(function () {
  // Use event delegation for dynamically loaded elements
  $(document).on("click", ".delete-sell-location", function () {
    console.log("Delete button clicked!");
    var button = $(this);
    var productId = button.data("product-id");
    var locationId = button.data("location-id");
    var locationName = button.data("location-name");
    var token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert(
      "Confirm Deletion",
      `Do you want to delete the location "${locationName}"?`,
      "Delete",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        $.ajax({
          url: `/LocalSpecialties/DeleteSellLocation/${productId}/${locationId}`,
          type: "DELETE",
          headers: {
            RequestVerificationToken: token,
          },
          success: function (response) {
            if (response.success) {
              // Remove the deleted location from the DOM
              $(`div[data-location-id="${locationId}"]`).remove();

              // Check if there are any locations left
              if ($("#locationList").children().length === 0) {
                $("#locationList").html(`
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <b>No Location Name.</b><br />
                                                    <span>No Location Address.</span>
                                                </div>
                                            </div>
                                        `);
              }

              showTimedAlert(
                "Success!",
                "Location deleted successfully!",
                "success",
                1000
              );
            } else {
              showTimedAlert(
                "Error!",
                response.message || "Failed to delete location.",
                "error",
                1000
              );
            }
          },
          error: function (xhr, status, error) {
            var errorMessage =
              xhr.responseJSON?.message ||
              "An error occurred while deleting the location.";
            showTimedAlert("Error!", errorMessage, "error", 1000);
          },
        });
      }
    });
  });
});
