/* Good Dog — theme.js */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function formatMoney(cents) {
    var format = (window.themeSettings && window.themeSettings.moneyFormat) || '${{amount}}';
    var amount = (cents / 100).toFixed(2);
    return format
      .replace(/\{\{\s*amount\s*\}\}/, amount)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100).toString())
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, amount.replace('.', ','));
  }

  var overlay = qs('#PageOverlay');

  function openOverlay() {
    if (!overlay) return;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('is-visible');
    setTimeout(function () { overlay.hidden = true; }, 250);
  }

  function closeAllPanels() {
    qsa('.cart-drawer.is-open, .mobile-drawer.is-open').forEach(function (el) {
      el.classList.remove('is-open');
    });
    document.body.style.overflow = '';
    closeOverlay();
  }

  if (overlay) overlay.addEventListener('click', closeAllPanels);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllPanels();
  });

  function openPanel(panel) {
    if (!panel) return;
    panel.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    openOverlay();
  }

  /* ---------- Sticky header shadow ---------- */
  var header = qs('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-open-mobile-nav]');
    if (openBtn) { e.preventDefault(); openPanel(qs('#MobileDrawer')); }
    var closeBtn = e.target.closest('[data-close-panel]');
    if (closeBtn) { e.preventDefault(); closeAllPanels(); }
  });

  /* ---------- Search toggle ---------- */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-toggle-search]');
    if (!toggle) return;
    e.preventDefault();
    var bar = qs('#HeaderSearch');
    if (!bar) return;
    bar.hidden = !bar.hidden;
    if (!bar.hidden) {
      var input = qs('input[type="search"]', bar);
      if (input) input.focus();
    }
  });

  /* ---------- Quantity steppers (event delegation) ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-qty-change]');
    if (!btn) return;
    e.preventDefault();
    var input = qs('input', btn.closest('.quantity'));
    if (!input) return;
    var step = parseInt(btn.getAttribute('data-qty-change'), 10);
    var min = parseInt(input.min || '0', 10);
    var next = Math.max(min, (parseInt(input.value, 10) || 0) + step);
    input.value = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------- Cart drawer ---------- */
  var cartDrawerEnabled = document.body.getAttribute('data-cart-type') === 'drawer';

  function refreshCartDrawer(openAfter) {
    var section = qs('#shopify-section-cart-drawer');
    if (!section) return Promise.resolve();
    return fetch(window.routes.root + '?section_id=cart-drawer')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector('.cart-drawer');
        var current = qs('.cart-drawer', section);
        if (fresh && current) {
          var wasOpen = current.classList.contains('is-open');
          current.innerHTML = fresh.innerHTML;
          if (wasOpen || openAfter) {
            current.classList.add('is-open');
            if (openAfter) { document.body.style.overflow = 'hidden'; openOverlay(); }
          }
        }
      });
  }

  function updateCartCount() {
    return fetch(window.routes.root + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        qsa('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.setAttribute('data-count', cart.item_count);
        });
        return cart;
      });
  }

  document.addEventListener('click', function (e) {
    var openCart = e.target.closest('[data-open-cart]');
    if (!openCart || !cartDrawerEnabled) return;
    e.preventDefault();
    openPanel(qs('.cart-drawer'));
  });

  /* AJAX add to cart */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-ajax-cart]');
    if (!form || !cartDrawerEnabled) return;
    e.preventDefault();
    var submitBtn = qs('[type="submit"]', form);
    var originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.setAttribute('aria-disabled', 'true'); submitBtn.textContent = 'Adding…'; }

    fetch(window.routes.cartAdd + '.js', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data.description || 'Could not add to cart');
        return Promise.all([updateCartCount(), refreshCartDrawer(true)]);
      })
      .catch(function (err) {
        alert(err.message);
      })
      .then(function () {
        if (submitBtn) { submitBtn.removeAttribute('aria-disabled'); submitBtn.textContent = originalText; }
      });
  });

  /* Drawer line quantity change / remove */
  document.addEventListener('click', function (e) {
    var removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn && removeBtn.closest('.cart-drawer')) {
      e.preventDefault();
      changeLine(removeBtn.getAttribute('data-cart-remove'), 0);
    }
  });

  document.addEventListener('change', function (e) {
    var input = e.target.closest('.cart-drawer [data-cart-line-qty]');
    if (!input) return;
    changeLine(input.getAttribute('data-cart-line-qty'), parseInt(input.value, 10) || 0);
  });

  function changeLine(line, quantity) {
    fetch(window.routes.cartChange + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: parseInt(line, 10), quantity: quantity })
    })
      .then(function () { return Promise.all([updateCartCount(), refreshCartDrawer(false)]); });
  }

  /* ---------- Product page: variant picker ---------- */
  qsa('[data-product-form-wrapper]').forEach(function (wrapper) {
    var dataEl = qs('[data-variant-json]', wrapper);
    if (!dataEl) return;
    var variants;
    try { variants = JSON.parse(dataEl.textContent); } catch (err) { return; }

    var idInput = qs('input[name="id"]', wrapper);
    var priceEl = qs('[data-product-price]', wrapper);
    var buyBtn = qs('[data-add-to-cart]', wrapper);
    var buyBtnText = qs('[data-add-to-cart-text]', wrapper) || buyBtn;
    var mainImage = qs('[data-main-image]', wrapper.closest('.product-page') || document);

    function selectedOptions() {
      return qsa('.option-group', wrapper).map(function (group) {
        var checked = qs('input:checked', group);
        return checked ? checked.value : null;
      });
    }

    function findVariant(options) {
      return variants.find(function (v) {
        return v.options.every(function (opt, i) { return opt === options[i]; });
      });
    }

    function onChange() {
      var variant = findVariant(selectedOptions());
      qsa('.option-group', wrapper).forEach(function (group) {
        var label = qs('[data-selected-value]', group);
        var checked = qs('input:checked', group);
        if (label && checked) label.textContent = checked.value;
      });
      if (!variant) {
        if (buyBtn) { buyBtn.setAttribute('disabled', ''); buyBtnText.textContent = 'Unavailable'; }
        return;
      }
      if (idInput) idInput.value = variant.id;
      if (priceEl) {
        var html = '';
        if (variant.compare_at_price > variant.price) {
          html = '<span class="price__sale">' + formatMoney(variant.price) + '</span> ' +
                 '<s class="price__compare">' + formatMoney(variant.compare_at_price) + '</s>';
        } else {
          html = '<span>' + formatMoney(variant.price) + '</span>';
        }
        priceEl.innerHTML = html;
      }
      if (buyBtn) {
        if (variant.available) {
          buyBtn.removeAttribute('disabled');
          buyBtnText.textContent = buyBtn.getAttribute('data-add-label') || 'Add to cart';
        } else {
          buyBtn.setAttribute('disabled', '');
          buyBtnText.textContent = 'Sold out';
        }
      }
      if (variant.featured_image && mainImage) {
        mainImage.src = variant.featured_image.src;
        if (variant.featured_image.srcset) {
          mainImage.srcset = variant.featured_image.srcset;
        } else {
          mainImage.removeAttribute('srcset');
        }
        if (variant.featured_image.alt) mainImage.alt = variant.featured_image.alt;
        qsa('.product-gallery__thumb').forEach(function (t) {
          t.classList.toggle('is-active', t.getAttribute('data-thumb') === variant.featured_image.src);
        });
      }
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }

    wrapper.addEventListener('change', function (e) {
      if (e.target.matches('.option-pill input')) onChange();
    });
  });

  /* ---------- Product gallery thumbs ---------- */
  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('[data-thumb]');
    if (!thumb) return;
    e.preventDefault();
    var gallery = thumb.closest('.product-gallery');
    var main = qs('[data-main-image]', gallery);
    if (!main) return;
    main.src = thumb.getAttribute('data-thumb');
    var thumbSrcset = thumb.getAttribute('data-thumb-srcset');
    if (thumbSrcset) {
      main.srcset = thumbSrcset;
    } else {
      main.removeAttribute('srcset');
    }
    main.alt = thumb.getAttribute('data-thumb-alt') || '';
    qsa('.product-gallery__thumb', gallery).forEach(function (t) { t.classList.remove('is-active'); });
    thumb.classList.add('is-active');
  });

  /* ---------- Collection sort ---------- */
  document.addEventListener('change', function (e) {
    var select = e.target.closest('[data-sort-by]');
    if (!select) return;
    var url = new URL(window.location.href);
    url.searchParams.set('sort_by', select.value);
    url.searchParams.delete('page');
    window.location.href = url.toString();
  });
})();
