/* =========================================================================
 * translation.js - Optimized Version
 * Description: Handles multilingual translation, optimized cache, accurate text comparison and replacement.
 * ========================================================================= */

/* ----------------- Configuration & Globals ------------------ */

// Strings from JS code that need translation.
const jsStrings = [
  "No Text",
  "No translatable text found on the page.",
  "Translation Error",
  "Failed to translate text. Please try again later.",
  "Retry",
  "Translating...",
  "Translation successful!",
  "Please wait %s seconds before translating again.",
  "Too fast!",
  "Notifications",
  "Feedback",
  "My Profile",
  "Settings",
  "Log Out",
  "Back",
  "Dashboards",
  "Account Management",
  "Admin Management",
  "Destination",
  "Ocop Product",
  "Ocop Type",
  "Company",
  "Review Management",
  "Local Specialties",
  "Event And Festival",
  "Tips Management",
  "Send Notifications",
  "Marker Management",
  "Itineraries",
  "Analytics",
  "Ocop",
  "Dashboard",
  "Default",
  "Check all",
  "Vietnamese",
  "English",
  "Admin",
  "Total Users",
  "Active Users",
  "Total Reviews",
  "(This month)",
  "Upcoming",
  "Performance by Tag",
  "Local Specialty",
  "Tips",
  "Festivals",
  "All",
  "Select tags",
  "Today",
  "Last Week",
  "Last Month",
  "Last Year",
  "Download Chart",
  "User Creation Over Time",
  "User Statistics Overview",
  "Age Distribution",
  "Gender Distribution",
  "Status Distribution",
  "Hometown Distribution",
  "Top 5 Reviews",
  "Tag",
  "Customer",
  "Destination Name",
  "Rate",
  "Review",
  "OK",
  "No",
  "Cancel",
  "Number of Users",
  "Age Groups",
  "Gender",
  "Status",
  "Day of Week",
  "Performance by Tag",
  // Chart specific strings
  "View Count",
  "Interaction Count",
  "Favorite Count",
  "OCOP Product Analytics",
  "Count",
  "Product Name",
  "OCOP User Demographics (Product – Hometown – Age Group)",
  "Users from",
  "N/A",
  "Age Group",
  "User Count",
  "Product",
  "Top Interacted OCOP Products",
  "Top Favorited OCOP Products",
  "OCOP Product Comparison",
  "Invalid Input",
  "Start date cannot be in the future.",
  "End date cannot be in the future.",
  "End date cannot be earlier than start date.",
  "Error",
  "No chart available for download",
  "Label",
  "Warning!",
  "No analytics data found",
  "Success!",
  "Analytics chart refreshed",
  "An error occurred",
  "No demographics data found",
  "Demographics chart refreshed",
  "No data found",
  "Top Interaction refreshed",
  "Failed to refresh top interaction",
  "Top Favorite refreshed",
  "Failed to refresh top favorites",
  "Please select products to compare",
  "Comparison chart refreshed",
  "Filters have been reset",
  "Views",
  "Interactions",
  "Favorites",
  "Destination Analytics",
  "Count",
  "Destinations",
  "User Demographics (Location – Hometown – Age Group)",
  "Location",
  "User Count",
  "Users from ", 
  "Age Group: ",
  "User Count: ", 
  "Top Interacted Destinations",
  "Top Destinations",
  "Top Favorited Destinations",
  "Destination Comparison",
  "Compared Destinations",
  "Invalid Input",
  "Start date cannot be in the future.",
  "End date cannot be in the future.",
  "End date cannot be earlier than start date.",
  "Warning",
  "No analytics data found",
  "Success!",
  "Analytics chart refreshed",
  "Failed to refresh analytics data",
  "No demographics data found",
  "Demographics chart refreshed",
  "Failed to refresh demographics data",
  "No data found",
  "Top Views refreshed",
  "Failed to refresh top views",
  "Top Favorites refreshed",
  "Failed to refresh top favorites",
  "Please choose at least one destination",
  "Comparison chart refreshed",
  "Failed to refresh comparison data",
  "Filters have been reset",
  "No chart available for download",
  "Label",
   // Main Dashboard Chart Strings
  "User Statistics Overview",
  "Age Distribution",
  "Number of Users",
  "Age Groups",
  "Gender Distribution",
  "Gender",
  "Status Distribution",
  "Status",
  "Number of Interactions",
  "Error!",
  "Failed to load charting library. Please refresh the page.",
  "Failed to load chart plugins. Please refresh the page.",
  "No chart data available to download!",
  "Failed to update chart: Invalid response format",
  "Failed to fetch statistics",
  "Failed to update chart",
  "users",
  "Value",
  "Day",
  "Female",
  "Male",
  "Other",      
  "Active",
  "Inactive",
  "Forbidden",
  "Week",
  "Month",
  "Year",
];

// Base URL for the translation API.
const apiBase = "https://localhost:7162/api/Translation";
// Minimum time between translation requests (5 seconds).
const minTranslationInterval = 5000;
// Number of strings to send per API batch request.
const BATCH_SIZE_FRONTEND = 40;

// Last translation timestamp for rate limiting.
let lastTranslationTime = 0;
// The last language applied to the UI.
let lastAppliedLang = null;
// Global cache for all translations: { "sourceLang_targetLang": { "normalizedOriginalText": "translatedText" } }.
let allTranslationsCache = {};
// Map to restore original English text from translated text (e.g., "chào mừng admin" -> "Welcome Admin").
let originalTextsMap = new Map(); // This is not currently used to affect chart translations, but good to keep.

// *** NEW: Global translation map for chart.js ***
window.translationMapForCharts = {};

/* ----------------- Helpers ------------------ */

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
 * Collects all translatable text from the DOM (HTML elements and attributes) and `jsStrings`.
 * Filters out numbers and long tokens.
 * @returns {string[]} Array of unique translatable strings.
 */
function getAllPlainTexts() {
  const texts = new Set();
  const selectors =
    "h1,h2,h3,h4,h5,h6,p,span,a,li,button,th,td,label,strong,div,option,figcaption,cite,blockquote,summary,details,mark,small,em,i,b,u,abbr,acronym,code,kbd,samp,time,var,dialog,output,meter,progress,textarea,select,optgroup,legend,fieldset,nav,aside";
  const attrs = [
    "title",
    "placeholder",
    "alt",
    "aria-label",
    "data-tooltip", 
  ];
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

  document.querySelectorAll(selectors).forEach((el) => {
    if (el.closest('.notranslate')) {
      return; // Nếu phần tử này nằm trong .notranslate, bỏ qua nó
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

  document
    .querySelectorAll(attrs.map((a) => `[${a}]`).join(","))
    .forEach((el) => {
      attrs.forEach((a) => {
        const v = el.getAttribute(a)?.trim();
        if (shouldTranslate(v)) {
          texts.add(v);
        }
      });
    });

  jsStrings.forEach((s) => {
    if (shouldTranslate(s)) texts.add(s);
  });

  console.log("Collected strings:", Array.from(texts));
  return Array.from(texts);
}

/**
 * Replaces an `originalTxt` with `newTxt` in the DOM and `jsStrings`.
 * Only replaces if the normalized texts are different.
 * @param {string} originalTxt - The text to find and replace.
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
  const attrs = [
    "title",
    "placeholder",
    "alt",
    "aria-label",
    "data-tooltip",
    // "value",
  ];

  document.querySelectorAll(selectors).forEach((el) => {
      if (el.closest('.notranslate')) return; 
    el.childNodes.forEach((n) => {
      if (
        n.nodeType === Node.TEXT_NODE &&
        normalizeText(n.textContent) === normOriginal
      ) {
        n.textContent = newTxt;
      }
    });
    const hasElementChild = Array.from(el.children).length > 0;
    const hasOnlyTextOrBrChildren = Array.from(el.childNodes).every(
      (n) =>
        n.nodeType === Node.TEXT_NODE ||
        n.nodeType === Node.COMMENT_NODE ||
        (n.nodeType === Node.ELEMENT_NODE && n.tagName === "BR")
    );
    if (!hasElementChild || hasOnlyTextOrBrChildren) {
      if (el.innerText && normalizeText(el.innerText) === normOriginal) {
        el.innerText = newTxt;
      }
    }
  });

  document
    .querySelectorAll(`${selectors},img,input,textarea,select`)
    .forEach((el) => {
        if (el.closest('.notranslate')) return;

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
  // If cache is already loaded, skip fetching.
  if (Object.keys(allTranslationsCache).length > 0) {
    console.log(`Global cache already exists. No need to reload.`);
    return;
  }
  try {
    console.log(`Loading entire translation cache from backend...`);
    const r = await fetch(`${apiBase}/cache`);
    if (!r.ok) throw new Error(`API response status: ${r.status}`);
    const data = await r.json();

    allTranslationsCache = {}; // Reset cache

    for (const key in data) {
      const colonIdx = key.indexOf(":");
      if (colonIdx < 0) continue; // Skip malformed keys.

      const cachedSrc = key.slice(0, colonIdx);
      const rawText = key.slice(colonIdx + 1);
      const normRaw = normalizeText(rawText);
      const targets = data[key];

      // Store all translations for this rawText.
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
    allTranslationsCache = {}; // Ensure cache is empty on error.
  }
}

/**
 * Main function to change the display language on the page.
 * Fetches translations from cache or API and updates the DOM.
 * @param {string} targetLang - The target language code (e.g., "en", "vi").
 * @param {string} targetName - The display name of the target language (e.g., "English", "Vietnamese").
 * @param {boolean} [skipAlert=false] - If true, suppresses Swal.fire alerts.
 */
async function changeLanguage(targetLang, targetName, skipAlert = false) {
  const now = Date.now();
  // Prevent rapid calls to avoid API spam.
  if (now - lastTranslationTime < minTranslationInterval) {
    const remainingTime = (
      (minTranslationInterval - (now - lastTranslationTime)) /
      1000
    ).toFixed(1);
    console.log(`⏳ Please wait ${remainingTime}s to translate again.`);
    if (!skipAlert) {
      Swal.fire({
        icon: "info",
        title: "Too fast!",
        text: `Please wait ${remainingTime} seconds before translating again.`,
        showConfirmButton: false,
        timer: 2000,
      });
    }
    return;
  }

  // Save selected language to local storage and update UI element.
  localStorage.setItem("selectedLanguage", targetLang);
  const currentLangElement = document.getElementById("currentLanguage");
  if (currentLangElement) currentLangElement.innerText = targetName;

  // Show loading alert if not skipped.
  if (!skipAlert) {
    Swal.fire({
      title: "Translating...",
      html: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  }

  try {
    const sourceLang = "en"; // Application's original language is always English.

    // Ensure the entire translation cache is loaded.
    await loadTranslationCache();

    const cacheKeyForTranslation = getSourceTargetKey(sourceLang, targetLang);
    const translationCache = allTranslationsCache[cacheKeyForTranslation] || {};

    const cacheKeyForReverting = getSourceTargetKey(lastAppliedLang, sourceLang);
    const revertingCache = allTranslationsCache[cacheKeyForReverting] || {};


    // Get all translatable text strings currently displayed on the DOM.
    const allTexts = getAllPlainTexts();
    if (allTexts.length === 0) {
      console.log("⚠️ No translatable content found on the page.");
      if (!skipAlert) Swal.close();
      return;
    }

    const textsToTranslateViaApi = []; // Stores texts that need API translation.
    window.translationMapForCharts = {}; // Reset chart translation map

    // 1. Revert all texts to English first to have a clean state
    if (lastAppliedLang && lastAppliedLang !== 'en') {
        console.log(`Reverting from '${lastAppliedLang}' to 'en' before applying '${targetLang}'`);
        allTexts.forEach(txt => {
            const normTxt = normalizeText(txt);
            if(revertingCache[normTxt]) {
                const originalText = revertingCache[normTxt];
                replaceText(txt, originalText);
            }
        });
    }


    const textsToProcess = getAllPlainTexts(); // Re-collect texts after reverting to English
    
    textsToProcess.forEach((txt) => {
        const normTxt = normalizeText(txt);
        let translatedText = translationCache[normTxt];
        
        if (targetLang === 'en') {
            translatedText = txt; // Revert to original
        }

        if (translatedText) {
            replaceText(txt, translatedText);
            window.translationMapForCharts[txt] = translatedText;
        } else if (targetLang !== 'en') {
            textsToTranslateViaApi.push(txt);
        } else {
             window.translationMapForCharts[txt] = txt;
        }
    });


    lastAppliedLang = targetLang;

    if (textsToTranslateViaApi.length === 0) {
      console.log(`✅ All strings processed from cache. No API call needed.`);
      window.dispatchEvent(new CustomEvent("languageChanged")); // FIRE EVENT
      if (!skipAlert) Swal.close();
      lastTranslationTime = Date.now();
      return;
    }


    // --- Start API translation process for remaining texts ---
    console.log(
      `Total strings on page: ${allTexts.length}, Strings needing API translation (not cached): ${textsToTranslateViaApi.length}`
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

      if (!skipAlert) {
        Swal.update({
          html: `Translating: Batch ${batchIndex}/${totalBatches} (${totalSuccess} texts translated)`,
        });
      }

      console.log(
        `Sending batch ${batchIndex}/${totalBatches} for translation:`,
        batch
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

    // *** FIRE EVENT AFTER ALL TRANSLATIONS ARE DONE ***
    window.dispatchEvent(new CustomEvent("languageChanged"));

    if (!skipAlert) {
      Swal.fire({
        icon: "success",
        title: "Translation complete!",
        text: `Translated and updated ${totalSuccess} texts.`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (err) {
    console.error("Critical error during translation:", err);
    if (!skipAlert) {
      Swal.fire({
        icon: "warning",
        title: "Partial translation",
        text: `Some texts could not be translated due to server limits. Please try again later.`,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  } finally {
    lastTranslationTime = Date.now();
  }
}

/* ----------------- Initialization ------------------ */

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
  
  lastAppliedLang = 'en'; // Assume initial state is English

  if (savedLang !== 'en') {
      await changeLanguage(savedLang, langName, true);
  } else {
      await loadTranslationCache(); // Pre-load cache even for English
  }
}

document.addEventListener("DOMContentLoaded", initialize);
window.changeLanguage = changeLanguage;

function t(text) {
  if (!text) return text;
  return window.translationMapForCharts?.[text] || text;
}