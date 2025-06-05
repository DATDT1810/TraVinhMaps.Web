let locationIndex = 0; // Sẽ được cập nhật từ View

// Định nghĩa các định dạng ảnh được phép
const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

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
                    <input type="text" name="Locations[${locationIndex}].Name" class="form-control" placeholder="Location name" required />
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${locationIndex}].Name" data-valmsg-replace="true"></span>
                </div>
                <div class="col-sm-4">
                    <label>Address</label>
                    <input type="text" name="Locations[${locationIndex}].Address" class="form-control" placeholder="Address" required />
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${locationIndex}].Address" data-valmsg-replace="true"></span>
                </div>
                <div class="col-sm-4">
                    <label>Marker Type</label>
                    <select name="Locations[${locationIndex}].MarkerId" class="form-select" required>
                        <option value="">Select marker type</option>
                        <option value="682449f7d14510b9c087c2a3">Religious Buildings</option>
                        <option value="682449f7d14510b9c087c2a4">Natural Destination</option>
                    </select>
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${locationIndex}].MarkerId" data-valmsg-replace="true"></span>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-6">
                    <label>Longitude</label>
                    <input type="number" name="Locations[${locationIndex}].Longitude" class="form-control" step="any" placeholder="Longitude" required min="-180" max="180" />
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${locationIndex}].Longitude" data-valmsg-replace="true"></span>
                </div>
                <div class="col-sm-6">
                    <label>Latitude</label>
                    <input type="number" name="Locations[${locationIndex}].Latitude" class="form-control" step="any" placeholder="Latitude" required min="-90" max="90" />
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${locationIndex}].Latitude" data-valmsg-replace="true"></span>
                </div>
            </div>
            <button type="button" class="btn btn-danger btn-sm mt-2 remove-location">Remove</button>
        </div>`;
    container.insertAdjacentHTML('beforeend', locationHtml);
    locationIndex++;
}

// Xử lý xóa địa điểm
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-location')) {
        e.target.parentElement.remove();
    }
});

// Xử lý upload và preview ảnh
document.addEventListener("DOMContentLoaded", function () {
    const addBox = document.getElementById("addImageBox");
    const uploadInput = document.getElementById("uploadImageInput");
    const imagePreview = document.getElementById("imagePreview");
    const validationMessage = document.getElementById("imageValidationMessage");

    if (!addBox || !uploadInput || !imagePreview || !validationMessage) {
        console.error('One or more elements not found: addImageBox, uploadImageInput, imagePreview, imageValidationMessage');
        return;
    }

    addBox.addEventListener("click", () => {
        console.log("addImageBox clicked"); // Debug
        uploadInput.click();
    });

    uploadInput.addEventListener("change", function (e) {
        console.log("uploadImageInput changed"); // Debug
        validationMessage.textContent = ""; // Xóa thông báo lỗi cũ
        imagePreview.innerHTML = ""; // Xóa preview cũ
        const files = uploadInput.files;

        if (!files || files.length === 0) {
            console.log("No files selected");
            return;
        }

        // Kiểm tra số lượng file
        if (files.length > 5) {
            validationMessage.textContent = "You can upload a maximum of 5 images.";
            uploadInput.value = ""; // Xóa lựa chọn
            console.log("Too many files selected");
            return;
        }

        // Kiểm tra định dạng file
        let hasInvalidFormat = false;
        Array.from(files).forEach(file => {
            const ext = `.${file.name.split('.').pop().toLowerCase()}`;
            if (!allowedExtensions.includes(ext)) {
                hasInvalidFormat = true;
            }
        });

        if (hasInvalidFormat) {
            validationMessage.textContent = `Unsupported file format. Allowed formats are: ${allowedExtensions.join(", ")}.`;
            uploadInput.value = ""; // Xóa lựa chọn
            console.log("Invalid file format");
            return;
        }

        // Hiển thị preview
        Array.from(files).forEach(file => {
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
                    imagePreview.appendChild(col);
                };
                reader.readAsDataURL(file);
            }
        });
    });
});

// Xử lý validation khi submit form
$(document).ready(function () {
    $('#createLocalSpecialtyForm').on('submit', function (e) {
        const longInputs = document.querySelectorAll('input[name$="Longitude"]');
        const latInputs = document.querySelectorAll('input[name$="Latitude"]');
        const uploadInput = document.getElementById("uploadImageInput");
        const validationMessage = document.getElementById("imageValidationMessage");
        let isValid = true;

        // Validation cho Latitude và Longitude
        longInputs.forEach(input => {
            const value = parseFloat(input.value);
            if (value < -180 || value > 180) {
                $(input).next('span').text('Longitude must be between -180 and 180.');
                isValid = false;
            } else {
                $(input).next('span').text('');
            }
        });

        latInputs.forEach(input => {
            const value = parseFloat(input.value);
            if (value < -90 || value > 90) {
                $(input).next('span').text('Latitude must be between -90 and 90.');
                isValid = false;
            } else {
                $(input).next('span').text('');
            }
        });

        // Validation cho ảnh
        if (uploadInput && uploadInput.files && uploadInput.files.length > 0) {
            const files = uploadInput.files;
            if (files.length > 5) {
                validationMessage.textContent = "You can upload a maximum of 5 images.";
                isValid = false;
            }

            let hasInvalidFormat = false;
            Array.from(files).forEach(file => {
                const ext = `.${file.name.split('.').pop().toLowerCase()}`;
                if (!allowedExtensions.includes(ext)) {
                    hasInvalidFormat = true;
                }
            });

            if (hasInvalidFormat) {
                validationMessage.textContent = `Unsupported file format. Allowed formats are: ${allowedExtensions.join(", ")}.`;
                isValid = false;
            }
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});