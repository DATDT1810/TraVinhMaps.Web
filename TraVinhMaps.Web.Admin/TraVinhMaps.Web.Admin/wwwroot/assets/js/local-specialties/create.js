document.addEventListener("DOMContentLoaded", function () {
  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const uploadInput = document.getElementById("uploadImageInput");
  const imagePreview = document.getElementById("imagePreview");
  const validationMessage = document.getElementById("validationMessage");

  if (!uploadInput || !imagePreview || !validationMessage) {
    console.error("Some DOM elements not found.");
    return;
  }

  uploadInput.addEventListener("change", handleImageUpload);

  function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    validationMessage.textContent = "";

    if (files.length === 0) return;

    if (files.length > 8) {
      validationMessage.textContent = "You can upload a maximum of 8 images.";
      uploadInput.value = "";
      return;
    }

    const hasInvalid = files.some((file) => {
      const ext = `.${file.name.split(".").pop().toLowerCase()}`;
      return !allowedExtensions.includes(ext);
    });

    if (hasInvalid) {
      validationMessage.textContent = `Only image formats: ${allowedExtensions.join(
        ", "
      )}`;
      uploadInput.value = "";
      return;
    }

    imagePreview.innerHTML = "";

    let loaded = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const col = document.createElement("div");
        col.className = "col-sm-3 image-item";
        col.innerHTML = `
                        <div class="item position-relative">
                            <img src="${e.target.result}" class="w-100 rounded" />
                        </div>`;
        imagePreview.appendChild(col);

        loaded++;
        if (loaded === files.length) {
          uploadInput.value = ""; // reset input
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function addLocationFromMap() {
    const lat = document.getElementById("latitude").value;
    const lng = document.getElementById("longitude").value;
    const address = document.getElementById("Address").value;

    if (
      !lat ||
      !lng ||
      !address ||
      address === "Retrieving address..." ||
      address === "Could not retrieve address"
    ) {
      if (typeof showTimedAlert === "function") {
        showTimedAlert(
          "Warning!",
          "Please select a valid location on the map first.",
          "warning",
          1500
        );
      } else {
        alert("Please select a valid location on the map first.");
      }
      return;
    }

    if (!locationsContainer) {
      console.error("locations-container not found");
      return;
    }

    const index = window.locationIndex || 0;

    const locationHtml = `
        <div class="location-group mb-3">
            <div class="row">
                <div class="col-sm-10">
                    <h6 class="mb-0">Location #${index + 1}</h6>
                </div>
                <div class="col-sm-2 text-end">
                    <button type="button" class="btn-close" aria-label="Close" onclick="this.closest('.location-group').remove()"></button>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-12">
                    <label>Name of Location</label>
                    <input name="Locations[${index}].Name" class="form-control" placeholder="Enter a name for this location" />
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-sm-12">
                    <label>Address</label>
                    <input name="Locations[${index}].Address" class="form-control" value="${address}" readonly/>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-sm-6">
                    <label>Latitude</label>
                    <input name="Locations[${index}].Latitude" class="form-control" type="number" value="${lat}" readonly/>
                </div>
                <div class="col-sm-6">
                    <label>Longitude</label>
                    <input name="Locations[${index}].Longitude" class="form-control" type="number" value="${lng}" readonly/>
                </div>
            </div>
        </div>`;

    locationsContainer.insertAdjacentHTML("beforeend", locationHtml);
    window.locationIndex = index + 1;
  }

  // --- EVENT BINDINGS ---
  if (addLocationFromMapBtn) {
    addLocationFromMapBtn.addEventListener("click", addLocationFromMap);
  }

  if (addImageBox && uploadInput) {
    addImageBox.addEventListener("click", () => uploadInput.click());

    // Chỉ gắn sự kiện change một lần
    uploadInput.removeEventListener("change", handleImageUpload); // Gỡ sự kiện cũ nếu có
    uploadInput.addEventListener("change", handleImageUpload);
  }

  if (createForm) {
    createForm.addEventListener("submit", function (e) {
      let isValid = true;

      const files = Array.from(uploadInput.files);
      if (files.length > 5) {
        validationMessage.textContent = "You can upload a maximum of 5 images.";
        isValid = false;
      }

      const hasInvalidFormat = files.some((file) => {
        const ext = `.${file.name.split(".").pop().toLowerCase()}`;
        return !allowedExtensions.includes(ext);
      });

      if (hasInvalidFormat) {
        validationMessage.textContent = `Unsupported file format. Allowed formats are: ${allowedExtensions.join(
          ", "
        )}.`;
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
      }
    });
  }
});

// check create button
document.addEventListener("DOMContentLoaded", function () {
  const createLocalSpecialtyForm = document.getElementById(
    "createLocalSpecialtyForm"
  );
  const uploadImageInput = document.getElementById("uploadImageInput");
  const imageValidationMessage = document.getElementById(
    "imageValidationMessage"
  );
  const createBtn = document.getElementById("create_btn");

  if (createLocalSpecialtyForm) {
    createLocalSpecialtyForm.addEventListener("submit", function (e) {
      // Kiểm tra số ảnh
      if (!uploadImageInput.files || uploadImageInput.files.length === 0) {
        e.preventDefault();
        e.stopPropagation();
        imageValidationMessage.textContent = "Please select at least 1 photo.";
        return;
      }

      // Nếu có ảnh thì clear thông báo lỗi
      imageValidationMessage.textContent = "";

      // Disable nút & hiển thị loading
      if (createBtn) {
        createBtn.disabled = true;
        createBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
      }
    });
  }
});
