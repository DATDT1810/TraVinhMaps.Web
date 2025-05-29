$(document).ready(function () {
  $("#createAdminForm").on("submit", function (e) {
    e.preventDefault();
    if (!$(this).valid()) return;

    var form = $(this);
    var emailInput = $("#Email");
    emailInput.removeClass("is-invalid");

    var submitButton = form.find('button[type="submit"]');
    var originalText = submitButton.text();

    $.ajax({
      url: form.attr("action"),
      type: form.attr("method"),
      data: form.serialize(),
      headers: {
        RequestVerificationToken: $(
          'input[name="__RequestVerificationToken"]'
        ).val(),
      },
      success: function (response) {
        if (response.success) {
          showTimedAlert("Success!", response.message, "success", 3000);
          setTimeout(() => {
            window.location.href = "/Admin";
          }, 3000);
        } else {
          if (/email.*(exist|đã tồn tại)/i.test(response.message)) {
            emailInput.addClass("is-invalid");
          }
          showTimedAlert("Error!", response.message, "error", 3000);
        }
      },
      error: function () {
        showTimedAlert("Error!", response.message, "error", 3000);
      },
      complete: function () {
        submitButton.prop("disabled", false).text(originalText);
      },
    });
  });

  // Clear invalid state when user starts typing
  $("#Email").on("input", function () {
    $(this).removeClass("is-invalid");
  });
});
