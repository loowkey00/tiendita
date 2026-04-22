// loquequieras.js

// =========================
// CARRITO (LocalStorage)
// =========================

let cart = JSON.parse(localStorage.getItem("d6guitars_cart")) || [];

const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalDisplay = document.getElementById("cartTotal");

const modalProductImg = document.getElementById("modalProductImg");
const modalProductTitle = document.getElementById("modalProductTitle");
const modalProductDesc = document.getElementById("modalProductDesc");
const modalProductPrice = document.getElementById("modalProductPrice");
const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
const modalQuantity = document.getElementById("modalQuantity");
const cardSaved =
  JSON.parse(localStorage.getItem("d6guitars_card_saved")) || null;

const cardStatus = cardSaved ? "saved" : "default"; // default, saved, updating

let cartToast;

// =========================
// INYECTAR MODAL DE PAGO
// (se crea una sola vez via JS,
//  no hay que pegarlo en cada HTML)
// =========================

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
        <div class="modal-body px-4 pb-4">
          {
             cardStatus === "saved" ?
              <>
                <div class="mb-3">
                  <label class="form-label fw-semibold text-muted small">NÚMERO DE TARJETA</label>
                  <input id="pay-number" type="text" class="form-control form-control-lg"
                    placeholder="0000 0000 0000 0000" maxlength="19" inputmode="numeric" value="${maskCardNumber(cardSaved.number)}" disabled>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold text-muted small">TITULAR</label>
                  <input id="pay-name" type="text" class="form-control form-control-lg"
                    placeholder="Nombre como aparece en la tarjeta" value="${cardSaved.name}" disabled>
                </div>

                <div class="row g-3 mb-4">
                  <div class="col-6">
                    <label class="form-label fw-semibold text-muted small">FECHA DE EXPIRACIÓN</label>
                    <input id="pay-expiry" type="text" class="form-control form-control-lg"
                      placeholder="MM/AA" maxlength="5" inputmode="numeric" value="${cardSaved.expiry}" disabled>
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold text-muted small">CVV</label>
                    <input id="pay-cvv" type="text" class="form-control form-control-lg"
                      placeholder="123" maxlength="3" inputmode="numeric" value="${maskCVV(cardSaved.cvv)}" disabled>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold text-muted small">ACTIVA</label>
                  <input id="pay-active" type="checkbox" class="form-check-input" ${cardSaved.active ? "checked" : ""} disabled>
                  <label for="pay-active" class="form-label fw-semibold text-muted small">Marcar como tarjeta activa</label>
                </div>

                <button id="delete-card-btn" type="button"
                  class="btn btn-outline-danger btn-lg w-100 fw-bold text-uppercase shadow-sm">
                  <i class="bi bi-trash-fill me-2"></i>Eliminar tarjeta guardada
                </button>

                {
                  cardStatus === "updating" && (
                    <button id="update-card-btn" type="button" class="btn btn-outline-secondary btn-lg w-100 fw-bold text-uppercase shadow-sm mt-2">
                      <i class="bi bi-pencil-fill me-2"></i>Actualizar tarjeta
                    </button>
                  )
                }

              </>
              :
              <>
                <div class="mb-3">
                  <label class="form-label fw-semibold text-muted small">NÚMERO DE TARJETA</label>
                  <input id="pay-number" type="text" class="form-control form-control-lg"
                    placeholder="0000 0000 0000 0000" maxlength="19" inputmode="numeric">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold text-muted small">TITULAR</label>
                  <input id="pay-name" type="text" class="form-control form-control-lg"
                    placeholder="Nombre como aparece en la tarjeta">
                </div>

                <div class="row g-3 mb-4">
                  <div class="col-6">
                    <label class="form-label fw-semibold text-muted small">FECHA DE EXPIRACIÓN</label>
                    <input id="pay-expiry" type="text" class="form-control form-control-lg"
                      placeholder="MM/AA" maxlength="5" inputmode="numeric">
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold text-muted small">CVV</label>
                    <input id="pay-cvv" type="text" class="form-control form-control-lg"
                      placeholder="123" maxlength="3" inputmode="numeric">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold text-muted small">ACTIVA</label>
                  <input id="pay-active" type="checkbox" class="form-check-input">
                  <label for="pay-active" class="form-label fw-semibold text-muted small">Marcar como tarjeta activa</label>
                </div>   
  
              </>
          }

          <span id="pay-status">
          TEST STATUS
          </span>

          <button id="add-card-btn" type="button"
            class="btn btn-danger btn-lg w-100 fw-bold text-uppercase shadow-sm">
            <i class="bi bi-lock-fill me-2"></i>Agregar tarjeta
          </button>
                          {
                  updateCard && (
                    <button id="update-card-btn" type="button" class="btn btn-outline-secondary btn-lg w-100 fw-bold text-uppercase shadow-sm mt-2">
                      <i class="bi bi-pencil-fill me-2"></i>Actualizar tarjeta
                    </button>
                  )
                }
          <button id="pay-confirm-btn" type="button" style="display: none;"
            class="btn btn-danger btn-lg w-100 fw-bold text-uppercase shadow-sm">
            <i class="bi bi-lock-fill me-2"></i>Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  </div>
`,
);

// =========================
// FORMATO AUTOMÁTICO INPUTS
// =========================

document.getElementById("pay-number").addEventListener("input", function () {
  let val = this.value.replace(/\D/g, "").substring(0, 16);
  this.value = val.match(/.{1,4}/g)?.join(" ") || val;
});

document.getElementById("pay-expiry").addEventListener("input", function () {
  let val = this.value.replace(/\D/g, "").substring(0, 4);
  this.value = val.length >= 3 ? val.slice(0, 2) + "/" + val.slice(2) : val;
});

document.getElementById("pay-cvv").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").substring(0, 3);
});

document.getElementById("pay-active").addEventListener("change", function () {
  if (this.checked) {
    this.value = "true";
  } else {
    this.value = "false";
  }
});

// =========================
// LÓGICA DEL PAGO
// =========================
const changeStatus = (message, customClass) => {
  let status = `<span class='${customClass}'> ${message}</span>`;
  return status;
};

const maskCardNumber = (number) => {
  return "**** **** **** " + number.slice(-4);
};

const maskCVV = (cvv) => {
  return "***";
};

const updateCard = (updatedData) => {
  // Lógica para actualizar tarjeta en LocalStorage
  let card = JSON.parse(localStorage.getItem("d6guitars_card_saved")) || {};
  localStorage.setItem(
    "d6guitars_card_saved",
    JSON.stringify({ ...card, ...updatedData }),
  );
};

const deleteCard = () => {
  // Lógica para eliminar tarjeta desde LocalStorage
  localStorage.setItem("d6guitars_card_saved", JSON.stringify({}));
};

const getCard = () => {
  // Logica para obtener tarjeta desde LocalStorage
  let card = JSON.parse(localStorage.getItem("d6guitars_card_saved")) || {};
  return card;
};

const saveCard = (card) => {
  // Lógica para guardar tarjeta en LocalStorage
  let cardSaved =
    JSON.parse(localStorage.getItem("d6guitars_card_saved")) || {};
  localStorage.setItem(
    "d6guitars_card_saved",
    JSON.stringify({ ...cardSaved, ...card }),
  );
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
};

const createCard = (number, name, expiry, cvv, active) => {
  let dangerClass = "text-danger";
  let successClass = "text-success";
  let message = "";

  let response = {
    status: "error",
    message: message,
    card: null,
  };

  if (!number || !/^\d{16}$/.test(number)) {
    message = "❌ Número de tarjeta inválido (16 dígitos)";
    response.message = message;
    return response;
  }
  if (!name) {
    message = "❌ Ingresa el nombre del titular";
    response.message = message;
    return response;
  }
  if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
    message = "❌ Fecha inválida (formato MM/AA)";
    response.message = message;
    return response;
  }
  if (!cvv || !/^\d{3}$/.test(cvv)) {
    message = "❌ CVV inválido (3 dígitos)";
    response.message = message;
    return response;
  }
  if (typeof active != "boolean") {
    message = "❌ Active debe ser booleano (true/false)";
    response.message = message;
    return response;
  }

  let cardJson = {
    id: generateId(),
    number: number,
    name: name,
    expiry: expiry,
    cvv: cvv,
    active: active,
  };

  if (active) {
    message = "✅ Tarjeta aprobada";
    response.status = "approved";
  } else {
    message = "❌ Tarjeta rechazada";
    response.status = "rejected";
  }

  response.message = message;
  response.card = cardJson;

  return response;
};

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

document
  .getElementById("delete-card-btn")
  ?.addEventListener("click", function () {
    deleteCard();
    this.style.display = "none";
    document.getElementById("update-card-btn").style.display = "none";
    document.getElementById("add-card-btn").style.display = "block";
    const status = document.getElementById("pay-status");
    status.innerHTML = changeStatus("✅ Tarjeta eliminada", "text-success");
  });

document
  .getElementById("update-card-btn")
  ?.addEventListener("click", function () {
    const { number, name, expiry, cvv, active } = getInputs();
    const updatedData = { number, name, expiry, cvv, active };
    updateCard(updatedData);
    const status = document.getElementById("pay-status");
    status.innerHTML = changeStatus("✅ Tarjeta actualizada", "text-success");
  });

document.getElementById("add-card-btn").addEventListener("click", function () {
  this.disabled = true;
  const status = document.getElementById("pay-status");
  status.innerHTML = changeStatus("⏳ Validando tarjeta...", "text-secondary");

  const { number, name, expiry, cvv, active } = getInputs();

  console.log("Inputs:", { number, name, expiry, cvv, active });

  const response = createCard(number, name, expiry, cvv, active);

  console.log("CreateCard response:", response);

  switch (response.status) {
    case "approved":
      status.innerHTML = changeStatus(response.message, "text-success");
      saveCard(response.card);
      this.style.display = "none";
      document.getElementById("pay-confirm-btn").style.display = "block";
      break;
    case "rejected":
      status.innerHTML = changeStatus(response.message, "text-danger");
      saveCard(response.card);
      this.disabled = false;
      break;
    default:
      status.innerHTML = changeStatus(response.message, "text-danger");
      this.disabled = false;
  }
});

document
  .getElementById("pay-confirm-btn")
  .addEventListener("click", function () {
    const btn = document.getElementById("pay-confirm-btn");
    btn.disabled = true;

    const status = document.getElementById("pay-status");
    status.innerHTML = changeStatus("⏳ Procesando pago...", "text-secondary");

    const approvedCards = [];

    // Deshabilitar botón y simular proceso

    setTimeout(() => {
      status.innerHTML = `<span class="text-success">✅ ¡Pago aprobado!</span>`;

      generateReceipt(name);

      setTimeout(() => {
        // Cerrar modal y limpiar carrito
        bootstrap.Modal.getInstance(
          document.getElementById("paymentModal"),
        ).hide();

        cart = [];
        localStorage.removeItem("d6guitars_cart");
        updateCartUI();

        // Limpiar campos del modal
        ["pay-number", "pay-name", "pay-expiry", "pay-cvv"].forEach((id) => {
          document.getElementById(id).value = "";
        });
        status.innerHTML = "";
        btn.disabled = false;

        // Mostrar toast de éxito
        const successToast = new bootstrap.Toast(
          document.getElementById("cartToast"),
          { delay: 4000 },
        );
        document.querySelector("#cartToast .toast-body").innerHTML =
          `<i class="bi bi-check-circle-fill fs-5"></i> ¡Compra realizada con éxito!`;
        successToast.show();
      }, 1500);
    }, 2000);
  });

// =========================
// BOTÓN "FINALIZAR COMPRA"
// abre el modal de pago
// =========================

document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-checkout")) {
    if (cart.length === 0) return;
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
// INICIALIZAR AL CARGAR DOM
// =========================

document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  const toastEl = document.getElementById("cartToast");
  if (toastEl) {
    cartToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  }
});

// =========================
// MODAL DE PRODUCTO
// =========================

document.querySelectorAll(".btn-details").forEach((button) => {
  button.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (modalQuantity) modalQuantity.value = 1;
    if (modalProductTitle) modalProductTitle.innerText = btn.dataset.name;
    if (modalProductDesc) modalProductDesc.innerText = btn.dataset.desc;
    if (modalProductPrice)
      modalProductPrice.innerText = `$${btn.dataset.price}`;
    if (modalProductImg) modalProductImg.src = btn.dataset.img;
    if (modalAddToCartBtn) {
      modalAddToCartBtn.dataset.name = btn.dataset.name;
      modalAddToCartBtn.dataset.price = btn.dataset.price;
    }
  });
});

// =========================
// AGREGAR AL CARRITO
// =========================

if (modalAddToCartBtn) {
  modalAddToCartBtn.addEventListener("click", (e) => {
    const name = e.target.closest("button").dataset.name;
    const price = parseFloat(e.target.closest("button").dataset.price);
    const quantityToAdd = parseInt(modalQuantity.value) || 1;

    const existingItem = cart.find((item) => item.name === name);
    if (existingItem) {
      existingItem.quantity += quantityToAdd;
    } else {
      cart.push({ name, price, quantity: quantityToAdd });
    }

    updateCartUI();

    const modalEl = document.getElementById("productModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    if (cartToast) cartToast.show();
  });
}

// =========================
// ACTUALIZAR UI DEL CARRITO
// =========================

function updateCartUI() {
  localStorage.setItem("d6guitars_cart", JSON.stringify(cart));

  if (!cartCount || !cartItemsContainer || !cartTotalDisplay) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.innerText = totalItems;
  cartCount.classList.add("scale-up");
  setTimeout(() => cartCount.classList.remove("scale-up"), 200);

  cartItemsContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <li class="list-group-item text-center text-muted py-5">
        <i class="bi bi-cart-x display-1 d-block mb-3 opacity-25"></i>El carrito está vacío
      </li>`;
  } else {
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <h6 class="my-0 fw-bold">${item.name}</h6>
          <small class="text-muted">$${item.price.toFixed(2)} x ${item.quantity}</small>
        </div>
        <div class="d-flex align-items-center">
          <span class="fw-bold text-success me-3">$${(item.price * item.quantity).toFixed(2)}</span>
          <button class="btn btn-outline-danger remove-btn p-0" data-index="${index}">
            <i class="bi bi-trash pointer-none"></i>
          </button>
        </div>`;
      cartItemsContainer.appendChild(li);
    });

    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        cart.splice(e.currentTarget.dataset.index, 1);
        updateCartUI();
      });
    });
  }

  cartTotalDisplay.innerText = total.toFixed(2);
}

// =========================
// GENERAR BOLETA PDF
// =========================
function generateReceipt(cardholderName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const orden = Math.floor(Math.random() * 900000) + 100000;
  const fecha = new Date().toLocaleDateString();

  // --- ENCABEZADO ---
  doc.setFillColor(40, 40, 40); // Fondo gris oscuro
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("D6GUITARS", 15, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("COMPROBANTE DE PAGO", 15, 33);
  doc.text(`Fecha: ${fecha}`, 195, 25, { align: "right" });
  doc.text(`Orden: #${orden}`, 195, 33, { align: "right" });

  // --- INFO CLIENTE ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DEL CLIENTE", 15, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${cardholderName.toUpperCase()}`, 15, 62);

  // --- TABLA DE PRODUCTOS ---
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 70, 195, 70); // Línea superior

  doc.setFont("helvetica", "bold");
  doc.text("Producto", 15, 77);
  doc.text("Cant.", 140, 77);
  doc.text("Subtotal", 195, 77, { align: "right" });
  doc.line(15, 80, 195, 80); // Línea inferior encabezado tabla

  let y = 90;
  let totalAcumulado = 0;
  doc.setFont("helvetica", "normal");

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;
    totalAcumulado += subtotal;

    doc.text(item.name, 15, y);
    doc.text(item.quantity.toString(), 142, y);
    doc.text(`$${subtotal.toFixed(2)}`, 195, y, { align: "right" });

    y += 10;
  });

  // --- SECCIÓN TOTAL ---
  y += 10;
  doc.setDrawColor(220, 53, 69); // Rojo de tu marca
  doc.setLineWidth(1);
  doc.line(120, y, 195, y); // Línea sobre el total

  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL COMPRA:", 120, y);
  doc.setTextColor(25, 135, 84); // Verde para el precio
  doc.text(`$${totalAcumulado.toFixed(2)}`, 195, y, { align: "right" });

  // --- PIE DE PÁGINA ---
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Gracias por elegir D6guitars. Este es un documento digital.",
    105,
    280,
    { align: "center" },
  );

  // Descarga
  doc.save(`Boleta_D6guitars_${orden}.pdf`);
}
