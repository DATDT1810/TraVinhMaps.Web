document.addEventListener('DOMContentLoaded', function () {
    if (successMessage) {
        // showSuccessAlert("Success!", successMessage, "OK");
        showTimedAlert("Success!", successMessage, "success", 3000);
    } else if (errorMessage) {
        // showErrorAlert("Error!", errorMessage, "OK");
        showTimedAlert("Error!", errorMessage, "error", 3000);
    }
});