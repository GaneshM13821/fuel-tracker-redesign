import { initFirebase } from "./storage.js";
import {
  updateSyncStatus,
  renderFuelSection,
  renderCostSection,
  renderSummarySection,
  showToast,
} from "./ui.js";

/* ---------- In-memory state ---------- */
let fuelRecords = [];
let costRecords = [];

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Render all sections first so they exist for event handlers
  renderFuelSection();
  renderCostSection();
  renderSummarySection();

  // Show only Fuel section by default
  showTab("fuelSection");

  // Initialize Firebase/network status
  const connected = initFirebase();
  updateSyncStatus(connected ? "online" : "offline");

  // Prefill dates in forms
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
  document.getElementById("costDate").value = today;

  // Load records from localStorage
  fuelRecords = JSON.parse(localStorage.getItem("fuelRecords") || "[]");
  costRecords = JSON.parse(localStorage.getItem("costRecords") || "[]");

  // Wire form handlers
  wireFuelForm();
  wireCostForm();

  // Tab switching logic
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      showTab(target);
    });
  });

  // Initial render
  refreshAll();
});

function showTab(tabId) {
  // Hide all tab-content sections
  document.querySelectorAll(".tab-content").forEach(sec => {
    sec.style.display = "none";
  });
  // Remove active class from all tab-btns
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  // Show the selected section and mark tab active
  document.getElementById(tabId).style.display = "block";
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add("active");
}

/* ---------- Fuel ---------- */
function wireFuelForm() {
  document.getElementById("fuelForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("date").value;
    const start = parseFloat(document.getElementById("meterStart").value);
    const end = parseFloat(document.getElementById("meterEnd").value);
    const fuel = parseFloat(document.getElementById("fuel").value);
    const cost = parseFloat(document.getElementById("cost").value);

    if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(fuel) || Number.isNaN(cost)) {
      alert("Please enter valid numbers.");
      return;
    }
    if (end < start) {
      alert("End meter must be greater than start meter.");
      return;
    }
    const distance = end - start;
    fuelRecords.push({ date, start, end, distance, fuel, cost });
    persist("fuelRecords", fuelRecords);
    showToast("✅ Fuel entry saved");
    e.target.reset();
    document.getElementById("date").value = new Date().toISOString().split("T")[0];
    refreshAll();
  });
}

/* ---------- Costs ---------- */
function wireCostForm() {
  document.getElementById("costForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("costDate").value;
    const item = document.getElementById("costItem").value;
    const amount = parseFloat(document.getElementById("costAmount").value);
    if (Number.isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }
    costRecords.push({ date, item, amount });
    persist("costRecords", costRecords);
    showToast("✅ Cost entry saved");
    e.target.reset();
    document.getElementById("costDate").value = new Date().toISOString().split("T")[0];
    refreshAll();
  });
}

/* ---------- Utilities ---------- */
function persist(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function refreshAll() {
  // You can add table rendering, dashboard update, etc here as needed.
}
