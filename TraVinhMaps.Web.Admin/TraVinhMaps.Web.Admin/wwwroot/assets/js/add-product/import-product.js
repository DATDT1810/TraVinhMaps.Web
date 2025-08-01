$(document).ready(function () {
    // Handle toggle issues button
    $('#toggleIssuesBtn').click(function () {
        $('#issuesContentWrapper').slideToggle(300, function () {
            const isVisible = $(this).is(':visible');
            $('#issuesToggleIcon').toggleClass('fa-chevron-up', isVisible);
            $('#issuesToggleIcon').toggleClass('fa-chevron-down', !isVisible);

            // Store preference in session storage
            sessionStorage.setItem('issuesExpanded', isVisible ? 'true' : 'false');
        });
    });

    // Handle lookup values button
    $('#showLookupValuesBtn').click(function (e) {
        e.preventDefault();
        $('#lookupValuesModal').modal('show');
    });

    let excelData = [];
    let excelHeaders = [];
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 1;

    // Handle show lookup values button
    $('#showLookupValuesBtn').click(function (e) {
        e.preventDefault();
        $('#lookupValuesModal').modal('show');
    });

    // Handle instructions button
    $('#showInstructionsBtn').click(function (e) {
        e.preventDefault();
        $('#instructionsModal').modal('show');
    });

    // Setup the Excel file input and dropzone
    $('#browseBtn').click(function () {
        $('#excelFileInput').click();
    });

    $('#excelFileInput').change(function (e) {
        handleExcelFile(e.target.files[0]);
    });

    // Handle drag and drop
    const dropzone = document.getElementById('excelDropzone');

    dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropzone.classList.add('dropzone-active');
    });

    dropzone.addEventListener('dragleave', function () {
        dropzone.classList.remove('dropzone-active');
    });

    dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropzone.classList.remove('dropzone-active');

        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            if (file.name.match(/\.(xlsx|xls)$/)) {
                handleExcelFile(file);
            } else {
                alert('Please upload a valid Excel file (.xlsx, .xls)');
            }
        }
    });

    // Handle the Excel file
    function handleExcelFile(file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get the first worksheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Store headers
            if (jsonData.length > 0) {
                excelHeaders = jsonData[0];
            }

            // Store data
            excelData = jsonData;

            // Reset pagination to first page
            currentPage = 1;

            // Process the data
            processExcelData();
        };

        reader.readAsArrayBuffer(file);
    }

    // Process and display the Excel data
    function processExcelData() {
        // Check if data is valid
        if (!excelData || excelData.length < 2) {
            alert('Invalid data format. Please use the provided template.');
            return;
        }

        // Clear existing data
        $('#excelDataBody').empty();

        // Get lookup data from the page
        const ocopTypes = window.ocopTypes || [];
        const companies = window.companies || [];
        const tags = window.tags || [];

        // Track validation issues
        let validProducts = 0;
        let warningProducts = 0;
        let errorProducts = 0;

        // Calculate pagination
        const dataRowsCount = excelData.length - 1; // excluding header
        totalPages = Math.ceil(dataRowsCount / pageSize);

        // Update pagination UI
        $('#currentPage').text(currentPage);
        $('#totalPages').text(totalPages);
        $('#totalItems').text(dataRowsCount);

        // Calculate page bounds
        const startIdx = (currentPage - 1) * pageSize + 1; // +1 to skip header
        const endIdx = Math.min(startIdx + pageSize - 1, excelData.length - 1);

        $('#pageStart').text(startIdx);
        $('#pageEnd').text(endIdx);

        // Update pagination buttons
        $('#prevPageBtn').toggleClass('disabled', currentPage === 1);
        $('#nextPageBtn').toggleClass('disabled', currentPage === totalPages || totalPages === 0);

        // Process rows for the current page only
        for (let i = startIdx; i <= endIdx; i++) {
            const row = excelData[i];
            if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue; // Skip empty rows

            // Simulate validation
            let status = 'Valid';
            let statusClass = 'badge-light-primary';
            let note = '-';
            let hasError = false;

            // Product Name validation (index 0)
            if (!row[0]) {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = 'Product name is required';
                errorProducts++;
                hasError = true;
            }

            // Price validation (index 2)
            if (!row[2]) {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = 'Product price is required';
                errorProducts++;
                hasError = true;
            }

            // OcopType validation (index 3)
            let ocopTypeId = null;
            if (row[3]) {
                const matchedType = ocopTypes.find(t => t.name.toLowerCase() === row[3].toString().toLowerCase());
                if (!matchedType) {
                    status = 'Error';
                    statusClass = 'badge-light-danger';
                    note = `OcopType "${row[3]}" not found in database`;
                    errorProducts++;
                    hasError = true;
                } else {
                    ocopTypeId = matchedType.id;
                }
            } else {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = 'OcopType is required';
                errorProducts++;
                hasError = true;
            }

            // Company validation (index 4)
            let companyId = null;
            if (row[4]) {
                const matchedCompany = companies.find(c => c.name.toLowerCase() === row[4].toString().toLowerCase());
                if (!matchedCompany) {
                    status = 'Error';
                    statusClass = 'badge-light-danger';
                    note = `Company "${row[4]}" not found in database`;
                    errorProducts++;
                    hasError = true;
                } else {
                    companyId = matchedCompany.id;
                }
            } else {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = 'Company is required';
                errorProducts++;
                hasError = true;
            }

            // OcopPoint validation (index 5)
            if (!row[5] || isNaN(parseInt(row[5])) || parseInt(row[5]) < 1 || parseInt(row[5]) > 5) {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = 'OcopPoint must be a number between 1 and 5';
                errorProducts++;
                hasError = true;
            }

            // OcopYear validation (index 6)
            if (!row[6] || isNaN(parseInt(row[6])) || parseInt(row[6]) > new Date().getFullYear()) {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = 'OcopYear must be a valid year not in the future';
                errorProducts++;
                hasError = true;
            }

            // Tag validation (index 7)
            let tagId = null;
            if (row[7]) {
                const matchedTag = tags.find(t => t.name.toLowerCase() === row[7].toString().toLowerCase());
                if (!matchedTag) {
                    status = 'Error';
                    statusClass = 'badge-light-danger';
                    note = `Tag "${row[7]}" not found in database`;
                    errorProducts++;
                    hasError = true;
                } else {
                    tagId = matchedTag.id;
                }
            } else {
                // Tag is optional, no warning needed
            }

            if (!hasError) {
                validProducts++;
            }

            // Store IDs for later use
            if (!excelData[i].ids) {
                excelData[i].ids = {};
            }
            excelData[i].ids.ocopTypeId = ocopTypeId;
            excelData[i].ids.companyId = companyId;
            excelData[i].ids.tagId = tagId;

            // Create table row
            const tr = $('<tr>').attr('data-row', i);

            // Add row number
            tr.append($('<td>').text(i));

            // Add status with badge
            const statusBadge = $('<span>')
                .addClass('badge ' + statusClass)
                .text(status);
            tr.append($('<td>').append(statusBadge));

            // Add product data cells
            tr.append($('<td contenteditable="true">').attr('data-col', 0).text(row[0] || '')); // Product name
            tr.append($('<td contenteditable="true">').attr('data-col', 1).text(row[1] || '')); // Description
            tr.append($('<td contenteditable="true">').attr('data-col', 2).text(row[2] ? formatPrice(row[2]) : '')); // Price

            // OcopType with validation indicator
            const ocopTypeCell = $('<td contenteditable="true">').attr('data-col', 3).text(row[3] || '');
            if (ocopTypeId) {
                ocopTypeCell.append($('<i class="fa fa-check-circle text-success ms-2"></i>'));
            } else if (row[3]) {
                ocopTypeCell.append($('<i class="fa fa-times-circle text-danger ms-2"></i>'));
            }
            tr.append(ocopTypeCell);

            // Company with validation indicator
            const companyCell = $('<td contenteditable="true">').attr('data-col', 4).text(row[4] || '');
            if (companyId) {
                companyCell.append($('<i class="fa fa-check-circle text-success ms-2"></i>'));
            } else if (row[4]) {
                companyCell.append($('<i class="fa fa-times-circle text-danger ms-2"></i>'));
            }
            tr.append(companyCell);

            // OcopPoint
            tr.append($('<td contenteditable="true">').attr('data-col', 5).text(row[5] || '')); // OcopPoint

            // OcopYear
            tr.append($('<td contenteditable="true">').attr('data-col', 6).text(row[6] || '')); // OcopYear

            // Add image upload control
            const imageCell = $('<td>');
            const imageUploadGroup = $('<div class="input-group">')
                .append($('<input type="file" class="form-control product-image-upload" accept="image/*" multiple>'))
                .append($('<button type="button" class="btn btn-outline-primary upload-image-btn"><i class="fa fa-upload"></i></button>'));
            imageCell.append(imageUploadGroup);

            // Display thumbnails of selected images
            const imagePreviewDiv = $('<div class="image-preview mt-2">');
            const requiredLabel = $('<div class="required-image-label text-danger small mb-1" style="display: none;"><i class="fa fa-exclamation-circle"></i> At least one image required</div>');
            imageCell.append(requiredLabel);
            imageCell.append(imagePreviewDiv);

            tr.append(imageCell);

            // Add row to table
            $('#excelDataBody').append(tr);
        }

        // Setup editable cells functionality
        setupEditableCells();

        // Setup image upload functionality
        setupImageUpload();

        // Run full validation to update the issues list
        collectAllValidationIssues();

        // Count all products across all pages
        let totalProductCount = 0;
        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            if (row && row.length > 0) {
                totalProductCount++;
            }
        }

    // Update product count and estimated time
    $('#productCount').text(totalProductCount);

    // Estimate about 1 minute per 10 products
    const estimatedMinutes = Math.ceil(totalProductCount / 10) * 2;
    $('#estimatedTime').text(`~${estimatedMinutes}`);

    // Show the data preview section
    $('#dataPreviewSection').removeClass('d-none');
}

// Display validation issues in a grouped format
function displayValidationIssues(issuesByRow) {
    const issuesList = $('#issuesList');
    issuesList.empty();

    const issueKeys = Object.keys(issuesByRow);

    if (issueKeys.length > 0) {
        issueKeys.sort((a, b) => a - b).forEach(rowNum => {
            const rowIssues = issuesByRow[rowNum];
            if (rowIssues.length > 0) {
                const li = $('<li>');
                // Group issues under a single row entry
                let issueHtml = `<div class="d-flex">
                                     <strong class="me-2">• Row ${rowNum}:</strong>
                                     <div>`;

                if (rowIssues.length === 1) {
                    issueHtml += rowIssues[0];
                } else {
                    const nestedList = rowIssues.map(issue => `<div>- ${issue}</div>`).join('');
                    issueHtml += `${nestedList}`;
                }
                
                issueHtml += `</div></div>`;
                li.html(issueHtml);
                issuesList.append(li);
            }
        });
        $('#validationIssues').removeClass('d-none');
        
        // Check if panel should be expanded
        if (sessionStorage.getItem('issuesExpanded') === 'true') {
            $('#issuesContentWrapper').show();
            $('#issuesToggleIcon').removeClass('fa-chevron-down').addClass('fa-chevron-up');
        } else {
            $('#issuesContentWrapper').hide();
            $('#issuesToggleIcon').removeClass('fa-chevron-up').addClass('fa-chevron-down');
        }
    } else {
        $('#validationIssues').addClass('d-none');
    }
}

// Collect validation issues from all rows
function collectAllValidationIssues() {
    const issuesByRow = {};

    // Helper to add an issue
    const addIssue = (rowNum, message) => {
        if (!issuesByRow[rowNum]) {
            issuesByRow[rowNum] = [];
        }
        // Avoid adding duplicate messages for the same row
        if (!issuesByRow[rowNum].includes(message)) {
            issuesByRow[rowNum].push(message);
        }
    };

    // Get lookup data from the page
    const ocopTypes = window.ocopTypes || [];
    const companies = window.companies || [];
    const tags = window.tags || [];

    // Check all rows, not just the current page
    for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i];
        if (!row || row.length === 0) continue;

        // Clear previous IDs
        if (!excelData[i].ids) {
            excelData[i].ids = {};
        }

        // Product Name validation
        if (!row[0]) {
            addIssue(i, 'Product name is required');
        }

        // Price validation
        if (!row[2]) {
            addIssue(i, 'Product price is required');
        }

        // OcopType validation
        if (row[3]) {
            const matchedType = ocopTypes.find(t => t.name.toLowerCase() === row[3].toString().toLowerCase());
            if (!matchedType) {
                addIssue(i, `OcopType "${row[3]}" not found in database`);
            } else {
                excelData[i].ids.ocopTypeId = matchedType.id;
            }
        } else {
            addIssue(i, 'OcopType is required');
        }

        // Company validation
        if (row[4]) {
            const matchedCompany = companies.find(c => c.name.toLowerCase() === row[4].toString().toLowerCase());
            if (!matchedCompany) {
                addIssue(i, `Company "${row[4]}" not found in database`);
            } else {
                excelData[i].ids.companyId = matchedCompany.id;
            }
        } else {
            addIssue(i, 'Company is required');
        }

        // OcopPoint validation
        if (!row[5] || isNaN(parseInt(row[5])) || parseInt(row[5]) < 1 || parseInt(row[5]) > 5) {
            addIssue(i, 'OcopPoint must be a number between 1 and 5');
        }

        // OcopYear validation
        if (!row[6] || isNaN(parseInt(row[6])) || parseInt(row[6]) > new Date().getFullYear()) {
            addIssue(i, 'OcopYear must be a valid year not in the future');
        }
        
        // Tag validation (recommendation) - REMOVED
        // if (!row[7]) {
        //     addIssue(i, 'Tag is recommended');
        // }

        // Image validation
        if (!excelData[i].files || excelData[i].files.length === 0) {
            addIssue(i, `No images uploaded for product "${row[0] || 'Unnamed'}"`);
        }

        // Use default Tag ID
        const defaultTagId = tags.length > 0 ? tags[0].id : null;
        excelData[i].ids.tagId = defaultTagId;
    }

    // Update UI
    displayValidationIssues(issuesByRow);
}

    // Handle pagination clicks
    $('#prevPageBtn').click(function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            processExcelData();
        }
    });

    $('#nextPageBtn').click(function (e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            processExcelData();
        }
    });

    // Setup editable cells
    function setupEditableCells() {
        $('[contenteditable="true"]').on('focus', function () {
            // Store original value
            $(this).data('original', $(this).text());
        }).on('blur', function () {
            // Get new value
            const newValue = $(this).text();
            const oldValue = $(this).data('original');

            // If value changed
            if (newValue !== oldValue) {
                // Get row and column
                const rowIdx = parseInt($(this).closest('tr').attr('data-row'));
                const colIdx = parseInt($(this).attr('data-col'));

                // Update data
                if (!excelData[rowIdx]) excelData[rowIdx] = [];

                // Special handling for price column
                if (colIdx === 2) {
                    const numValue = parseFloat(newValue.replace(/[^\d.-]/g, ''));
                    if (!isNaN(numValue)) {
                        excelData[rowIdx][colIdx] = numValue;
                        $(this).text(formatPrice(numValue));
                    }
                } else {
                    excelData[rowIdx][colIdx] = newValue;
                }

                // Revalidate
                validateRow(rowIdx);
            }
        });
    }

    // Validate a row
    function validateRow(rowIndex) {
        const row = excelData[rowIndex];
        const tr = $(`tr[data-row="${rowIndex}"]`);

        // If row is not visible on current page, just update the data
        if (tr.length === 0) {
            collectAllValidationIssues();
            return;
        }

        // Get lookup data from the page
        const ocopTypes = window.ocopTypes || [];
        const companies = window.companies || [];
        const tags = window.tags || [];

        const badge = tr.find('td:nth-child(2) .badge');
        let status = 'Valid';
        let statusClass = 'badge-light-primary';
        let note = '-';
        let hasError = false;

        // Clear previous IDs
        if (!excelData[rowIndex].ids) {
            excelData[rowIndex].ids = {};
        }

        // Product Name validation
        if (!row[0]) {
            status = 'Error';
            statusClass = 'badge-light-danger';
            note = 'Product name is required';
            hasError = true;
        }

        // Price validation
        if (!row[2]) {
            status = 'Error';
            statusClass = 'badge-light-danger';
            note = 'Product price is required';
            hasError = true;
        }

        // OcopType validation
        const ocopTypeCell = tr.find('td:nth-child(6)');
        if (row[3]) {
            const matchedType = ocopTypes.find(t => t.name.toLowerCase() === row[3].toString().toLowerCase());
            if (!matchedType) {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = `OcopType "${row[3]}" not found in database`;
                hasError = true;
                ocopTypeCell.find('i').remove();
                ocopTypeCell.append($('<i class="fa fa-times-circle text-danger ms-2"></i>'));
            } else {
                excelData[rowIndex].ids.ocopTypeId = matchedType.id;
                ocopTypeCell.find('i').remove();
                ocopTypeCell.append($('<i class="fa fa-check-circle text-success ms-2"></i>'));
            }
        } else {
            status = 'Error';
            statusClass = 'badge-light-danger';
            note = 'OcopType is required';
            hasError = true;
            ocopTypeCell.find('i').remove();
        }

        // Company validation
        const companyCell = tr.find('td:nth-child(7)');
        if (row[4]) {
            const matchedCompany = companies.find(c => c.name.toLowerCase() === row[4].toString().toLowerCase());
            if (!matchedCompany) {
                status = 'Error';
                statusClass = 'badge-light-danger';
                note = `Company "${row[4]}" not found in database`;
                hasError = true;
                companyCell.find('i').remove();
                companyCell.append($('<i class="fa fa-times-circle text-danger ms-2"></i>'));
            } else {
                excelData[rowIndex].ids.companyId = matchedCompany.id;
                companyCell.find('i').remove();
                companyCell.append($('<i class="fa fa-check-circle text-success ms-2"></i>'));
            }
        } else {
            status = 'Error';
            statusClass = 'badge-light-danger';
            note = 'Company is required';
            hasError = true;
            companyCell.find('i').remove();
        }

        // OcopPoint validation
        if (!row[5] || isNaN(parseInt(row[5])) || parseInt(row[5]) < 1 || parseInt(row[5]) > 5) {
            status = 'Error';
            statusClass = 'badge-light-danger';
            note = 'OcopPoint must be a number between 1 and 5';
            hasError = true;
        }

        // OcopYear validation
        if (!row[6] || isNaN(parseInt(row[6])) || parseInt(row[6]) > new Date().getFullYear()) {
            status = 'Error';
            statusClass = 'badge-light-danger';
            note = 'OcopYear must be a valid year not in the future';
            hasError = true;
        }

        // Get default Tag ID
        const defaultTagId = tags.length > 0 ? tags[0].id : null;
        excelData[rowIndex].ids.tagId = defaultTagId;

        // Update UI
        badge.removeClass('badge-light-primary badge-light-warning badge-light-danger')
            .addClass(statusClass)
            .text(status);

        // Refresh validation issues
        collectAllValidationIssues();
    }

    // Setup image upload functionality
    function setupImageUpload() {
        // Handle file selection change
        $('.product-image-upload').on('change', function () {
            const files = this.files;
            const previewDiv = $(this).closest('td').find('.image-preview');
            const requiredLabel = $(this).closest('td').find('.required-image-label');
            const rowIdx = parseInt($(this).closest('tr').attr('data-row'));
            const invalidFiles = [];
            previewDiv.empty();

            // Store files in the excelData
            if (!excelData[rowIdx].files) {
                excelData[rowIdx].files = [];
            }

            // Clear previous files
            excelData[rowIdx].files = [];

            // Check if there are any files
            if (files.length === 0) {
                requiredLabel.show();
                return;
            }

            // Check if files are valid image files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileType = file.type;
                
                // Check if file is an image
                if (!fileType.match('image.*')) {
                    invalidFiles.push(file.name);
                    continue;
                }
                
                excelData[rowIdx].files.push(file);

                // Create preview thumbnail with delete button
                const reader = new FileReader();
                reader.onload = function (e) {
                    const imgContainer = $('<div>').addClass('img-container position-relative me-2 mb-2');
                    
                    // Delete button
                    const deleteBtn = $('<button>')
                        .addClass('btn btn-sm btn-danger image-delete-btn')
                        .html('<i class="fa fa-times"></i>')
                        .attr('type', 'button');
                    
                    // Image thumbnail
                    const img = $('<img>')
                        .addClass('img-thumbnail preview-image')
                        .attr('src', e.target.result)
                        .attr('data-full-img', e.target.result)
                        .css({ 'width': '60px', 'height': '60px', 'object-fit': 'cover', 'cursor': 'pointer' });
                    
                    imgContainer.append(img);
                    imgContainer.append(deleteBtn);
                    previewDiv.append(imgContainer);
                    
                    // Setup click handler for image preview
                    img.on('click', function() {
                        showImagePreview($(this).attr('data-full-img'));
                    });
                    
                    // Setup click handler for delete button
                    deleteBtn.on('click', function(e) {
                        e.stopPropagation();
                        const imgContainer = $(this).closest('.img-container');
                        const allImages = previewDiv.find('.img-container');
                        const index = allImages.index(imgContainer);
                        
                        // Remove from UI
                        imgContainer.remove();
                        
                        // Remove from data
                        if (excelData[rowIdx].files && index >= 0) {
                            excelData[rowIdx].files.splice(index, 1);
                        }
                        
                        // Show required label if no images left
                        if (previewDiv.find('.img-container').length === 0) {
                            requiredLabel.show();
                            
                            // Add to validation issues
                            collectAllValidationIssues();
                        }
                    });
                };
                reader.readAsDataURL(file);
            }
            
            // Show invalid file message if any
            if (invalidFiles.length > 0) {
                // Add to validation issues
                const fileIssue = `• Row ${rowIdx}: Invalid file type(s): ${invalidFiles.join(', ')}. Only image files are allowed.`;
                
                // Check if this issue already exists
                let exists = false;
                $('#issuesList li').each(function() {
                    if ($(this).html().includes(`Row ${rowIdx}: Invalid file type`)) {
                        exists = true;
                        $(this).html(fileIssue);
                        return false;
                    }
                });
                
                if (!exists) {
                    $('#issuesList').append($('<li class="text-danger">').html(fileIssue));
                    $('#validationIssues').removeClass('d-none');
                }
                
                // Show SweetAlert notification
                showWarningAlert(
                    'Invalid Files', 
                    `Some files are not images and will be skipped: ${invalidFiles.join(', ')}`,
                    'OK'
                );
            }
            
            // Hide required label if valid files were added
            if (excelData[rowIdx].files.length > 0) {
                requiredLabel.hide();
            } else {
                requiredLabel.show();
            }
            
            // Update validation
            validateRow(rowIdx);
        });

        // Handle upload button click
        $('.upload-image-btn').on('click', function () {
            const fileInput = $(this).closest('.input-group').find('.product-image-upload');
            fileInput.click();
        });
    }
    
    // Show image preview in modal
    function showImagePreview(imgSrc) {
        // Create modal if it doesn't exist
        if ($('#imagePreviewModal').length === 0) {
            const modal = $(`
                <div class="modal fade" id="imagePreviewModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Image Preview</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body text-center">
                                <img id="previewImage" src="" alt="Preview" class="img-fluid" style="max-height: 70vh;">
                            </div>
                        </div>
                    </div>
                </div>
            `);
            $('body').append(modal);
        }
        
        // Set image source and show modal
        $('#previewImage').attr('src', imgSrc);
        var previewModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        previewModal.show();
    }

    // Helper function to format price
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price);
    }

    // Handle clear data button
    $('#clearDataBtn').click(function () {
        excelData = [];
        $('#excelDataBody').empty();
        $('#issuesList').empty();
        $('#dataPreviewSection').addClass('d-none');
        $('#excelFileInput').val('');

        // Reset pagination
        currentPage = 1;
        totalPages = 1;
        updatePaginationUI();
    });

    // Update pagination UI
    function updatePaginationUI() {
        $('#currentPage').text(currentPage);
        $('#totalPages').text(totalPages);
        $('#pageStart').text(0);
        $('#pageEnd').text(0);
        $('#totalItems').text(0);
        $('#prevPageBtn').toggleClass('disabled', currentPage === 1);
        $('#nextPageBtn').toggleClass('disabled', currentPage === totalPages || totalPages === 0);
    }

    // Template download handler
    $('#downloadTemplateBtn').click(function (e) {
        e.preventDefault();

        // Create template workbook
        const wb = XLSX.utils.book_new();

        // Create headers
        const templateData = [
            ['Product Name', 'Description', 'Price (VND)', 'OcopType', 'Company', 'OcopPoint', 'OcopYear'],
            ['Honey', 'Pure honey from U Minh forest', '250000', 'Thực phẩm', 'An Nam Company', '5', '2023'],
            ['Bánh tráng nướng', 'Bánh tráng nướng truyền thống', '45000', 'Thực phẩm', 'Công ty Truyền thống', '4', '2022'],
        ];

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(templateData);

        // Set column widths
        ws['!cols'] = [
            { wpx: 200 }, // Name
            { wpx: 300 }, // Description
            { wpx: 100 }, // Price
            { wpx: 120 }, // OcopType
            { wpx: 150 }, // Company
            { wpx: 80 },  // OcopPoint
            { wpx: 80 },  // OcopYear
        ];

        // Add to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Template');

        // Generate Excel file
        XLSX.writeFile(wb, 'ocop_product_template.xlsx');
    });

    // Handle start import button
    $('#startImportBtn').click(function () {
        // Count valid records
        let validCount = 0;
        let invalidCount = 0;
        let noImagesCount = 0;

        // Collect all products to import
        const productsToImport = [];

        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            if (!row || row.length === 0) continue;

            // Flag to track image requirement
            let hasNoImages = !excelData[i].files || excelData[i].files.length === 0;

            // Check if product has required data and valid IDs
            if (row[0] && row[2] && excelData[i].ids &&
                excelData[i].ids.ocopTypeId && excelData[i].ids.companyId && !hasNoImages) {

                validCount++;

                // Prepare product data
                const product = {
                    ProductName: row[0],
                    ProductDescription: row[1] || '',
                    ProductPrice: row[2].toString(),
                    OcopTypeId: excelData[i].ids.ocopTypeId,
                    CompanyId: excelData[i].ids.companyId,
                    OcopPoint: parseInt(row[5]) || 1,
                    OcopYearRelease: parseInt(row[6]) || new Date().getFullYear(),
                    TagId: excelData[i].ids.tagId || '',
                    rowIndex: i,
                    files: excelData[i].files || [] // Include files array
                };

                productsToImport.push(product);
            } else {
                if (hasNoImages) {
                    noImagesCount++;
                    
                    // Show required label for rows on current page
                    const tr = $(`tr[data-row="${i}"]`);
                    if (tr.length > 0) {
                        tr.find('.required-image-label').show();
                    }
                }
                invalidCount++;
            }
        }

        if (validCount <= 0) {
            if (noImagesCount > 0) {
                showWarningAlert(
                    'No Valid Records',
                    'Please add at least one image to each product.'
                );
            } else {
                showWarningAlert(
                    'No Valid Records',
                    'Please fix the validation errors before importing.'
                );
            }
            return;
        }

        if (invalidCount > 0) {
            let message = `There are ${invalidCount} invalid products.`;
            if (noImagesCount > 0) {
                message += ` (${noImagesCount} products missing images)`;
            }
            
            showWarningAlert(
                'Invalid Products', 
                `${message}<br>Do you want to continue importing only the <b>${validCount}</b> valid products?`,
                'Yes, continue',
                'No, cancel'
            ).then((result) => {
                if (result.isConfirmed) {
                    confirmImport(validCount, productsToImport);
                }
            });
            return;
        }

        // If no invalid products, confirm import directly
        confirmImport(validCount, productsToImport);
    });

    // Function to handle import confirmation and processing
    function confirmImport(validCount, productsToImport) {
        showConfirmAlert(
            'Confirm Import',
            `Are you sure you want to import ${validCount} products?`,
            'Yes, import products',
            'Cancel'
        ).then((confirmed) => {
            if (confirmed) {
                console.log('Import confirmed, starting processing...');
                // Show loading state
                $('#startImportBtn').prop('disabled', true).html('<i class="fa fa-spinner fa-spin me-1"></i>Importing...');
                
                // Add progress bar to the page
                if ($('#importProgressContainer').length === 0) {
                    const progressContainer = $(`
                        <div id="importProgressContainer" class="mt-4">
                            <h5 class="mb-2">Import Progress</h5>
                            <div class="progress">
                                <div id="importProgressBar" class="progress-bar bg-success" role="progressbar" style="width: 0%" 
                                    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                            </div>
                            <div class="mt-2 text-center" id="importProgressStatus">Preparing to import...</div>
                        </div>
                    `);
                    $('#dataPreviewSection').append(progressContainer);
                }

                // Process products in batches of 5
                const BATCH_SIZE = 5;
                let currentBatch = 0;
                const totalBatches = Math.ceil(productsToImport.length / BATCH_SIZE);
                let totalProcessed = 0;
                let totalErrors = 0;

                const processBatch = function (batchIndex) {
                    if (batchIndex >= totalBatches) {
                        // All batches processed
                        $('#startImportBtn').html('<i class="fa fa-check me-1"></i>Import Complete');
                        
                        // Update progress bar to 100%
                        $('#importProgressBar').css('width', '100%').attr('aria-valuenow', 100).text('100%');
                        $('#importProgressStatus').html(`Import completed. <b>${totalProcessed - totalErrors}</b> products imported successfully.`);

                        const successCount = totalProcessed - totalErrors;
                        if (totalErrors > 0) {
                            Swal.fire({
                                title: 'Import Completed with Issues',
                                html: `Successfully imported <b>${successCount}</b> products.<br><b>${totalErrors}</b> products failed.`,
                                icon: 'warning',
                                confirmButtonColor: '#1B8754',
                                confirmButtonText: 'Yes'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    window.location.reload();
                                }
                            });
                        } else {
                            Swal.fire({
                                title: 'Import Successful',
                                html: `Successfully imported <b>${successCount}</b> products!`,
                                icon: 'success',
                                confirmButtonColor: '#1B8754',
                                confirmButtonText: 'Yes'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    window.location.reload();
                                }
                            });
                        }
                        return;
                    }

                    // Get products for current batch
                    const startIndex = batchIndex * BATCH_SIZE;
                    const endIndex = Math.min(startIndex + BATCH_SIZE, productsToImport.length);
                    const batchProducts = productsToImport.slice(startIndex, endIndex);

                    // Update progress
                    const progress = Math.round((batchIndex / totalBatches) * 100);
                    $('#startImportBtn').html(`<i class="fa fa-spinner fa-spin me-1"></i>Importing batch ${batchIndex + 1}/${totalBatches}`);
                    
                    // Update progress bar
                    $('#importProgressBar').css('width', `${progress}%`).attr('aria-valuenow', progress).text(`${progress}%`);
                    $('#importProgressStatus').html(`Processing batch ${batchIndex + 1} of ${totalBatches} <small>(${totalProcessed} of ${productsToImport.length} products processed)</small>`);

                    // Create form data for this batch
                    const formData = new FormData();

                    // Prepare products array (without files)
                    const productsForJson = batchProducts.map(product => ({
                        ProductName: product.ProductName,
                        ProductDescription: product.ProductDescription,
                        ProductPrice: product.ProductPrice,
                        OcopTypeId: product.OcopTypeId,
                        CompanyId: product.CompanyId,
                        OcopPoint: product.OcopPoint,
                        OcopYearRelease: product.OcopYearRelease,
                        TagId: product.TagId
                    }));

                    // Add products JSON to form data
                    formData.append('products', JSON.stringify(productsForJson));

                    // Add images for each product in batch
                    batchProducts.forEach((product, index) => {
                        if (product.files && product.files.length > 0) {
                            product.files.forEach(file => {
                                formData.append(`productImages[${index}]`, file);
                            });
                        } else {
                            // If no images, create a placeholder to maintain index consistency
                            console.warn(`Product "${product.ProductName}" has no images`);
                        }
                    });

                    // Debug information
                    console.log('Preparing to send batch', batchIndex + 1);
                    console.log('Product data:', productsForJson);
                    console.log('Files data:', batchProducts.map(p => p.files ? p.files.length : 0));
                    console.log('Session ID:', window.sessionId);

                    // Log the formData contents for debugging
                    console.log('FormData content summary:');
                    for (let pair of formData.entries()) {
                        if (pair[0] === 'products') {
                            console.log('Products JSON:', pair[1]);
                        } else {
                            console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
                        }
                    }
                    
                    // Send batch request
                    console.log('Attempting to send AJAX request to import products...');
                    $.ajax({
                        url: 'window.apiBaseUrl + "/api/OcopProduct/import-product',
                        type: 'POST',
                        headers: {
                            'sessionId': window.sessionId,
                        },
                        data: formData,
                        processData: false,
                        contentType: false,
                        timeout: 300000, // 5 minutes timeout
                        beforeSend: function(xhr) {
                            console.log('Starting AJAX request to:', 'window.apiBaseUrl + "/api/OcopProduct/import-product');
                        },
                        success: function (response) {
                            console.log(`Batch ${batchIndex + 1} completed successfully`, response);
                            totalProcessed += batchProducts.length;
                            
                            // Update status message
                            $('#importProgressStatus').html(`Batch ${batchIndex + 1} completed successfully. Processing next batch...`);

                            // Process next batch
                            processBatch(batchIndex + 1);
                        },
                        error: function (xhr, status, error) {
                            console.error(`Batch ${batchIndex + 1} failed:`, error);
                            console.error('XHR status:', status);
                            console.error('XHR response:', xhr.responseText);
                            console.error('XHR status code:', xhr.status);

                            // Try to parse error response
                            let errorMessage = error;
                            try {
                                const errorResponse = JSON.parse(xhr.responseText);
                                errorMessage = errorResponse.message || errorMessage;
                            } catch (e) {
                                // Use default error message
                            }

                            console.error(`Failed to import batch ${batchIndex + 1}: ${errorMessage}`);
                            totalProcessed += batchProducts.length;
                            totalErrors += batchProducts.length;
                            
                            // Show error message with SweetAlert custom function
                            showErrorAlert(
                                'Batch Import Error',
                                `Failed to import batch ${batchIndex + 1}: ${errorMessage}`,
                                'Continue'
                            );
                            
                            // Update status message
                            $('#importProgressStatus').html(`<span class="text-danger">Batch ${batchIndex + 1} failed.</span> Continuing with next batch...`);

                            // Continue with next batch even if current batch fails
                            processBatch(batchIndex + 1);
                        }
                    });
                };

                // Start processing batches
                processBatch(0);
            }
        });
    }
});
