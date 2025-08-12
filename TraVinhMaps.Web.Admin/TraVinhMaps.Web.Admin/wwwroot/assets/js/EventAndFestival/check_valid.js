// Custom validator for datenotinpast
$.validator.addMethod(
  "datenotinpast",
  function (value, element, param) {
    if (!value) return false;

    const parts = value.split("/");
    if (parts.length !== 3) return false;

    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const inputDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time for comparison

    return inputDate > today;
  },
  "The date must not be in the past."
);

// Adapter to get the format attribute
$.validator.unobtrusive.adapters.addSingleVal("datenotinpast", "format");

// Custom validator for date greater than
$.validator.addMethod(
  "dategreaterthan",
  function (value, element, params) {
    const startDateId = params.other;
    const format = params.format || "mm/dd/yyyy";
    const startValue = $(startDateId).val();

    if (!value || !startValue) return false;

    const parseDate = function (val) {
      const parts = val.split("/");
      if (parts.length !== 3) return null;
      return new Date(parts[2], parts[0] - 1, parts[1]); // yyyy, mm, dd
    };

    const endDate = parseDate(value);
    const startDate = parseDate(startValue);

    if (!startDate || !endDate) return false;

    return endDate > startDate;
  },
  "The ending date must be after the starting date."
);

// Adapter to pass data-val attributes
$.validator.unobtrusive.adapters.add(
  "dategreaterthan",
  ["other", "format"],
  function (options) {
    options.rules["dategreaterthan"] = {
      other: "#" + options.params.other,
      format: options.params.format,
    };
    options.messages["dategreaterthan"] = options.message;
  }
);

// Gộp tất cả các tác vụ cần thực hiện khi trang tải xong vào một chỗ
document.addEventListener("DOMContentLoaded", function () {
  // --- BƯỚC 1: Đặt ngày bắt đầu mặc định là ngày mai ---
  const startDateInput = document.getElementById("StartDate");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Định dạng ngày thành chuỗi "mm/dd/yyyy"
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const year = tomorrow.getFullYear();
  const formattedTomorrow = `${month}/${day}/${year}`;

  // Gán giá trị vào ô input
  if (startDateInput) {
    startDateInput.value = formattedTomorrow;
  }

  // --- BƯỚC 2: Thiết lập chức năng xem trước ảnh upload ---
  const setupUploadBox = (boxId, inputId) => {
    const addBox = document.getElementById(boxId);
    const uploadInput = document.getElementById(inputId);

    if (!addBox || !uploadInput) return;

    const trigger = addBox.querySelector(".upload-placeholder");
    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        uploadInput.click();
      });
    }

    let previewContainer = document.createElement("div");
    previewContainer.classList.add("row", "mt-3", "g-3");
    addBox.parentElement.appendChild(previewContainer);

    uploadInput.addEventListener("change", function () {
      previewContainer.innerHTML = "";

      Array.from(uploadInput.files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const col = document.createElement("div");
            col.classList.add("col-sm-3");

            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item", "position-relative");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.classList.add("w-100", "rounded");

            itemDiv.appendChild(img);
            col.appendChild(itemDiv);
            previewContainer.appendChild(col);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  };
  setupUploadBox("addImageBox", "uploadImageInput");
});

const create_form = document.getElementById("create_form");
if (create_form) {
  create_form.addEventListener("submit", function (e) {
    if (!this.checkValidity()) {
      e.preventDefault(); // Dừng submit
      e.stopPropagation();
      return;
    }
    const create_btn = document.getElementById("create_btn");
    if (create_btn) {
      create_btn.disabled = true;
      create_btn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
    }
  });
}
