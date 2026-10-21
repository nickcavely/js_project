// let rame = document.getElementById("cardds");
// console.log(rame);
// let classname = document.getElementsByClassName("ftr-container");
// console.log(classname);
// rame.addEventListener("wheel", () => {
//   // cycle colors: red -> blue -> green -> red
//   const cur = rame.style.backgroundColor;
//   if (cur === "orange") {
//     rame.style.backgroundColor = "blue";
//   } else if (cur === "blue") {
//     rame.style.backgroundColor = "green";
//   } else if (cur === "green") {
//     rame.style.backgroundColor = "grey";
//   } else if (cur === "grey") {
//     rame.style.backgroundColor = "red";
//   } else {
//     rame.style.backgroundColor = "orange";
//   }
//   console.log("ravi");
// });
// ============================================
// FOODIE API CLIENT - Complete JavaScript Application
// ============================================

const API_BASE_URL = "https://restaurantapi.stepacademy.ge";

// ============================================
// TOKEN MANAGEMENT
// ============================================

const TokenManager = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setTokens: (access, refresh) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  isAuthenticated: () => !!localStorage.getItem("accessToken"),
};

// ============================================
// HTTP CLIENT
// ============================================

async function httpClient(
  endpoint,
  method = "GET",
  body = null,
  requiresAuth = false,
) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    Accept: "text/plain",
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = TokenManager.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.title || "Request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

const AuthAPI = {
  // POST /api/auth/register
  register: async (firstName, lastName, email, password) => {
    const data = await httpClient(
      "/api/auth/register",
      "POST",
      {
        firstName,
        lastName,
        email,
        password,
      },
      false,
    );
    return data; // { token: string }
  },

  // POST /api/auth/login
  login: async (email, password) => {
    const data = await httpClient(
      "/api/auth/login",
      "POST",
      {
        email,
        password,
      },
      false,
    );

    if (data.accessToken && data.refreshToken) {
      TokenManager.setTokens(data.accessToken, data.refreshToken);
    }
    return data; // { accessToken, refreshToken, isVerified }
  },

  // POST /api/auth/refresh-access-token/{token}
  refreshToken: async () => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const data = await httpClient(
      `/api/auth/refresh-access-token/${refreshToken}`,
      "POST",
      null,
      false,
    );

    if (data.accessToken && data.refreshToken) {
      TokenManager.setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  // PUT /api/auth/verify-email
  verifyEmail: async (email, code) => {
    const data = await httpClient(
      "/api/auth/verify-email",
      "PUT",
      {
        email,
        code,
      },
      false,
    );

    if (data.accessToken && data.refreshToken) {
      TokenManager.setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  // POST /api/auth/resend-email-verification/{email}
  resendVerification: async (email) => {
    return httpClient(
      `/api/auth/resend-email-verification/${email}`,
      "POST",
      null,
      false,
    );
  },

  // POST /api/auth/forgot-password/{email}
  forgotPassword: async (email) => {
    return httpClient(
      `/api/auth/forgot-password/${email}`,
      "POST",
      null,
      false,
    );
  },

  // PUT /api/auth/reset-password
  resetPassword: async (token, newPassword) => {
    return httpClient(
      "/api/auth/reset-password",
      "PUT",
      {
        token,
        newPassword,
      },
      false,
    );
  },

  logout: () => {
    TokenManager.clearTokens();
    window.location.href = "login.html";
  },
};

// ============================================
// CATEGORIES API
// ============================================

const CategoriesAPI = {
  // GET /api/categories
  getAll: async () => {
    return httpClient("/api/categories", "GET", null, true);
  },

  // POST /api/categories
  create: async (name) => {
    return httpClient("/api/categories", "POST", { name }, true);
  },

  // PUT /api/categories/{id}
  update: async (id, name) => {
    return httpClient(`/api/categories/${id}`, "PUT", { name }, true);
  },

  // DELETE /api/categories/{id}
  delete: async (id) => {
    return httpClient(`/api/categories/${id}`, "DELETE", null, true);
  },
};

// ============================================
// PRODUCTS API
// ============================================

const ProductsAPI = {
  // GET /api/products?take={}&page={}
  getAll: async (take = 10, page = 1) => {
    return httpClient(
      `/api/products?take=${take}&page=${page}`,
      "GET",
      null,
      false,
    );
  },

  // POST /api/products
  create: async (productData) => {
    return httpClient("/api/products", "POST", productData, true);
  },

  // GET /api/products/filter?query={}&vegetarian={}&spiciness={}&rate={}&minPrice={}&maxPrice={}&categoryId={}&take={}&page={}
  filter: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.query) params.append("query", filters.query);
    if (filters.vegetarian !== undefined)
      params.append("vegetarian", filters.vegetarian);
    if (filters.spiciness) params.append("spiciness", filters.spiciness);
    if (filters.rate) params.append("rate", filters.rate);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.take) params.append("take", filters.take);
    if (filters.page) params.append("page", filters.page);

    return httpClient(
      `/api/products/filter?${params.toString()}`,
      "GET",
      null,
      false,
    );
  },

  // GET /api/products/{id}
  getById: async (id) => {
    return httpClient(`/api/products/${id}`, "GET", null, false);
  },

  // PUT /api/products/{id}
  update: async (id, productData) => {
    return httpClient(`/api/products/${id}`, "PUT", productData, true);
  },

  // DELETE /api/products/{id}
  delete: async (id) => {
    return httpClient(`/api/products/${id}`, "DELETE", null, true);
  },
};

// ============================================
// CART API
// ============================================

const CartAPI = {
  // POST /api/cart/add-to-cart
  addToCart: async (productId, quantity) => {
    return httpClient(
      "/api/cart/add-to-cart",
      "POST",
      {
        productId,
        quantity,
      },
      true,
    );
  },

  // PUT /api/cart/edit-quantity
  editQuantity: async (itemId, quantity) => {
    return httpClient(
      "/api/cart/edit-quantity",
      "PUT",
      {
        itemId,
        quantity,
      },
      true,
    );
  },

  // DELETE /api/cart/remove-from-cart/{itemId}
  removeFromCart: async (itemId) => {
    return httpClient(
      `/api/cart/remove-from-cart/${itemId}`,
      "DELETE",
      null,
      true,
    );
  },

  // GET /api/cart
  getCart: async () => {
    return httpClient("/api/cart", "GET", null, true);
  },

  // POST /api/cart/checkout?take={}&page={}
  checkout: async (take = 10, page = 1) => {
    return httpClient(
      `/api/cart/checkout?take=${take}&page=${page}`,
      "POST",
      null,
      true,
    );
  },
};

// ============================================
// UI MANAGERS
// ============================================

// Toast Notifications
function showToast(message, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <i class="fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        <span>${message}</span>
    `;

  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "15px 25px",
    borderRadius: "10px",
    color: "white",
    fontWeight: "500",
    zIndex: "10000",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
    animation: "slideIn 0.3s ease",
    background: type === "success" ? "#4CAF50" : "#e94560",
  });

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Auth UI Handler
const AuthUI = {
  initLoginForm: () => {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const result = await AuthAPI.login(email, password);
        showToast("წარმატებით შეხვედით!");

        if (result.isVerified) {
          setTimeout(() => (window.location.href = "index.html"), 1000);
        } else {
          window.location.href = `verify-email.html?email=${encodeURIComponent(email)}`;
        }
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  },

  initSignupForm: () => {
    const form = document.getElementById("signup-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await AuthAPI.register(firstName, lastName, email, password);
        showToast("რეგისტრაცია წარმატებულია! გთხოვთ დაადასტუროთ ემაილი.");
        window.location.href = `verify-email.html?email=${encodeURIComponent(email)}`;
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  },

  initVerifyForm: () => {
    const form = document.getElementById("verify-form");
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    if (email) document.getElementById("email").value = email;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = document.getElementById("code").value;

      try {
        await AuthAPI.verifyEmail(email, code);
        showToast("ემაილი დადასტურდა!");
        window.location.href = "index.html";
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  },

  updateNav: () => {
    const isAuth = TokenManager.isAuthenticated();
    const authLinks = document.querySelectorAll(".auth-link");
    const userLinks = document.querySelectorAll(".user-link");
    const logoutBtn = document.getElementById("logout-btn");

    authLinks.forEach(
      (link) => (link.style.display = isAuth ? "none" : "block"),
    );
    userLinks.forEach(
      (link) => (link.style.display = isAuth ? "block" : "none"),
    );

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        AuthAPI.logout();
        showToast("გამოსვლა წარმატებულია");
      };
    }
  },
};

// Products UI Handler
const ProductsUI = {
  renderProductCard: (product) => {
    return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image || "placeholder.jpg"}" alt="${product.name}">
                    ${product.vegetarian ? '<span class="badge veg">🌿 ვეგეტარიანული</span>' : ""}
                    ${product.spiciness > 0 ? '<span class="badge spicy">🌶️'.repeat(product.spiciness) + "</span>" : ""}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description || ""}</p>
                    <div class="product-meta">
                        <span class="price">$${product.price.toFixed(2)}</span>
                        <div class="rating">${"⭐".repeat(Math.round(product.rate || 0))}</div>
                    </div>
                    <button class="btn-add-cart" onclick="CartUI.addToCart(${product.id}, 1)">
                        <i class="fa-solid fa-cart-plus"></i> კალათაში დამატება
                    </button>
                </div>
            </div>
        `;
  },

  loadProducts: async () => {
    const container = document.getElementById("products-container");
    const popularContainer = document.getElementById("cardds");

    try {
      const data = await ProductsAPI.getAll(10, 1);
      const products = data.products || [];

      if (container) {
        container.innerHTML = products
          .map(ProductsUI.renderProductCard)
          .join("");
      }

      // Popular dishes on homepage (first 3)
      if (popularContainer && window.location.pathname.includes("index")) {
        popularContainer.innerHTML = products
          .slice(0, 3)
          .map(ProductsUI.renderProductCard)
          .join("");
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  },

  loadCategories: async () => {
    const container = document.getElementById("categories-filter");
    if (!container) return;

    try {
      const categories = await CategoriesAPI.getAll();
      container.innerHTML = `
                <button class="category-btn active" data-category="">ყველა</button>
                ${categories
                  .map(
                    (cat) => `
                    <button class="category-btn" data-category="${cat.id}">${cat.name}</button>
                `,
                  )
                  .join("")}
            `;

      // Category filter click handlers
      container.querySelectorAll(".category-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          container
            .querySelectorAll(".category-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          ProductsUI.filterProducts({ categoryId: btn.dataset.category });
        });
      });
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  },

  filterProducts: async (filters) => {
    const container = document.getElementById("products-container");
    if (!container) return;

    try {
      const data = await ProductsAPI.filter(filters);
      const products = data.products || [];
      container.innerHTML = products.map(ProductsUI.renderProductCard).join("");
    } catch (error) {
      showToast("ფილტრაცია ვერ მოხერხდა", "error");
    }
  },
};

// Cart UI Handler
const CartUI = {
  cartItems: [],

  init: async () => {
    if (window.location.pathname.includes("cart.html")) {
      await CartUI.loadCart();
    }
    CartUI.updateBadge();
  },

  loadCart: async () => {
    const container = document.getElementById("cart-items");
    const summaryItems = document.getElementById("total-items");
    const summaryPrice = document.getElementById("total-price");

    try {
      const data = await CartAPI.getCart();
      CartUI.cartItems = data.items || [];

      if (container) {
        if (CartUI.cartItems.length === 0) {
          container.innerHTML = `
                        <div class="empty-cart">
                            <i class="fa-solid fa-cart-shopping" style="font-size: 4em; color: #ddd;"></i>
                            <p>თქვენი კალათა ცარიელია</p>
                            <a href="menu.html" class="btn-primary">მენუს ნახვა</a>
                        </div>
                    `;
        } else {
          container.innerHTML = CartUI.cartItems
            .map((item) => CartUI.renderCartItem(item))
            .join("");
        }
      }

      if (summaryItems) summaryItems.textContent = data.totalItems || 0;
      if (summaryPrice)
        summaryPrice.textContent = `$${(data.totalPrice || 0).toFixed(2)}`;

      CartUI.updateBadge(data.totalItems);
    } catch (error) {
      showToast("კალათის ჩატვირთვა ვერ მოხერხდა", "error");
    }
  },

  renderCartItem: (item) => {
    const product = item.product;
    return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    <img src="${product.image || "placeholder.jpg"}" alt="${product.name}">
                </div>
                <div class="item-details">
                    <h3>${product.name}</h3>
                    <p class="item-description">${product.description || ""}</p>
                    <div class="item-meta">
                        <span class="price">$${product.price.toFixed(2)} თითოეული</span>
                    </div>
                </div>
                <div class="item-controls">
                    <div class="quantity-control">
                        <button class="btn-quantity" onclick="CartUI.updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <input type="number" value="${item.quantity}" min="1" 
                               onchange="CartUI.updateQuantity(${item.id}, this.value)">
                        <button class="btn-quantity" onclick="CartUI.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="btn-remove" onclick="CartUI.removeItem(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="item-total">
                    $${(product.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `;
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      await CartAPI.addToCart(productId, quantity);
      showToast("პროდუქტი დაემატა კალათაში!");
      CartUI.updateBadge();
    } catch (error) {
      showToast("დამატება ვერ მოხერხდა", "error");
    }
  },

  updateQuantity: async (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity < 1) return;

    try {
      await CartAPI.editQuantity(itemId, quantity);
      await CartUI.loadCart();
      showToast("რაოდენობა განახლდა");
    } catch (error) {
      showToast("განახლება ვერ მოხერხდა", "error");
    }
  },

  removeItem: async (itemId) => {
    if (!confirm("ნამდვილად გსურთ ამ პროდუქტის ამოშლა?")) return;

    try {
      await CartAPI.removeFromCart(itemId);
      await CartUI.loadCart();
      showToast("პროდუქტი ამოიშალა");
    } catch (error) {
      showToast("ამოშლა ვერ მოხერხდა", "error");
    }
  },

  checkout: async () => {
    try {
      await CartAPI.checkout();
      showToast("შეკვეთა წარმატებით გაფორმდა!");
      await CartUI.loadCart();
    } catch (error) {
      showToast("ჩეკაუთი ვერ მოხერხდა", "error");
    }
  },

  updateBadge: (count) => {
    const badge = document.querySelector(".cart-badge");
    if (badge) {
      const total =
        count || CartUI.cartItems.reduce((sum, item) => sum + item.quantity, 0);
      badge.textContent = total;
      badge.style.display = total > 0 ? "inline-block" : "none";
    }
  },
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Update navigation based on auth status
  AuthUI.updateNav();

  // Initialize forms
  AuthUI.initLoginForm();
  AuthUI.initSignupForm();
  AuthUI.initVerifyForm();

  // Load products on menu and index pages
  if (
    document.getElementById("products-container") ||
    document.getElementById("cardds")
  ) {
    ProductsUI.loadProducts();
  }

  // Load categories filter
  ProductsUI.loadCategories();

  // Initialize cart
  CartUI.init();
});
