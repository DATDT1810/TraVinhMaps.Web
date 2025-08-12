// let locationIndex = 0; // Sẽ được cập nhật từ View
// // Function để thêm địa điểm mới
// function addLocation() {
//     const container = document.getElementById('locations-container');
//     if (!container) {
//         console.error('locations-container not found');
//         return;
//     }
//     const locationHtml = `
//     <div class="location-group mb-3">
//         <div class="row">
//             <div class="col-sm-4">
//                 <label>Name of Location</label>
//                 <input type="text" name="SellLocations[${locationIndex}].LocationName" class="form-control" placeholder="Location name" required />
//                 <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].LocationName" data-valmsg-replace="true"></span>
//             </div>
//             <div class="col-sm-4">
//                 <label>Address</label>
//                 <input type="text" name="SellLocations[${locationIndex}].LocationAddress" class="form-control" placeholder="Location name" required />
//                 <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].LocationAddress" data-valmsg-replace="true"></span>
//             </div>
//             <div class="col-sm-4">
//                 <label>Type</label>
//                 <select name="SellLocations[${locationIndex}].Type" class="form-select" required>
//                     <option value="point" selected>Point</option>
//                 </select>
//                 <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].Type" data-valmsg-replace="true"></span>
//             </div>
//         </div>
//         <div class="row">
//             <div class="col-sm-6">
//                 <label>Longitude</label>
//                 <input type="text" name="SellLocations[${locationIndex}].Longitude" class="form-control" placeholder="Location name" required />
//                 <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].Longitude" data-valmsg-replace="true"></span>
//             </div>
//             <div class="col-sm-6">
//                 <label>Latitude</label>
//                 <input type="text" name="SellLocations[${locationIndex}].Latitude" class="form-control" placeholder="Location name" required />
//                 <span class="text-danger field-validation-valid" data-valmsg-for="SellLocations[${locationIndex}].Latitude" data-valmsg-replace="true"></span>
//             </div>
//         </div>
//         <button type="button" class="btn btn-danger btn-sm mt-2 remove-location">Remove</button>
//     </div>`;
//     container.insertAdjacentHTML('beforeend', locationHtml);
//     locationIndex++;
// }

$(document).ready(function () {
  // Lấy token một lần để dùng chung
  const token = $('input[name="__RequestVerificationToken"]').val();

  // Hàm lấy ID sản phẩm từ các vị trí có thể có trên trang
  function getOcopProductId() {
    return (
      $("#id").val() ||
      $('input[name="Id"]').val() ||
      $('input[name="ProductId"]').val() ||
      $("#productIdEdit").val()
    );
  }

  /* ========= HELPER - HÀM TẬP TRUNG ĐỂ LÀM MỚI DỮ LIỆU ========= */
  function refreshOcopDetails(productId) {
    if (!productId) {
      console.error("Product ID is missing. Cannot refresh details.");
      return;
    }

    const listEl = document.getElementById("sellocation-list");
    const prevPage = listEl ? parseInt(listEl.dataset.currentPage || "1", 10) : 1;

    $.get(`/Admin/OcopProduct/Detail/${productId}`, function (html) {
      const $html = $(html);

      // Cập nhật danh sách điểm bán (Sell Locations)
      const newLocationList = $html.find("#sellocation-list").html();
      if (newLocationList) {
        $("#sellocation-list").html(newLocationList);
        const locationCount = $("#sellocation-list .col-md-6").length;
        $("#sellingPointsCount").text(locationCount);
      }

      // --- Cập nhật toàn bộ khu vực Selling Link ---

      // 1. Cập nhật khối tóm tắt
      const newSummaryElement = $html.find("#selling-link-summary-container");
      if (newSummaryElement.length) {
        // Thay thế toàn bộ thẻ div để xử lý cả trường hợp nó không tồn tại ban đầu
        $("#selling-link-summary-container").replaceWith(newSummaryElement);
      } else {
        $("#selling-link-summary-container").remove();
      }

      // 2. Cập nhật danh sách các link
      const newSellingLinkList = $html.find("#sellinglink-list").html();
      if (newSellingLinkList) {
        $("#sellinglink-list").html(newSellingLinkList);
      }

      // Sau khi DOM được cập nhật, gọi lại các hàm khởi tạo
      requestAnimationFrame(() => {
        if (typeof setupLocationPagination === "function") {
          setupLocationPagination({ keepPage: true, currentPage: prevPage });
        }
        if (typeof initializeMapObserver === "function") {
          initializeMapObserver(document.getElementById("sellocation-list"));
        }
      });
    }).fail(() => {
      showTimedAlert("Error!", "Failed to reload product data.", "error", 1000);
    });
  }

  /* ========= SELL LOCATION (ĐIỂM BÁN) ========= */

  // Gom chung xử lý cho form Thêm và Sửa Điểm Bán
  $("#addLocationForm, #editLocationForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const url = form.attr("id") === "addLocationForm" ? "/Admin/OcopProduct/CreateSellLocation" : "/Admin/OcopProduct/UpdateSellLocationPost";
    const modalId = form.attr("id") === "addLocationForm" ? "#addLocationModal" : "#editLocationModal";

    $.ajax({
      url: url,
      type: "POST",
      data: form.serialize(),
      headers: { RequestVerificationToken: token },
      success: function (response) {
        if (!response.success) {
          return showTimedAlert("Error!", response.message, "error", 1000);
        }
        showTimedAlert("Success!", response.message, "success", 1000);
        $(modalId).modal("hide");
        if (modalId === "#addLocationModal") form[0].reset();
        refreshOcopDetails(getOcopProductId());
      },
      error: function (xhr) {
        const errorMessage = xhr.responseJSON?.message || "An error occurred.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
      },
    });
  });

  // Điền dữ liệu vào modal sửa
  $(document).on("click", ".edit-location-btn", function () {
    const button = $(this);
    $("#editLocationModal #id").val(button.data("id") || "");
    $("#editLocationModal #locationName").val(button.data("name") || "");
    $("#editLocationModal #locationAddress").val(button.data("address") || "");
    $("#editLocationModal #markerId").val(button.data("marker") || "");
    $("#editLocationModal #type").val(button.data("type") || "Point");
    $("#editLocationModal #longitude").val(button.data("longitude") || 0);
    $("#editLocationModal #latitude").val(button.data("latitude") || 0);
  });

  // Xử lý Xóa Điểm Bán (Phương pháp đáng tin cậy)
  $(document).on("click", ".delete-sell-location", function (e) {
    e.preventDefault();
    const button = $(this);
    const productId = button.data("product-id");
    const locationName = button.data("location-name");

    showConfirmAlert("Confirmation", `Are you sure you want to delete "${locationName}"?`, "Delete", "Cancel")
    .then((confirmed) => {
        if (!confirmed) return;
        $.ajax({
            url: `/Admin/OcopProduct/DeleteSellLocation/${productId}/${locationName}`,
            method: "DELETE",
            headers: { RequestVerificationToken: token },
            success: function (response) {
                if (!response.success) {
                    return showTimedAlert("Error!", response.message, "error", 1000);
                }
                showTimedAlert("Success!", "Location deleted successfully!", "success", 1000);
                // Gọi hàm làm mới chung để cập nhật toàn bộ giao diện
                refreshOcopDetails(productId);
            },
            error: function (xhr) {
                 const errorMessage = xhr.responseJSON?.message || "An error occurred.";
                 showTimedAlert("Error!", errorMessage, "error", 3000);
            }
        });
    });
  });

  /* ========= SELLING LINK (LINK BÁN HÀNG) ========= */

  // Gom chung xử lý cho form Thêm và Sửa Link
  $("#addSellingLinkForm, #editSellingLinkForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const url = form.attr("id") === "addSellingLinkForm" ? "/Admin/OcopProduct/CreateSellingLink" : "/Admin/OcopProduct/UpdateSellingLinkPost";
    const modalId = form.attr("id") === "addSellingLinkForm" ? "#addSellingLinkModal" : "#editSellingLinkModal";

    $.ajax({
      url: url,
      type: "POST",
      data: form.serialize(),
      headers: { RequestVerificationToken: token },
      success: function (response) {
        if (!response.success) {
          return showTimedAlert("Error!", response.message, "error", 1000);
        }
        showTimedAlert("Success!", response.message, "success", 1000);
        $(modalId).modal("hide");
        if (modalId === "#addSellingLinkModal") form[0].reset();
        refreshOcopDetails(getOcopProductId());
      },
      error: function (xhr) {
        const errorMessage = xhr.responseJSON?.message || "An error occurred.";
        showTimedAlert("Error!", errorMessage, "error", 1000);
      },
    });
  });

  // Điền dữ liệu vào modal sửa
  $(document).on("click", ".edit-selling-link-btn", function () {
    const button = $(this);
    $("#editSellingLinkModal #productIdEdit").val(button.data("product-id"));
    $("#editSellingLinkModal #idEdit").val(button.data("id"));
    $("#editSellingLinkModal #titleEdit").val(button.data("title"));
    $("#editSellingLinkModal #linkEdit").val(button.data("link"));
  });

  // Xử lý Xóa Link Bán Hàng (Phương pháp đáng tin cậy)
  $(document).on("click", ".delete-selling-link", function (e) {
    e.preventDefault();
    const button = $(this);
    const sellingLinkId = button.data("id");
    const productId = button.data("product-id"); // Lấy productId từ nút

    showConfirmAlert("Confirmation", "Are you sure you want to delete this link?", "Delete", "Cancel")
    .then((confirmed) => {
        if (!confirmed) return;
        $.ajax({
            url: `/Admin/OcopProduct/DeleteSellingLink/${sellingLinkId}`,
            method: "DELETE",
            headers: { RequestVerificationToken: token },
            success: function (response) {
                if (!response.success) {
                    return showTimedAlert("Error!", response.message, "error", 1000);
                }
                showTimedAlert("Success!", "Link deleted successfully!", "success", 1000);
                // Gọi hàm làm mới chung để cập nhật toàn bộ giao diện
                refreshOcopDetails(productId);
            },
            error: function (xhr) {
                const errorMessage = xhr.responseJSON?.message || "An error occurred.";
                showTimedAlert("Error!", errorMessage, "error", 3000);
            }
        });
    });
  });
});

// Toggle sellocation items
const toggleButton = document.getElementById("toggle-sellocation");
const locationItems = document.querySelectorAll(".sellocation-item");
if (toggleButton) {
  toggleButton.addEventListener("click", function () {
    const isExpanded = toggleButton.getAttribute("data-expanded") === "true";
    locationItems.forEach((item, index) => {
      if (index > 0) {
        item.classList.toggle("d-none", isExpanded);
      }
    });
    toggleButton.textContent = isExpanded ? "Xem thêm" : "Thu gọn";
    toggleButton.setAttribute("data-expanded", (!isExpanded).toString());
  });
}
