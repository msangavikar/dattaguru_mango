const farmConfig = {
  farmName: "Dattaguru Mango Farm",
  sellerPhoneDisplay: "+91 98920 90429",
  sellerWhatsAppNumber: "919226450614",
  currentItemName: "Mangoes",
  quantityOptions: Array.from({ length: 20 }, (_, index) => `${index + 1} kg`),
};

const form = document.querySelector("#orderForm");
const quantityInput = document.querySelector("#orderQuantity");
const summarySection = document.querySelector("#orderSummary");
const summaryText = document.querySelector("#summaryText");
const copyButton = document.querySelector("#copyOrder");
const sendButton = document.querySelector("#sendOrder");

function populateQuantityOptions() {
  quantityInput.replaceChildren(
    new Option("Select quantity", ""),
    ...farmConfig.quantityOptions.map((quantity) => new Option(quantity, quantity)),
  );
}

function updateFormState() {
  const isComplete = form.checkValidity();
  sendButton.disabled = !isComplete;
  copyButton.disabled = !isComplete;
}

function buildOrderMessage() {
  const data = new FormData(form);
  const quantity = data.get("orderQuantity");

  return [
    `New farm order for ${farmConfig.farmName}`,
    "",
    `Name: ${data.get("customerName")}`,
    `Phone: ${data.get("phone")}`,
    `Item: ${farmConfig.currentItemName}`,
    `Quantity: ${quantity}`,
    `Address: ${data.get("address")}`,
    `Notes: ${data.get("notes") || "None"}`,
    "",
    "Please confirm availability, current price, final amount, and pick up address.",
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

form.addEventListener("input", updateFormState);
form.addEventListener("change", updateFormState);

populateQuantityOptions();
updateFormState();
