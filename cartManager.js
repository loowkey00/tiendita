// =========================
// CARRITO (LocalStorage)
// =========================

let cart = JSON.parse(localStorage.getItem("d6guitars_cart")) || [];

const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalDisplay = document.getElementById("cartTotal");

let cartToast = null;

function addToCart(name, price, quantity = 1) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    if (existingItem.quantity + quantity > 99) {
      existingItem.quantity = 99;
      showCartToast("Límite de 99 unidades alcanzado.");
    } else {
      existingItem.quantity += quantity;
    }
  } else {
    const finalQuantity = quantity > 99 ? 99 : quantity;
    cart.push({ name, price, quantity: finalQuantity });
    if (quantity > 99) {
      showCartToast("Límite de 99 unidades alcanzado.");
    }
  }

  updateCartUI();
}

function changeQuantity(index, delta) {
  if (cart[index]) {
    const newQuantity = cart[index].quantity + delta;
    
    if (newQuantity > 99) {
      cart[index].quantity = 99;
      showCartToast("Límite de 99 unidades alcanzado.");
    } else {
      cart[index].quantity = newQuantity;
    }
    

    if (cart[index].quantity <= 0) {
      removeFromCart(index);
    } else {
      updateCartUI();
    }
  }
}


function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function clearCart() {
  cart = [];
  localStorage.removeItem("d6guitars_cart");
  updateCartUI();
}

function hasCartItems() {
  return cart.length > 0;
}

function showCartToast(message = "¡Producto agregado al carrito!") {
  if (!cartToast) return;

  const toastBody = document.querySelector("#cartToast .toast-body");
  if (toastBody) {
    toastBody.innerHTML = `<i class="bi bi-check-circle-fill fs-5"></i> ${message}`;
  }

  cartToast.show();
}


function updateCartUI() {
  localStorage.setItem("d6guitars_cart", JSON.stringify(cart));

  if (!cartCount || !cartItemsContainer || !cartTotalDisplay) return;

  cartItemsContainer.innerHTML = '';
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <li class="list-group-item text-center text-muted py-5">
        <i class="bi bi-cart-x display-1 d-block mb-3 opacity-25"></i>El carrito está vacío
      </li>`;
  } else {
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      count += item.quantity;

      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      li.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <br>
          <small class="text-muted">$${item.price.toLocaleString('en-US')}</small>
        </div>
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-outline-secondary px-2 py-0 me-1" onclick="changeQuantity(${index}, -1)">-</button>
          
          <span class="badge text-bg-secondary rounded-pill mx-1">${item.quantity}</span>
          
          <button class="btn btn-sm btn-outline-secondary px-2 py-0 ms-1 me-3" onclick="changeQuantity(${index}, 1)">+</button>
          
          <span class="fw-bold text-success me-3">$${(item.price * item.quantity).toLocaleString('en-US')}</span>
          
          <button class="btn btn-sm btn-outline-danger px-2 py-0" onclick="removeFromCart(${index})">X</button>
        </div>
      `;
      cartItemsContainer.appendChild(li);
    });
  }

  // Actualizar contadores
  cartCount.innerText = count;
  cartCount.classList.add("scale-up");
  setTimeout(() => cartCount.classList.remove("scale-up"), 200);

  cartTotalDisplay.innerText = total.toLocaleString('en-US');
}

// =========================
// GENERAR BOLETA PDF
// =========================
function generateReceipt(cardholderName = "Cliente") {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const orden = Math.floor(Math.random() * 900000) + 100000;
  const fecha = new Date().toLocaleDateString();

  const safeName =
    typeof cardholderName === "string" && cardholderName.trim()
      ? cardholderName.trim()
      : "Cliente";

  doc.setFillColor(40, 40, 40);
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

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DEL CLIENTE", 15, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${safeName.toUpperCase()}`, 15, 62);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 70, 195, 70);

  doc.setFont("helvetica", "bold");
  doc.text("Producto", 15, 77);
  doc.text("Cant.", 140, 77);
  doc.text("Subtotal", 195, 77, { align: "right" });
  doc.line(15, 80, 195, 80);

  let y = 90;
  let totalAcumulado = 0;
  doc.setFont("helvetica", "normal");

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;
    totalAcumulado += subtotal;

    doc.text(item.name, 15, y);
    doc.text(item.quantity.toString(), 142, y);
    doc.text(`$${subtotal.toLocaleString('en-US')}`, 195, y, { align: "right" });

    y += 10;
  });

  y += 10;
  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(1);
  doc.line(120, y, 195, y);

  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL COMPRA:", 120, y);
  doc.setTextColor(25, 135, 84);
  doc.text(`$${totalAcumulado.toLocaleString('en-US')}`, 195, y, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Gracias por elegir D6guitars. Este es un documento digital.",
    105,
    280,
    { align: "center" },
  );

  doc.save(`Boleta_D6guitars_${orden}.pdf`);
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();

  const toastEl = document.getElementById("cartToast");
  if (toastEl) {
    cartToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  }
});

// =========================
// API GLOBAL MÍNIMA
// =========================
window.addToCart = addToCart;
window.updateCartUI = updateCartUI;
window.clearCart = clearCart;
window.generateReceipt = generateReceipt;
window.showCartToast = showCartToast;
window.hasCartItems = hasCartItems;
window.removeFromCart = removeFromCart;
window.changeQuantity = changeQuantity;