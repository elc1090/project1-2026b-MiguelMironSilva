// i18n.js
// Adds an English / Kiswahili toggle to the Drawing Board app.
// Opção de Suaíli mudada para Português
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
        resetColor: "Reset",
      },
      pt: {
        pageTitle: "App de Desenho",
        tools: "OPÇÕES",
        shapes: "Formas",
        options: "Opções",
        colors: "Cores",
        rectangle: "Retângulo",
        circle: "Círculo",
        triangle: "Triângulo",
        line: "Linha",
        randomDraw: "Desenho Aleatório",
        fillColor: "Preencher com Cor",
        brush: "Pincel",
        eraser: "Borracha",
        spray: "Spray",
        clearCanvas: "Limpar Desenho",
        saveImg: "Salvar Como Imagem",
        installApp: "Instalar App",
        resetColor: "Restaurar",
      },
    };
  
    // If a school hasn't picked a language yet, default based on the
    // browser/device language - otherwise fall back to English.
    function detectDefaultLang() {
      const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
      return nav.startsWith("pt") ? "pt" : "en";
    }
  
    function getSavedLang() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "en" || saved === "pt" ? saved : null;
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
      const dict = translations[lang] || translations.pt; //talvez seja aqui que não funciona?
  
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
