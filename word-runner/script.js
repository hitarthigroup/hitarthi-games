/* ===========================================================
   Word Runner: The Lost Kingdom — Landing Page Script
   =========================================================== */
(function () {
  "use strict";

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("siteHeader");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 12);
    if (backToTop) backToTop.classList.toggle("show", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Mobile nav ---------- */
  const hamburger = document.getElementById("hamburger");
  const mobilePanel = document.getElementById("mobilePanel");
  const scrim = document.getElementById("scrim");

  function closeMenu() {
    hamburger && hamburger.classList.remove("open");
    mobilePanel && mobilePanel.classList.remove("open");
    scrim && scrim.classList.remove("open");
    document.body.style.overflow = "";
  }
  function toggleMenu() {
    const willOpen = !mobilePanel.classList.contains("open");
    hamburger.classList.toggle("open", willOpen);
    mobilePanel.classList.toggle("open", willOpen);
    scrim.classList.toggle("open", willOpen);
    document.body.style.overflow = willOpen ? "hidden" : "";
  }
  if (hamburger) hamburger.addEventListener("click", toggleMenu);
  if (scrim) scrim.addEventListener("click", closeMenu);
  document.querySelectorAll(".mobile-panel a").forEach((a) =>
    a.addEventListener("click", closeMenu)
  );

  /* ---------- Smooth in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 0.06 + "s";
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Hero floating vocabulary orbs (decorative only) ---------- */
  const HERO_WORDS = [
    "Dog 🐕", "Ghost 👻", "Fairy 🧚", "King 👑", "Snow ❄️", "Fish 🐟",
    "Star ⭐", "Dragon 🐉"
  ];
  const heroVisual = document.getElementById("heroVisual");
  if (heroVisual) {
    HERO_WORDS.slice(0, 5).forEach((w, i) => {
      const el = document.createElement("div");
      el.className = "float-word";
      el.textContent = w;
      const positions = [
        { top: "6%", left: "2%" },
        { top: "18%", right: "0%" },
        { top: "68%", left: "-4%" },
        { top: "80%", right: "-2%" },
        { top: "42%", left: "88%" }
      ];
      const p = positions[i % positions.length];
      Object.assign(el.style, p, { animationDelay: i * 0.7 + "s" });
      heroVisual.appendChild(el);
    });

    // orbs falling inside the device mockup
    const deviceScreen = document.getElementById("deviceOrbs");
    if (deviceScreen) {
      const orbWords = ["Cat", "Tree", "Moon", "Wave", "Crown"];
      orbWords.forEach((w, i) => {
        const orb = document.createElement("div");
        orb.className = "device-orb";
        orb.textContent = w;
        const lane = i % 3;
        const left = 20 + lane * 30;
        orb.style.left = left + "%";
        orb.style.top = "0px";
        orb.style.width = "44px";
        orb.style.height = "44px";
        orb.style.animationDelay = i * 0.9 + "s";
        deviceScreen.appendChild(orb);
      });
    }
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
