// js/utils.js
(function () {
  // Format numbers with commas (e.g., 1250000 -> 1,250,000)
  window.formatNumber = function (num) {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Auto-format all .kpi-value or .currency-value on load
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".kpi-value, .currency-value").forEach(el => {
      let text = el.innerText.trim();

      // Extract numeric part
      let value = text.replace(/[^0-9.]/g, "");
      if (!value) return;

      let formatted = formatNumber(value);

      // Preserve KWD, $, or any suffix
      let suffix = text.replace(/[0-9.,]/g, "").trim();
      el.innerText = suffix ? formatted + " " + suffix : formatted;
    });
  });
})();