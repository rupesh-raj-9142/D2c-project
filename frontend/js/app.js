// LAXMI Pickles - Main Application Controller
// Event Handlers, Routing, Live Filters, Modals, Checkout & Authentication

import { store } from './store.js';
import {
  CATEGORIES,
  PRODUCTS,
  REGIONAL_FLAVOURS,
  HOW_IT_MADE_STEPS,
  REVIEWS,
  INSTAGRAM_POSTS
} from './data.js';
import {
  renderProductCard,
  renderCategoryCard,
  renderReviewCard,
  renderRegionalCard,
  renderInstagramPost,
  renderCartDrawerContent,
  renderQuickViewModal,
  getImageUrl
} from './components.js';

class App {
  constructor() {
    this.currentCategoryFilter = 'all';
    this.currentSearchQuery = '';
    this.currentSortBy = 'popular';
    this.currentMaxPrice = 1000;
    this.currentSpiceFilter = 'all';

    // Quickview active state
    this.qvProductId = null;
    this.qvWeightIdx = 0;
    this.qvQuantity = 1;

    // Card weights memory { productId: weightIndex }
    this.cardSelectedWeights = {};
  }

  init() {
    this.renderHeaderBadges();
    this.renderHeroBadges();
    this.renderCategories();
    this.renderBestsellers();
    this.renderHowItMade();
    this.renderRegionalFlavours();
    this.renderReviews();
    this.renderInstagramGrid();
    this.renderShopProducts();
    this.setupEventListeners();
    this.setupHashRouting();
    this.updateUserNav();

    // Subscribe to store updates
    store.subscribe((event, payload) => {
      this.renderHeaderBadges();
      if (event === 'cart_updated' || event === 'coupon_applied' || event === 'coupon_removed') {
        this.updateCartDrawer();
      }
      if (event === 'wishlist_updated') {
        this.updateWishlistBadges();
      }
      if (event === 'user_updated') {
        this.updateUserNav();
      }
    });

    console.log('✨ LAXMI Pickles Application Initialized Successfully!');
  }

  // --- RENDERING CORE SECTIONS ---

  renderHeaderBadges() {
    const cartCountEl = document.getElementById('cart-count-badge');
    const wishlistCountEl = document.getElementById('wishlist-count-badge');
    const mobileCartCountEl = document.getElementById('mobile-cart-badge');

    const cartCount = store.getCartCount();
    const wishlistCount = store.wishlist.length;

    if (cartCountEl) {
      cartCountEl.textContent = cartCount;
      cartCountEl.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    if (mobileCartCountEl) {
      mobileCartCountEl.textContent = cartCount;
      mobileCartCountEl.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    if (wishlistCountEl) {
      wishlistCountEl.textContent = wishlistCount;
      wishlistCountEl.style.display = wishlistCount > 0 ? 'flex' : 'none';
    }
  }

  renderHeroBadges() {
    // Add micro-animations / interactive hover tags if needed
  }

  renderCategories() {
    const container = document.getElementById('category-grid-container');
    if (!container) return;
    container.innerHTML = CATEGORIES.map((cat) => renderCategoryCard(cat)).join('');
  }

  renderBestsellers() {
    const container = document.getElementById('bestseller-grid-container');
    if (!container) return;

    // Show 4 flagship bestsellers (Mango, Lemon, Green Chilli, Mixed)
    const bestsellers = PRODUCTS.filter((p) =>
      ['laxmi-mango', 'laxmi-lemon', 'laxmi-chilli', 'laxmi-mixed'].includes(p.id)
    );

    container.innerHTML = bestsellers
      .map((p) => {
        const weightIdx = this.cardSelectedWeights[p.id] || 0;
        return renderProductCard(p, weightIdx);
      })
      .join('');
  }

  renderHowItMade() {
    const container = document.getElementById('how-made-container');
    if (!container) return;

    container.innerHTML = HOW_IT_MADE_STEPS.map(
      (step) => `
      <div class="how-step-card">
        <div class="step-num-circle">${step.step}</div>
        <div class="step-text-content">
          <h4 class="step-title">${step.title}</h4>
          <span class="step-subtitle">${step.subtitle}</span>
          <p class="step-desc">${step.desc}</p>
        </div>
      </div>
    `
    ).join('');
  }

  renderRegionalFlavours() {
    const container = document.getElementById('regional-grid-container');
    if (!container) return;
    container.innerHTML = REGIONAL_FLAVOURS.map((r) => renderRegionalCard(r)).join('');
  }

  renderReviews() {
    const container = document.getElementById('reviews-grid-container');
    if (!container) return;
    container.innerHTML = REVIEWS.map((rev) => renderReviewCard(rev)).join('');
  }

  renderInstagramGrid() {
    const container = document.getElementById('instagram-grid-container');
    if (!container) return;
    container.innerHTML = INSTAGRAM_POSTS.map((p) => renderInstagramPost(p)).join('');
  }

  // --- SHOP FILTER & SEARCH ENGINE ---

  renderShopProducts() {
    const container = document.getElementById('shop-products-grid');
    const resultCountEl = document.getElementById('shop-results-count');
    if (!container) return;

    let filtered = [...PRODUCTS];

    // Category filter
    if (this.currentCategoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.category === this.currentCategoryFilter);
    }

    // Search filter
    if (this.currentSearchQuery.trim() !== '') {
      const q = this.currentSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.hindiName.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    // Price filter
    filtered = filtered.filter((p) => p.weights[0].price <= this.currentMaxPrice);

    // Spice filter
    if (this.currentSpiceFilter !== 'all') {
      filtered = filtered.filter((p) =>
        p.spiceLevel.toLowerCase().includes(this.currentSpiceFilter.toLowerCase())
      );
    }

    // Sort order
    if (this.currentSortBy === 'price-low') {
      filtered.sort((a, b) => a.weights[0].price - b.weights[0].price);
    } else if (this.currentSortBy === 'price-high') {
      filtered.sort((a, b) => b.weights[0].price - a.weights[0].price);
    } else if (this.currentSortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: Popular / Reviews count
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    if (resultCountEl) {
      resultCountEl.textContent = `Showing ${filtered.length} authentic pickles`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="no-results-box">
          <div class="no-res-icon">🌶️</div>
          <h3>No matching pickles found</h3>
          <p>Try clearing your filters or searching for terms like "Mango", "Lemon", "Garlic", or "Mirch".</p>
          <button type="button" class="btn-primary" onclick="window.app.resetShopFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map((p) => {
        const weightIdx = this.cardSelectedWeights[p.id] || 0;
        return renderProductCard(p, weightIdx);
      })
      .join('');
  }

  onProductCardWeightChange(productId, weightIdx, buttonEl) {
    this.cardSelectedWeights[productId] = weightIdx;
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const chosenWeight = product.weights[weightIdx];
    const cardEl = buttonEl.closest('.laxmi-product-card');
    if (!cardEl) return;

    // Update active pill state
    cardEl.querySelectorAll('.weight-pill').forEach((pill, i) => {
      pill.classList.toggle('active', i === weightIdx);
    });

    // Update price display
    const priceDisplay = cardEl.querySelector(`#price-${productId}`);
    if (priceDisplay) {
      priceDisplay.textContent = chosenWeight.price;
    }

    const mrpDisplay = cardEl.querySelector('.mrp-price');
    if (mrpDisplay && chosenWeight.originalPrice) {
      mrpDisplay.textContent = `₹${chosenWeight.originalPrice}`;
    }

    const discDisplay = cardEl.querySelector('.discount-tag');
    if (discDisplay && chosenWeight.discount) {
      discDisplay.textContent = chosenWeight.discount;
    }

    cardEl.dataset.selectedWeight = chosenWeight.weight;
  }

  addProductCardToCart(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const weightIdx = this.cardSelectedWeights[productId] || 0;
    const weightObj = product.weights[weightIdx] || product.weights[0];
    store.addToCart(product, weightObj, 1);
  }

  toggleWishlist(productId, buttonEl) {
    const isNowLiked = store.toggleWishlist(productId);
    if (buttonEl) {
      buttonEl.classList.toggle('active', isNowLiked);
      const svg = buttonEl.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', isNowLiked ? '#c82333' : 'none');
      }
    }
  }

  updateWishlistBadges() {
    this.renderHeaderBadges();
    // Also re-render wishlist modal if open
    const modal = document.getElementById('wishlist-modal');
    if (modal && modal.classList.contains('active')) {
      this.renderWishlistModalContent();
    }
  }

  // --- QUICK VIEW MODAL ---

  openQuickView(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    this.qvProductId = productId;
    this.qvWeightIdx = this.cardSelectedWeights[productId] || 0;
    this.qvQuantity = 1;

    const modal = document.getElementById('quickview-modal');
    const content = document.getElementById('quickview-modal-content');
    if (!modal || !content) return;

    content.innerHTML = renderQuickViewModal(product, this.qvWeightIdx, this.qvQuantity);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeQuickView() {
    const modal = document.getElementById('quickview-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  switchQvImage(imgSrc, btnEl) {
    const mainImg = document.getElementById('qv-main-img');
    if (mainImg) mainImg.src = imgSrc;
    const thumbs = document.querySelectorAll('.qv-thumb-btn');
    thumbs.forEach((t) => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
  }

  onQvWeightChange(productId, weightIdx) {
    this.qvWeightIdx = weightIdx;
    this.cardSelectedWeights[productId] = weightIdx;
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const content = document.getElementById('quickview-modal-content');
    if (content) {
      content.innerHTML = renderQuickViewModal(product, this.qvWeightIdx, this.qvQuantity);
    }
  }

  changeQvQty(delta) {
    this.qvQuantity = Math.max(1, this.qvQuantity + delta);
    const qtyDisplay = document.getElementById('qv-qty-display');
    if (qtyDisplay) qtyDisplay.textContent = this.qvQuantity;
  }

  addQvToCart(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const weightObj = product.weights[this.qvWeightIdx] || product.weights[0];
    store.addToCart(product, weightObj, this.qvQuantity);
    this.closeQuickView();
    this.openCart();
  }

  buyNow(productId) {
    this.addQvToCart(productId);
    this.closeQuickView();
    this.openCheckout();
  }

  buyComboNow() {
    const combo = PRODUCTS.find((p) => p.id === 'laxmi-ultimate-combo');
    if (combo) {
      store.addToCart(combo, combo.weights[0], 1);
      this.openCart();
    }
  }

  checkDeliveryPin() {
    const input = document.getElementById('qv-pin-input');
    const feedback = document.getElementById('qv-pin-feedback');
    if (!input || !feedback) return;

    const result = store.checkPincode(input.value);
    if (result.valid) {
      feedback.className = 'pin-feedback-msg pin-success';
      feedback.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${result.message} (${result.region})</span>
      `;
    } else {
      feedback.className = 'pin-feedback-msg pin-error';
      feedback.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${result.message}</span>
      `;
    }
  }

  // --- CART DRAWER CONTROLS ---

  openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer && overlay) {
      this.updateCartDrawer();
      drawer.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  updateCartDrawer() {
    const body = document.getElementById('cart-drawer-body');
    if (body) {
      body.innerHTML = renderCartDrawerContent();
    }
  }

  updateCartQty(cartItemId, newQty) {
    store.updateCartQuantity(cartItemId, newQty);
  }

  removeFromCart(cartItemId) {
    store.removeFromCart(cartItemId);
  }

  applyCartCoupon() {
    const input = document.getElementById('cart-coupon-input');
    if (!input) return;
    const res = store.applyCoupon(input.value);
    if (!res.success) {
      store.showToast('Coupon Error', res.message, 'error');
    }
  }

  removeCoupon() {
    store.removeCoupon();
  }

  // --- WISHLIST MODAL ---

  openWishlist() {
    const modal = document.getElementById('wishlist-modal');
    if (!modal) return;
    this.renderWishlistModalContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeWishlist() {
    const modal = document.getElementById('wishlist-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  renderWishlistModalContent() {
    const body = document.getElementById('wishlist-modal-body');
    if (!body) return;

    if (store.wishlist.length === 0) {
      body.innerHTML = `
        <div class="empty-wishlist-view">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d48b10" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h3>Your Wishlist is Empty</h3>
          <p>Tap the heart icon on any pickle jar to save it here for later.</p>
          <button type="button" class="btn-primary" onclick="window.app.closeWishlist(); window.app.navigateToSection('shop')">Explore Shop</button>
        </div>
      `;
      return;
    }

    const items = PRODUCTS.filter((p) => store.wishlist.includes(p.id));

    body.innerHTML = `
      <div class="wishlist-grid">
        ${items
        .map(
          (p) => `
          <div class="wishlist-item-card">
            <img src="${getImageUrl(p.image)}" alt="${p.name}" class="wish-thumb" onerror="this.onerror=null; this.src='/assets/images/hero-pickle.jpg';" />
            <div class="wish-info">
              <h4>${p.name}</h4>
              <p class="wish-price">Starting from ₹${p.weights[0].price}</p>
              <div class="wish-actions">
                <button type="button" class="btn-move-cart" onclick="window.app.moveWishlistToCart('${p.id}')">
                  Move to Cart
                </button>
                <button type="button" class="btn-remove-wish" onclick="window.app.toggleWishlist('${p.id}')">
                  Remove
                </button>
              </div>
            </div>
          </div>
        `
        )
        .join('')}
      </div>
    `;
  }

  moveWishlistToCart(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    store.addToCart(product, product.weights[0], 1);
    store.toggleWishlist(productId);
    this.renderWishlistModalContent();
  }

  // --- CHECKOUT EXPERIENCE ---

  openCheckout() {
    this.closeCart();
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    if (store.cart.length === 0) {
      store.showToast('Cart is Empty', 'Please add pickles before proceeding to checkout.', 'error');
      return;
    }

    this.renderCheckoutModalContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  renderCheckoutModalContent() {
    const body = document.getElementById('checkout-modal-body');
    if (!body) return;

    const totals = store.getCartTotals();
    const user = store.user;

    body.innerHTML = `
      <form id="checkout-form" class="checkout-form-grid" onsubmit="window.app.handleCheckoutSubmit(event)">
        <!-- Left: Form Sections -->
        <div class="checkout-form-steps">
          <!-- Step 1: Contact Details -->
          <div class="checkout-step-card">
            <div class="step-header">
              <span class="step-badge">1</span>
              <h3>Contact Information</h3>
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>Full Name *</label>
                <input type="text" name="name" required placeholder="e.g. Anjali Verma" value="${user ? user.name : ''}" />
              </div>
              <div class="form-group half">
                <label>Mobile Number (for delivery SMS) *</label>
                <input type="tel" name="phone" required placeholder="10-digit number" pattern="[0-9]{10}" value="${user && user.phone ? user.phone.replace('+91 ', '') : ''}" />
              </div>
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" required placeholder="e.g. anjali@example.com" value="${user ? user.email : ''}" />
            </div>
          </div>

          <!-- Step 2: Shipping Address -->
          <div class="checkout-step-card">
            <div class="step-header">
              <span class="step-badge">2</span>
              <h3>Delivery Address</h3>
            </div>
            <div class="form-group">
              <label>House / Flat / Office No., Floor & Building Name *</label>
              <input type="text" name="address1" required placeholder="Flat 402, Heritage Residency" />
            </div>
            <div class="form-group">
              <label>Street / Area / Locality *</label>
              <input type="text" name="address2" required placeholder="Sector 14, Near City Mall" />
            </div>
            <div class="form-row">
              <div class="form-group third">
                <label>City *</label>
                <input type="text" name="city" required placeholder="New Delhi" />
              </div>
              <div class="form-group third">
                <label>State *</label>
                <select name="state" required>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Punjab">Punjab</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Other">Other State</option>
                </select>
              </div>
              <div class="form-group third">
                <label>PIN Code *</label>
                <input type="text" name="pincode" required placeholder="110001" pattern="[0-9]{6}" maxlength="6" />
              </div>
            </div>
          </div>

          <!-- Step 3: Payment Options -->
          <div class="checkout-step-card">
            <div class="step-header">
              <span class="step-badge">3</span>
              <h3>Payment Method</h3>
            </div>
            <div class="payment-methods-stack">
              <label class="payment-opt-card">
                <input type="radio" name="paymentMethod" value="UPI" checked />
                <div class="opt-content">
                  <div class="opt-title-row">
                    <span class="opt-name">Instant UPI (GPay, PhonePe, Paytm, BHIM)</span>
                    <span class="opt-badge">⚡ Fastest</span>
                  </div>
                  <span class="opt-desc">Pay directly via any UPI App or QR scan</span>
                </div>
              </label>

              <label class="payment-opt-card">
                <input type="radio" name="paymentMethod" value="Cards" />
                <div class="opt-content">
                  <div class="opt-title-row">
                    <span class="opt-name">Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                  </div>
                  <span class="opt-desc">Secure 128-bit encrypted bank gateway</span>
                </div>
              </label>

              <label class="payment-opt-card">
                <input type="radio" name="paymentMethod" value="NetBanking" />
                <div class="opt-content">
                  <div class="opt-title-row">
                    <span class="opt-name">Net Banking (All Indian Banks)</span>
                  </div>
                  <span class="opt-desc">HDFC, SBI, ICICI, Axis, Kotak, PNB</span>
                </div>
              </label>

              <label class="payment-opt-card">
                <input type="radio" name="paymentMethod" value="COD" />
                <div class="opt-content">
                  <div class="opt-title-row">
                    <span class="opt-name">Cash on Delivery (COD)</span>
                  </div>
                  <span class="opt-desc">Pay cash when your pickle package arrives</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="checkout-summary-column">
          <div class="checkout-summary-box">
            <h3>Order Summary (${store.getCartCount()} items)</h3>
            
            <div class="checkout-items-preview">
              ${store.cart
        .map(
          (item) => `
                <div class="checkout-item-line">
                  <img src="${getImageUrl(item.image)}" alt="${item.name}" onerror="this.onerror=null; this.src='/assets/images/hero-pickle.jpg';" />
                  <div class="co-item-info">
                    <span class="co-name">${item.name}</span>
                    <span class="co-meta">${item.weight} × ${item.quantity}</span>
                  </div>
                  <span class="co-price">₹${item.price * item.quantity}</span>
                </div>
              `
        )
        .join('')}
            </div>

            <div class="summary-breakdown">
              <div class="s-row"><span>Subtotal</span><span>₹${totals.subtotal}</span></div>
              ${totals.productSavings > 0 ? `<div class="s-row s-green"><span>Total Savings</span><span>- ₹${totals.productSavings}</span></div>` : ''}
              ${totals.couponDiscount > 0 ? `<div class="s-row s-green"><span>Promo (${store.activeCoupon.code})</span><span>- ₹${totals.couponDiscount}</span></div>` : ''}
              <div class="s-row"><span>Delivery</span><span>${totals.delivery === 0 ? '<strong style="color:#2c5a2e;">FREE</strong>' : `₹${totals.delivery}`}</span></div>
              <div class="s-total-row"><span>Payable Amount</span><span>₹${totals.grandTotal}</span></div>
            </div>

            <button type="submit" class="btn-place-order">
              Place Order • ₹${totals.grandTotal}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>

            <div class="security-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2c5a2e" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>100% Safe & Tamper-Proof Hygienic Packaging Guaranteed</span>
            </div>
          </div>
        </div>
      </form>
    `;
  }

  handleCheckoutSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const address = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address1: formData.get('address1'),
      address2: formData.get('address2'),
      city: formData.get('city'),
      state: formData.get('state'),
      pincode: formData.get('pincode')
    };

    const paymentMethod = formData.get('paymentMethod');

    // Create confirmed order in store
    const confirmedOrder = store.createOrder({ address, paymentMethod });
    this.closeCheckout();
    this.showOrderConfirmation(confirmedOrder);
  }

  showOrderConfirmation(order) {
    const modal = document.getElementById('order-success-modal');
    const content = document.getElementById('order-success-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="order-celebration">
        <div class="check-animation-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2c5a2e" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <span class="sub-greetings">बधाई हो! Order Successfully Placed</span>
        <h2 class="success-title">Thank You For Your Order!</h2>
        <p class="order-id-tag">Order ID: <strong>#${order.orderId}</strong></p>
        
        <div class="delivery-eta-card">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d48b10" stroke-width="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <div class="eta-text">
            <h4>Estimated Delivery: 3 to 4 Business Days</h4>
            <p>We are hand-packing your fresh achar jar right now. You will receive live SMS updates at <strong>${order.shippingAddress.phone}</strong>.</p>
          </div>
        </div>

        <div class="confirmed-summary-box">
          <h4>Order Details</h4>
          <p><strong>Shipping to:</strong> ${order.shippingAddress.name}, ${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Amount Paid:</strong> ₹${order.totals.grandTotal}</p>
        </div>

        <button type="button" class="btn-primary" onclick="window.app.closeOrderConfirmation(); window.app.navigateToSection('shop')">
          Continue Shopping
        </button>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeOrderConfirmation() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // --- USER AUTHENTICATION MODAL ---

  openAuth(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    this.renderAuthModalContent(tab);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeAuth() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  renderAuthModalContent(activeTab = 'login') {
    const body = document.getElementById('auth-modal-body');
    if (!body) return;

    if (store.user) {
      body.innerHTML = `
        <div class="user-account-card" style="text-align: center; padding: 1.5rem 0.5rem;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #96281b; color: #fff; font-size: 2rem; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 4px 12px rgba(150,40,27,0.25);">
            ${store.user.avatar || 'U'}
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #231f20; margin-bottom: 0.25rem;">
            ${store.user.name}
          </h3>
          <p style="color: #666; font-size: 0.95rem; margin-bottom: 0.35rem;">${store.user.email}</p>
          <p style="color: #888; font-size: 0.85rem; margin-bottom: 1.5rem;">
            ${store.user.phone || '+91 98765 43210'} • <span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-weight: 600;">${store.user.role || 'CUSTOMER'}</span>
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn-primary" style="padding: 0.75rem 1.5rem; font-size: 0.95rem;" onclick="window.app.closeAuth(); window.app.navigateToSection('shop')">
              Explore Achar Shop
            </button>
            <button type="button" class="btn-secondary" style="padding: 0.75rem 1.5rem; font-size: 0.95rem; background: #fff; border: 1.5px solid #d48b10; color: #96281b; border-radius: 8px; cursor: pointer; font-weight: 600;" onclick="window.store.logoutUser(); window.app.closeAuth();">
              Sign Out
            </button>
          </div>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="auth-tabs-row">
        <button type="button" class="auth-tab-btn ${activeTab === 'login' ? 'active' : ''}" onclick="window.app.renderAuthModalContent('login')">
          Sign In
        </button>
        <button type="button" class="auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}" onclick="window.app.renderAuthModalContent('signup')">
          Create Account
        </button>
      </div>

      ${activeTab === 'login'
        ? `
        <form class="auth-form" onsubmit="window.app.handleLoginSubmit(event)">
          <div class="form-group">
            <label>Email Address or Mobile Number</label>
            <input type="text" id="login-email" required placeholder="name@example.com or 10-digit mobile" />
          </div>
          <div class="form-group">
            <div class="label-row-between">
              <label>Password</label>
              <a href="javascript:void(0)" class="link-forgot" onclick="store.showToast('Password Reset', 'Password reset instructions sent to your email.', 'info')">Forgot Password?</a>
            </div>
            <input type="password" id="login-password" required placeholder="Enter your password" />
          </div>
          
          <button type="submit" class="btn-auth-submit">
            Sign In to LAXMI
          </button>

          <div class="auth-divider"><span>OR</span></div>

          <button type="button" class="btn-google-auth" onclick="window.app.mockGoogleAuth()">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Continue with Google
          </button>
        </form>
      `
        : `
        <form class="auth-form" onsubmit="window.app.handleSignupSubmit(event)">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="reg-name" required placeholder="e.g. Rameshwar Gupta" />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="reg-email" required placeholder="name@example.com" />
          </div>
          <div class="form-group">
            <label>Mobile Number</label>
            <input type="tel" id="reg-phone" required placeholder="9876543210" pattern="[0-9]{10}" />
          </div>
          <div class="form-group">
            <label>Create Password</label>
            <input type="password" id="reg-password" required minlength="6" placeholder="At least 6 characters" />
          </div>

          <button type="submit" class="btn-auth-submit">
            Create Free Account
          </button>

          <div class="auth-divider"><span>OR</span></div>

          <button type="button" class="btn-google-auth" onclick="window.app.mockGoogleAuth()">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Continue with Google
          </button>
        </form>
      `
      }
    `;
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('.btn-auth-submit');
    const originalText = submitBtn ? submitBtn.textContent : 'Sign In';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing In...';
    }

    const res = await store.loginUser({ email, password });
    if (res?.success) {
      this.closeAuth();
    } else {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  async handleSignupSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const submitBtn = e.target.querySelector('.btn-auth-submit');
    const originalText = submitBtn ? submitBtn.textContent : 'Create Free Account';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';
    }

    const res = await store.registerUser({ name, email, phone, password });
    if (res?.success) {
      this.closeAuth();
    } else {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  mockGoogleAuth() {
    store.loginUser({
      name: 'Aditi Sharma',
      email: 'aditi.sharma@gmail.com',
      phone: '+91 98112 34567'
    });
    this.closeAuth();
  }

  updateUserNav() {
    const userBtn = document.getElementById('btn-nav-account');
    if (!userBtn) return;

    if (store.user) {
      userBtn.innerHTML = `
        <span class="nav-avatar-pill" title="Signed in as ${store.user.name}">
          ${store.user.avatar}
        </span>
      `;
    } else {
      userBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
    }
  }

  // --- NAVIGATION & ROUTING ---

  setupEventListeners() {
    // Search input live handler
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value;
        this.renderShopProducts();
      });
    }

    // Price range slider
    const priceRange = document.getElementById('price-range-slider');
    const priceValEl = document.getElementById('price-range-val');
    if (priceRange && priceValEl) {
      priceRange.addEventListener('input', (e) => {
        this.currentMaxPrice = parseInt(e.target.value, 10);
        priceValEl.textContent = `₹${this.currentMaxPrice}`;
        this.renderShopProducts();
      });
    }

    // Sort selector
    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSortBy = e.target.value;
        this.renderShopProducts();
      });
    }

    // Spice filter pills
    const spicePills = document.querySelectorAll('.spice-filter-btn');
    spicePills.forEach((btn) => {
      btn.addEventListener('click', () => {
        spicePills.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSpiceFilter = btn.dataset.spice || 'all';
        this.renderShopProducts();
      });
    });

    // Category filter pills in Shop Page
    const catPills = document.querySelectorAll('.category-filter-btn');
    catPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        catPills.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategoryFilter = btn.dataset.category || 'all';
        this.renderShopProducts();
      });
    });

    // Mobile nav drawer toggle
    const hamburger = document.getElementById('btn-hamburger');
    const mobileMenu = document.getElementById('mobile-nav-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
      });
    }

    // Close overlays when clicking outside
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }

  filterByCategory(categoryId) {
    this.currentCategoryFilter = categoryId;
    const catPills = document.querySelectorAll('.category-filter-btn');
    catPills.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.category === categoryId);
    });
    this.renderShopProducts();
    this.navigateToSection('shop');
  }

  filterByRegional(regionName) {
    this.currentCategoryFilter = 'regional';
    const catPills = document.querySelectorAll('.category-filter-btn');
    catPills.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.category === 'regional');
    });
    this.renderShopProducts();
    this.navigateToSection('shop');
  }

  resetShopFilters() {
    this.currentCategoryFilter = 'all';
    this.currentSearchQuery = '';
    this.currentMaxPrice = 1000;
    this.currentSpiceFilter = 'all';
    this.currentSortBy = 'popular';

    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = '';

    const priceRange = document.getElementById('price-range-slider');
    const priceValEl = document.getElementById('price-range-val');
    if (priceRange) priceRange.value = 1000;
    if (priceValEl) priceValEl.textContent = '₹1000';

    const catPills = document.querySelectorAll('.category-filter-btn');
    catPills.forEach((b) => b.classList.toggle('active', b.dataset.category === 'all'));

    const spicePills = document.querySelectorAll('.spice-filter-btn');
    spicePills.forEach((b) => b.classList.toggle('active', b.dataset.spice === 'all'));

    this.renderShopProducts();
  }

  navigateToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    const mobileMenu = document.getElementById('mobile-nav-menu');
    if (mobileMenu) mobileMenu.classList.remove('open');
  }

  navigateToProduct(productId) {
    this.openQuickView(productId);
  }

  setupHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (hash === 'cart') this.openCart();
        else if (hash === 'wishlist') this.openWishlist();
        else if (hash === 'checkout') this.openCheckout();
        else if (hash.startsWith('product-')) {
          const pid = hash.replace('product-', '');
          this.openQuickView(pid);
        } else {
          this.navigateToSection(hash);
        }
      }
    });
  }

  async handleNewsletterSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('newsletter-email-input');
    if (!input || !input.value) return;

    try {
      await api.subscribeNewsletter(input.value.trim());
      store.showToast(
        'Subscribed!',
        `Welcome to LAXMI Parivaar! Use coupon "GHARKASWAD" for 10% off your first order.`,
        'success'
      );
      input.value = '';
    } catch (err) {
      store.showToast('Newsletter Info', err.message || 'Thank you for connecting with LAXMI!', 'info');
    }
  }
}

// Attach globally for inline event handlers
window.app = new App();
window.store = store;

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
