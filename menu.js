document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const year = document.querySelector("[data-current-year]");

  if (year) year.textContent = new Date().getFullYear();
  if (!burger || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("nav-active");
    burger.classList.remove("toggle");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-active");
    burger.classList.toggle("toggle", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !burger.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      burger.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });
});
