document.addEventListener('DOMContentLoaded', function () {
    if (successMessage) {
        showSuccessAlert("Success!", successMessage, "OK");
    } else if (errorMessage) {
        showErrorAlert("Error!", errorMessage, "OK");
    }
});