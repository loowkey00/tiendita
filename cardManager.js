// =========================
// HELPERS UI TARJETA
// =========================
const maskCardNumber = (number) => {
  return "**** **** **** " + number.slice(-4);
};

const maskCVV = () => {
  return "***";
};

const changeStatus = (message, customClass) => {
  return `<span class="${customClass}">${message}</span>`;
};

// =========================
// CRUD DE TARJETAS
// =========================
const getCard = () => {
  const card = JSON.parse(
    localStorage.getItem("d6guitars_card_saved") || "null",
  );

  if (!card) return null;
  if (!card.number || !card.name || !card.cvv || !card.expiry) return null;

  return card;
};

const saveCard = (card) => {
  localStorage.setItem("d6guitars_card_saved", JSON.stringify(card));
};

const updateCard = (updatedData) => {
  const currentCard = getCard();
  if (!currentCard) return;

  localStorage.setItem(
    "d6guitars_card_saved",
    JSON.stringify({ ...currentCard, ...updatedData }),
  );
};

const deleteCard = () => {
  localStorage.removeItem("d6guitars_card_saved");
};

let cardStatus = getCard() ? "saved" : "default"; // default | saved | updating

// =========================
// INYECTAR MODAL DE PAGO
// =========================
if (!document.getElementById("paymentModal")) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal fade" id="paymentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-credit-card me-2 text-danger"></i>Pago simulado
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body px-4 pb-4" id="paymentModalBody"></div>
        </div>
      </div>
    </div>
  `,
  );
}

// =========================
// RENDER UI MODAL
// =========================
const renderCardFields = ({
  disabled = false,
  card = null,
  masked = false,
} = {}) => {
  const numberValue = card
    ? masked
      ? maskCardNumber(card.number)
      : card.number
    : "";

  const nameValue = card?.name || "";
  const expiryValue = card?.expiry || "";
  const cvvValue = card ? (masked ? maskCVV(card.cvv) : card.cvv) : "";
  const activeChecked = card?.active ? "checked" : "";
  const disabledAttr = disabled ? "disabled" : "";

  return `
    <div class="mb-3">
      <label class="form-label fw-semibold text-muted small">NÚMERO DE TARJETA</label>
      <input
        id="pay-number"
        type="text"
        class="form-control form-control-lg"
        placeholder="0000 0000 0000 0000"
        maxlength="19"
        inputmode="numeric"
        value="${numberValue}"
        ${disabledAttr}
      >
    </div>

    <div class="mb-3">
      <label class="form-label fw-semibold text-muted small">TITULAR</label>
      <input
        id="pay-name"
        type="text"
        class="form-control form-control-lg"
        placeholder="Nombre como aparece en la tarjeta"
        value="${nameValue}"
        ${disabledAttr}
      >
    </div>

    <div class="row g-3 mb-4">
      <div class="col-6">
        <label class="form-label fw-semibold text-muted small">FECHA DE EXPIRACIÓN</label>
        <input
          id="pay-expiry"
          type="text"
          class="form-control form-control-lg"
          placeholder="MM/AA"
          maxlength="5"
          inputmode="numeric"
          value="${expiryValue}"
          ${disabledAttr}
        >
      </div>
      <div class="col-6">
        <label class="form-label fw-semibold text-muted small">CVV</label>
        <input
          id="pay-cvv"
          type="text"
          class="form-control form-control-lg"
          placeholder="123"
          maxlength="3"
          inputmode="numeric"
          value="${cvvValue}"
          ${disabledAttr}
        >
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label fw-semibold text-muted small d-block">ACTIVA</label>
      <div class="form-check">
        <input
          id="pay-active"
          type="checkbox"
          class="form-check-input"
          ${activeChecked}
          ${disabledAttr}
        >
        <label for="pay-active" class="form-check-label fw-semibold text-muted small">
          Marcar como tarjeta activa
        </label>
      </div>
    </div>
  `;
};

const renderPaymentActions = () => {
  const card = getCard();

  if (cardStatus === "saved" && card) {
    return `
      <div class="d-grid gap-2">
        <button
          id="edit-card-btn"
          type="button"
          class="btn btn-outline-secondary btn-lg w-100 fw-bold text-uppercase shadow-sm"
        >
          <i class="bi bi-pencil-fill me-2"></i>Actualizar tarjeta
        </button>

        <button
          id="delete-card-btn"
          type="button"
          class="btn btn-outline-danger btn-lg w-100 fw-bold text-uppercase shadow-sm"
        >
          <i class="bi bi-trash-fill me-2"></i>Eliminar tarjeta guardada
        </button>

        <button
          id="pay-confirm-btn"
          type="button"
          class="btn btn-danger btn-lg w-100 fw-bold text-uppercase shadow-sm"
          ${card.active ? "" : "disabled"}
        >
          <i class="bi bi-lock-fill me-2"></i>Confirmar pago
        </button>
      </div>
    `;
  }

  if (cardStatus === "updating" && card) {
    return `
      <div class="d-grid gap-2">
        <button
          id="save-card-changes-btn"
          type="button"
          class="btn btn-danger btn-lg w-100 fw-bold text-uppercase shadow-sm"
        >
          <i class="bi bi-check2-circle me-2"></i>Guardar cambios
        </button>

        <button
          id="cancel-update-card-btn"
          type="button"
          class="btn btn-outline-secondary btn-lg w-100 fw-bold text-uppercase shadow-sm"
        >
          Cancelar
        </button>
      </div>
    `;
  }

  return `
    <button
      id="add-card-btn"
      type="button"
      class="btn btn-danger btn-lg w-100 fw-bold text-uppercase shadow-sm"
    >
      <i class="bi bi-lock-fill me-2"></i>Agregar tarjeta
    </button>
  `;
};

const renderPaymentModal = (statusMessage = "", statusClass = "") => {
  const modalBody = document.getElementById("paymentModalBody");
  const card = getCard();

  if (!modalBody) return;

  if (!card && cardStatus !== "default") {
    cardStatus = "default";
  }

  let fieldsHtml = "";

  if (cardStatus === "saved" && card) {
    fieldsHtml = renderCardFields({
      disabled: true,
      card,
      masked: true,
    });
  } else if (cardStatus === "updating" && card) {
    fieldsHtml = renderCardFields({
      disabled: false,
      card,
      masked: false,
    });
  } else {
    fieldsHtml = renderCardFields({
      disabled: false,
      card: null,
      masked: false,
    });
  }

  modalBody.innerHTML = `
    ${fieldsHtml}

    <div id="pay-status" class="mb-3">
      ${statusMessage ? changeStatus(statusMessage, statusClass) : ""}
    </div>

    ${renderPaymentActions()}
  `;

  bindPaymentInputFormatters();
};

const setPaymentStatus = (message, customClass) => {
  const status = document.getElementById("pay-status");
  if (status) {
    status.innerHTML = changeStatus(message, customClass);
  }
};

// =========================
// FORMATO INPUTS
// =========================
const bindPaymentInputFormatters = () => {
  const numberInput = document.getElementById("pay-number");
  const expiryInput = document.getElementById("pay-expiry");
  const cvvInput = document.getElementById("pay-cvv");

  if (numberInput && !numberInput.dataset.bound && !numberInput.disabled) {
    numberInput.addEventListener("input", function () {
      let val = this.value.replace(/\D/g, "").substring(0, 16);
      this.value = val.match(/.{1,4}/g)?.join(" ") || val;
    });
    numberInput.dataset.bound = "true";
  }

  if (expiryInput && !expiryInput.dataset.bound && !expiryInput.disabled) {
    expiryInput.addEventListener("input", function () {
      let val = this.value.replace(/\D/g, "").substring(0, 4);
      this.value = val.length >= 3 ? val.slice(0, 2) + "/" + val.slice(2) : val;
    });
    expiryInput.dataset.bound = "true";
  }

  if (cvvInput && !cvvInput.dataset.bound && !cvvInput.disabled) {
    cvvInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").substring(0, 3);
    });
    cvvInput.dataset.bound = "true";
  }
};

// =========================
// CAPTURA INPUTS
// =========================
const getInputs = () => {
  const number = document
    .getElementById("pay-number")
    .value.replace(/\s/g, "")
    .trim();
  const name = document.getElementById("pay-name").value.trim();
  const expiry = document.getElementById("pay-expiry").value.trim();
  const cvv = document.getElementById("pay-cvv").value.trim();
  const active = document.getElementById("pay-active").checked;

  return { number, name, expiry, cvv, active };
};

// =========================
// VALIDACIÓN / CREACIÓN
// =========================
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
};

const createCard = (number, name, expiry, cvv, active) => {
  const response = {
    status: "error",
    message: "",
    card: null,
  };

  if (!number || !/^\d{16}$/.test(number)) {
    response.message = "❌ Número de tarjeta inválido (16 dígitos)";
    return response;
  }

  if (!name) {
    response.message = "❌ Ingresa el nombre del titular";
    return response;
  }

  if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
    response.message = "❌ Fecha inválida (formato MM/AA)";
    return response;
  }

  if (!cvv || !/^\d{3}$/.test(cvv)) {
    response.message = "❌ CVV inválido (3 dígitos)";
    return response;
  }

  if (typeof active !== "boolean") {
    response.message = "❌ Active debe ser booleano";
    return response;
  }

  const existingCard = getCard();

  const cardJson = {
    id: existingCard?.id || generateId(),
    number,
    name,
    expiry,
    cvv,
    active,
  };

  if (active) {
    response.status = "approved";
    response.message = "✅ Tarjeta aprobada";
  } else {
    response.status = "rejected";
    response.message = "❌ Tarjeta rechazada";
  }

  response.card = cardJson;
  return response;
};

// =========================
// EVENTOS MODAL DE PAGO
// =========================
const paymentModal = document.getElementById("paymentModal");

if (paymentModal) {
  paymentModal.addEventListener("click", function (e) {
    const addBtn = e.target.closest("#add-card-btn");
    const editBtn = e.target.closest("#edit-card-btn");
    const saveChangesBtn = e.target.closest("#save-card-changes-btn");
    const cancelUpdateBtn = e.target.closest("#cancel-update-card-btn");
    const deleteBtn = e.target.closest("#delete-card-btn");
    const confirmBtn = e.target.closest("#pay-confirm-btn");

    if (editBtn) {
      cardStatus = "updating";
      renderPaymentModal();
      return;
    }

    if (cancelUpdateBtn) {
      cardStatus = getCard() ? "saved" : "default";
      renderPaymentModal();
      return;
    }

    if (deleteBtn) {
      deleteCard();
      cardStatus = "default";
      renderPaymentModal("✅ Tarjeta eliminada", "text-success");
      return;
    }

    if (addBtn) {
      addBtn.disabled = true;
      setPaymentStatus("⏳ Validando tarjeta...", "text-secondary");

      const { number, name, expiry, cvv, active } = getInputs();
      const response = createCard(number, name, expiry, cvv, active);

      if (response.status === "approved" || response.status === "rejected") {
        saveCard(response.card);
        cardStatus = "saved";
        renderPaymentModal(
          response.message,
          response.status === "approved" ? "text-success" : "text-danger",
        );
      } else {
        setPaymentStatus(response.message, "text-danger");
        addBtn.disabled = false;
      }

      return;
    }

    if (saveChangesBtn) {
      saveChangesBtn.disabled = true;
      setPaymentStatus("⏳ Guardando cambios...", "text-secondary");

      const { number, name, expiry, cvv, active } = getInputs();
      const response = createCard(number, name, expiry, cvv, active);

      if (response.status === "approved" || response.status === "rejected") {
        updateCard(response.card);
        cardStatus = "saved";
        renderPaymentModal(
          response.message,
          response.status === "approved" ? "text-success" : "text-danger",
        );
      } else {
        setPaymentStatus(response.message, "text-danger");
        saveChangesBtn.disabled = false;
      }

      return;
    }

    if (confirmBtn) {
      confirmBtn.disabled = true;
      setPaymentStatus("⏳ Procesando pago...", "text-secondary");

      const savedCard = getCard();

      setTimeout(() => {
        setPaymentStatus("✅ ¡Pago aprobado!", "text-success");

        if (typeof window.generateReceipt === "function") {
          window.generateReceipt(savedCard?.name || "Cliente");
        }

        setTimeout(() => {
          bootstrap.Modal.getInstance(
            document.getElementById("paymentModal"),
          )?.hide();

          if (typeof window.clearCart === "function") {
            window.clearCart();
          }

          if (typeof window.showCartToast === "function") {
            window.showCartToast("¡Compra realizada con éxito!");
          }

          confirmBtn.disabled = false;
        }, 1500);
      }, 2000);

      return;
    }
  });
}

// =========================
// BOTÓN FINALIZAR COMPRA
// =========================
document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-checkout")) {
    if (typeof window.hasCartItems === "function" && !window.hasCartItems()) {
      return;
    }

    const offcanvas = bootstrap.Offcanvas.getInstance(
      document.getElementById("cartOffcanvas"),
    );

    if (offcanvas) offcanvas.hide();

    setTimeout(() => {
      new bootstrap.Modal(document.getElementById("paymentModal")).show();
    }, 300);
  }
});

// =========================
// INIT
// =========================
renderPaymentModal();
