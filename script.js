const farmConfig = {
  farmName: "Sunrise Mango Farm",
  sellerPhoneDisplay: "+1 (555) 123-4567",
  sellerWhatsAppNumber: "15551234567",
  rates: {
    "10 lb box": 28,
    "5 lb box": 16,
    "single dozen": 22,
  },
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const form = document.querySelector("#orderForm");
const quantityInput = document.querySelector("#quantity");
const unitInput = document.querySelector("#unit");
const totalOutput = document.querySelector("#estimatedTotal");
const displayRate = document.querySelector("#displayRate");
const summarySection = document.querySelector("#orderSummary");
const summaryText = document.querySelector("#summaryText");
const copyButton = document.querySelector("#copyOrder");

function getRate() {
  return farmConfig.rates[unitInput.value] || 0;
}

function getQuantity() {
  return Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
}

function getEstimatedTotal() {
  return getRate() * getQuantity();
}

function updateTotals() {
  totalOutput.textContent = currency.format(getEstimatedTotal());
  displayRate.textContent = `${currency.format(getRate())} / ${unitInput.value}`;
}

function buildOrderMessage() {
  const data = new FormData(form);
  const quantity = getQuantity();
  const unit = data.get("unit");
  const rate = getRate();
  const total = getEstimatedTotal();
  const quantityLabel =
    quantity === 1
      ? unit
      : unit === "single dozen"
        ? "dozens"
        : `${unit}es`;

  return [
    `New mango order for ${farmConfig.farmName}`,
    "",
    `Name: ${data.get("customerName")}`,
    `Phone: ${data.get("phone")}`,
    `Quantity: ${quantity} ${quantityLabel}`,
    `Rate: ${currency.format(rate)} per ${unit}`,
    `Estimated total: ${currency.format(total)}`,
    `Delivery option: ${data.get("delivery")}`,
    `Address: ${data.get("address")}`,
    `Notes: ${data.get("notes") || "None"}`,
    "",
    "Please confirm availability and delivery time.",
  ].join("\n");
}

function showSummary(message) {
  summaryText.textContent = message;
  summarySection.hidden = false;
  summarySection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${farmConfig.sellerWhatsAppNumber}?text=${encodedMessage}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const message = buildOrderMessage();
  showSummary(message);
  localStorage.setItem("latestMangoOrder", message);
  openWhatsApp(message);
});

copyButton.addEventListener("click", async () => {
  const message = buildOrderMessage();
  showSummary(message);

  try {
    await navigator.clipboard.writeText(message);
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = "Copy details";
    }, 1800);
  } catch {
    copyButton.textContent = "Select summary to copy";
  }
});

quantityInput.addEventListener("input", updateTotals);
unitInput.addEventListener("change", updateTotals);

updateTotals();
