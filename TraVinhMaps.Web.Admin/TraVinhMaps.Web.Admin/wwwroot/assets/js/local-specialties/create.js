document.addEventListener("DOMContentLoaded", function () {
    // --- GLOBALS & CONFIG ---
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const locationsContainer = document.getElementById('locations-container');
    const addImageBox = document.getElementById("addImageBox");
    const uploadInput = document.getElementById("uploadImageInput");
    const imagePreview = document.getElementById("imagePreview");
    const validationMessage = document.getElementById("imageValidationMessage");
    const createForm = document.getElementById("createLocalSpecialtyForm");
    const addLocationFromMapBtn = document.getElementById('addLocationFromMapBtn');

    // --- FUNCTIONS ---

    // Function to add a new location group to the form
    function addLocationFromMap() {
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        const address = document.getElementById('Address').value; // Corrected ID

        if (!lat || !lng || !address || address === 'Retrieving address...' || address === 'Could not retrieve address') {
            if (typeof showTimedAlert === 'function') {
                showTimedAlert("Warning!", "Please select a valid location on the map first.", "warning", 1500);
            } else {
                alert("Please select a valid location on the map first.");
            }
            return;
        }

        if (!locationsContainer) {
            console.error("locations-container not found");
            return;
        }

        const locationHtml = `
        <div class="location-group mb-3">
            <div class="row">
                <div class="col-sm-10">
                     <h6 class="mb-0">Location #${window.locationIndex + 1}</h6>
                </div>
                <div class="col-sm-2 text-end">
                    <button type="button" class="btn-close" aria-label="Close" onclick="this.closest('.location-group').remove()"></button>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-12">
                    <label>Name of Location</label>
                    <input name="Locations[${window.locationIndex}].Name" class="form-control" placeholder="Enter a name for this location" />
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Name" data-valmsg-replace="true"></span>
                </div>
            </div>
            <div class="row mt-2">
                 <div class="col-sm-12">
                    <label>Address</label>
                    <input name="Locations[${window.locationIndex}].Address" class="form-control" value="${address}" readonly/>
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Address" data-valmsg-replace="true"></span>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-sm-6">
                    <label>Latitude</label>
                    <input name="Locations[${window.locationIndex}].Latitude" class="form-control" type="number" value="${lat}" readonly/>
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Latitude" data-valmsg-replace="true"></span>
                </div>
                <div class="col-sm-6">
                    <label>Longitude</label>
                    <input name="Locations[${window.locationIndex}].Longitude" class="form-control" type="number" value="${lng}" readonly/>
                    <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Longitude" data-valmsg-replace="true"></span>
                </div>
            </div>
        </div>`;
        locationsContainer.insertAdjacentHTML("beforeend", locationHtml);
        window.locationIndex++;
    }

    // --- EVENT LISTENERS ---

    if (addLocationFromMapBtn) {
        addLocationFromMapBtn.addEventListener('click', addLocationFromMap);
    }

    // Image Upload Logic
    if (addImageBox && uploadInput) {
        addImageBox.addEventListener("click", () => uploadInput.click());

        uploadInput.addEventListener("change", function () {
            if (!imagePreview || !validationMessage) return;
            
            validationMessage.textContent = "";
            imagePreview.innerHTML = "";
            const files = uploadInput.files;

            if (!files || files.length === 0) return;

            if (files.length > 5) {
                validationMessage.textContent = "You can upload a maximum of 5 images.";
                uploadInput.value = "";
                return;
            }

            let hasInvalidFormat = false;
            Array.from(files).forEach((file) => {
                const ext = `.${file.name.split(".").pop().toLowerCase()}`;
                if (!allowedExtensions.includes(ext)) {
                    hasInvalidFormat = true;
                }
            });

            if (hasInvalidFormat) {
                validationMessage.textContent = `Unsupported file format. Allowed formats are: ${allowedExtensions.join(", ")}.`;
                uploadInput.value = "";
                return;
            }

            Array.from(files).forEach((file) => {
                if (file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const col = document.createElement("div");
                        col.classList.add("col-sm-3");
                        col.innerHTML = `<div class="item position-relative"><img src="${e.target.result}" class="w-100 rounded"></div>`;
                        imagePreview.appendChild(col);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    // Form Submission Validation
    if (createForm) {
        createForm.addEventListener("submit", function (e) {
            let isValid = true;

            // Validate images
            if (uploadInput && uploadInput.files && uploadInput.files.length > 0) {
                const files = uploadInput.files;
                if (files.length > 5) {
                    validationMessage.textContent = "You can upload a maximum of 5 images.";
                    isValid = false;
                }

                let hasInvalidFormat = false;
                Array.from(files).forEach((file) => {
                    const ext = `.${file.name.split(".").pop().toLowerCase()}`;
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
    }
});
