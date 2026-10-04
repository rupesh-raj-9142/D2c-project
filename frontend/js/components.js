// LAXMI Pickles - Reusable Component Generators
// High-fidelity UI templates for Products, Categories, Reviews, Drawers, Modals

import { store } from './store.js';
import { PRODUCTS } from './data.js';

// Safe image path resolver
export function getImageUrl(path) {
  if (!path) return 'assets/images/hero-pickle.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path.substring(1);
  return path;
}

// Helper for rendering star SVGs
export function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let starsHtml = '';

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += `<svg class="star-icon star-full" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
    } else if (i === fullStars && hasHalf) {
      starsHtml += `<svg class="star-icon star-half" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4zM22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24z"/></svg>`;
    } else {
      starsHtml += `<svg class="star-icon star-empty" viewBox="0 0 24 24"><path fill="currentColor" d="M22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`;
    }
  }

  return `<div class="stars-row" title="${rating} out of 5 stars">${starsHtml} <span class="rating-num">${rating}</span></div>`;
}

// 1. Product Card Component
export function renderProductCard(product, selectedWeightIdx = 0) {
  const currentWeightObj = product.weights[selectedWeightIdx] || product.weights[0];
  const isWishlisted = store.isInWishlist(product.id);
  const badge = product.badges && product.badges.length ? product.badges[0] : null;

  return `
    <article class="laxmi-product-card" data-product-id="${product.id}" data-selected-weight="${currentWeightObj.weight}">
      <div class="product-media">
        <div class="media-container" onclick="window.app.openQuickView('${product.id}')">
          <img src="${getImageUrl(product.image)}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='assets/images/hero-pickle.jpg';" />
          <div class="image-overlay-glow"></div>
        </div>

        ${badge ? `<span class="badge-pill badge-accent">${badge}</span>` : ''}

        <button type="button" class="btn-wishlist-toggle ${isWishlisted ? 'active' : ''}" 
                title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                onclick="window.app.toggleWishlist('${product.id}', this)"
                aria-label="Wishlist">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${isWishlisted ? '#c82333' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <button type="button" class="btn-quick-preview" onclick="window.app.openQuickView('${product.id}')" title="Quick View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Quick View
        </button>
      </div>

      <div class="product-info">
        <div class="product-rating-meta">
          ${renderStars(product.rating)}
          <span class="reviews-count">(${product.reviewsCount.toLocaleString()})</span>
        </div>

        <h3 class="product-title" onclick="window.app.navigateToProduct('${product.id}')">
          ${product.name}
        </h3>
        
        <p class="product-tagline">${product.tagline}</p>

        <!-- Weight Selection Pills -->
        <div class="weight-selector-row">
          <span class="weight-label">Weight:</span>
          <div class="weight-options-pills">
            ${product.weights
              .map(
                (w, idx) => `
                <button type="button" 
                        class="weight-pill ${idx === selectedWeightIdx ? 'active' : ''}" 
                        data-weight="${w.weight}"
                        data-price="${w.price}"
                        data-original="${w.originalPrice}"
                        data-discount="${w.discount}"
                        onclick="window.app.onProductCardWeightChange('${product.id}', ${idx}, this)">
                  ${w.weight}
                </button>
              `
              )
              .join('')}
          </div>
        </div>

        <!-- Price Section -->
        <div class="product-pricing">
          <div class="price-stack">
            <span class="currency-symbol">₹</span>
            <span class="current-price" id="price-${product.id}">${currentWeightObj.price}</span>
            ${
              currentWeightObj.originalPrice
                ? `<span class="mrp-price">₹${currentWeightObj.originalPrice}</span>
                   <span class="discount-tag">${currentWeightObj.discount}</span>`
                : ''
            }
          </div>
          <span class="tax-inclusive">Inclusive of all taxes</span>
        </div>

        <!-- Action Row -->
        <div class="card-action-row">
          <button type="button" class="btn-add-cart" onclick="window.app.addProductCardToCart('${product.id}')">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  `;
}

// 2. Category Card Component
export function renderCategoryCard(cat) {
  return `
    <div class="category-card" onclick="window.app.filterByCategory('${cat.id}')">
      <div class="category-media">
        <img src="${getImageUrl(cat.image)}" alt="${cat.name}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/hero-pickle.jpg';" />
        <div class="cat-tag-pill">${cat.tag}</div>
      </div>
      <div class="category-body">
        <span class="cat-hindi">${cat.hindi}</span>
        <h3 class="category-title">${cat.name}</h3>
        <p class="category-desc">${cat.shortDesc}</p>
        <button type="button" class="btn-cat-explore">
          Explore Pickles
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// 3. Customer Review Card Component
export function renderReviewCard(item) {
  return `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-avatar">${item.avatar}</div>
        <div class="reviewer-meta">
          <h4 class="reviewer-name">${item.name}</h4>
          <span class="reviewer-city">${item.city}</span>
        </div>
        <div class="verified-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Verified Buyer
        </div>
      </div>

      <div class="review-rating-row">
        ${renderStars(item.rating)}
        <span class="review-date">${item.date}</span>
      </div>

      <blockquote class="review-quote">
        “${item.review}”
      </blockquote>

      <div class="review-product-tag">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        Purchased: <strong>${item.product}</strong>
      </div>
    </div>
  `;
}

// 4. Regional Flavour Card
export function renderRegionalCard(card) {
  return `
    <div class="regional-card">
      <div class="regional-media">
        <img src="${getImageUrl(card.image)}" alt="${card.region}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/hero-pickle.jpg';" />
        <span class="region-badge">${card.region}</span>
        <span class="flavour-tag">${card.tag}</span>
      </div>
      <div class="regional-content">
        <h3 class="regional-title">${card.title}</h3>
        <p class="regional-desc">${card.desc}</p>
        <button type="button" class="btn-regional-action" onclick="window.app.filterByRegional('${card.region}')">
          Explore Flavours
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// 5. Instagram Feed Card
export function renderInstagramPost(post) {
  return `
    <div class="insta-post-card" onclick="window.open('https://instagram.com', '_blank')">
      <img src="${getImageUrl(post.image)}" alt="LAXMI Achar Story" loading="lazy" onerror="this.onerror=null; this.src='assets/images/hero-pickle.jpg';" />
      <div class="insta-overlay">
        <div class="insta-icons">
          <span class="insta-stat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ${post.likes.toLocaleString()}
          </span>
          <span class="insta-tag">@laxmipickles</span>
        </div>
        <p class="insta-caption">${post.caption}</p>
      </div>
    </div>
  `;
}

// 6. Cart Drawer Content
export function renderCartDrawerContent() {
  const cart = store.cart;
  const totals = store.getCartTotals();

  if (cart.length === 0) {
    return `
      <div class="cart-empty-state">
        <div class="empty-icon-wrap">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d48b10" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h3>Your Achar Cart is Empty</h3>
        <p>You haven’t added any delicious homemade pickles yet. Explore our bestselling jars!</p>
        <button type="button" class="btn-primary" onclick="window.app.closeCart(); window.app.navigateToSection('shop')">
          Explore Pickles
        </button>
      </div>
    `;
  }

  return `
    <!-- Free Delivery Progress Bar -->
    <div class="free-shipping-card">
      <div class="shipping-info-row">
        ${
          totals.isFreeDelivery
            ? `<span class="shipping-unlocked">🎉 You’ve unlocked <strong>FREE Delivery!</strong></span>`
            : `<span>Add <strong>₹${totals.freeDeliveryRemaining}</strong> more to unlock <strong>FREE Delivery</strong></span>`
        }
      </div>
      <div class="shipping-meter">
        <div class="shipping-fill" style="width: ${totals.freeDeliveryProgress}%;"></div>
      </div>
    </div>

    <!-- Cart Items Scroll -->
    <div class="cart-items-list">
      ${cart
        .map(
          (item) => `
        <div class="cart-item-row" data-cart-id="${item.cartItemId}">
          <img src="${getImageUrl(item.image)}" alt="${item.name}" class="cart-item-thumb" onerror="this.onerror=null; this.src='assets/images/hero-pickle.jpg';" />
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-meta">
              <span class="cart-item-weight">${item.weight}</span>
              <span class="cart-item-price">₹${item.price} each</span>
            </div>
            <div class="cart-qty-ctrls">
              <button type="button" class="btn-qty" onclick="window.app.updateCartQty('${item.cartItemId}', ${item.quantity - 1})">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button type="button" class="btn-qty" onclick="window.app.updateCartQty('${item.cartItemId}', ${item.quantity + 1})">+</button>
            </div>
          </div>
          <div class="cart-item-total">
            <span class="item-line-price">₹${item.price * item.quantity}</span>
            <button type="button" class="btn-remove-item" onclick="window.app.removeFromCart('${item.cartItemId}')" title="Remove Item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- Promo Coupon Section -->
    <div class="cart-coupon-box">
      ${
        store.activeCoupon
          ? `
          <div class="applied-coupon-row">
            <div class="coupon-tag-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span>Code <strong>${store.activeCoupon.code}</strong> Applied (${store.activeCoupon.label})</span>
            </div>
            <button type="button" class="btn-coupon-remove" onclick="window.app.removeCoupon()">Remove</button>
          </div>
        `
          : `
          <div class="coupon-input-group">
            <input type="text" id="cart-coupon-input" placeholder="Promo code (e.g. GHARKASWAD)" uppercase />
            <button type="button" class="btn-apply-coupon" onclick="window.app.applyCartCoupon()">Apply</button>
          </div>
          <div class="coupon-hints">Use code <strong>GHARKASWAD</strong> for 10% OFF | <strong>LAXMI50</strong> for ₹50 OFF</div>
        `
      }
    </div>

    <!-- Bill Breakdown Summary -->
    <div class="cart-bill-summary">
      <div class="bill-row">
        <span>Item Subtotal</span>
        <span>₹${totals.subtotal}</span>
      </div>
      ${
        totals.productSavings > 0
          ? `
        <div class="bill-row bill-savings">
          <span>MRP Discount</span>
          <span>- ₹${totals.productSavings}</span>
        </div>
      `
          : ''
      }
      ${
        totals.couponDiscount > 0
          ? `
        <div class="bill-row bill-discount">
          <span>Promo Code Discount</span>
          <span>- ₹${totals.couponDiscount}</span>
        </div>
      `
          : ''
      }
      <div class="bill-row">
        <span>Delivery Fee</span>
        <span>${totals.delivery === 0 ? '<span class="free-pill">FREE</span>' : `₹${totals.delivery}`}</span>
      </div>
      <div class="bill-row bill-grand-total">
        <span>Total Payable</span>
        <span>₹${totals.grandTotal}</span>
      </div>
    </div>

    <!-- Checkout Action Button -->
    <div class="cart-drawer-footer">
      <button type="button" class="btn-checkout-primary" onclick="window.app.openCheckout()">
        Proceed to Checkout • ₹${totals.grandTotal}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  `;
}

// 7. Quick View Modal Renderer
export function renderQuickViewModal(product, currentWeightIdx = 0, currentQty = 1) {
  const currentWeightObj = product.weights[currentWeightIdx] || product.weights[0];
  const isWishlisted = store.isInWishlist(product.id);

  return `
    <div class="quickview-grid">
      <!-- Media Gallery -->
      <div class="quickview-gallery">
        <div class="main-image-frame">
          <img src="${getImageUrl(product.gallery[0] || product.image)}" id="qv-main-img" alt="${product.name}" onerror="this.onerror=null; this.src='assets/images/hero-pickle.jpg';" />
          ${product.badges && product.badges.length ? `<span class="qv-badge">${product.badges[0]}</span>` : ''}
        </div>
        <div class="qv-thumbnails">
          ${(product.gallery || [product.image])
            .map(
              (img, i) => `
            <button type="button" class="qv-thumb-btn ${i === 0 ? 'active' : ''}" onclick="window.app.switchQvImage('${img}', this)">
              <img src="${getImageUrl(img)}" alt="Thumbnail ${i + 1}" onerror="this.onerror=null; this.src='assets/images/hero-pickle.jpg';" />
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Details Column -->
      <div class="quickview-details">
        <div class="qv-header">
          <span class="qv-sub-hindi">${product.hindiName}</span>
          <h2 class="qv-title">${product.name}</h2>
          
          <div class="qv-meta-row">
            ${renderStars(product.rating)}
            <span class="qv-reviews">(${product.reviewsCount.toLocaleString()} Verified Customer Reviews)</span>
            <span class="meta-separator">•</span>
            <span class="qv-spice-tag">${product.spiceLevel}</span>
          </div>
        </div>

        <div class="qv-price-box">
          <div class="qv-price-stack">
            <span class="qv-currency">₹</span>
            <span class="qv-price-val" id="qv-price-display">${currentWeightObj.price}</span>
            ${
              currentWeightObj.originalPrice
                ? `<span class="qv-mrp">₹${currentWeightObj.originalPrice}</span>
                   <span class="qv-discount">${currentWeightObj.discount}</span>`
                : ''
            }
          </div>
          <p class="qv-tax-note">Tax included • Free Shipping on orders above ₹499</p>
        </div>

        <!-- Weight Chooser -->
        <div class="qv-section">
          <label class="qv-label">Select Jar Size / Weight:</label>
          <div class="qv-weights-row">
            ${product.weights
              .map(
                (w, idx) => `
              <button type="button" class="qv-weight-btn ${idx === currentWeightIdx ? 'active' : ''}" 
                      onclick="window.app.onQvWeightChange('${product.id}', ${idx})">
                <span class="weight-title">${w.weight}</span>
                <span class="weight-price">₹${w.price}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Quantity & Cart Row -->
        <div class="qv-action-section">
          <div class="qv-qty-selector">
            <button type="button" class="qv-qty-btn" onclick="window.app.changeQvQty(-1)">-</button>
            <span class="qv-qty-number" id="qv-qty-display">${currentQty}</span>
            <button type="button" class="qv-qty-btn" onclick="window.app.changeQvQty(1)">+</button>
          </div>

          <button type="button" class="btn-qv-cart" onclick="window.app.addQvToCart('${product.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Add to Cart
          </button>

          <button type="button" class="btn-qv-buynow" onclick="window.app.buyNow('${product.id}')">
            Buy Now
          </button>

          <button type="button" class="btn-qv-wishlist ${isWishlisted ? 'active' : ''}" 
                  onclick="window.app.toggleWishlist('${product.id}', this)" title="Add to Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? '#c82333' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <!-- PIN Code Delivery Checker -->
        <div class="qv-pincode-box">
          <label for="qv-pin-input" class="pincode-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Check Delivery to your PIN Code:
          </label>
          <div class="pincode-input-group">
            <input type="text" id="qv-pin-input" placeholder="Enter 6-digit PIN (e.g. 110001)" maxlength="6" />
            <button type="button" class="btn-check-pin" onclick="window.app.checkDeliveryPin()">Check</button>
          </div>
          <div id="qv-pin-feedback" class="pin-feedback-msg"></div>
        </div>

        <!-- Information Tabs Accordion -->
        <div class="qv-accordion-section">
          <!-- Description Tab -->
          <details class="qv-accordion-item" open>
            <summary class="qv-accordion-header">
              <span>Authentic Description & Heritage</span>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="qv-accordion-body">
              <p>${product.description}</p>
              <div class="heritage-pillars">
                <span class="pillar">🌿 100% Homemade Taste</span>
                <span class="pillar">☀️ Sun-Cured Naturally</span>
                <span class="pillar">🏺 Glazed Barni Curing</span>
                <span class="pillar">🚫 Zero Artificial Vinegar</span>
              </div>
            </div>
          </details>

          <!-- Ingredients Tab -->
          <details class="qv-accordion-item">
            <summary class="qv-accordion-header">
              <span>Traditional Ingredients</span>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="qv-accordion-body">
              <ul class="ingredients-list">
                ${product.ingredients.map((ing) => `<li><span class="bullet-spice">✦</span> ${ing}</li>`).join('')}
              </ul>
            </div>
          </details>

          <!-- Nutrition Tab -->
          <details class="qv-accordion-item">
            <summary class="qv-accordion-header">
              <span>Nutrition Facts (${product.nutrition.servingSize})</span>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="qv-accordion-body">
              <table class="nutrition-table">
                <tbody>
                  <tr><td>Energy</td><td><strong>${product.nutrition.energy}</strong></td></tr>
                  <tr><td>Protein</td><td>${product.nutrition.protein}</td></tr>
                  <tr><td>Carbohydrates</td><td>${product.nutrition.carbs}</td></tr>
                  <tr><td>Good Fats (Mustard Oil)</td><td>${product.nutrition.fat}</td></tr>
                  <tr><td>Sodium</td><td>${product.nutrition.sodium}</td></tr>
                </tbody>
              </table>
            </div>
          </details>

          <!-- Storage Instructions -->
          <details class="qv-accordion-item">
            <summary class="qv-accordion-header">
              <span>Storage & Serving Instructions</span>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="qv-accordion-body">
              <p>${product.storage}</p>
              <p class="delivery-guarantee"><strong>Dispatch & Delivery:</strong> ${product.deliveryInfo}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  `;
}
