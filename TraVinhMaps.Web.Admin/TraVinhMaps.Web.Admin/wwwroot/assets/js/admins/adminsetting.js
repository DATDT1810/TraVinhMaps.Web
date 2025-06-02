$(document).ready(function () {
    const sessionId = document.querySelector('input[name="sessionId"]').value;
    let currentFieldType = '';
    let currentIdentifier = '';
    let countdownTimer = null;
    let otpRequestToken = '';
    let newEmailValue = '';  // To store the new email value
    let newPhoneValue = '';  // To store the new phone value

    // Functions to show and hide loading spinner
    function showLoading() {
        $('#loadingSpinner').fadeIn(200);
    }

    function hideLoading() {
        $('#loadingSpinner').fadeOut(200);
    }

    // Hàm gọi API request OTP
    function requestOTP(identifier, fieldType) {
        showLoading();
        return $.ajax({
            url: `https://localhost:7162/api/Admins/request-otp-update?identifier=${encodeURIComponent(identifier)}`,
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
                hideLoading();
            },
            error: function() {
                hideLoading();
            }
        });
    }

    // Hàm hiển thị modal OTP
    function showOTPModal(fieldType, identifier, isNewValue = false) {
        currentFieldType = fieldType;
        currentIdentifier = identifier;

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
        formatCountdown(timeLeft);
        $('#resendOtpBtn').prop('disabled', true);

        countdownTimer = setInterval(function() {
            timeLeft--;
            formatCountdown(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(countdownTimer);
                $('#resendOtpBtn').prop('disabled', false).html('<i class="fas fa-redo-alt me-2"></i>Resend OTP');
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
                        requestOTP(identifier, 'email')
                            .done(function(response) {
                                hideLoading();
                                showOTPModal('email', identifier, false);
                            })
                            .fail(function(error) {
                                showErrorAlert("Error", "Cannot send OTP. Please try again.");
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
                        requestOTP(identifier, 'phone')
                            .done(function(response) {
                                hideLoading();
                                showOTPModal('phone', identifier);
                            })
                            .fail(function(error) {
                                hideLoading();
                                showErrorAlert("Error", "Cannot send OTP. Please try again.");
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
                            requestOTP(identifier, 'password')
                                .done(function(response) {
                                    hideLoading();
                                    showOTPModal('password', identifier);
                                })
                                .fail(function(error) {
                                    hideLoading();
                                    showErrorAlert("Error", "Cannot send OTP. Please try again.");
                                });
                        } else {
                            hideLoading();
                            showErrorAlert("Error", "Need email or phone number to verify.");
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
        const otpCode = $('#otpInput').val();

        if (!otpCode || otpCode.length !== 6) {
            showErrorAlert("Error", "Please enter the full 6-digit OTP.");
            return;
        }

        // Gọi API verify OTP
        showLoading();
        $.ajax({
            url: `https://localhost:7162/api/Admins/confirm-otp-update?otp=${otpCode}`,
            method: "PUT",
            headers: {
                "SessionId": sessionId,
                "id": otpRequestToken
            },
            contentType: "application/json",
            success: function(response) {
                hideLoading();
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
                hideLoading();
                showErrorAlert("Error", "OTP is not correct or expired.");
            }
        });
    });

    // Xử lý gửi lại OTP
    $('#resendOtpBtn').click(function() {
        if (!$(this).prop('disabled')) {
            // Call the specific resend OTP endpoint with the current identifier
            showLoading();
            $.ajax({
                url: `https://localhost:7162/api/Admins/resend-otp-update-by-email?identifier=${encodeURIComponent(currentIdentifier)}`,
                method: 'Get',
                contentType: 'application/json',
                headers: {
                    "SessionId": sessionId,
                    "id": otpRequestToken
                },
            })
            .done(function(response) {
                hideLoading();
                showSuccessAlert("Success", "New OTP has been sent.");
                startCountdown();
            })
            .fail(function(error) {
                hideLoading();
                showErrorAlert("Error", "Cannot send new OTP.");
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
        const newEmail = $('#newEmail').val();
        
        // Validate email
        if (!validateEmail(newEmail)) {
            $('#newEmail').addClass('is-invalid');
            return;
        }
        
        // Store new email for later use
        newEmailValue = newEmail;
        $('#newEmailModal').modal('hide');
        
        // Request OTP for the new email
        requestOTP(newEmail, 'email')
            .done(function(response) {
                showOTPModal('email', newEmail, true); // true indicates this is for new email
                
                // Replace the original verifyOtpBtn click handler with new one for new email
                $('#verifyOtpBtn').off('click').on('click', function() {
                    const otpCode = $('#otpInput').val();
                    
                    if (!otpCode || otpCode.length !== 6) {
                        showErrorAlert("Error", "Please enter the full 6-digit OTP.");
                        return;
                    }
                    
                    // Verify OTP for new email
                    showLoading();
                    $.ajax({
                        url: `https://localhost:7162/api/Admins/confirm-otp-update?otp=${otpCode}`,
                        method: "PUT",
                        headers: {
                            "SessionId": sessionId,
                            "id": otpRequestToken
                        },
                        contentType: "application/json",
                        success: function(response) {
                            hideLoading();
                            $('#otpModal').modal('hide');
                            
                            // Update the email with the PUT request
                            updateEmailFinal(newEmailValue);
                        },
                        error: function(error) {
                            hideLoading();
                            showErrorAlert("Error", "OTP is not correct or expired.");
                        }
                    });
                });
            })
            .fail(function(error) {
                showErrorAlert("Error", "Cannot send OTP to new email. Please try again.");
            });
    });
    
    // Handle new phone form submission
    $('#newPhoneForm').submit(function(e) {
        e.preventDefault();
        const newPhone = $('#newPhone').val();
        
        // Validate phone
        if (!validatePhone(newPhone)) {
            $('#newPhone').addClass('is-invalid');
            return;
        }
        
        // Store new phone for later use
        newPhoneValue = newPhone;
        $('#newPhoneModal').modal('hide');
        
        // Request OTP for the new phone
        requestOTP(newPhone, 'phone')
            .done(function(response) {
                showOTPModal('phone', newPhone, true); // true indicates this is for new phone
                
                // Replace the original verifyOtpBtn click handler with new one for new phone
                $('#verifyOtpBtn').off('click').on('click', function() {
                    const otpCode = $('#otpInput').val();
                    
                    if (!otpCode || otpCode.length !== 6) {
                        showErrorAlert("Error", "Please enter the full 6-digit OTP.");
                        return;
                    }
                    
                    // Verify OTP for new phone
                    showLoading();
                    $.ajax({
                        url: `https://localhost:7162/api/Admins/confirm-otp-update?otp=${otpCode}`,
                        method: "PUT",
                        headers: {
                            "SessionId": sessionId,
                            "id": otpRequestToken
                        },
                        contentType: "application/json",
                        success: function(response) {
                            hideLoading();
                            $('#otpModal').modal('hide');
                            
                            // Update the phone with the PUT request
                            updatePhoneFinal(newPhoneValue);
                        },
                        error: function(error) {
                            hideLoading();
                            showErrorAlert("Error", "OTP is not correct or expired.");
                        }
                    });
                });
            })
            .fail(function(error) {
                showErrorAlert("Error", "Cannot send OTP to new phone. Please try again.");
            });
    });
    
    // Handle new password form submission
    $('#newPasswordForm').submit(function(e) {
        e.preventDefault();
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
        
        updatePasswordFinal(currentPassword, newPassword);
        $('#newPasswordModal').modal('hide');
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
        showLoading();
        $.ajax({
            url: `https://localhost:7162/api/Admins/update-setting-admin`,
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
                hideLoading();
                showSuccessAlert("Success", "Email has been updated!");
                // Reload page after successful update
                setTimeout(function() {
                    location.reload();
                }, 1500);
            },
            error: function (err) {
                hideLoading();
                showErrorAlert("Error", "Cannot update email.");
            }
        });
    }
    
    // Function to update phone after all verifications
    function updatePhoneFinal(newPhone) {
        showLoading();
        $.ajax({
            url: `https://localhost:7162/api/Admins/update-setting-admin`,
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
                hideLoading();
                showSuccessAlert("Success", "Phone number has been updated!");
                // Reload page after successful update
                setTimeout(function() {
                    location.reload();
                }, 1500);
            },
            error: function (err) {
                hideLoading();
                showErrorAlert("Error", "Cannot update phone number.");
            }
        });
    }

    // Function to update password
    function updatePasswordFinal(currentPassword, newPassword) {
        showLoading();
        $.ajax({
            url: `https://localhost:7162/api/Admins/update-password-admin`,
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
                hideLoading();
                showSuccessAlert("Success", "Password has been updated!");
                // Reload page after successful update
                setTimeout(function() {
                    location.reload();
                }, 1500);
            },
            error: function (err) {
                hideLoading();
                showErrorAlert("Error", "Cannot update password. Please check your current password and try again.");
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