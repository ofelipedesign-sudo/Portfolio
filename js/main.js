(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navList = document.querySelector("[data-nav-list]");
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const yearEl = document.querySelector("[data-year]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Header scroll state */
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile nav */
  if (navToggle && navList) {
    const closeNav = () => {
      navToggle.setAttribute("aria-expanded", "false");
      navList.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const openNav = () => {
      navToggle.setAttribute("aria-expanded", "true");
      navList.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeNav() : openNav();
    });
    navLinks.forEach((link) => link.addEventListener("click", closeNav));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* Active nav link on scroll */
  const sections = ["work", "about", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const navMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute("href").replace("#", "");
      navMap.set(id, link);
    });
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navMap.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  /* Scroll reveals */
  const revealEls = document.querySelectorAll(".reveal, .work-entry");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }
})();
