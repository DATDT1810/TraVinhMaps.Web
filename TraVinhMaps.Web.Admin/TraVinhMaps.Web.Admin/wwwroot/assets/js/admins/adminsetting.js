$(document).ready(function () {
    const sessionId = document.querySelector('input[name="sessionId"]').value;
    let currentFieldType = '';
    let currentIdentifier = '';
    let countdownTimer = null;
    let otpRequestToken = '';
    let newEmailValue = '';  // To store the new email value
    let newPhoneValue = '';  // To store the new phone value
    let currentUseFor = ''; // Variable to hold the current useFor context

    // Functions to show and hide loading spinner
    function showLoading() {
        $('#loadingSpinner').fadeIn(200);
    }

    function hideLoading() {
        $('#loadingSpinner').fadeOut(200);
    }

    // Hàm gọi API request OTP
    function requestOTP(identifier, fieldType, useFor) {
        // Kiểm tra nếu identifier không hợp lệ
        console.log("Requesting OTP with identifier:", identifier, "fieldType:", fieldType, "useFor:", useFor); // Debugging line
        
        return $.ajax({
            url: window.apiBaseUrl + "api/Admins/request-otp-update?identifier=" + encodeURIComponent(identifier) + "&useFor=" + useFor,
            method: "GET",
            headers: {
                "SessionId": sessionId
            },
            success: function(response) {
                // Store the token from successful response
                if (response && response.status === "success" && response.data) {
                    otpRequestToken = response.data;
                    console.log("OTP request token stored:", otpRequestToken);
                }
            },
            error: function() {
                // Error handling
            }
        });
    }

    // Hàm hiển thị modal OTP
    function showOTPModal(fieldType, identifier, useFor) {
        currentFieldType = fieldType;
        currentIdentifier = identifier;
        currentUseFor = useFor; // Store useFor in the global variable
        const isNewValue = useFor === 2;

        // Cập nhật nội dung modal theo loại field và trạng thái (hiện tại/mới)
        if (fieldType === 'email') {
            $('#otpIcon').removeClass().addClass('fas fa-envelope text-white').css('font-size', '2rem');
            if (isNewValue) {
                $('#otpTitle').text('Verify New Email');
                $('#otpSubtitle').text(`Your OTP is sent to ${identifier} now`);
            } else {
                $('#otpTitle').text('Verify Current Email');
                $('#otpSubtitle').text(`Your OTP is sent to ${identifier} now`);
            }
        } else if (fieldType === 'phone') {
            $('#otpIcon').removeClass().addClass('fas fa-phone text-white').css('font-size', '2rem');
            if (isNewValue) {
                $('#otpTitle').text('Verify New Phone Number');
                $('#otpSubtitle').text(`Your OTP is sent to ${identifier} now`);
            } else {
                $('#otpTitle').text('Verify Current Phone Number');
                $('#otpSubtitle').text(`Your OTP is sent to ${identifier} now`);
            }
        } else if (fieldType === 'password') {
            $('#otpIcon').removeClass().addClass('fas fa-lock text-white').css('font-size', '2rem');
            $('#otpTitle').text('Verify to change password');
            $('#otpSubtitle').text('Your OTP is sent to verify');
        }

        // Reset input và hiển thị modal
        $('#otpInput').val('');
        $('#otpModal').modal('show');

        // Bắt đầu countdown
        startCountdown();
    }

    // Hàm bắt đầu countdown
    function startCountdown() {
        let timeLeft = 300; // 5 minutes in seconds
        const resendButton = $('#resendOtpBtn');
        const countdownSpan = $('#countdown');

        resendButton.prop('disabled', true);
        countdownSpan.show();
        formatCountdown(timeLeft);

        countdownTimer = setInterval(function() {
            timeLeft--;
            formatCountdown(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(countdownTimer);
                resendButton.prop('disabled', false).find('span').hide();
                resendButton.find('.resend-text').text('Resend OTP');
            }
        }, 1000);
    }

    // Format countdown in minutes:seconds
    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        $('#countdown').text(formattedTime);
    }

    // Xử lý khi nhấn "Change Email"
    $(".email-options-btn").click(function (e) {
        e.preventDefault();

        const identifier = $(this).data('identifier');

        // Luôn hiển thị thông báo xác nhận trước
        showConfirmAlert("Confirm", "Are you want to update your email?", "Yes", "No")
            .then(confirmed => {
                if (confirmed) {
                    // Kiểm tra nếu email không null/empty
                    if (identifier && identifier.trim() !== '') {
                        // Gọi API request OTP
                        requestOTP(identifier, 'email', 1)
                            .done(function(response) {
                                showOTPModal('email', identifier, 1);
                            })
                            .fail(function(error) {
                                showTimedAlert("Error", "Cannot send OTP. Please try again.", "error", 4000);
                            });
                    } else {
                        // Nếu email chưa có, cho phép cập nhật trực tiếp
                        $('#newEmailModal').modal('show');
                    }
                }
            });
    });

    // Xử lý khi nhấn "Change Phone"
    $(".phone-options-btn").click(function (e) {
        e.preventDefault();

        const identifier = $(this).data('identifier');

        // Luôn hiển thị thông báo xác nhận trước
        showConfirmAlert("Confirm", "Are you want to update your phone number?", "Yes", "No")
            .then(confirmed => {
                if (confirmed) {
                    // Kiểm tra nếu phone không null/empty
                    if (identifier && identifier.trim() !== '') {
                        // Gọi API request OTP
                        requestOTP(identifier, 'phone', 1)
                            .done(function(response) {
                                showOTPModal('phone', identifier, 1);
                            })
                            .fail(function(error) {
                                showTimedAlert("Error", "Cannot send OTP. Please try again.", "error", 4000);
                            });
                    } else {
                        // Nếu phone chưa có, cho phép cập nhật trực tiếp
                        $('#newPhoneModal').modal('show');
                    }
                }
            });
    });

    // Xử lý khi nhấn "Change Password"
    $(".change-password-btn").click(function (e) {
        e.preventDefault();

        const hasPassword = $(this).data('identifier');

        // Luôn hiển thị thông báo xác nhận trước
        showConfirmAlert("Confirm", "Are you want to update your password?", "Yes", "No")
            .then(confirmed => {
                if (confirmed) {
                    // Với password, luôn yêu cầu OTP nếu đã có password
                    if (hasPassword) {
                        // Sử dụng email hoặc phone để gửi OTP cho password
                        const emailIdentifier = $('#userEmail').val();
                        const phoneIdentifier = $('#userPhone').val();

                        let identifier = '';
                        if (emailIdentifier && emailIdentifier.trim() !== '') {
                            identifier = emailIdentifier;
                        } else if (phoneIdentifier && phoneIdentifier.trim() !== '') {
                            identifier = phoneIdentifier;
                        }

                        if (identifier) {
                            requestOTP(identifier, 'password', 1)
                                .done(function(response) {
                                    showOTPModal('password', identifier, 1);
                                })
                                .fail(function(error) {
                                    showTimedAlert("Error", "Cannot send OTP. Please try again.", "error", 4000);
                                });
                        } else {
                            showTimedAlert("Error", "Need email or phone number to verify.", "error", 4000);
                        }
                    } else {
                        // Nếu chưa có password, cho phép tạo mới trực tiếp
                        $('#newPasswordModal').modal('show');
                    }
                }
            });
    });

    // Xử lý xác thực OTP cho email/phone hiện tại
    $('#verifyOtpBtn').click(function() {
        const $btn = $(this);
        const originalBtnHtml = $btn.html();
        const otpCode = $('#otpInput').val();

        if (!otpCode || otpCode.length !== 6) {
            showErrorAlert("Error", "Please enter the full 6-digit OTP.");
            return;
        }

        // Disable button and show loading text
        $btn.prop('disabled', true).html("loading.....");

        // Gọi API verify OTP
        $.ajax({
            url: window.apiBaseUrl + "api/Admins/confirm-otp-update?otp=" + otpCode,
            method: "PUT",
            headers: {
                "SessionId": sessionId,
                "id": otpRequestToken
            },
            contentType: "application/json",
            success: function(response) {
                $('#otpModal').modal('hide');
                // Sau khi xác thực thành công, hiển thị modal tương ứng
                if (currentFieldType === 'email') {
                    $('#newEmailModal').modal('show');
                } else if (currentFieldType === 'phone') {
                    $('#newPhoneModal').modal('show');
                } else if (currentFieldType === 'password') {
                    $('#newPasswordModal').modal('show');   
                }
            },
            error: function(error) {
                showErrorAlert("Error", "OTP is not correct or expired.");
            },
            complete: function() {
                // Restore button state
                $btn.prop('disabled', false).html(originalBtnHtml);
            }
        });
    });

    // Xử lý gửi lại OTP
    $('#resendOtpBtn').click(function() {
        if (!$(this).prop('disabled')) {
            // Add detailed logging to diagnose the issue
            console.log('--- Resend OTP Clicked ---');
            console.log('Value of currentIdentifier:', currentIdentifier);
            console.log('Value of currentFieldType:', currentFieldType);
            console.log('Value of currentUseFor:', currentUseFor);
            console.log('--------------------------');

            // Re-use the main requestOTP function, passing the stored context
            requestOTP(currentIdentifier, currentFieldType, currentUseFor)
                .done(function(response) {
                    showTimedAlert("Success", "New OTP has been sent.", "success", 4000);
                    startCountdown();
                })
                .fail(function(error) {
                    showTimedAlert("Error", "Cannot send new OTP.", "error", 4000);
                });
        }
    });

    // Xử lý nút back
    $('#backBtn').click(function() {
        $('#otpModal').modal('hide');
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }
    });

    // Xử lý khi modal bị đóng
    $('#otpModal').on('hidden.bs.modal', function () {
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }
    });

    // Handle new email form submission
    $('#newEmailForm').submit(function(e) {
        e.preventDefault();
        const $form = $(this);
        const $btn = $form.find('button[type="submit"]');
        const originalBtnHtml = $btn.html();
        const newEmail = $('#newEmail').val();
        
        // Validate email
        if (!validateEmail(newEmail)) {
            $('#newEmail').addClass('is-invalid');
            return;
        }
        
        // Store new email for later use
        newEmailValue = newEmail;
        
        $btn.prop('disabled', true).html("loading.....");

        // Request OTP for the new email
        requestOTP(newEmail, 'email', 2)
            .done(function(response) {
                $('#newEmailModal').modal('hide');
                showOTPModal('email', newEmail, 2); // true indicates this is for new email
                
                // Replace the original verifyOtpBtn click handler with new one for new email
                $('#verifyOtpBtn').off('click').on('click', function() {
                    const $btn = $(this);
                    const originalBtnHtml = $btn.html();
                    const otpCode = $('#otpInput').val();
                    
                    if (!otpCode || otpCode.length !== 6) {
                        showTimedAlert("Error", "Please enter the full 6-digit OTP.", "error", 4000);
                        return;
                    }
                    
                    $btn.prop('disabled', true).html("loading.....");

                    // Verify OTP for new email
                    $.ajax({
                        url: window.apiBaseUrl + "api/Admins/confirm-otp-update?otp=" + otpCode,
                        method: "PUT",
                        headers: {
                            "SessionId": sessionId,
                            "id": otpRequestToken
                        },
                        contentType: "application/json",
                        success: function(response) {
                            $('#otpModal').modal('hide');
                            // Update the email with the PUT request
                            updateEmailFinal(newEmailValue);
                        },
                        error: function(error) {
                            showTimedAlert("Error", "OTP is not correct or expired.", "error", 4000);
                        },
                        complete: function() {
                            $btn.prop('disabled', false).html(originalBtnHtml);
                        }
                    });
                });
            })
            .fail(function(error) {
                showTimedAlert("Error", "Cannot send OTP to new email. Please try again.", "error", 4000);
            })
            .always(function() {
                $btn.prop('disabled', false).html(originalBtnHtml);
            });
    });
    
    // Handle new phone form submission
    $('#newPhoneForm').submit(function(e) {
        e.preventDefault();
        const $form = $(this);
        const $btn = $form.find('button[type="submit"]');
        const originalBtnHtml = $btn.html();
        const newPhone = $('#newPhone').val();
        
        // Validate phone
        if (!validatePhone(newPhone)) {
            $('#newPhone').addClass('is-invalid');
            return;
        }
        
        // Store new phone for later use
        newPhoneValue = newPhone;
        
        $btn.prop('disabled', true).html("loading.....");

        // Request OTP for the new phone
        requestOTP(newPhone, 'phone', 2)
            .done(function(response) {
                $('#newPhoneModal').modal('hide');
                showOTPModal('phone', newPhone, 2); // true indicates this is for new phone
                
                // Replace the original verifyOtpBtn click handler with new one for new phone
                $('#verifyOtpBtn').off('click').on('click', function() {
                    const $btn = $(this);
                    const originalBtnHtml = $btn.html();
                    const otpCode = $('#otpInput').val();
                    
                    if (!otpCode || otpCode.length !== 6) {
                        showTimedAlert("Error", "Please enter the full 6-digit OTP.", "error", 4000);
                        return;
                    }
                    
                    $btn.prop('disabled', true).html("loading.....");

                    // Verify OTP for new phone
                    $.ajax({
                        url: window.apiBaseUrl + "api/Admins/confirm-otp-update?otp=" + otpCode,
                        method: "PUT",
                        headers: {
                            "SessionId": sessionId,
                            "id": otpRequestToken
                        },
                        contentType: "application/json",
                        success: function(response) {
                            $('#otpModal').modal('hide');
                            // Update the phone with the PUT request
                            updatePhoneFinal(newPhoneValue);
                        },
                        error: function(error) {
                            showTimedAlert("Error", "OTP is not correct or expired.", "error", 4000);
                        },
                        complete: function() {
                            $btn.prop('disabled', false).html(originalBtnHtml);
                        }
                    });
                });
            })
            .fail(function(error) {
                showTimedAlert("Error", "Cannot send OTP to new phone. Please try again.", "error", 4000);
            })
            .always(function() {
                $btn.prop('disabled', false).html(originalBtnHtml);
            });
    });
    
    // Handle new password form submission
    $('#newPasswordForm').submit(function(e) {
        e.preventDefault();
        const $form = $(this);
        const $btn = $form.find('button[type="submit"]');
        const originalBtnHtml = $btn.html();
        const currentPassword = $('#currentPassword').val();
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        
        // Validate input
        let isValid = true;
        
        if (!currentPassword) {
            $('#currentPassword').addClass('is-invalid');
            isValid = false;
        } else {
            $('#currentPassword').removeClass('is-invalid');
        }
        
        if (newPassword.length < 8) {
            $('#newPassword').addClass('is-invalid');
            isValid = false;
        } else {
            $('#newPassword').removeClass('is-invalid');
        }
        
        if (newPassword !== confirmPassword) {
            $('#confirmPassword').addClass('is-invalid');
            isValid = false;
        } else {
            $('#confirmPassword').removeClass('is-invalid');
        }
        
        if (!isValid) {
            return;
        }
        
        $btn.prop('disabled', true).html("loading.....");

        updatePasswordFinal(currentPassword, newPassword)
            .always(function() {
                $btn.prop('disabled', false).html(originalBtnHtml);
            });
    });
    
    // Input validation on change
    $('#currentPassword').on('input', function() {
        if ($(this).val()) {
            $(this).removeClass('is-invalid');
        }
    });
    
    $('#newPassword, #confirmPassword').on('input', function() {
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        
        if (newPassword.length >= 8) {
            $('#newPassword').removeClass('is-invalid');
        }
        
        if (newPassword === confirmPassword && confirmPassword !== '') {
            $('#confirmPassword').removeClass('is-invalid');
        }
    });
    
    // Input field validations
    $('#newEmail').on('input', function() {
        if (validateEmail($(this).val())) {
            $(this).removeClass('is-invalid');
        }
    });
    
    $('#newPhone').on('input', function() {
        if (validatePhone($(this).val())) {
            $(this).removeClass('is-invalid');
        }
    });
    
    // Simple validation functions
    function validateEmail(email) {
        if (!email || email.trim() === '') return false;
        
        // Regular expression for email validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    
    function validatePhone(phone) {
        if (!phone || phone.trim() === '') return false;
        
        // Validate Vietnamese phone numbers (10 digits, starting with 0)
        const phoneRegex = /^0\d{9}$/;
        return phoneRegex.test(phone);
    }

    // Function to update email after all verifications
    function updateEmailFinal(newEmail) {
        $.ajax({
            url: window.apiBaseUrl + "api/Admins/update-setting-admin"  ,
            method: "PUT",
            headers: {
                "SessionId": sessionId
            },
            contentType: "application/json",
            data: JSON.stringify({
                "updateValue": newEmail,
                "updateType": "email"
            }),
            success: function (res) {
                showConfirmAlert("Success", "Email has been updated! Please log in again.", "OK")
                    .then(() => {
                        // Create a form to submit a POST request for logout
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = '/Authen/logout';
                        
                        // Add anti-forgery token if needed (assuming it's stored in a hidden input)
                        const antiforgery = document.querySelector('input[name="__RequestVerificationToken"]');
                        if (antiforgery) {
                            form.appendChild(antiforgery.cloneNode());
                        }
                        
                        document.body.appendChild(form);
                        form.submit();
                    });
            },
            error: function (err) {
                showTimedAlert("Error", "Cannot update email.", "error", 4000);
            }
        });
    }
    
    // Function to update phone after all verifications
    function updatePhoneFinal(newPhone) {
        $.ajax({
            url: window.apiBaseUrl + "api/Admins/update-setting-admin",
            method: "PUT",
            headers: {
                "SessionId": sessionId
            },
            contentType: "application/json",
            data: JSON.stringify({
                "updateValue": newPhone,
                "updateType": "phone"
            }),
            success: function (res) {
                showConfirmAlert("Success", "Phone number has been updated! Please log in again.", "OK")
                    .then(() => {
                        // Create a form to submit a POST request for logout
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = '/Authen/logout';

                        // Add anti-forgery token if needed (assuming it's stored in a hidden input)
                        const antiforgery = document.querySelector('input[name="__RequestVerificationToken"]');
                        if (antiforgery) {
                            form.appendChild(antiforgery.cloneNode());
                        }

                        document.body.appendChild(form);
                        form.submit();
                    });
            },
            error: function (err) {
                showTimedAlert("Error", "Cannot update phone number.", "error", 4000);
            }
        });
    }

    // Function to update password
    function updatePasswordFinal(currentPassword, newPassword) {
        return $.ajax({
            url: window.apiBaseUrl + "api/Admins/update-password-admin",
            method: "PUT",
            headers: {
                "SessionId": sessionId
            },
            contentType: "application/json",
            data: JSON.stringify({
                "currentPassword": currentPassword,
                "newPassword": newPassword
            }),
            success: function (res) {
                $('#newPasswordModal').modal('hide');
                showTimedAlert("Success", "Password has been updated!", "success", 4000);
                // Reload page after successful update
                setTimeout(function() {
                    location.reload();
                }, 1500);
            },
            error: function (err) {
                showTimedAlert("Error", "Cannot update password. Please check your current password and try again.", "error", 4000);
            }
        });
    }
    
    // Xử lý nhập OTP chỉ cho phép số
    $('.otp-digit').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Handle OTP digit inputs
    $(document).on('input', '.otp-digit', function() {
        if (this.value.length === 1) {
            // Move focus to next input
            $(this).next('.otp-digit').focus();
        }
        
        // Combine all digits into the hidden input
        updateOtpValue();
    });

    // Handle backspace on OTP inputs
    $(document).on('keydown', '.otp-digit', function(e) {
        // If backspace is pressed and current input is empty, move to previous input
        if (e.keyCode === 8 && $(this).val() === '') {
            $(this).prev('.otp-digit').focus();
        }
    });

    // Function to update the hidden OTP input with combined values
    function updateOtpValue() {
        let otp = '';
        $('.otp-digit').each(function() {
            otp += $(this).val();
        });
        $('#otpInput').val(otp);
    }

    // Clear OTP inputs when modal is shown
    $('#otpModal').on('shown.bs.modal', function() {
        $('.otp-digit').val('');
        $('.otp-digit:first').focus();
        updateOtpValue();
    });
});
