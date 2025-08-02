/*! -----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------

        01. password show hide
        02. Background Image js
        03. sidebar filter

 --------------------------------------------------------------------------------- */

(function ($) {
  "use strict";

  $(document).on("click", function (e) {
    var outside_space = $(".outside");
    if (
      !outside_space.is(e.target) &&
      outside_space.has(e.target).length === 0
    ) {
      $(".menu-to-be-close").removeClass("d-block").css("display", "none");
    }
  });

  $(".prooduct-details-box .close").on("click", function () {
    $(this).closest(".prooduct-details-box").addClass("d-none");
  });

  if ($(".page-wrapper").hasClass("horizontal-wrapper")) {
    $(".sidebar-list").hover(
      function () {
        $(this).addClass("hoverd");
      },
      function () {
        $(this).removeClass("hoverd");
      }
    );
    $(window).on("scroll", function () {
      if ($(this).scrollTop() < 600) $(".sidebar-list").removeClass("hoverd");
    });
  }

  /* Password show/hide */
  $(".show-hide").show();
  $(".show-hide span").addClass("show");

  $(".show-hide span").click(function () {
    const input = $('input[name="login[password]"]');
    if ($(this).hasClass("show")) {
      input.attr("type", "text");
      $(this).removeClass("show");
    } else {
      input.attr("type", "password");
      $(this).addClass("show");
    }
  });

  $('form button[type="submit"]').on("click", function () {
    $(".show-hide span").addClass("show");
    $('input[name="login[password]"]').attr("type", "password");
  });

  $(".mega-menu-container").hide();
  $(".header-search").click(function () {
    $(".search-full").addClass("open");
  });
  $(".close-search").click(function () {
    $(".search-full").removeClass("open");
    $("body").removeClass("offcanvas");
  });

  $(".mobile-toggle").click(function () {
    $(".nav-menus").toggleClass("open");
  });

  $(".mobile-toggle-left").click(function () {
    $(".left-header").toggleClass("open");
  });

  $(".bookmark-search").click(function () {
    $(".form-control-search").toggleClass("open");
  });

  $(".filter-toggle").click(function () {
    $(".product-sidebar").toggleClass("open");
  });

  $(".toggle-data").click(function () {
    $(".product-wrapper").toggleClass("sidebaron");
  });

  $(".form-control-search input").keyup(function (e) {
    $(".page-wrapper").toggleClass("offcanvas-bookmark", !!e.target.value);
  });

  $(".search-full input").keyup(function (e) {
    $("body").toggleClass("offcanvas", !!e.target.value);
  });

  $("body").keydown(function (e) {
    if (e.keyCode == 27) {
      $(".search-full input, .form-control-search input").val("");
      $(".page-wrapper").removeClass("offcanvas-bookmark");
      $(".search-full").removeClass("open");
      $(".search-form .form-control-search").removeClass("open");
      $("body").removeClass("offcanvas");
    }
  });

  // ========================
  //  DARK MODE: toggle + icon
  // ========================
  $(".mode").on("click", function () {
    const isDark = $("body").hasClass("dark-only");
    const $icon = $(this).find("i");

    if (isDark) {
      $("body").removeClass("dark-only").addClass("light");
      $(".mode").removeClass("active");
      localStorage.setItem("mode", "light");
      $icon.attr("data-feather", "moon");
    } else {
      $("body").addClass("dark-only").removeClass("light");
      $(".mode").addClass("active");
      localStorage.setItem("mode", "dark-only");
      $icon.attr("data-feather", "sun");
    }

    if (typeof feather !== "undefined") {
      feather.replace(); // cập nhật lại icon
    }
  });

  // ========================
  //  APPLY dark mode + sidebar active on page load
  // ========================
  $(document).ready(function () {
    // Dark mode handling (unchanged)
    const savedMode = localStorage.getItem("mode");
    const $icon = $(".mode").find("i");

    if (savedMode === "dark-only") {
      $("body").addClass("dark-only").removeClass("light");
      $(".mode").addClass("active");
      $icon.attr("data-feather", "sun");
    } else {
      $("body").removeClass("dark-only").addClass("light");
      $(".mode").removeClass("active");
      $icon.attr("data-feather", "moon");
    }

    if (typeof feather !== "undefined") {
      feather.replace(); // Initialize feather icons
    }

    // Sidebar Active
    let path = window.location.pathname.toLowerCase().replace(/\/$/, "");
    if (path === "") path = "/"; // Root path is "/"

    // Reset all active classes and hide submenus
    $("#sidebar-menu .sidebar-link").removeClass("active");
    $("#sidebar-menu .sidebar-list").removeClass("active");
    $("#sidebar-menu .sidebar-submenu").css("display", "none");

    let bestMatchLink = null;
    let bestMatchLength = 0;

    // Iterate through sidebar links
    $("#sidebar-menu .sidebar-link").each(function () {
      const $link = $(this);
      const hrefAttr = $link.attr("href")?.toLowerCase().replace(/\/$/, "");
      const dataHrefAttr = $link
        .attr("data-href")
        ?.toLowerCase()
        .replace(/\/$/, "");
      const href = dataHrefAttr || hrefAttr;
      if (!href || href === "#") return;

      const isSubLink = $link.closest("ul").hasClass("sidebar-submenu");

      // Check if the current path matches or starts with the link's href
      // const isMatch = path === href || (href !== "/" && path.startsWith(href + "/"));
      const isMatch = path === href || path.startsWith(href + "/") || path.startsWith(href + "?");


      if (isMatch) {
        // Prioritize longer matches, with sub-links having lower priority
        const weight = href.length + (isSubLink ? 1000 : 0);
        if (weight > bestMatchLength) {
          bestMatchLink = $link;
          bestMatchLength = weight;
        }
      }
    });

    // Activate the best matching link
    if (bestMatchLink) {
      bestMatchLink.addClass("active");

      const parentListItem = bestMatchLink.closest("li.sidebar-list");
      if (parentListItem.length) {
        parentListItem.addClass("active");
      }

      const submenu = bestMatchLink.closest("ul.sidebar-submenu");
      if (submenu.length) {
        submenu.css("display", "block");
        submenu.closest("li.sidebar-list").addClass("active");
      }
    } else if (path === "/") {
      // Fallback for root path: activate Dashboard link
      const dashboardLink = $('#sidebar-menu .sidebar-link[data-href="/"]');
      if (dashboardLink.length) {
        dashboardLink.addClass("active");
        dashboardLink.closest("li.sidebar-list").addClass("active");
      }
    }

    // Debug: Log the current path and matched href for troubleshooting
    console.log("Current Path:", path);
    console.log(
      "Matched Link:",
      bestMatchLink ? bestMatchLink.attr("href") : "None"
    );
  });

  // Sidebar filter
  $(".md-sidebar .md-sidebar-toggle").on("click", function () {
    $(".md-sidebar .md-sidebar-aside").toggleClass("open");
  });

  $(".loader-wrapper").fadeOut("slow", function () {
    $(this).remove();
  });

  $(window).on("scroll", function () {
    $(".tap-top").fadeToggle($(this).scrollTop() > 600);
  });

  $(".tap-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  });

  // Ripple effect
  (function ($, window, document) {
    "use strict";
    var $ripple = $(".js-ripple");
    $ripple.on("click.ui.ripple", function (e) {
      var $this = $(this);
      var $offset = $this.parent().offset();
      var $circle = $this.find(".c-ripple__circle");
      var x = e.pageX - $offset.left;
      var y = e.pageY - $offset.top;
      $circle.css({ top: y + "px", left: x + "px" });
      $this.addClass("is-active");
    });
    $ripple.on(
      "animationend webkitAnimationEnd oanimationend MSAnimationEnd",
      function () {
        $(this).removeClass("is-active");
      }
    );
  })(jQuery, window, document);

  // UI toggles
  $(".chat-menu-icons .toogle-bar").click(function () {
    $(".chat-menu").toggleClass("show");
  });

  $(".mobile-title svg").click(function () {
    $(".header-mega").toggleClass("d-block");
  });

  $(".onhover-dropdown").on("click", function () {
    $(this).children(".onhover-show-div").toggleClass("active");
  });

  $("#flip-btn").click(function () {
    $(".flip-card-inner").addClass("flipped");
  });
})(jQuery);


// Sử dụng window.onload để đảm bảo script này chạy sau tất cả các script khác
$(window).on('load', function () {
  
  // Danh sách các ID của bảng bạn muốn khởi tạo
  const tableSelectors = ['#basic-9', '#project-status'];

  tableSelectors.forEach(function (selector) {
    const table = $(selector);

    // BƯỚC 1: Chỉ thực hiện nếu tìm thấy bảng trên trang
    // Bằng cách này, sẽ không có cảnh báo "Table not found" nữa
    if (table.length) {
      
      // BƯỚC 2: Luôn dùng "destroy: true"
      // Nó sẽ phá hủy bất kỳ DataTable nào đã được script khác khởi tạo trước đó
      table.DataTable({
        "destroy": true, 
        "columnDefs": [{
          "targets": 'no-sort',
          "orderable": false
        }]
      });
      
      console.log(`DataTable has been successfully initialized for: ${selector}`);
    }
  });

});

