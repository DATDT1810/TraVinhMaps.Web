window.onload = function () {
  if (window.successMessage) {
    showSuccessAlert("Success!", window.successMessage, "OK");
    // Optional: Clear the message after displaying
    window.successMessage = null;
  }
  if (window.errorMessage) {
    showErrorAlert("Error!", window.errorMessage, "OK");
    // Optional: Clear the message after displaying
    window.errorMessage = null;
  }
};
