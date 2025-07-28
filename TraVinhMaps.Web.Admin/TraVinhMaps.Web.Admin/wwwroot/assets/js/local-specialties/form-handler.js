document.addEventListener('DOMContentLoaded', function () {
    const addLocationForm = document.getElementById('addLocationForm');
    const editLocationForm = document.getElementById('editLocationForm');

    const handleFormSubmit = (form, url) => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Stop other handlers from running

            const formData = new FormData(form);
            const token = form.querySelector('input[name="__RequestVerificationToken"]').value;

            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'RequestVerificationToken': token
                }
            })
            .then(response => {
                if (response.ok) {
                    // On success, show an alert and then reload the page.
                    // Don't hide the modal manually, as the reload will take care of it.
                    showSuccessAlert('Success!', 'The location has been saved successfully.')
                        .then(() => {
                            window.location.reload();
                        });
                } else {
                    // Handle errors
                    showErrorAlert('Error!', 'Failed to save the location. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorAlert('Error!', 'An unexpected error occurred. Please try again.');
            });
        });
    };

    if (addLocationForm) {
        handleFormSubmit(addLocationForm, addLocationForm.action);
    }

    if (editLocationForm) {
        handleFormSubmit(editLocationForm, editLocationForm.action);
    }
});
