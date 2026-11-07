(function () {
  "use strict";

  const STORAGE_KEY = "trinkgeldrechner-einstellungen-v1";
  const defaults = {
    basisTrinkgeldsatz: 10,
    maximalTrinkgeldsatz: 15,
    durchschnittspreisGetraenke: 3.5,
    durchschnittspreisHauptspeisen: 16,
    durchschnittspreisNachspeisenVorspeisen: 6.5
  };
  const state = {
    bewertung: 0.5,
    anzahlGetraenke: 0,
    anzahlHauptspeisen: 0,
    anzahlNachspeisenVorspeisen: 0,
    zahlungsart: "bar",
    gesamtpreis: 0,
    ...defaults
  };

  const elements = {
    baseRate: document.getElementById("base-rate"),
    maxRate: document.getElementById("max-rate"),
    totalPrice: document.getElementById("total-price"),
    drinksPrice: document.getElementById("price-drinks"),
    mainsPrice: document.getElementById("price-mains"),
    startersDessertsPrice: document.getElementById("price-starters-desserts"),
    drinksCount: document.getElementById("count-drinks"),
    mainsCount: document.getElementById("count-mains"),
    startersDessertsCount: document.getElementById("count-starters-desserts"),
    totalWithTip: document.getElementById("total-with-tip"),
    tipPercent: document.getElementById("tip-percent"),
    tipAmount: document.getElementById("tip-amount"),
    roundingAmount: document.getElementById("rounding-amount"),
    inputMessage: document.getElementById("input-message")
  };

  const persistentFields = [
    ["basisTrinkgeldsatz", elements.baseRate],
    ["maximalTrinkgeldsatz", elements.maxRate],
    ["durchschnittspreisGetraenke", elements.drinksPrice],
    ["durchschnittspreisHauptspeisen", elements.mainsPrice],
    ["durchschnittspreisNachspeisenVorspeisen", elements.startersDessertsPrice]
  ];

  function parseNumber(value) {
    const text = String(value).trim().replace(/\s/g, "");
    if (!text) return null;

    let normalized = text;
    if (text.includes(",") && text.includes(".")) {
      const decimalSeparator = text.lastIndexOf(",") > text.lastIndexOf(".") ? "," : ".";
      const thousandsSeparator = decimalSeparator === "," ? "." : ",";
      normalized = text.split(thousandsSeparator).join("").replace(decimalSeparator, ".");
    } else {
      normalized = text.replace(",", ".");
    }

    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  function nonNegativeValue(value) {
    const parsed = parseNumber(value);
    return parsed === null ? 0 : Math.max(0, parsed);
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      for (const [key] of persistentFields) {
        const value = saved[key];
        if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
          state[key] = value;
        }
      }
    } catch (error) {
      showMessage("Einstellungen konnten nicht geladen werden.");
    }
  }

  function saveSettings() {
    const settings = {};
    for (const [key] of persistentFields) settings[key] = state[key];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      showMessage("Einstellungen konnten nicht gespeichert werden.");
    }
  }

  function showMessage(message) {
    elements.inputMessage.textContent = message;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR"
    }).format(Number.isFinite(value) ? value : 0);
  }

  function updateResults() {
    state.basisTrinkgeldsatz = nonNegativeValue(elements.baseRate.value);
    state.maximalTrinkgeldsatz = nonNegativeValue(elements.maxRate.value);
    state.durchschnittspreisGetraenke = nonNegativeValue(elements.drinksPrice.value);
    state.durchschnittspreisHauptspeisen = nonNegativeValue(elements.mainsPrice.value);
    state.durchschnittspreisNachspeisenVorspeisen = nonNegativeValue(elements.startersDessertsPrice.value);
    state.gesamtpreis = nonNegativeValue(elements.totalPrice.value);

    const absolutesTrinkgeld = nonNegativeValue(trinkgeldBerechnen({
      bewertung: state.bewertung,
      basisTrinkgeldsatz: state.basisTrinkgeldsatz,
      maximalTrinkgeldsatz: state.maximalTrinkgeldsatz,
      durchschnittspreisGetraenke: state.durchschnittspreisGetraenke,
      anzahlGetraenke: state.anzahlGetraenke,
      durchschnittspreisHauptspeisen: state.durchschnittspreisHauptspeisen,
      anzahlHauptspeisen: state.anzahlHauptspeisen,
      durchschnittspreisNachspeisenVorspeisen: state.durchschnittspreisNachspeisenVorspeisen,
      anzahlNachspeisenVorspeisen: state.anzahlNachspeisenVorspeisen,
      gesamtpreis: state.gesamtpreis
    }));
    const trinkgeldProzent = state.gesamtpreis > 0
      ? (absolutesTrinkgeld / state.gesamtpreis) * 100
      : 0;
    const gesamtpreisVorAufrundung = state.gesamtpreis + absolutesTrinkgeld;
    const gesamtpreisMitTrinkgeld = betragAufrunden(gesamtpreisVorAufrundung, state.zahlungsart);
    const rundungsbetrag = gesamtpreisMitTrinkgeld - gesamtpreisVorAufrundung;

    elements.totalWithTip.textContent = formatCurrency(gesamtpreisMitTrinkgeld);
    elements.roundingAmount.textContent = formatCurrency(rundungsbetrag);
    elements.tipPercent.textContent = `${new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 2
    }).format(Number.isFinite(trinkgeldProzent) ? trinkgeldProzent : 0)} %`;
    elements.tipAmount.textContent = formatCurrency(absolutesTrinkgeld);
  }

  function updateMessageFor(input) {
    const value = input.value.trim();
    const parsed = parseNumber(value);
    if (value && parsed === null) {
      showMessage("Bitte eine gültige Zahl eingeben.");
    } else if (parsed !== null && parsed < 0) {
      showMessage("Negative Werte sind nicht möglich.");
    } else {
      showMessage("");
    }
  }

  function bindNumberInput(input, stateKey, persist) {
    input.addEventListener("input", function () {
      updateMessageFor(input);
      if (persist) {
        const parsed = parseNumber(input.value);
        if (parsed !== null && parsed >= 0) {
          state[stateKey] = parsed;
          saveSettings();
        }
      }
      updateResults();
    });
  }

  loadSettings();
  for (const [key, input] of persistentFields) {
    input.value = new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 2,
      useGrouping: false
    }).format(state[key]);
    bindNumberInput(input, key, true);
  }
  bindNumberInput(elements.totalPrice, "gesamtpreis", false);

  document.querySelectorAll(".rating-option").forEach(function (button) {
    button.addEventListener("click", function () {
      state.bewertung = Number(button.dataset.rating);
      document.querySelectorAll(".rating-option").forEach(function (option) {
        const selected = option === button;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      updateResults();
    });
  });

  document.querySelectorAll(".payment-option").forEach(function (button) {
    button.addEventListener("click", function () {
      state.zahlungsart = button.dataset.payment;
      document.querySelectorAll(".payment-option").forEach(function (option) {
        const selected = option === button;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      updateResults();
    });
  });

  const quantityBindings = [
    ["drinks", "anzahlGetraenke", elements.drinksCount],
    ["mains", "anzahlHauptspeisen", elements.mainsCount],
    ["startersDesserts", "anzahlNachspeisenVorspeisen", elements.startersDessertsCount]
  ];
  document.querySelectorAll(".quantity-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const binding = quantityBindings.find(function (item) {
        return item[0] === button.dataset.quantity;
      });
      if (!binding) return;
      state[binding[1]] = Math.max(0, state[binding[1]] + Number(button.dataset.delta));
      binding[2].textContent = String(state[binding[1]]);
      updateResults();
    });
  });

  updateResults();

  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./service-worker.js").catch(function () {
        showMessage("Offline-Installation konnte nicht eingerichtet werden.");
      });
    });
  }
}());
