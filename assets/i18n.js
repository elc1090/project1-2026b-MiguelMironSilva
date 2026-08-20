// i18n.js
// Adds an English / Kiswahili toggle to the Drawing Board app.
// Works entirely through [data-i18n] / [data-i18n-alt] attributes,
// so it never touches script.js or style.css.

(() => {
    const STORAGE_KEY = "drawingAppLanguage";
  
    const translations = {
      en: {
        pageTitle: "Drawing App",
        tools: "TOOLS",
        shapes: "Shapes",
        options: "Options",
        colors: "Colors",
        rectangle: "Rectangle",
        circle: "Circle",
        triangle: "Triangle",
        line: "Line",
        randomDraw: "Random Draw",
        fillColor: "Fill color",
        brush: "Brush",
        eraser: "Eraser",
        spray: "Spray",
        clearCanvas: "Clear Workspace",
        saveImg: "Save As Image",
        installApp: "Install App",
      },
      sw: {
        pageTitle: "Programu ya Kuchora",
        tools: "ZANA",
        shapes: "Maumbo",
        options: "Chaguo",
        colors: "Rangi",
        rectangle: "Mstatili",
        circle: "Duara",
        triangle: "Pembetatu",
        line: "Mstari",
        randomDraw: "Bahati Nasibu",
        fillColor: "Jaza Rangi",
        brush: "Burashi",
        eraser: "Kifutio",
        spray: "Nyunyiza",
        clearCanvas: "Futa Ubao",
        saveImg: "Hifadhi Kama Picha",
        installApp: "Sakinisha Programu",
      },
      pt: {
        pageTitle: "App de Desenho",
        tools: "FERRAMENTAS",
        shapes: "Shapes",
        options: "Options",
        colors: "Colors",
        rectangle: "Rectangle",
        circle: "Circle",
        triangle: "Triangle",
        line: "Line",
        randomDraw: "Random Draw",
        fillColor: "Fill color",
        brush: "Brush",
        eraser: "Eraser",
        spray: "Spray",
        clearCanvas: "Clear Workspace",
        saveImg: "Save As Image",
        installApp: "Install App",
      },
    };
  
    // If a school hasn't picked a language yet, default based on the
    // browser/device language - otherwise fall back to Kiswahili.
    function detectDefaultLang() {
      const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
      return nav.startsWith("en") ? "en" : "sw": "pt";
    }
  
    function getSavedLang() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "en" || saved === "sw" || saved === "pt" ? saved : null;
      } catch (err) {
        return null;
      }
    }
  
    function saveLang(lang) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (err) {
        // localStorage unavailable (e.g. private browsing) - language
        // just won't be remembered between visits.
      }
    }
  
    function applyLanguage(lang) {
      const dict = translations[lang] || translations.en;
  
      document.documentElement.lang = lang;
      document.title = dict.pageTitle;
  
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) el.textContent = dict[key];
      });
  
      document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
        const key = el.getAttribute("data-i18n-alt");
        if (dict[key]) el.setAttribute("alt", dict[key]);
      });
  
      document.querySelectorAll(".lang-btn").forEach((btn) => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
  
      saveLang(lang);
    }
  
    document.addEventListener("DOMContentLoaded", () => {
      applyLanguage(getSavedLang() || detectDefaultLang());
  
      document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
      });
    });
  })();
