// loquequieras.js
// Cargar el carrito desde LocalStorage para mantenerlo entre las distintas páginas HTML
let cart = JSON.parse(localStorage.getItem("d6guitars_cart")) || [];

// DOM Elements
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalDisplay = document.getElementById("cartTotal");

// Modal Elements
const modalProductImg = document.getElementById("modalProductImg");
const modalProductTitle = document.getElementById("modalProductTitle");
const modalProductDesc = document.getElementById("modalProductDesc");
const modalProductPrice = document.getElementById("modalProductPrice");
const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");
const modalQuantity = document.getElementById("modalQuantity");

let cartToast;

// Inicializar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  const toastEl = document.getElementById("cartToast");
  if (toastEl) {
    cartToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  }
});

// Lógica de llenado del Modal
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

// Lógica de Agregar al Carrito desde el Modal
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

// Función para actualizar la interfaz del carrito y el LocalStorage
function updateCartUI() {
  // Guardar en LocalStorage
  localStorage.setItem("d6guitars_cart", JSON.stringify(cart));

  if (!cartCount || !cartItemsContainer || !cartTotalDisplay) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.innerText = totalItems;

  cartCount.classList.add("scale-up");
  setTimeout(() => cartCount.classList.remove("scale-up"), 200);

  cartItemsContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<li class="list-group-item text-center text-muted py-5">
                <i class="bi bi-cart-x display-1 d-block mb-3 opacity-25"></i>
                El carrito está vacío
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
                </div>
            `;
      cartItemsContainer.appendChild(li);
    });

    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemIndex = e.currentTarget.dataset.index;
        cart.splice(itemIndex, 1);
        updateCartUI();
      });
    });
  }

  cartTotalDisplay.innerText = total.toFixed(2);
}
