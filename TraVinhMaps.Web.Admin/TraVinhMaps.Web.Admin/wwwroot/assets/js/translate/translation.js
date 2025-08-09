/* =========================================================================
 * translation.js - Optimized Version
 * ========================================================================= */

/* ----------------- Configuration & Globals ------------------ */

const jsStrings = [
  // =======================================================================
  // 1. GIAO DIỆN CHUNG & CÁC NÚT CƠ BẢN (General UI & Common Actions)
  // =======================================================================
  "OK",
  "Cancel",
  "Yes",
  "No",
  "Back",
  "Remove",
  "Retry",
  "Delete",
  "Restore",
  "Ban",
  "Unban",
  "Confirm",
  "Continue",
  "Check all",
  "Select tags",
  "All",
  "Default",
  "English",
  "Vietnamese",

  // =======================================================================
  // 2. THANH ĐIỀU HƯỚNG & MENU (Admin Sidebar/Navigation)
  // =======================================================================
  "Dashboard",
  "Dashboards",
  "My Profile",
  "Settings",
  "Log Out",
  "Account Management",
  "Admin Management",
  "Review Management",
  "Send Notifications",
  "Analytics",
  "OCOP",
  "Destination",
  "Ocop Product",
  "OCOP Type",
  "Company",
  "Local Specialties",
  "Sell Locations",
  "Event And Festival",
  "Tips Management",
  "Marker Management",
  "Itineraries",
  "Feedback",

  // =======================================================================
  // 3. TIÊU ĐỀ POPUP & ALERT CHUNG (General Alert Titles)
  // =======================================================================
  "Success!",
  "Error!",
  "Warning!",
  "Information",
  "Confirmation",
  "Confirm Deletion",
  "Confirm delete",
  "Deleted!",
  "Restored!",
  "Failed!",
  "Invalid Input",
  "Too fast!",
  "Notification",
  "Confirm OTP",

  // =======================================================================
  // 4. BẢNG ĐIỀU KHIỂN & BIỂU ĐỒ (Dashboards & Charts)
  // =======================================================================
  "User Statistics Overview",
  "Total Users",
  "Active Users",
  "Total Reviews",
  "(This month)",
  "Upcoming",
  "Performance by Tag",
  "User Creation Over Time",
  "Number of Users",
  "Number of Interactions",
  "Top 5 Reviews",
  "Failed to fetch statistics",
  "Failed to update chart",
  "users",
  "Value",
  "Label",
  "Count",
  "Age Distribution",
  "Gender Distribution",
  "Status Distribution",
  "Hometown Distribution",
  "Age Group",
  "Age Groups",
  "Gender",
  "Status",
  "Female",
  "Male",
  "Other",
  "Active",
  "Inactive",
  "Forbidden",
  "Today",
  "Last Week",
  "Last Month",
  "Last Year",
  "Day",
  "Week",
  "Month",
  "Year",
  "Day of Week",
  "View Count",
  "Interaction Count",
  "Favorite Count",
  "Views",
  "Interactions",
  "Favorites",
  "Tag",
  "Customer",
  "Destination Name",
  "Product Name",
  "Rate",
  "Review",
  "Product",
  "Location",
  "Destinations",
  "Compared Destinations",
  "OCOP Product Analytics",
  "OCOP User Demographics (Product – Hometown – Age Group)",
  "Top Interacted OCOP Products",
  "Top Favorited OCOP Products",
  "OCOP Product Comparison",
  "Destination Analytics",
  "User Demographics (Location – Hometown – Age Group)",
  "Top Interacted Destinations",
  "Top Favorited Destinations",
  "Top Destinations",
  "Destination Comparison",
  "Users from",
  "Users from ",
  "Age Group: ",
  "User Count",
  "User Count: ",
  "N/A",
  "Local Specialty",
  "Tips",
  "Festivals",
  "Local specialty",

  // =======================================================================
  // 5. THÔNG BÁO TƯƠNG TÁC BIỂU ĐỒ (Chart Interaction Messages)
  // =======================================================================
  "Download Chart",
  "Analytics chart refreshed",
  "Demographics chart refreshed",
  "Comparison chart refreshed",
  "Top Interaction refreshed",
  "Top Favorite refreshed",
  "Top Favorites refreshed",
  "Top Views refreshed",
  "Filters have been reset",
  "Filters and selections have been reset",
  "Failed to refresh analytics data",
  "Failed to refresh demographics data",
  "Failed to refresh comparison data",
  "Failed to refresh top interaction",
  "Failed to refresh top favorites",
  "Failed to refresh top views",
  "No analytics data found",
  "No demographics data found",
  "No data found",
  "No chart available for download",
  "No data available to download.",
  "No chart data available to download!",
  "Please select products to compare",
  "Please choose at least one destination",
  "Please enter a valid 6-digit code",
  "Sending new code...",

  // =======================================================================
  // 6. XÁC THỰC DỮ LIỆU & LỖI FORM (Frontend Validation & Form Errors)
  // =======================================================================
  "Start date cannot be in the future.",
  "End date cannot be in the future.",
  "End date cannot be earlier than start date.",
  "At least one image is required",
  "Please upload valid image files only (e.g., JPG, PNG, GIF).",
  "You can upload a maximum of %s images.",
  "File %s exceeds the maximum size of 5 MB.",
  "File %s has an unsupported format. Allowed formats: %s.",
  "Unsupported format",
  "No matching records found",
  "• Row %s: Product name is required",
  "• Row %s: Product price is required",
  "• Row %s: OcopType is required",
  '• Row %s: OcopType "%s" not found in database',
  "• Row %s: Company is required",
  '• Row %s: Company "%s" not found in database',
  "• Row %s: OcopPoint must be a number between 1 and 5",
  "• Row %s: OcopYear must be a valid year not in the future",
  "• Row %s: Tag is recommended",
  '• Row %s: Tag "%s" not found in database',
  '• Row %s: No images uploaded for product "%s"',
  "• Row %s: Invalid file type(s): %s. Only image files are allowed.",

  // =======================================================================
  // 7. IMPORT / EXPORT
  // =======================================================================
  "Exporting Data",
  "Export Successful",
  "Export Successful!",
  "Export Error",
  "Export Error!",
  "Export Warning!",
  "Error creating Excel file: %s",
  "Error during Excel creation:",
  "Confirm Import",
  "Importing...",
  "Import Progress",
  "Import Successful",
  "Import Completed with Issues",
  "Batch Import Error",
  "Invalid Files",
  "Invalid Products",
  "No Valid Records",
  "Please upload a valid Excel file (.xlsx, .xls)",
  "Invalid data format. Please use the provided template.",
  "No admin data available.",
  "No company data available.",
  "No destinations found for export.",
  "No feedback found for export.",
  "No festivals found for export.",
  "No itineraries found.",
  "No local specialties found for export.",
  "No notifications found.",
  "No OCOP product data available for export.",
  "No OCOP type data available for export.",
  "No tips found for export.",
  "No user data available for export.",
  "items have been exported to Excel.",
  "Retrieving all admin data for export...",
  "Retrieving all company data for export...",
  "Retrieving all community tips for export...",
  "Retrieving all feedback for export...",
  "Retrieving all festivals for export...",
  "Retrieving all itineraries for export...",
  "Retrieving all local specialties for export...",
  "Retrieving all notifications for export...",
  "Retrieving all tourist destinations for export...",
  "Retrieving all user data for export...",
  "Retrieving OCOP product data for export...",
  "Retrieving OCOP type data for export...",
  "Add at least one image to each product.",
  "Fix the validation errors before importing.",
  "Some files are not images and will be skipped: %s",
  "There are %s invalid products. (%s products missing images)<br>Do you want to continue importing only the <b>%s</b> valid products?",
  "Are you sure you want to import %s products?",
  "Yes, continue",
  "Yes, import products",
  "Preparing to import...",
  "Importing batch %s/%s",
  "Processing batch %s of %s <small>(%s of %s products processed)</small>",
  "Batch %s completed successfully. Processing next batch...",
  "Batch %s failed. Continuing with next batch...",
  "Failed to import batch %s: %s",
  "Import completed. <b>%s</b> products imported successfully.",
  "Successfully imported <b>%s</b> products!",
  "Successfully imported <b>%s</b> products.<br><b>%s</b> products failed.",

  // =======================================================================
  // 8. HÀNH ĐỘNG CRUD (Xác nhận & Lỗi) (CRUD Actions)
  // =======================================================================
  "Are you sure you want to perform this action?",
  "Are you sure you want to delete this admin?",
  "Do you really want to delete this admin?",
  "Are you sure you want to restore this admin?",
  "Do you want to restore this admin?",
  "Delete failed!",
  "Restore failed!",
  "There was an error deleting the admin.",
  "There was an error restoring the admin.",
  "Yes, delete it!",
  "Yes, restore it!",
  "Are you sure you want to ban this user?",
  "Are you sure you want to unban this user?",
  "An error occurred while banning the user: %s",
  "An error occurred while unbanning the user: %s",
  "Are you sure you want to delete this destination?",
  "Are you sure you want to restore this destination?",
  "Are you sure you want to delete this event and festival?",
  "Are you sure you want to restore this event and festival?",
  "Are you sure you want to delete this itinerary plan?",
  "Are you sure you want to restore this itinerary plan?",
  "Are you sure you want to delete this local specialties?",
  "Are you sure you want to restore this local specialties?",
  "Restore Local Specialties",
  "Are you sure you want to delete this marker?",
  "Are you sure you want to restore this Marker?",
  "Are you sure you want to delete this ocop product?",
  "Are you sure you want to restore this ocop product?",
  "Are you sure you want to delete this tip?",
  "Are you sure you want to restore this tip?",
  "Restore Tip",
  "An error occurred while deleting.",
  "An error occurred while restoring.",
  "An error occurred while deleting the tip.",
  "An error occurred while restoring the tip.",
  "An error occurred while banning the destination: %s",
  "An error occurred while restoring the destination: %s",
  "Are you sure you want to delete this image?",
  "Are you sure you want to delete this selling link?",
  'Do you want to delete the location "%s"?',
  "Image deleted successfully!",
  "Location added successfully!",
  "Location deleted successfully!",
  "Location updated successfully!",
  "Selling link updated successfully!",
  "Failed to delete image.",
  "Failed to delete location.",
  "Failed to add location.",
  "Failed to update location.",
  "Failed to update selling link.",
  "Failed to reload location data.",
  "Failed to reload selling link data.",
  "An error occurred while deleting the image.",
  "An error occurred while adding the location.",
  "An error occurred while deleting the location.",
  "An error occurred while updating the location.",
  "An error occurred while deleting the selling link: %s",
  "An error occurred while updating the selling link.",
  "An error occurred while uploading the images.",
  "Adding photos to this tourist attraction failed, please try again later",

  // =======================================================================
  // 9. HỆ THỐNG & DỊCH THUẬT (System & Translation)
  // =======================================================================
  "Translating...",
  "Translation successful!",
  "Translation Error",
  "Partial translation",
  "No Text",
  "No translatable text found on the page.",
  "Please wait %s seconds before translating again.",
  "Some texts could not be translated due to server limits. Please try again later.",
  "Failed to translate text. Please try again later.",
  "Failed to load charting library. Please refresh the page.",
  "Failed to load chart plugins. Please refresh the page.",
  "Failed to update chart: Invalid response format",
  "Error: sessionId is missing or undefined",
  "Session ID is missing. Please log in again.",
  "Unauthorized access. Please log in again.",
  "You do not have permission to perform this action.",
  "API endpoint not found. Verify the URL.",
  "Could not retrieve destination data. Please check your connection or permissions.",
  "Could not retrieve feedback data. Please check your connection or permissions.",
  "Could not retrieve festival data. Please check your connection or permissions.",
  "Could not retrieve local specialties data. Please check your connection or permissions.",
  "Could not retrieve notification data.",
  "Could not retrieve product data. Please check your connection or permissions.",
  "Could not retrieve tip data. Please check your connection or permissions.",
  "Could not retrieve user data. Please check your connection or permissions.",
  "Failed to retrieve data. Check connection or permission.",
  "An error occurred",
  "Unknown error",
  "Something went wrong, please try again",
  "Or Sign in with",
  "Forgot password?",
  "Sign in to account",
  "Enter your email & password to login",
  "Remember password",
  "Or Sign in with",
  "Sign in",
  "show",
  "hide",
  "entries",
  "Submit",
  "Female",
  "Male",

  // =======================================================================
  // 10. THƯ VIỆN BÊN THỨ BA (3rd Party Libraries)
  // =======================================================================
  "Search:",
  "First",
  "Last",
  "Next",
  "Previous",
  "Show _MENU_ entries",
  "Showing _START_ to _END_ of _TOTAL_ entries",
  "Showing 0 to 0 of 0 entries",
  "(filtered from _MAX_ total entries)",
  "No data available in table",
  "Processing...",
  "Loading...",
  "Show entries",

  // =======================================================================
  // 11. XÁC THỰC BACKEND & TÊN TRƯỜNG (Backend Validation & Field Names)
  // =======================================================================
  // --- Tên trường (Display Names) ---
  "Email or Phone Number",
  "Password",
  "Remember me",
  "Verification Code",
  "New Password",
  "Confirm Password",
  "Destination title",
  "Description",
  "Address of destination",
  "Create New Password",
  "Enter your new password below",
  "Reset Password",
  "The password and confirmation password do not match.",
  // --- Các lỗi xác thực CỤ THỂ đã được định nghĩa trong code C# ---
  "Password Reset Verification",
  "Enter the verification code sent to reset your password",
  "Verification Code",
  "Resend available in:",
  "Resend Code",
  "Verify",
  "Email or phone number is required",
  "Email or Phonenumber is required",
  "Password is required",
  "Verification code is required",
  "New password is required",
  "Confirm password is required",
  "Title must be at least 20 characters long.",
  "Title can be at most 100 characters long.",
  "Content must be at least 20 characters long.",
  "Content can be at most 1000 characters long.",
  "Company name is required.",
  "Name must be between 3 and 100 characters.",
  "Company address is required.",
  "Address must be between 5 and 200 characters.",
  "At least one location is required.",
  "Invalid phone number.",
  "Invalid email address.",
  "Invalid website URL.",
  "Name cannot be longer than 100 characters.",
  "Name is required.",
  "Address is required.",
  "Location is required.",
  "Type is required.",
  "Coordinates are required.",
  "Food name is required.",
  "Food name must be between 5 and 100 characters.",
  "Description is required.",
  "Description must be between 10 and 3000 characters.",
  "TagId is required.",
  "Location name is required.",
  "Location address is required.",
  "Longitude is required.",
  "Longitude must be between -180 and 180.",
  "Latitude is required.",
  "Latitude must be between -90 and 90.",
  "Id is required.",
  "Image is required",
  "Please select an icon.",
  "Product name is required.",
  "Product name must not exceed 100 characters.",
  "Product description must not exceed 500 characters.",
  "Product description must not exceed 3000 characters.",
  "At least one product image is required.",
  "Product price must be a valid number.",
  "Selling link is required.",
  "SellingLinkId must be a valid URL.",
  "At least one sell location is required.",
  "Product ID is required.",
  "Title is required.",
  "Title must be at least 2 characters",
  "Title must be less than or equal to 100 characters",
  "Title of destination is required",
  "Description must be at least 10 characters",
  "Description must be less than or equal to 3000 characters",
  "Address must be at least 10 characters",
  "Address must be less than or equal to 150 characters",
  "Address of destination is required",
  "Longitude of destination is required",
  "Latitude of destination is required",
  "At least one image file is required.",
  "Only JPG, JPEG, PNG, and GIF files are allowed.",
  "New password is required",
  "Confirm password is required",
  "Verification code has been resent successfully",
  "Your OTP is sent to verify",
  "Verify to change password",
  "Verify Current Email",
  "Verify New Phone Number Your OTP is sent to now",
  "Your OTP is sent to now",

  // --- Mẫu lỗi MẶC ĐỊNH của .NET (quan trọng nhất) ---
  "The %s field is required.",
  "The field %s must be a string with a maximum length of %s.",
  "The %s must be at least %s and at most %s characters long.",
  "The %s field is not a valid e-mail address.",
  "The %s field is not a valid phone number.",
  "The field %s must be between %s and %s.",
  "'{0}' and '{1}' do not match.",
  "The password and confirmation password do not match.",
  "The value '%s' is not valid for %s.",

  // =======================================================================
  // 12. NHÃN CHO FORM THÊM ĐỊA ĐIỂM (Location Form Labels)
  // =======================================================================
  "Name of Location",
  "Address",
  "Marker Type",
  "Longitude",
  "Latitude",
];

const apiBase = window.apiBaseUrl + "api/Translation";
const minTranslationInterval = 5000;
const BATCH_SIZE_FRONTEND = 100; // Tăng kích thước batch để giảm số lượng yêu cầu API

let lastTranslationTime = 0;
let lastAppliedLang = null;
let allTranslationsCache = {};
let originalTextsMap = new Map();
window.translationMapForCharts = {};

/* ----------------- Helpers ------------------ */

/**
 * Translates text using cache or fallback to original text.
 * @param {string} text - Text to translate.
 * @returns {string} Translated text or original text if no translation found.
 */
function translateText(text) {
  if (!text) return text;
  return window.translationMapForCharts?.[text] || text;
}

/**
 * Normalizes text for consistent comparison (removes extra spaces, converts to lowercase, handles Unicode).
 * @param {string} txt - Text to normalize.
 * @returns {string} Normalized text.
 */
function normalizeText(txt) {
  if (typeof txt !== "string" || !txt) return "";
  return txt
    .normalize("NFC")
    .replace(/[\n\t\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Checks if a string is purely numeric.
 */
const isNumeric = (str) => /^\d+(\.\d+)?$/.test(str);

/**
 * Checks if a string is a long, un-translatable token (like a hash or long ID).
 */
const isLongToken = (str) =>
  /^[0-9a-fA-F]{16,}$/.test(str) || (str.length > 50 && !str.includes(" "));

/**
 * Collects all translatable text from the DOM or a specific element.
 * Filters out numbers and long tokens.
 * @param {HTMLElement} [element=null] - Optional element to limit text collection.
 * @returns {string[]} Array of unique translatable strings.
 */
function getAllPlainTexts(element = null) {
  const texts = new Set();
  const selectors =
    "h1,h2,h3,h4,h5,h6,p,span,a,li,button,th,td,label,strong,div,option,figcaption,cite,blockquote,summary,details,mark,small,em,i,b,u,abbr,acronym,code,kbd,samp,time,var,dialog,output,meter,progress,textarea,select,optgroup,legend,fieldset,nav,aside";
  const attrs = ["title", "placeholder", "alt", "aria-label", "data-tooltip"];
  const minTextLength = 2;
  const maxTextLength = 500;

  const shouldTranslate = (str) => {
    if (
      typeof str !== "string" ||
      !str ||
      str.length < minTextLength ||
      str.length > maxTextLength ||
      isNumeric(str) ||
      isLongToken(str)
    ) {
      return false;
    }
    return true;
  };

  const root = element || document;
  root.querySelectorAll(selectors).forEach((el) => {
    if (el.closest(".notranslate")) {
      return;
    }
    const elementTextContent = el.textContent
      ?.replace(/[\n\t\r]+/g, " ")
      .trim();
    const hasElementChild = Array.from(el.children).length > 0;
    const hasOnlyTextChildren = Array.from(el.childNodes).every(
      (n) =>
        n.nodeType === Node.TEXT_NODE ||
        n.nodeType === Node.COMMENT_NODE ||
        (n.nodeType === Node.ELEMENT_NODE && n.tagName === "BR")
    );

    if (!hasElementChild || hasOnlyTextChildren) {
      if (shouldTranslate(elementTextContent)) {
        texts.add(elementTextContent);
      }
    } else {
      const textOnlyNode = Array.from(el.childNodes)
        .filter(
          (n) =>
            n.nodeType === Node.TEXT_NODE &&
            shouldTranslate(n.textContent.trim())
        )
        .map((n) => n.textContent.trim())
        .join(" ");
      if (shouldTranslate(textOnlyNode)) {
        texts.add(textOnlyNode);
      }
    }
  });

  root
    .querySelectorAll(attrs.map((a) => `[${a}]`).join(","))
    .forEach((el) => {
      attrs.forEach((a) => {
        const v = el.getAttribute(a)?.trim();
        if (shouldTranslate(v)) {
          texts.add(v);
        }
      });
    });

  if (!element) {
    jsStrings.forEach((s) => {
      if (shouldTranslate(s)) texts.add(s);
    });
  }

  return Array.from(texts);
}

/**
 * Replaces an `originalTxt` with `newTxt` in the DOM and `jsStrings`.
 * Only replaces if the normalized texts are different.
 * MODIFIED: This version preserves leading/trailing whitespace from the original text node.
 * @param {string} originalTxt - The text to find and replace (already trimmed).
 * @param {string} newTxt - The text to replace with.
 */
function replaceText(originalTxt, newTxt) {
  if (
    typeof originalTxt !== "string" ||
    typeof newTxt !== "string" ||
    !originalTxt ||
    !newTxt
  )
    return;
    
  const normOriginal = normalizeText(originalTxt);
  const normNew = normalizeText(newTxt);
  if (normOriginal === normNew) return;

  const selectors =
    "h1,h2,h3,h4,h5,h6,p,span,a,li,button,th,td,label,strong,div,option,figcaption,cite,blockquote,summary,details,mark,small,em,i,b,u,abbr,acronym,code,kbd,samp,time,var,dialog,output,meter,progress,textarea,select,optgroup,legend,fieldset,nav,aside";
  const attrs = ["title", "placeholder", "alt", "aria-label", "data-tooltip"];

  document.querySelectorAll(selectors).forEach((el) => {
    if (el.closest(".notranslate")) return;

    // --- START MODIFICATION ---
    el.childNodes.forEach((n) => {
      if (
        n.nodeType === Node.TEXT_NODE &&
        normalizeText(n.textContent) === normOriginal
      ) {
        const originalContent = n.textContent;
        let translatedContent = newTxt;

        // Check for leading space in original and add to translation if needed
        if (originalContent.startsWith(' ') && !translatedContent.startsWith(' ')) {
          translatedContent = ' ' + translatedContent;
        } else if (originalContent.startsWith('\n') && !translatedContent.startsWith('\n')) {
          // Also handle newlines which might act as spaces
           translatedContent = ' ' + translatedContent;
        }

        // Check for trailing space in original and add to translation if needed
        if (originalContent.endsWith(' ') && !translatedContent.endsWith(' ')) {
          translatedContent = translatedContent + ' ';
        } else if (originalContent.endsWith('\n') && !translatedContent.endsWith('\n')) {
          translatedContent = translatedContent + ' ';
        }

        n.textContent = translatedContent;
      }
    });
    // --- END MODIFICATION ---

    // The rest of the function for attributes remains the same
    const hasElementChild = Array.from(el.children).length > 0;
    const hasOnlyTextOrBrChildren = Array.from(el.childNodes).every(
      (n) =>
        n.nodeType === Node.TEXT_NODE ||
        n.nodeType === Node.COMMENT_NODE ||
        (n.nodeType === Node.ELEMENT_NODE && n.tagName === "BR")
    );
    if (!hasElementChild || hasOnlyTextOrBrChildren) {
      if (el.innerText && normalizeText(el.innerText) === normOriginal) {
        // This part is less precise but can be a fallback. The node modification above is better.
        // We won't modify this part for now as the childNode loop is more effective.
      }
    }
  });

  document
    .querySelectorAll(`${selectors},img,input,textarea,select`)
    .forEach((el) => {
      if (el.closest(".notranslate")) return;
      attrs.forEach((a) => {
        const v = el.getAttribute(a);
        if (v && normalizeText(v) === normOriginal) {
          el.setAttribute(a, newTxt);
        }
      });
    });

  jsStrings.forEach((val, i) => {
    if (normalizeText(val) === normOriginal) jsStrings[i] = newTxt;
  });
}

/**
 * Creates a cache key for a language pair (e.g., "en_vi").
 */
function getSourceTargetKey(sourceLang, targetLang) {
  return `${sourceLang}_${targetLang}`;
}

/**
 * Loads the entire translation cache from the backend API.
 * Stores all known translation pairs (both directions) in `allTranslationsCache`.
 */
async function loadTranslationCache() {
  if (Object.keys(allTranslationsCache).length > 0) {
    console.log(`Global cache already exists. No need to reload.`);
    return;
  }
  try {
    console.log(`Loading entire translation cache from backend...`);
    const r = await fetch(`${apiBase}/cache`);
    if (!r.ok) throw new Error(`API response status: ${r.status}`);
    const data = await r.json();

    allTranslationsCache = {};
    for (const key in data) {
      const colonIdx = key.indexOf(":");
      if (colonIdx < 0) continue;

      const cachedSrc = key.slice(0, colonIdx);
      const rawText = key.slice(colonIdx + 1);
      const normRaw = normalizeText(rawText);
      const targets = data[key];

      for (const target in targets) {
        const translation = targets[target]?.trim();
        if (translation) {
          const cacheKey = getSourceTargetKey(cachedSrc, target);
          if (!allTranslationsCache[cacheKey]) {
            allTranslationsCache[cacheKey] = {};
          }
          allTranslationsCache[cacheKey][normRaw] = translation;
        }
      }
    }
    console.log(
      `Global cache loaded. Total language pairs in cache: ${
        Object.keys(allTranslationsCache).length
      }`
    );
  } catch (e) {
    console.error("Error loading cache from backend:", e);
    allTranslationsCache = {};
  }
}

/**
 * Displays a SweetAlert popup with translated content.
 * Ensures the popup content is translated immediately after being rendered.
 * @param {object} options - Options to pass to Swal.fire().
 * @returns {Promise} - Promise returned from Swal.fire().
 */
function showTranslatedSwal(options) {
  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  const langName = savedLang === "vi" ? "Vietnamese" : "English";

  // Create a copy to avoid modifying the original object
  const newOptions = { ...options };

  // Store the original didOpen to be called later
  const originalDidOpen = options.didOpen;

  newOptions.didOpen = async (popup) => {
    // Apply translation first
    if (savedLang !== "en") {
      await changeLanguage(savedLang, langName, popup);
    }
    // Then, if the original options had a didOpen, call it.
    if (originalDidOpen) {
      originalDidOpen(popup);
    }
  };

  // Use the original Swal.fire method to avoid infinite loops
  if (window.Swal && window.Swal.originalFire) {
      return window.Swal.originalFire(newOptions);
  }
  // Fallback for safety
  return Swal.fire(newOptions);
}

/**
 * Main function to change the display language on the page.
 * Fetches translations from cache or API and updates the DOM silently.
 * @param {string} targetLang - The target language code (e.g., "en", "vi").
 * @param {string} targetName - The display name of the target language (e.g., "English", "Vietnamese").
 * @param {HTMLElement} [element=null] - Optional element to limit translation.
 */
async function changeLanguage(targetLang, targetName, element = null) {
  
  // ============================== END: MODIFICATION ===============================

  localStorage.setItem("selectedLanguage", targetLang);
  const currentLangElement = document.getElementById("currentLanguage");
  if (currentLangElement && !element) currentLangElement.innerText = targetName;

  try {
    const sourceLang = "en";
    await loadTranslationCache();

    const cacheKeyForTranslation = getSourceTargetKey(sourceLang, targetLang);
    const translationCache = allTranslationsCache[cacheKeyForTranslation] || {};

    const cacheKeyForReverting = getSourceTargetKey(
      lastAppliedLang,
      sourceLang
    );
    const revertingCache = allTranslationsCache[cacheKeyForReverting] || {};

    const allTexts = getAllPlainTexts(element);
    if (allTexts.length === 0) {
      if (element) {
          console.log("No translatable content found in the specified element.");
      }
      return;
    }

    const textsToTranslateViaApi = [];
    if (!element) {
      window.translationMapForCharts = {};
    }

    if (lastAppliedLang && lastAppliedLang !== "en" && !element) {
      console.log(
        `Reverting from '${lastAppliedLang}' to 'en' before applying '${targetLang}'`
      );
      allTexts.forEach((txt) => {
        const normTxt = normalizeText(txt);
        if (revertingCache[normTxt]) {
          const originalText = revertingCache[normTxt];
          replaceText(txt, originalText);
        }
      });
    }

    const textsToProcess = getAllPlainTexts(element);
    textsToProcess.forEach((txt) => {
      const normTxt = normalizeText(txt);
      let translatedText = translationCache[normTxt];

      if (targetLang === "en") {
        // When switching back to English, we should use the original text.
        // The original text might have been overwritten, so we look it up from the reverting cache.
        const revertingCacheEn = allTranslationsCache[getSourceTargetKey(lastAppliedLang, "en")] || {};
        translatedText = revertingCacheEn[normTxt] || txt;
      }
      
      if (translatedText) {
        replaceText(txt, translatedText);
        window.translationMapForCharts[txt] = translatedText;
      } else if (targetLang !== "en") {
        textsToTranslateViaApi.push(txt);
      } else {
        window.translationMapForCharts[txt] = txt;
      }
    });

    if (!element) {
      lastAppliedLang = targetLang;
    }

    if (textsToTranslateViaApi.length === 0) {
      if (!element) {
        console.log(
          `All strings processed from cache for the whole page. No API call needed.`
        );
        window.dispatchEvent(new CustomEvent("languageChanged"));
        lastTranslationTime = Date.now();
      } else {
        console.log(`All strings for the element processed from cache.`);
      }
      return;
    }

    console.log(
      `Total strings: ${allTexts.length}, Strings needing API translation: ${textsToTranslateViaApi.length}`
    );

    let totalSuccess = 0;
    const totalBatches = Math.ceil(
      textsToTranslateViaApi.length / BATCH_SIZE_FRONTEND
    );

    for (
      let i = 0;
      i < textsToTranslateViaApi.length;
      i += BATCH_SIZE_FRONTEND
    ) {
      const batch = textsToTranslateViaApi.slice(i, i + BATCH_SIZE_FRONTEND);
      const batchIndex = Math.floor(i / BATCH_SIZE_FRONTEND) + 1;

      console.log(
        `Sending batch ${batchIndex}/${totalBatches} for translation...`
      );

      const payload = { texts: batch, sourceLang, targetLang };

      const response = await fetch(`${apiBase}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(
          `API translation error: ${response.status} - ${errMsg}`
        );
      }

      const translations = await response.json();

      Object.entries(translations).forEach(([original, translated]) => {
        const normOrig = normalizeText(original);
        const normTranslated = normalizeText(translated);

        const enTargetCacheKey = getSourceTargetKey(sourceLang, targetLang);
        if (!allTranslationsCache[enTargetCacheKey]) {
          allTranslationsCache[enTargetCacheKey] = {};
        }
        allTranslationsCache[enTargetCacheKey][normOrig] = translated;

        const targetEnCacheKey = getSourceTargetKey(targetLang, sourceLang);
        if (!allTranslationsCache[targetEnCacheKey]) {
          allTranslationsCache[targetEnCacheKey] = {};
        }
        allTranslationsCache[targetEnCacheKey][normTranslated] = original;

        replaceText(original, translated);
        window.translationMapForCharts[original] = translated;
      });

      totalSuccess += Object.keys(translations).length;
    }

    console.log(
      `Translation completed. Successfully translated ${totalSuccess} strings.`
    );
    if (!element) {
      window.dispatchEvent(new CustomEvent("languageChanged"));
      lastTranslationTime = Date.now();
    }
  } catch (err) {
    console.error("Critical error during translation:", err);
  }
}

/**
 * Initialization function, runs when DOM is fully loaded.
 * Reads saved language, updates UI, and applies translation.
 */
async function initialize() {
  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  let langName = savedLang === "vi" ? "Vietnamese" : "English";

  const currentLangElement = document.getElementById("currentLanguage");
  if (currentLangElement) {
    currentLangElement.innerText = langName;
  }

  lastAppliedLang = "en";

  await loadTranslationCache();
  if (savedLang !== "en") {
    await changeLanguage(savedLang, langName);
  }

  let isTranslating = false;
  $('table.dataTable').on('draw.dt', async function () {
    if (isTranslating) return;
    isTranslating = true;
    const table = this;
    const currentSavedLang = localStorage.getItem("selectedLanguage") || "en";
    const currentLangName = currentSavedLang === "vi" ? "Vietnamese" : "English";
    if (currentSavedLang !== "en") {
      await changeLanguage(currentSavedLang, currentLangName, table);
    }
    isTranslating = false;
  });

  window.addEventListener("languageChanged", async () => {
    const currentSavedLang = localStorage.getItem("selectedLanguage") || "en";
    const currentLangName = currentSavedLang === "vi" ? "Vietnamese" : "English";
    document.querySelectorAll(".swal2-popup").forEach(async (popup) => {
      await changeLanguage(currentSavedLang, currentLangName, popup);
    });
  });
}

/**
 * NEW: Patches the global Swal.fire() function to ensure all popups are translated.
 * This makes the translation system more robust.
 */
function patchSwal() {
    if (window.Swal) {
        // Keep a reference to the original function to be called inside our wrapper
        window.Swal.originalFire = window.Swal.fire;

        // Override the global Swal.fire
        window.Swal.fire = function(...args) {
            let options = {};
            // Case 1: Swal.fire({ title: '...', text: '...' })
            if (args.length === 1 && typeof args[0] === 'object') {
                options = args[0];
            } 
            // Case 2: Swal.fire('Title', 'Text', 'icon')
            else {
                const [title, html, icon] = args;
                options = { title, html, icon };
            }

            // Call our custom translated Swal function instead of the original
            return showTranslatedSwal(options);
        };
        console.log("Swal.fire has been patched for automatic translation.");
    } else {
        console.warn("Swal was not found on the window object. Patching failed.");
    }
}


/* ----------------- Location and Image Handling ------------------ */

const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

/**
 * Adds a new location input group to the form and translates it.
 */
async function addLocation() {
  console.log("addLocation called, locationIndex:", window.locationIndex);
  const container = document.getElementById("locations-container");
  if (!container) {
    console.error("locations-container not found");
    return;
  }
  const locationHtml = `
    <div class="location-group mb-3">
        <div class="row">
            <div class="col-sm-4">
                <label>${translateText("Name of Location")}</label>
                <input type="text" name="Locations[${window.locationIndex}].Name" class="form-control" placeholder="${translateText("Location name")}" required />
                <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Name" data-valmsg-replace="true"></span>
            </div>
            <div class="col-sm-4">
                <label>${translateText("Address")}</label>
                <input type="text" name="Locations[${window.locationIndex}].Address" class="form-control" placeholder="${translateText("Address")}" required />
                <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Address" data-valmsg-replace="true"></span>
            </div>
            <div class="col-sm-4">
                <label>${translateText("Marker Type")}</label>
                <input type="text" class="form-control" value="${window.sellLocationMarkerName}" readonly />
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <label>${translateText("Longitude")}</label>
                <input type="number" name="Locations[${window.locationIndex}].Longitude" class="form-control" step="any" placeholder="${translateText("Longitude")}" required min="-180" max="180" />
                <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Longitude" data-valmsg-replace="true"></span>
            </div>
            <div class="col-sm-6">
                <label>${translateText("Latitude")}</label>
                <input type="number" name="Locations[${window.locationIndex}].Latitude" class="form-control" step="any" placeholder="${translateText("Latitude")}" required min="-90" max="90" />
                <span class="text-danger field-validation-valid" data-valmsg-for="Locations[${window.locationIndex}].Latitude" data-valmsg-replace="true"></span>
            </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm mt-2 remove-location">${translateText("Remove")}</button>
    </div>`;
  container.insertAdjacentHTML("beforeend", locationHtml);
  window.locationIndex++;

  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  const langName = savedLang === "vi" ? "Vietnamese" : "English";
  if (savedLang !== "en") {
    const newLocation = container.lastElementChild;
    await changeLanguage(savedLang, langName, newLocation);
  }
}

/**
 * Removes a location input group.
 */
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-location")) {
    e.target.parentElement.remove();
  }
});

/**
 * Handles initialization, event listeners, and form validation.
 */
document.addEventListener("DOMContentLoaded", function () {
  initialize();
  patchSwal(); // <<-- KÍCH HOẠT BẢN VÁ TỰ ĐỘNG DỊCH

  const addBox = document.getElementById("addImageBox");
  const uploadInput = document.getElementById("uploadImageInput");
  const imagePreview = document.getElementById("imagePreview");
  const validationMessage = document.getElementById("imageValidationMessage");

  if (addBox) {
    addBox.addEventListener("click", () => {
        if (uploadInput) {
            uploadInput.click();
        }
    });
  }

  if(uploadInput) {
    uploadInput.addEventListener("change", async function (e) {
      validationMessage.textContent = "";
      if (imagePreview) imagePreview.innerHTML = "";
      const files = uploadInput.files;

      if (!files || files.length === 0) return;
      
      if (files.length > 5) {
        validationMessage.textContent = translateText(
          "You can upload a maximum of %s images."
        ).replace("%s", "5");
        uploadInput.value = "";
        return;
      }

      let hasInvalidFormat = false;
      Array.from(files).forEach((file) => {
        const ext = `.${file.name.split(".").pop().toLowerCase()}`;
        if (!allowedExtensions.includes(ext)) {
          hasInvalidFormat = true;
        }
      });

      if (hasInvalidFormat) {
        validationMessage.textContent = translateText(
          "Please upload valid image files only (e.g., JPG, PNG, GIF)."
        );
        uploadInput.value = "";
        return;
      }

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const col = document.createElement("div");
            col.classList.add("col-sm-3");
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item", "position-relative");
            const img = document.createElement("img");
            img.src = e.target.result;
            img.classList.add("w-100", "rounded");
            itemDiv.appendChild(img);
            col.appendChild(itemDiv);
            if(imagePreview) imagePreview.appendChild(col);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }

  // Form validation for createLocalSpecialtyForm
  const form = $("#createLocalSpecialtyForm");
  if (form.length) {
    form.on("submit", async function (e) {
      const longInputs = document.querySelectorAll('input[name$="Longitude"]');
      const latInputs = document.querySelectorAll('input[name$="Latitude"]');
      let isValid = true;

      longInputs.forEach((input) => {
        const value = parseFloat(input.value);
        if (input.value && (value < -180 || value > 180)) {
          $(input).next(".text-danger").text(translateText("Longitude must be between -180 and 180."));
          isValid = false;
        } else {
          $(input).next(".text-danger").text("");
        }
      });

      latInputs.forEach((input) => {
        const value = parseFloat(input.value);
        if (input.value && (value < -90 || value > 90)) {
          $(input).next(".text-danger").text(translateText("Latitude must be between -90 and 90."));
          isValid = false;
        } else {
          $(input).next(".text-danger").text("");
        }
      });

      if (uploadInput && validationMessage) {
        const files = uploadInput.files;
        if (!files || files.length === 0) {
            validationMessage.textContent = translateText("At least one image is required");
            isValid = false;
        } else if (files.length > 5) {
            validationMessage.textContent = translateText("You can upload a maximum of %s images.").replace("%s", "5");
            isValid = false;
        } else {
            let hasInvalidFormat = false;
            Array.from(files).forEach((file) => {
                const ext = `.${file.name.split(".").pop().toLowerCase()}`;
                if (!allowedExtensions.includes(ext)) {
                    hasInvalidFormat = true;
                }
            });
            if (hasInvalidFormat) {
                validationMessage.textContent = translateText("Please upload valid image files only (e.g., JPG, PNG, GIF).");
                isValid = false;
            }
        }
      }

      // if (!isValid) {
      //   e.preventDefault();
      //   // This will now be automatically translated
      //   Swal.fire({
      //     icon: "error",
      //     title: "Invalid Input",
      //     text: "Please correct the validation errors before submitting.",
      //     showConfirmButton: true,
      //   });
      // }
    });
  }
});