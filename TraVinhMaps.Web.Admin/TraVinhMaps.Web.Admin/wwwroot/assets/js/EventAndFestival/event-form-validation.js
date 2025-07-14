document.addEventListener('DOMContentLoaded', function () {
    // Initialize CKEditor for the description field
    let editor;
    ClassicEditor
        .create(document.querySelector('#descriptionEditor'), {
            height: '280px',
            // Remove the "powered by CKEditor" branding
            ui: {
                poweredBy: {
                    position: 'inside',
                    side: 'left',
                    label: null // Ẩn label
                }
            },
            toolbar: {
                items: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'link',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'outdent',
                    'indent',
                    '|',
                    'blockQuote',
                    'insertTable',
                    'undo',
                    'redo'
                ]
            }
        })
        .then(newEditor => {
            editor = newEditor;
        })
        .catch(error => { 
            console.error('CKEditor initialization error:', error); 
        });
    
    const form = document.querySelector('form[action*="CreateEventFestival"]');

    if (!form) {
        console.error('Create Event/Festival form not found.');
        return;
    }

    // Function to create and show an error message
    const showError = (field, message) => {
        // Remove existing error message
        let error = field.parentElement.querySelector('.validation-error');
        if (error) {
            error.remove();
        }

        // Create and append new error message
        error = document.createElement('div');
        error.className = 'text-danger validation-error';
        error.textContent = message;
        field.parentElement.appendChild(error);
    };

    // Function to clear error messages
    const clearError = (field) => {
        const error = field.parentElement.querySelector('.validation-error');
        if (error) {
            error.remove();
        }
    };

    form.addEventListener('submit', function (event) {
        event.preventDefault(); 

        let isValid = true;

        // Get form fields
        const titleField = form.querySelector('[name="NameEvent"]');
        const locationNameField = form.querySelector('[name="Name"]');
        const imageInput = document.getElementById('uploadImageInput');
        const startDateField = form.querySelector('[name="StartDate"]');
        const endDateField = form.querySelector('[name="EndDate"]');

        // Clear previous errors
        clearError(titleField);
        clearError(locationNameField);
        clearError(imageInput.closest('.add-image-box'));
        clearError(startDateField);
        clearError(endDateField);

        // 1. Validate Title
        if (!titleField.value.trim()) {
            showError(titleField, 'Event And Festival Title is required.');
            isValid = false;
        }

        // 2. Validate Location Name
        if (!locationNameField.value.trim()) {
            showError(locationNameField, 'Name of Location is required.');
            isValid = false;
        }

        // 3. Validate Image Upload
        if (imageInput.files.length === 0) {
            showError(imageInput.closest('.add-image-box'), 'At least one image is required.');
            isValid = false;
        } else {
            for (const file of imageInput.files) {
                if (!file.type.startsWith('image/')) {
                    showError(imageInput.closest('.add-image-box'), 'Please upload valid image files only (e.g., JPG, PNG, GIF).');
                    isValid = false;
                    break;
                }
            }
        }

        // 4. Validate Dates
        if (!startDateField.value) {
            showError(startDateField, 'Starting date is required.');
            isValid = false;
        }
        if (!endDateField.value) {
            showError(endDateField, 'Ending date is required.');
            isValid = false;
        }

        if (startDateField.value && endDateField.value) {
            const [startMonth, startDay, startYear] = startDateField.value.split('/');
            const [endMonth, endDay, endYear] = endDateField.value.split('/');

            const startDate = new Date(+startYear, +startMonth - 1, +startDay);
            const endDate = new Date(+endYear, +endMonth - 1, +endDay);

            if (endDate < startDate) {
                showError(endDateField, 'Ending date cannot be before the starting date.');
                isValid = false;
            }
        }

        // If using CKEditor, update the textarea with the editor content before submission
        if (editor) {
            const descriptionData = editor.getData();
            document.getElementById('Description').value = descriptionData;
        }

        if (isValid) {
            // If the form is valid, submit it
            form.submit();
        }
    });
}); 