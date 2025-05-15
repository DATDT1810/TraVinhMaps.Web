/**
 * SweetAlert2 Custom Functions
 */

// Success alert
function showSuccessAlert(title = "Success!", text = "The action has been successfully completed.", confirmButtonText = "OK") {
    Swal.fire({
        title: title,
        text: text,
        icon: "success",
        confirmButtonText: confirmButtonText,
        confirmButtonColor: "#28a745" // Green colors
    });
}

// Error alert
function showErrorAlert(title = "Error!", text = "An error has occurred. Please try again.", confirmButtonText = "OK") {
    Swal.fire({
        title: title,
        text: text,
        icon: "error",
        confirmButtonText: confirmButtonText,
        confirmButtonColor: "#dc3545" // Red color
    });
}

// Warning alert
function showWarningAlert(title = "Warning!", text = "Are you sure you want to continue?", confirmButtonText = "Yes", cancelButtonText = "No") {
    return Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        confirmButtonColor: "#ffc107", // Yellow color
        cancelButtonColor: "#6c757d"  // Gray color
    });
}

// Confirmation alert (for delete, ban, unban, etc.)
async function showConfirmAlert(title = "Confirmation", text = "Are you sure you want to perform this action?", confirmButtonText = "Confirm", cancelButtonText = "Cancel") {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        confirmButtonColor: "#007bff", // Blue color
        cancelButtonColor: "#6c757d"
    });
    return result.isConfirmed; // Returns true if user confirms
}

// Information alert
function showInfoAlert(title = "Information", text = "This is an informational message.", confirmButtonText = "OK") {
    Swal.fire({
        title: title,
        text: text,
        icon: "info",
        confirmButtonText: confirmButtonText,
        confirmButtonColor: "#17a2b8" // Cyan color
    });
}

// Timed alert (auto-closes)
function showTimedAlert(title = "Notification", text = "This notification will auto-close after 2 seconds.", icon = "info", timer = 2000) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        timer: timer,
        showConfirmButton: false
    });
}