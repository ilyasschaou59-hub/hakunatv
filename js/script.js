/* HAKUNA TV – Interaktionen (Vanilla JS, ohne Abhängigkeiten) */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     KONFIGURATION
     whatsappUrl: offizielle WhatsApp-Adresse von HAKUNA TV.
     Diese eine Einstellung gilt für alle WhatsApp-Schaltflächen der Website.
     Ist der Wert leer, verweisen die Schaltflächen auf die Support-Seite
     und dort wird ein Hinweis angezeigt.
     ------------------------------------------------------------------ */
  var CONFIG = {
    whatsappUrl: "https://wa.me/447577310143"
  };

  /* WhatsApp: Link-Erzeugung und Nachrichtenvorlagen */
  var WA_URL = (CONFIG.whatsappUrl || "").trim();
  var WA_TERMS = { "1": "1 Monat", "3": "3 Monaten", "6": "6 Monaten", "12": "12 Monaten" };
  var WA_MESSAGES = {
    general: "Hallo HAKUNA TV, ich habe eine Frage zu eurem Angebot.",
    renewal: "Hallo HAKUNA TV, ich möchte mein Abonnement verlängern. Da es sich nicht automatisch verlängert, würde ich die weitere Laufzeit gerne persönlich mit euch abstimmen.",
    reseller: "Hallo HAKUNA TV, ich interessiere mich für das Reseller-Programm und würde gerne mehr über die Zusammenarbeit und die verfügbaren Konditionen erfahren.",
    plan: function (devicePhrase, months, price) {
      return "Hallo HAKUNA TV, ich interessiere mich für das Paket für " + devicePhrase +
        " mit " + (WA_TERMS[months] || months + " Monaten") + " Laufzeit" +
        (price ? " (" + price + " €)" : "") + ".";
    }
  };

  function whatsAppHref(text) {
    var url = WA_URL;
    if (text && /(wa\.me|whatsapp\.com)/.test(url)) {
      url += (url.indexOf("?") === -1 ? "?" : "&") + "text=" + encodeURIComponent(text);
    }
    return url;
  }

  function setWhatsAppLink(link, text, label) {
    link.href = whatsAppHref(text);
    link.target = "_blank";
    link.rel = "noopener";
    link.classList.remove("is-disabled");
    link.removeAttribute("aria-disabled");
    if (label) link.setAttribute("aria-label", label + " – öffnet WhatsApp in einem neuen Fenster");
  }

  var doc = document.documentElement;
  doc.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header-Zustand beim Scrollen + Zurück-nach-oben-Button */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* Mobile Navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    nav.classList.toggle("is-open", open);
    if (header) header.classList.toggle("nav-open", open);
    document.body.classList.toggle("nav-locked", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (mq) {
      if (mq.matches) setNav(false);
    });
  }

  /* Aktiven Menüpunkt markieren */
  var path = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  document.querySelectorAll(".main-nav a[href]").forEach(function (link) {
    var href = new URL(link.href, window.location.href).pathname
      .replace(/index\.html$/, "").replace(/\/$/, "") || "/";
    // Unterseiten (z. B. Blogartikel) markieren ihren Bereich mit
    if (href === path || (href !== "/" && path.indexOf(href + "/") === 0)) {
      link.setAttribute("aria-current", "page");
    }
  });

  /* Einblend-Animationen beim Scrollen */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Lichteffekt auf Karten, folgt dem Mauszeiger */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* FAQ: immer nur ein Eintrag gleichzeitig geöffnet */
  document.querySelectorAll(".faq-list").forEach(function (list) {
    list.addEventListener("toggle", function (e) {
      if (!e.target.open) return;
      list.querySelectorAll(".faq-item[open]").forEach(function (item) {
        if (item !== e.target) item.open = false;
      });
    }, true);
  });

  /* Preisseite: Laufzeit wählen, Preis und Anfrage-Link aktualisieren */
  var priceCards = document.querySelectorAll(".price-card[data-devices]");
  if (priceCards.length) {
    var termLabels = { "1": "1 Monat", "3": "3 Monate", "6": "6 Monate", "12": "12 Monate" };

    var updateCard = function (card) {
      var checked = card.querySelector(".term-options input:checked");
      if (!checked) return;
      var months = checked.value;
      var price = checked.getAttribute("data-price");
      var devices = card.getAttribute("data-devices");
      var name = card.getAttribute("data-name") || "";
      var amount = card.querySelector("[data-price-amount]");
      var term = card.querySelector("[data-price-term]");
      var cta = card.querySelector("[data-price-cta]");
      if (amount) amount.textContent = price;
      if (term) term.textContent = "für " + termLabels[months];
      if (cta) {
        var label = name + " für " + termLabels[months] + " zu " + price + " € anfragen";
        if (WA_URL) {
          var phrase = name.charAt(0).toLowerCase() + name.slice(1);
          setWhatsAppLink(cta, WA_MESSAGES.plan(phrase, months, price), label);
        } else {
          // Rückfall ohne WhatsApp-Konfiguration: Support-Seite mit Auswahl
          cta.href = "contact.html?geraete=" + devices + "&laufzeit=" + months;
          cta.setAttribute("aria-label", label);
        }
      }
    };

    var syncSwitch = function () {
      // Globale Auswahl nur markieren, wenn alle Karten dieselbe Laufzeit zeigen
      var values = Array.prototype.map.call(priceCards, function (card) {
        var c = card.querySelector(".term-options input:checked");
        return c ? c.value : "";
      });
      var same = values.every(function (v) { return v === values[0]; });
      document.querySelectorAll("[data-term-switch] input").forEach(function (input) {
        input.checked = same && input.value === values[0];
      });
    };

    priceCards.forEach(function (card) {
      updateCard(card);
      card.addEventListener("change", function () {
        updateCard(card);
        syncSwitch();
      });
    });

    var termSwitch = document.querySelector("[data-term-switch]");
    if (termSwitch) {
      termSwitch.addEventListener("change", function (e) {
        var months = e.target.value;
        priceCards.forEach(function (card) {
          var input = card.querySelector('.term-options input[value="' + months + '"]');
          if (input) {
            input.checked = true;
            updateCard(card);
          }
        });
      });
    }

    // Vorauswahl über URL-Parameter (z. B. pricing.html?geraete=2&laufzeit=6)
    if (window.URLSearchParams) {
      var preset = new URLSearchParams(window.location.search);
      var presetDevices = preset.get("geraete");
      var presetTerm = preset.get("laufzeit");
      if (/^[1-4]$/.test(presetDevices || "")) {
        var presetCard = document.querySelector('.price-card[data-devices="' + presetDevices + '"]');
        if (presetCard) {
          if (/^(1|3|6|12)$/.test(presetTerm || "")) {
            var presetInput = presetCard.querySelector('.term-options input[value="' + presetTerm + '"]');
            if (presetInput) {
              presetInput.checked = true;
              updateCard(presetCard);
              syncSwitch();
            }
          }
          presetCard.classList.add("is-preselected");
        }
      }
    }
  }

  /* Support-Seite: Auswahl aus der Preisseite bzw. Reseller-Anfrage übernehmen */
  var selectionEl = document.querySelector("[data-selection]");
  if (selectionEl && window.URLSearchParams) {
    var params = new URLSearchParams(window.location.search);
    var deviceNames = { "1": "ein Gerät", "2": "zwei Geräte", "3": "drei Geräte", "4": "vier Geräte" };
    var termNames = { "1": "1 Monat", "3": "3 Monate", "6": "6 Monate", "12": "12 Monate" };
    var dev = params.get("geraete");
    var term = params.get("laufzeit");
    var waButton = document.querySelector("#whatsapp [data-whatsapp]");
    var message = "";

    if (deviceNames[dev] && termNames[term]) {
      selectionEl.textContent = "Deine Auswahl: Paket für " + deviceNames[dev] + " · " + termNames[term];
      message = WA_MESSAGES.plan(deviceNames[dev], term);
    } else if (params.get("anliegen") === "partner") {
      selectionEl.textContent = "Dein Anliegen: Reseller-Anfrage";
      message = WA_MESSAGES.reseller;
    }
    if (message) {
      selectionEl.hidden = false;
      if (waButton) waButton.setAttribute("data-whatsapp-text", message);
    }
  }

  /* WhatsApp-Schaltflächen (Verlängerung, Support, Partner) */
  var waLinks = document.querySelectorAll("[data-whatsapp]");
  if (waLinks.length) {
    if (WA_URL) {
      waLinks.forEach(function (link) {
        var type = link.getAttribute("data-whatsapp");
        var text = link.getAttribute("data-whatsapp-text") || WA_MESSAGES[type] || WA_MESSAGES.general;
        setWhatsAppLink(link, text, link.textContent.replace(/\s+/g, " ").trim());
      });
    } else {
      // Keine Konfiguration: auf der Support-Seite deaktiviert anzeigen,
      // auf anderen Seiten bleibt der Verweis zur Support-Seite bestehen.
      document.querySelectorAll("[data-whatsapp-pending]").forEach(function (el) { el.hidden = false; });
      waLinks.forEach(function (link) {
        if ((link.getAttribute("href") || "").charAt(0) === "#") {
          link.classList.add("is-disabled");
          link.setAttribute("aria-disabled", "true");
          link.addEventListener("click", function (e) { e.preventDefault(); });
        }
      });
    }
  }

  /* Aktuelles Jahr im Footer */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
