const PRODUCTS = [
  { id: 1, name: "Premium Hoodie", category: "all", price: 1299, img: "assets/Hoodie.jpg" },
  { id: 2, name: "Classic T-Shirt", category: "all", price: 699, img: "assets/Classic-T-shirt.jpg" },
  { id: 3, name: "Denim Jeans", category: "all", price: 1599, img: "assets/Denim-jeans.webp" },
  { id: 4, name: "Summer Dress", category: "all", price: 1099, img: "assets/Summer-dress.jpg" },
  { id: 5, name: "Casual Jacket", category: "all", price: 1299, img: "assets/casual-jacket.jpg" },
  { id: 6, name: "Comfortable Leggings", category: "all", price: 699, img: "assets/leggings.jpg" }
];

let state = {
  category: localStorage.getItem("selected_category") || "all",
  search: localStorage.getItem("search_query") || ""
};

const container = document.getElementById("product-container");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const cartBadge = document.getElementById("cartCount");

function toast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = "toast-msg";
  t.innerText = msg;
  Object.assign(t.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: type === "success" ? "#16c784" : "#ff5e5e",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    zIndex: 99999,
    opacity: 0,
    transition: ".3s"
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = 1; });
  setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 300); }, 2000);
}

const CART_KEY = "clothify_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  const navMenuItems = navMenu.querySelectorAll(".nav-menu-item");
  navMenuItems.forEach(item => {
    item.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

function updateCartBadge() {
  if (cartBadge) {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.innerText = count;
  }
}

function addToCart(id) {
  const cart = getCart();
  const productId = parseInt(id);
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return toast("Invalid Product!", "error");
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  toast("Added to cart!");
}

function removeFromCart(id) {
  const productId = parseInt(id);
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
  updateCartBadge();
  toast("Item removed!", "success");
}

function updateQty(id, action) {
  const cart = getCart();
  const productId = parseInt(id);
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (action === "inc") item.qty++;
  else if (action === "dec" && item.qty > 1) item.qty--;
  else if (action === "dec" && item.qty === 1) return removeFromCart(id);
  saveCart(cart);
  renderCartPage();
}

function calculateTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? 80 : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderCartPage() {
  const itemsBox = document.getElementById("cart-items");
  const emptyBox = document.getElementById("empty-cart");
  if (!itemsBox) return;
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryShipping = document.getElementById("summary-shipping");
  const summaryTotal = document.getElementById("summary-total");
  const cart = getCart();
  if (cart.length === 0) {
    itemsBox.style.display = "none";
    emptyBox.style.display = "block";
    if (summarySubtotal) summarySubtotal.innerText = "₹0";
    if (summaryTotal) summaryTotal.innerText = "₹0";
    return;
  }
  itemsBox.style.display = "block";
  emptyBox.style.display = "none";
  itemsBox.innerHTML = "";
  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item fade-unit";
    div.innerHTML = `
      <div class="item-left"><img src="${item.img}" alt="${item.name}"></div>
      <div class="item-middle">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
      <div class="item-right">
        <div class="qty-box">
          <button class="qty-decrease" data-id="${item.id}">-</button>
          <span class="qty-count">${item.qty}</span>
          <button class="qty-increase" data-id="${item.id}">+</button>
        </div>
      </div>`;
    itemsBox.appendChild(div);
  });
  const { subtotal, shipping, total } = calculateTotals();
  if (summarySubtotal) summarySubtotal.innerText = `₹${subtotal}`;
  if (summaryShipping) summaryShipping.innerText = `₹${shipping}`;
  if (summaryTotal) summaryTotal.innerText = `₹${total}`;
}

function renderProducts(data) {
  if (!container) return;
  container.innerHTML = "";
  if (!data.length) return container.innerHTML = `<p style="padding:20px;">No products found</p>`;
  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card fade-unit";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">₹${p.price}</p>
      <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
    `;
    container.appendChild(card);
  });
  initFadeUnits();
}

function applyFilters() {
  let list = PRODUCTS;
  if (state.category !== "all") list = list.filter(p => p.category === state.category);
  if (state.search.trim() !== "") list = list.filter(p => p.name.toLowerCase().includes(state.search.toLowerCase()));
  renderProducts(list);
}

let debounceTimer = null;

document.addEventListener("click", e => {
  if (e.target.classList.contains("category-btn")) {
    const cat = e.target.dataset.category;
    state.category = cat;
    localStorage.setItem("selected_category", cat);
    applyFilters();
  }
});

if (searchInput) {
  searchInput.value = state.search;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = searchInput.value.trim();
      localStorage.setItem("search_query", state.search);
      applyFilters();
    }, 250);
  });
}

if (searchForm) {
  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    state.search = searchInput.value.trim();
    localStorage.setItem("search_query", state.search);
    applyFilters();
  });
}

let lastScrollY = window.scrollY;

function initFadeUnits() {
  const units = document.querySelectorAll(".fade-unit");
  units.forEach(u => {
    u.style.opacity = "0";
    u.style.transform = "translateY(30px)";
    u.style.transition = "opacity .6s ease, transform .6s ease";
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const dir = window.scrollY > lastScrollY ? "down" : "up";
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0px)";
        });
      } else {
        requestAnimationFrame(() => {
          entry.target.style.opacity = "0";
          entry.target.style.transform = dir === "down" ? "translateY(30px)" : "translateY(-30px)";
        });
      }
    });
    lastScrollY = window.scrollY;
  }, { threshold: 0.1 });
  units.forEach(u => obs.observe(u));
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    addToCart(e.target.dataset.id);
  }
  if (e.target.classList.contains("remove-btn")) {
    removeFromCart(e.target.dataset.id);
  }
  if (e.target.classList.contains("qty-increase")) {
    updateQty(e.target.dataset.id, "inc");
  }
  if (e.target.classList.contains("qty-decrease")) {
    updateQty(e.target.dataset.id, "dec");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  applyFilters();
  renderCartPage();
  updateCartBadge();
  initFadeUnits();
  runSearchPage();
});

const searchResultsBox = document.getElementById("search-results-grid");
const noResultsBox = document.getElementById("no-results");

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  });
}

function runSearchPage() {
  if (!searchResultsBox) return;
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") ? params.get("q").toLowerCase() : "";
  if (!query) {
    showNoResults();
    return;
  }
  const results = PRODUCTS.filter(item =>
    item.name.toLowerCase().includes(query)
  );
  if (!results.length) {
    showNoResults();
    return;
  }
  renderVerticalResults(results);
}

function renderVerticalResults(list) {
  searchResultsBox.innerHTML = "";
  noResultsBox.style.display = "none";
  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "search-row-item";
    div.innerHTML = `
      <div class="search-row-left">
        <img src="${item.img}" alt="${item.name}">
      </div>
      <div class="search-row-middle">
        <h3>${item.name}</h3>
        <p class="price">₹${item.price}</p>
      </div>
      <div class="search-row-right">
        <button class="add-to-cart-btn" data-id="${item.id}">
          Add to Cart
        </button>
      </div>
    `;
    searchResultsBox.appendChild(div);
  });
  initFadeUnits();
}

function showNoResults() {
  if (searchResultsBox) searchResultsBox.innerHTML = "";
  if (noResultsBox) noResultsBox.style.display = "block";
}

// Search page specific functions
function handleSearchSubmit(e) {
  e.preventDefault();
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  }
}

function displaySearchResults(query) {
  const results = PRODUCTS.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );
  const grid = document.getElementById("search-results-grid");
  const noResults = document.getElementById("no-results");
  if (results.length === 0) {
    grid.innerHTML = "";
    noResults.style.display = "flex";
    return;
  }
  grid.innerHTML = "";
  noResults.style.display = "none";
  results.forEach(product => {
    const card = document.createElement("div");
    card.className = "search-item fade-unit";
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">₹${product.price}</p>
      <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    `;
    grid.appendChild(card);
  });
  initFadeUnits();
}

// Initialize search page on load
window.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = query;
    }
    const searchInfo = document.getElementById("searchInfo");
    if (searchInfo) {
      searchInfo.innerText = `Showing results for "${query}"`;
    }
    displaySearchResults(query);
  } else {
    const noResults = document.getElementById("no-results");
    if (noResults) {
      noResults.style.display = "flex";
    }
  }
});
