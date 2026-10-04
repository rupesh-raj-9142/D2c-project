// LAXMI Pickles - Reactive State Management & Storage
// Persistent Cart, Wishlist, User Sessions, and Order Records

import { PRODUCTS } from './data.js';

class Store {
  constructor() {
    this.STORAGE_KEY_CART = 'laxmi_pickle_cart_v1';
    this.STORAGE_KEY_WISHLIST = 'laxmi_pickle_wishlist_v1';
    this.STORAGE_KEY_USER = 'laxmi_pickle_user_v1';
    this.STORAGE_KEY_ORDERS = 'laxmi_pickle_orders_v1';

    this.cart = this.loadFromStorage(this.STORAGE_KEY_CART, []);
    this.wishlist = this.loadFromStorage(this.STORAGE_KEY_WISHLIST, []);
    this.user = this.loadFromStorage(this.STORAGE_KEY_USER, null);
    this.orders = this.loadFromStorage(this.STORAGE_KEY_ORDERS, []);
    this.activeCoupon = null;
    this.shippingThreshold = 499;
    this.standardShippingFee = 50;

    this.listeners = new Set();
  }

  loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('LocalStorage access error:', e);
      return fallback;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, payload, this);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }

  // --- CART OPERATIONS ---
  addToCart(product, weightObj, quantity = 1) {
    const cartItemId = `${product.id}-${weightObj.weight}`;
    const existingIndex = this.cart.findIndex((item) => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        hindiName: product.hindiName,
        weight: weightObj.weight,
        price: weightObj.price,
        originalPrice: weightObj.originalPrice,
        image: product.image,
        quantity: quantity
      });
    }

    this.saveToStorage(this.STORAGE_KEY_CART, this.cart);
    this.notify('cart_updated', { cart: this.cart, addedItem: product });
    this.showToast(
      'Added to Cart!',
      `${product.name} (${weightObj.weight}) added successfully.`,
      'success'
    );
  }

  updateCartQuantity(cartItemId, newQty) {
    const index = this.cart.findIndex((item) => item.cartItemId === cartItemId);
    if (index === -1) return;

    if (newQty <= 0) {
      this.removeFromCart(cartItemId);
      return;
    }

    this.cart[index].quantity = newQty;
    this.saveToStorage(this.STORAGE_KEY_CART, this.cart);
    this.notify('cart_updated', { cart: this.cart });
  }

  removeFromCart(cartItemId) {
    const item = this.cart.find((i) => i.cartItemId === cartItemId);
    this.cart = this.cart.filter((i) => i.cartItemId !== cartItemId);
    this.saveToStorage(this.STORAGE_KEY_CART, this.cart);
    this.notify('cart_updated', { cart: this.cart });
    if (item) {
      this.showToast('Item Removed', `${item.name} removed from your cart.`, 'info');
    }
  }

  clearCart() {
    this.cart = [];
    this.saveToStorage(this.STORAGE_KEY_CART, this.cart);
    this.notify('cart_updated', { cart: this.cart });
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const mrpTotal = this.cart.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
      0
    );
    const productSavings = Math.max(0, mrpTotal - subtotal);

    let couponDiscount = 0;
    if (this.activeCoupon) {
      if (this.activeCoupon.type === 'percent') {
        couponDiscount = Math.round((subtotal * this.activeCoupon.value) / 100);
      } else if (this.activeCoupon.type === 'flat') {
        couponDiscount = Math.min(subtotal, this.activeCoupon.value);
      }
    }

    const freeDeliveryRemaining = Math.max(0, this.shippingThreshold - subtotal);
    const freeDeliveryProgress = Math.min(100, Math.round((subtotal / this.shippingThreshold) * 100));
    const delivery = subtotal >= this.shippingThreshold || subtotal === 0 ? 0 : this.standardShippingFee;
    const grandTotal = Math.max(0, subtotal - couponDiscount + delivery);

    return {
      subtotal,
      mrpTotal,
      productSavings,
      couponDiscount,
      delivery,
      grandTotal,
      freeDeliveryRemaining,
      freeDeliveryProgress,
      isFreeDelivery: delivery === 0 && subtotal > 0
    };
  }

  applyCoupon(code) {
    const normalized = (code || '').trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    if (normalized === 'GHARKASWAD' || normalized === 'FIRST10') {
      this.activeCoupon = { code: normalized, type: 'percent', value: 10, label: '10% Extra Off' };
      this.notify('coupon_applied', { coupon: this.activeCoupon });
      this.showToast('Coupon Applied!', '10% discount applied to your order.', 'success');
      return { success: true, message: '10% discount applied successfully!' };
    } else if (normalized === 'LAXMI50') {
      this.activeCoupon = { code: normalized, type: 'flat', value: 50, label: '₹50 Flat Off' };
      this.notify('coupon_applied', { coupon: this.activeCoupon });
      this.showToast('Coupon Applied!', '₹50 discount applied to your order.', 'success');
      return { success: true, message: '₹50 flat discount applied!' };
    } else {
      return { success: false, message: 'Invalid coupon code. Try GHARKASWAD or LAXMI50' };
    }
  }

  removeCoupon() {
    this.activeCoupon = null;
    this.notify('coupon_removed', null);
    this.showToast('Coupon Removed', 'Promo code removed from your order.', 'info');
  }

  // --- WISHLIST OPERATIONS ---
  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    const product = PRODUCTS.find((p) => p.id === productId);
    const name = product ? product.name : 'Item';

    if (index > -1) {
      this.wishlist.splice(index, 1);
      this.saveToStorage(this.STORAGE_KEY_WISHLIST, this.wishlist);
      this.notify('wishlist_updated', { wishlist: this.wishlist, productId, added: false });
      this.showToast('Removed from Wishlist', `${name} was removed from your wishlist.`, 'info');
      return false;
    } else {
      this.wishlist.push(productId);
      this.saveToStorage(this.STORAGE_KEY_WISHLIST, this.wishlist);
      this.notify('wishlist_updated', { wishlist: this.wishlist, productId, added: true });
      this.showToast('Saved to Wishlist!', `Added ${name} to your wishlist.`, 'success');
      return true;
    }
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  // --- PINCODE CHECKER ---
  checkPincode(pincode) {
    const pin = (pincode || '').trim();
    if (!/^\d{6}$/.test(pin)) {
      return {
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      };
    }

    // Realistic delivery simulation based on Indian postal zones
    const firstDigit = pin.charAt(0);
    const zoneMap = {
      '1': { region: 'North Zone (Delhi, Punjab, Haryana)', days: '2-3 Business Days' },
      '2': { region: 'North Zone (UP, Uttarakhand)', days: '2-3 Business Days' },
      '3': { region: 'West Zone (Rajasthan, Gujarat)', days: '3-4 Business Days' },
      '4': { region: 'West Zone (Maharashtra, Goa)', days: '3-4 Business Days' },
      '5': { region: 'South Zone (Andhra, Telangana, Karnataka)', days: '3-4 Business Days' },
      '6': { region: 'South Zone (Kerala, Tamil Nadu)', days: '3-5 Business Days' },
      '7': { region: 'East Zone (West Bengal, Odisha, North East)', days: '4-5 Business Days' },
      '8': { region: 'East Zone (Bihar, Jharkhand)', days: '3-4 Business Days' }
    };

    const zone = zoneMap[firstDigit] || { region: 'India Wide Express', days: '3-5 Business Days' };

    return {
      valid: true,
      pin,
      region: zone.region,
      days: zone.days,
      codAvailable: true,
      freeShippingEligible: true,
      message: `Delivery available in ${zone.days}! Cash on Delivery available.`
    };
  }

  // --- USER AUTHENTICATION ---
  loginUser(userData) {
    this.user = {
      name: userData.name || 'Gourmet Patron',
      email: userData.email,
      phone: userData.phone || '+91 98765 43210',
      avatar: (userData.name || 'G').charAt(0).toUpperCase(),
      joinedDate: 'October 2026'
    };
    this.saveToStorage(this.STORAGE_KEY_USER, this.user);
    this.notify('user_updated', { user: this.user });
    this.showToast('Welcome Back!', `Signed in as ${this.user.name}`, 'success');
  }

  logoutUser() {
    this.user = null;
    localStorage.removeItem(this.STORAGE_KEY_USER);
    this.notify('user_updated', { user: null });
    this.showToast('Logged Out', 'You have been safely signed out.', 'info');
  }

  // --- ORDERS ---
  createOrder(orderData) {
    const orderId = `LXMI-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: [...this.cart],
      totals: this.getCartTotals(),
      shippingAddress: orderData.address,
      paymentMethod: orderData.paymentMethod,
      status: 'Confirmed - Preparing in Kitchen'
    };

    this.orders.unshift(newOrder);
    this.saveToStorage(this.STORAGE_KEY_ORDERS, this.orders);
    this.clearCart();
    this.notify('order_created', { order: newOrder });
    return newOrder;
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `laxmi-toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'info') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-body">
        <h4 class="toast-title">${title}</h4>
        <p class="toast-desc">${message}</p>
      </div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.isConnected) {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 250);
      }
    }, 4000);
  }
}

export const store = new Store();
