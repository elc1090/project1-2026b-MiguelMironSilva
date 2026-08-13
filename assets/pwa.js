// pwa.js
// Registers the service worker (sw.js) for offline support, and shows a
// floating "Install App" button when the browser is able to install the
// app to the home screen / desktop.

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
    });
  }
  
  const installBtn = document.querySelector(".install-btn");
  let deferredInstallPrompt = null;
  
  window.addEventListener("beforeinstallprompt", (event) => {
    // Stop the browser's default mini-infobar and show our own button instead.
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });
  
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.hidden = true;
    });
  }
  
  window.addEventListener("appinstalled", () => {
    if (installBtn) installBtn.hidden = true;
    deferredInstallPrompt = null;
  });