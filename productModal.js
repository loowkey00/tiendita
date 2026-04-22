// =========================
// MODAL DE PRODUCTO
// =========================

function getProductModalElements() {
  return {
    modalProductImg: document.getElementById("modalProductImg"),
    modalProductTitle: document.getElementById("modalProductTitle"),
    modalProductDesc: document.getElementById("modalProductDesc"),
    modalProductPrice: document.getElementById("modalProductPrice"),
    modalAddToCartBtn: document.getElementById("modalAddToCartBtn"),
    modalQuantity: document.getElementById("modalQuantity"),
  };
}

function fillProductModal(button) {
  const {
    modalProductImg,
    modalProductTitle,
    modalProductDesc,
    modalProductPrice,
    modalAddToCartBtn,
    modalQuantity,
  } = getProductModalElements();

  const name = button.dataset.name || "";
  const desc = button.dataset.desc || "";
  const price = button.dataset.price || "";
  const img =
    button.dataset.img ||
    button.dataset.image ||
    button.getAttribute("data-img") ||
    button.getAttribute("data-image") ||
    "";

  if (modalQuantity) {
    modalQuantity.value = 1;
  }

  if (modalProductTitle) {
    modalProductTitle.innerText = name;
  }

  if (modalProductDesc) {
    modalProductDesc.innerText = desc;
  }

  if (modalProductPrice) {
    modalProductPrice.innerText = price ? `$${price}` : "";
  }

  if (modalProductImg) {
    if (img) {
      modalProductImg.src = img;
      modalProductImg.alt = name || "Producto";
    } else {
      modalProductImg.removeAttribute("src");
      modalProductImg.alt = "Producto";
    }
  }

  if (modalAddToCartBtn) {
    modalAddToCartBtn.dataset.name = name;
    modalAddToCartBtn.dataset.price = price;
  }
}

// Abrir modal con datos del producto
document.addEventListener("click", function (e) {
  const detailsBtn = e.target.closest(".btn-details");
  if (!detailsBtn) return;

  fillProductModal(detailsBtn);
});

// Agregar producto al carrito usando la API pública
document.addEventListener("click", function (e) {
  const addBtn = e.target.closest("#modalAddToCartBtn");
  if (!addBtn) return;

  const { modalQuantity } = getProductModalElements();

  const name = addBtn.dataset.name || "";
  const price = parseFloat(addBtn.dataset.price);
  const quantityToAdd = parseInt(modalQuantity?.value, 10) || 1;

  if (!name || Number.isNaN(price)) {
    console.warn("Producto inválido en modal:", { name, price });
    return;
  }

  if (typeof window.addToCart === "function") {
    window.addToCart(name, price, quantityToAdd);
  }

  const modalEl = document.getElementById("productModal");
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) {
    modalInstance.hide();
  }

  if (typeof window.showCartToast === "function") {
    window.showCartToast("¡Producto agregado al carrito!");
  }
});
