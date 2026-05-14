const farmConfig = {
  farmName: "Dattaguru Mango Farm",
  sellerPhoneDisplay: "+91 98920 90429",
  sellerWhatsAppNumber: "919226450614",
  rates: {
    "1 kg": 230,
    "5 kg": 1000,
    "10 kg bulk": 2000,
  },
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
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
const sendButton = document.querySelector("#sendOrder");

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

function updateFormState() {
  const isComplete = form.checkValidity();
  sendButton.disabled = !isComplete;
  copyButton.disabled = !isComplete;
}

function buildOrderMessage() {
  const data = new FormData(form);
  const quantity = getQuantity();
  const unit = data.get("unit");
  const rate = getRate();
  const total = getEstimatedTotal();

  return [
    `New mango order for ${farmConfig.farmName}`,
    "",
    `Name: ${data.get("customerName")}`,
    `Phone: ${data.get("phone")}`,
    `Quantity: ${quantity} x ${unit}`,
    `Rate: ${currency.format(rate)} per ${unit}`,
    `Estimated total: ${currency.format(total)}`,
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
form.addEventListener("input", updateFormState);
form.addEventListener("change", updateFormState);

updateTotals();
updateFormState();
