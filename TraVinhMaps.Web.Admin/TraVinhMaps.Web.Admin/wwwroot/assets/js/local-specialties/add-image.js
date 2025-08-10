/* ========= Helpers ========= */
function raf2(fn){ requestAnimationFrame(() => requestAnimationFrame(fn)); }

/** Phân trang có thể gọi lại sau mỗi lần thay DOM */
function setupPagination(opts = {}) {
  const itemsPerPage = 2;
  const list = document.getElementById('locationList');
  const pagination = document.getElementById('pagination');
  if (!list || !pagination) return;

  const items = Array.from(list.querySelectorAll('.col-md-6'));
  const total = items.length;
  const pageCount = Math.ceil(total / itemsPerPage);

  // Giữ trang hiện tại nếu có
  let current = 1;
  if (opts.keepPage && list.dataset.currentPage) {
    current = Math.max(1, Math.min(parseInt(list.dataset.currentPage, 10) || 1, Math.max(1, pageCount)));
  }

  function renderPagination(active) {
    pagination.innerHTML = '';
    if (pageCount <= 1) return;
    for (let i = 1; i <= pageCount; i++) {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = i;
      if (i === active) a.classList.add('active');
      a.addEventListener('click', (e) => { e.preventDefault(); renderPage(i); });
      const li = document.createElement('li');
      li.appendChild(a);
      pagination.appendChild(li);
    }
  }

  function renderPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    items.forEach((el, i) => el.classList.toggle('d-none', !(i >= start && i < end)));
    list.dataset.currentPage = String(page);
    renderPagination(page);

    // Sau khi đổi trang: init/resize HERE map cho các item đang hiển thị (nếu có)
    if (typeof initializeMapObserver === 'function') {
      raf2(() => initializeMapObserver(list));
    }
    // Resize map đã init và vừa hiển thị
    list.querySelectorAll('.here-map-container').forEach(el => {
      if (el.offsetParent !== null && el.__hereMap) {
        el.__hereMap.getViewPort().resize();
      }
    });
  }

  if (total === 0) { pagination.innerHTML = ''; return; }
  renderPage(current);
}

/** Tải lại danh sách địa điểm từ server và re-init UI (KHÔNG reload trang) */
function refreshLocationList(localSpecialtyId) {
  // Lưu trang hiện tại trước khi thay HTML
  const listEl = document.getElementById('locationList');
  const prevPage = parseInt(listEl?.dataset.currentPage || '1', 10) || 1;

  $.get(`/LocalSpecialties/Details/${localSpecialtyId}`, function (html) {
    const $html = $(html);
    const newList = $html.find("#locationList").html();

    $("#locationList").html(newList);

    // Gán lại currentPage để setupPagination giữ đúng trang
    if (listEl) listEl.dataset.currentPage = String(prevPage);

    $("#sellingCount").text($("#locationList .col-md-6").length);

    raf2(() => {
      // GIỮ TRANG HIỆN TẠI
      setupPagination({ keepPage: true });

      // Re-init map cho các item đang hiển thị
      if (typeof initializeMapObserver === 'function') {
        initializeMapObserver(document.getElementById("locationList"));
      }
    });
  }).fail(() => {
    showTimedAlert("Error!", "Failed to reload location data.", "error", 1000);
  });
}


/* ========= Image Delete / Upload ========= */
function deleteImage(button) {
  var id = $(button).data("id");
  var imageUrl = $(button).data("image-url");
  var token = $('input[name="__RequestVerificationToken"]').val();

  showConfirmAlert("Confirm Deletion","Are you sure you want to delete this image?","Delete","Cancel")
  .then((confirmed) => {
    if (!confirmed) return;

    $.ajax({
      url: "/LocalSpecialties/DeleteLocalSpecialtiesImage",
      type: "POST",
      data: { __RequestVerificationToken: token, Id: id, ImageUrl: imageUrl },
      success: function (response) {
        if (!response.success) {
          return showTimedAlert("Error!", response.message || "Failed to delete image.", "error", 1000);
        }

        showTimedAlert("Success!", "Image deleted successfully!", "success", 1000);

        // Xóa ảnh trong carousel sync1
        var $sync1 = $("#sync1");
        $sync1.find(".item").each(function (index) {
          var $img = $(this).find("img");
          if ($img.attr("src") === imageUrl) {
            $sync1.trigger("remove.owl.carousel", [index]).trigger("refresh.owl.carousel");
            return false;
          }
        });

        // Xóa ảnh trong carousel sync2
        var $sync2 = $("#sync2");
        $sync2.find(".item").each(function (index) {
          var $img = $(this).find("img");
          if ($img.attr("src") === imageUrl) {
            $sync2.trigger("remove.owl.carousel", [index]).trigger("refresh.owl.carousel");
            return false;
          }
        });

        // Xóa nút trong DOM (nếu còn)
        $(button).closest(".item").remove();
      },
      error: function (xhr) {
        var errorMessage = xhr.responseJSON?.message || "An error occurred while deleting the image.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
      },
    });
  });
}

$(function () {
  // "+" mở file input
  $("#uploadPlaceholder").on("click", function () { $("#imageInput").click(); });

  // Upload ảnh
  $("#imageInput").on("change", function () {
    var files = this.files;
    var maxImages = 5;
    var maxFileSize = 5 * 1024 * 1024; // 5 MB
    var allowedExtensions = ["jpg", "jpeg", "png"];

    if (files.length > maxImages) {
      showTimedAlert("Error!", `You can upload a maximum of ${maxImages} images.`, "error", 1000);
      this.value = ""; return;
    }

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        showTimedAlert("Error!", `File ${file.name} has an unsupported format. Allowed formats: ${allowedExtensions.join(", ")}.`, "error", 1000);
        this.value = ""; return;
      }
      if (file.size > maxFileSize) {
        showTimedAlert("Error!", `File ${file.name} exceeds the maximum size of 5 MB.`, "error", 1000);
        this.value = ""; return;
      }
    }

    var formData = new FormData($("#addImageForm")[0]);
    var token = $('input[name="__RequestVerificationToken"]').val();

    $.ajax({
      url: "/LocalSpecialties/AddLocalSpecialtiesImage",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      headers: { RequestVerificationToken: token }, // thống nhất header
      success: function (response) {
        if (!response.success) {
          showTimedAlert("Error!", response.message, "error", 1000);
          return $("#imageInput").val("");
        }

        showTimedAlert("Success!", response.message, "success", 1000);
        response.imageUrls.forEach(function (imageUrl) {
          $("#sync1").trigger("add.owl.carousel", [
            `<div class="item" style="height: 400px;">
              <img src="${imageUrl}" alt="image" style="width: 100%; height: 400px;" />
            </div>`
          ]).trigger("refresh.owl.carousel");

          $("#sync2").trigger("add.owl.carousel", [
            `<div class="item" style="height: 90px; width: 70px; position: relative;">
              <img src="${imageUrl}" alt="image" style="width: 100%; height: 100%; object-fit: cover; display: block;">
              <button type="button" class="delete-button-image delete-image-btn"
                      data-id="${$('#addImageForm input[name="id"]').val()}"
                      data-image-url="${imageUrl}"
                      onclick="deleteImage(this)">×</button>
            </div>`
          ]).trigger("refresh.owl.carousel");
        });
        $("#imageInput").val("");
      },
      error: function (xhr) {
        var errorMessage = xhr.responseJSON?.message || "An error occurred while uploading the images.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
        $("#imageInput").val("");
      },
    });
  });

  /* ========= Edit Location ========= */
  $(document).on("click", ".edit-location-btn", function () {
    const button = $(this);
    $("#editId").val(button.data("id") || "");
    $("#editLocationId").val(button.data("location-id") || "");
    $("#editName").val(button.data("name") || "");
    $("#editAddress").val(button.data("address") || "");
    $("#editType").val(button.data("type") || "Point");
    $("#editLongitude").val(button.data("longitude") || 0);
    $("#editLatitude").val(button.data("latitude") || 0);
  });

  $("#editLocationForm").on("submit", function (e) {
    e.preventDefault();
    var form = $(this);
    var token = $('input[name="__RequestVerificationToken"]').val();
    var formData = form.serialize();

    $.ajax({
      url: "/LocalSpecialties/UpdateSellLocation",
      type: "POST",
      data: formData,
      headers: { RequestVerificationToken: token },
      success: function (response) {
        if (!response.success) {
          return showTimedAlert("Error!", response.message || "Failed to update location.", "error", 1000);
        }
        showTimedAlert("Success!", response.message || "Location updated successfully!", "success", 1000);
        $("#editLocationModal").modal("hide");

        // KHÔNG GET 2 lần — chỉ dùng 1 hàm refresh
        const localSpecialtyId = $("#editId").val();
        refreshLocationList(localSpecialtyId);
      },
      error: function (xhr) {
        var errorMessage = xhr.responseJSON?.message || "An error occurred while updating the location.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
      },
    });
  });

  /* ========= Add Location ========= */
  $("#addLocationForm").on("submit", function (e) {
    e.preventDefault();
    var form = $(this);
    var token = $('input[name="__RequestVerificationToken"]').val();
    var formData = form.serialize();

    $.ajax({
      url: "/LocalSpecialties/CreatePointOfSell",
      type: "POST",
      data: formData,
      headers: { RequestVerificationToken: token },
      success: function (response) {
        if (!response.success) {
          return showTimedAlert("Error!", response.message || "Failed to add location.", "error", 1000);
        }
        showTimedAlert("Success!", response.message || "Location added successfully!", "success", 1000);
        $("#addLocationModal").modal("hide");

        const localSpecialtyId = form.find('input[name="Id"]').val();
        refreshLocationList(localSpecialtyId);
        form[0].reset();
      },
      error: function (xhr) {
        var errorMessage = xhr.responseJSON?.message || "An error occurred while adding the location.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
      },
    });
  });

  /* ========= Delete Location ========= */
  $(document).on("click", ".delete-sell-location", function () {
    var button = $(this);
    var productId = button.data("product-id");
    var locationId = button.data("location-id");
    var locationName = button.data("location-name");
    var token = $('input[name="__RequestVerificationToken"]').val();

    showConfirmAlert("Confirm Deletion", `Do you want to delete the location "${locationName}"?`, "Delete", "Cancel")
    .then((confirmed) => {
      if (!confirmed) return;

      $.ajax({
        url: `/LocalSpecialties/DeleteSellLocation/${productId}/${locationId}`,
        type: "DELETE",
        headers: { RequestVerificationToken: token },
        success: function (response) {
          if (!response.success) {
            return showTimedAlert("Error!", response.message || "Failed to delete location.", "error", 1000);
          }

          // Xóa đúng card ngoài cùng
          const $card = button.closest(".col-md-6");
          $card.remove();

          // Cập nhật bộ đếm + empty state + pagination
          const left = $("#locationList .col-md-6").length;
          $("#sellingCount").text(left);

          if (left === 0) {
            $("#locationList").html(`
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center ps-3">
                  <div>
                    <strong>No Location Name.</strong><br/>
                    <span>No Location Address.</span>
                  </div>
                </div>
              </div>
            `);
          }

          setupPagination({ keepPage: true });

          // map cho item đang hiển thị
          if (typeof initializeMapObserver === 'function') {
            raf2(() => initializeMapObserver(document.getElementById('locationList')));
          }

          showTimedAlert("Success!", "Location deleted successfully!", "success", 1000);
        },
        error: function (xhr) {
          var errorMessage = xhr.responseJSON?.message || "An error occurred while deleting the location.";
          showTimedAlert("Error!", errorMessage, "error", 1000);
        },
      });
    });
  });

  // Khởi tạo lần đầu khi trang load
  setupPagination();
  if (typeof initializeMapObserver === 'function') {
    initializeMapObserver(document); // observe map container lần đầu
  }
});
