/* ==========================================================================
   Abdullah Azam | Portfolio
   Small, dependency-free enhancements. The page works without this file;
   it only adds the mobile menu, active-link highlighting, reveal animations
   and contact-form validation.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Contact form backend.
     Host the Django app in ./backend and paste its public URL here, e.g.
       var CONTACT_ENDPOINT = "https://yourname.pythonanywhere.com/api/contact/";
     Leave it empty ("") and the form stays front-end only.
     ------------------------------------------------------------------ */
  var CONTACT_ENDPOINT = "";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: add a border once the page is scrolled ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a link
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    // Close with the Escape key and return focus to the button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    // Reset when the window grows back to desktop width
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Highlight the nav link of the section in view ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var active = link.getAttribute("href") === "#" + entry.target.id;
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var reveal = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach(function (el) { reveal.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contact form (front-end validation only) ---------- */
  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");

  var rules = {
    name: function (v) {
      return v.trim().length >= 2 || "Enter your name (at least 2 characters).";
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Enter a valid email address, like name@example.com.";
    },
    subject: function (v) {
      return v.trim().length >= 3 || "Enter a subject (at least 3 characters).";
    },
    message: function (v) {
      return v.trim().length >= 10 || "Write a message of at least 10 characters.";
    }
  };

  function validateField(input) {
    var result = rules[input.name](input.value);
    var errorEl = document.getElementById(input.id + "-error");
    var valid = result === true;
    input.setAttribute("aria-invalid", String(!valid));
    if (errorEl) errorEl.textContent = valid ? "" : result;
    return valid;
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea"));

    // Re-check a field as the person fixes it, after it has been flagged once
    fields.forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) validateField(input); });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (statusEl) statusEl.textContent = "";

      var firstInvalid = null;
      fields.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      /* ----------------------------------------------------------------
         Send the message to the Django backend. If no endpoint is set yet,
         fall back to the notice so the form never pretends to have sent.
         ---------------------------------------------------------------- */
      if (!CONTACT_ENDPOINT) {
        if (statusEl) {
          statusEl.textContent =
            "Your details look good, but the contact backend isn't configured yet. Please use the email link instead.";
        }
        return;
      }

      var payload = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        subject: form.elements.subject.value.trim(),
        message: form.elements.message.value.trim()
      };

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) statusEl.textContent = "Sending…";

      fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () { return {}; })
            .then(function (data) { return { ok: response.ok, data: data }; });
        })
        .then(function (result) {
          if (result.ok && result.data.ok !== false) {
            form.reset();
            fields.forEach(function (input) { input.removeAttribute("aria-invalid"); });
            if (statusEl) {
              statusEl.textContent = result.data.message || "Thanks! Your message was received.";
            }
            return;
          }

          var serverErrors = result.data.errors || {};
          var hasFieldError = false;
          Object.keys(serverErrors).forEach(function (key) {
            var errorEl = document.getElementById(key + "-error");
            var input = document.getElementById(key);
            if (errorEl) { errorEl.textContent = serverErrors[key]; hasFieldError = true; }
            if (input) input.setAttribute("aria-invalid", "true");
          });
          if (statusEl) {
            statusEl.textContent = hasFieldError
              ? "Please fix the highlighted fields and try again."
              : "Sorry, something went wrong. Please try again or use the email link.";
          }
        })
        .catch(function () {
          if (statusEl) {
            statusEl.textContent =
              "Couldn't reach the server. Please check your connection, try again, or use the email link.";
          }
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
