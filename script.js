/* ==========================================================================
   North Star Bakery — Interactivity and Client-Side Data
   Feature: a Pre-Order List that customers build on the Products page.
   The list (and its total) is saved with localStorage and carries over
   to the Contact page, where it pre-fills the Item Details field.
   The Contact page form also gets JavaScript validation.
   ========================================================================== */

/* ---------------------------- Data ---------------------------------- */

const menuItems = [
  { id: "loaf", name: "Signature Loaf", price: 7 },
  { id: "wheat", name: "Whole Wheat Loaf", price: 6 },
  { id: "cinnamon-roll", name: "Cinnamon Roll", price: 5 },
  { id: "cake-slice", name: "Ready-Made Cake Slice", price: 6 },
];

let preOrderList = [];

const STORAGE_KEY = "northStarPreOrderList";

/* ------------------------- Storage helpers --------------------------- */

function savePreOrderList() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preOrderList));
}

function loadPreOrderList() {
  const saved = localStorage.getItem(STORAGE_KEY);
  preOrderList = saved ? JSON.parse(saved) : [];
}

function clearSavedList() {
  preOrderList = [];
  savePreOrderList();
  renderPreOrderList();
  renderSavedPicksBanner();
}

/* ------------------- Products page: building the list ---------------- */

function findMenuItem(itemId) {
  return menuItems.find(function (item) {
    return item.id === itemId;
  });
}

function addToPreOrder(itemId) {
  const menuItem = findMenuItem(itemId);
  if (!menuItem) return;

  const existing = preOrderList.find(function (entry) {
    return entry.id === itemId;
  });

  if (existing) {
    existing.quantity += 1;
  } else {
    preOrderList.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
    });
  }

  savePreOrderList();
  renderPreOrderList();
}

function removeFromPreOrder(itemId) {
  preOrderList = preOrderList.filter(function (entry) {
    return entry.id !== itemId;
  });
  savePreOrderList();
  renderPreOrderList();
}

function calculateTotal() {
  return preOrderList.reduce(function (sum, entry) {
    return sum + entry.price * entry.quantity;
  }, 0);
}

function renderPreOrderList() {
  const listEl = document.getElementById("preorder-list");
  const totalEl = document.getElementById("preorder-total");
  const emptyMsg = document.getElementById("preorder-empty");
  if (!listEl) return; // not on this page

  listEl.innerHTML = "";

  if (preOrderList.length === 0) {
    if (emptyMsg) emptyMsg.hidden = false;
  } else {
    if (emptyMsg) emptyMsg.hidden = true;

    preOrderList.forEach(function (entry) {
      const li = document.createElement("li");
      li.className = "preorder-item";

      const label = document.createElement("span");
      label.textContent =
        entry.quantity +
        "x " +
        entry.name +
        " ($" +
        (entry.price * entry.quantity).toFixed(2) +
        ")";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-item";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute(
        "aria-label",
        "Remove " + entry.name + " from pre-order list"
      );
      removeBtn.addEventListener("click", function () {
        removeFromPreOrder(entry.id);
      });

      li.appendChild(label);
      li.appendChild(removeBtn);
      listEl.appendChild(li);
    });
  }

  if (totalEl) {
    totalEl.textContent = "Estimated Total: $" + calculateTotal().toFixed(2);
  }
}

function initMenuButtons() {
  const buttons = document.querySelectorAll("[data-add-item]");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      addToPreOrder(button.getAttribute("data-add-item"));
    });
  });
}

/* --------------- Contact page: saved picks banner + prefill ----------- */

function renderSavedPicksBanner() {
  const banner = document.getElementById("saved-picks-banner");
  const summary = document.getElementById("saved-picks-summary");
  if (!banner) return; // not on this page

  if (preOrderList.length === 0) {
    banner.hidden = true;
    return;
  }

  banner.hidden = false;
  const parts = preOrderList.map(function (entry) {
    return entry.quantity + "x " + entry.name;
  });
  summary.textContent =
    parts.join(", ") + " — Estimated Total: $" + calculateTotal().toFixed(2);
}

function prefillItemDetails() {
  const textarea = document.getElementById("item-details");
  if (!textarea) return; // not on this page
  if (preOrderList.length === 0) return;
  if (textarea.value.trim() !== "") return; // do not overwrite what the user already typed

  const parts = preOrderList.map(function (entry) {
    return entry.quantity + "x " + entry.name;
  });
  textarea.value = parts.join(", ");
}

function initClearListButton() {
  const btn = document.getElementById("clear-saved-list");
  if (!btn) return;
  btn.addEventListener("click", clearSavedList);
}

/* ------------------- Contact page: form validation --------------------- */

function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function parseDateInput(dateString) {
  const parts = dateString.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isMonday(dateString) {
  if (!dateString) return false;
  return parseDateInput(dateString).getDay() === 1;
}

function isPastDate(dateString) {
  if (!dateString) return false;
  const selected = parseDateInput(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
}

function showFieldError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + "-error");
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.classList.add("input-error");
}

function clearFieldError(fieldId) {
  const errorEl = document.getElementById(fieldId + "-error");
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = "";
  if (inputEl) inputEl.classList.remove("input-error");
}

function clearAllErrors() {
  ["name", "email", "pickup-date", "item-details"].forEach(clearFieldError);
}

function validateForm(event) {
  event.preventDefault();
  clearAllErrors();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const pickupDate = document.getElementById("pickup-date").value;
  const itemDetails = document.getElementById("item-details").value.trim();

  let isValid = true;

  if (name.length < 2) {
    showFieldError(
      "name",
      "Please enter your full name (at least 2 characters)."
    );
    isValid = false;
  }

  if (!isValidEmail(email)) {
    showFieldError(
      "email",
      "Please enter a valid email address, like name@example.com."
    );
    isValid = false;
  }

  if (!pickupDate) {
    showFieldError("pickup-date", "Please choose a pickup date.");
    isValid = false;
  } else if (isPastDate(pickupDate)) {
    showFieldError("pickup-date", "Pickup date cannot be in the past.");
    isValid = false;
  } else if (isMonday(pickupDate)) {
    showFieldError(
      "pickup-date",
      "We are closed Mondays. Please choose Tuesday through Sunday."
    );
    isValid = false;
  }

  if (itemDetails.length === 0) {
    showFieldError(
      "item-details",
      "Please tell us what you would like to order."
    );
    isValid = false;
  }

  if (!isValid) return;

  const confirmationEl = document.getElementById("form-confirmation");
  if (confirmationEl) {
    confirmationEl.hidden = false;
    confirmationEl.textContent =
      "Thanks, " +
      name +
      "! Your request has been noted. We will confirm your " +
      pickupDate +
      " pickup by email.";
  }

  clearSavedList();
  event.target.reset();
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return; // not on this page
  form.addEventListener("submit", validateForm);
}

/* ------------------------------- Init ---------------------------------- */

document.addEventListener("DOMContentLoaded", function () {
  loadPreOrderList();
  renderPreOrderList(); // Products page
  renderSavedPicksBanner(); // Contact page
  prefillItemDetails(); // Contact page
  initMenuButtons(); // Products page
  initClearListButton(); // Contact page
  initContactForm(); // Contact page
});
