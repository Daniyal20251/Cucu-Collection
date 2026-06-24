document.addEventListener("DOMContentLoaded", async () => {

  // ─── Elements ──────────────────────────────────────────────────
  const container               = document.getElementById("itemContainer");
  const containerRest           = document.getElementById("itemContainerRest");
  const skeletonContainer       = document.getElementById("skeletonContainer");
  const flashSaleContainer      = document.getElementById("flashSaleContainer");
  const flashSaleBox            = document.getElementById("flashSaleBox");
  const recentlyViewedBox       = document.getElementById("recentlyViewedBox");
  const recentlyViewedContainer = document.getElementById("recentlyViewedContainer");
  const searchInput             = document.getElementById("searchInput");
  const searchPanel             = document.getElementById("searchPanel");
  const recentSearchesList      = document.getElementById("recentSearches");
  const clearHistoryBtn         = document.getElementById("clearHistoryBtn");
  const swiperWrapper           = document.getElementById("swiperWrapper");
  const adSlider                = document.getElementById("adSlider");
  const adsSkeleton             = document.getElementById("adsSkeleton");
  const suggestionsDropdown     = document.getElementById("suggestionsDropdown");
  const searchClearBtn          = document.getElementById("searchClearBtn");
  const allProductsHeader       = document.getElementById("allProductsHeader");
  const sellerNameEl            = document.getElementById("sellerName");
  const sellerLogoEl            = document.getElementById("sellerLogo");

  let allProducts   = [];
  let swiperInstance = null;

  // ─── Config ────────────────────────────────────────────────────
  const API_BASE = "https://delight-backend--araindaniyalo2.replit.app";

  const STORE_CONFIG = {
    phone: "03352166725",
    name: "Cucu-collection",
    logo: "Store icons/Cucu.png"
  };

  const AD_NAMES = [
    "Cucu-collection",
    "Cucu-collection1",
    "Cucu-collection2",
    "Cucu-collection3",
    "Cucu-collection4",
    "Cucu-collection5",
    "Cucu-collection6"
  ];

  // ─── Helpers ───────────────────────────────────────────────────
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showProductsSkeleton() {
    if (skeletonContainer) skeletonContainer.style.display = "grid";
    if (container) container.style.display = "none";
    if (allProductsHeader) allProductsHeader.style.display = "none";
  }

  function hideProductsSkeleton() {
    if (skeletonContainer) skeletonContainer.style.display = "none";
    if (container) container.style.display = "grid";
    if (containerRest) containerRest.style.display = "grid";
    if (allProductsHeader) allProductsHeader.style.display = "flex";
  }

  function showAdsSkeleton() {
    if (adsSkeleton) adsSkeleton.style.display = "block";
    if (adSlider) adSlider.style.display = "none";
  }

  function hideAdsSkeleton() {
    if (adsSkeleton) adsSkeleton.style.display = "none";
  }

  async function incrementView(productId) {
    try {
      await fetch(`${API_BASE}/products/${productId}/view`, { method: "POST" });
    } catch (e) {}
  }

  // ─── RECENTLY VIEWED ───────────────────────────────────────────
  function getRecentlyViewed() {
    try { return JSON.parse(localStorage.getItem("recentlyViewed_store") || "[]"); }
    catch { return []; }
  }

  function addToRecentlyViewed(product) {
    let list = getRecentlyViewed();
    list = list.filter(p => p.id !== product.id);
    list.unshift(product);
    if (list.length > 20) list = list.slice(0, 20);
    localStorage.setItem("recentlyViewed_store", JSON.stringify(list));
  }

  function renderRecentlyViewed() {
    if (!recentlyViewedContainer || !recentlyViewedBox) return;
    const list = getRecentlyViewed();
    if (!list.length) { recentlyViewedBox.style.display = "none"; return; }

    recentlyViewedBox.style.display = "block";

    // Update count badge
    const countBadge = document.getElementById("rvCountBadge");
    if (countBadge) {
      countBadge.textContent = list.length;
      countBadge.classList.add("show");
    }

    recentlyViewedContainer.innerHTML = list.map((product, i) => {
      const basePrice  = parseInt((product.price || "0").toString().replace(/[^\d]/g, "")) || 0;
      const discount   = parseInt((product.discount || "0").toString().replace(/[^\d]/g, "")) || 0;
      const finalPrice = product.finalPrice || (basePrice - discount);
      const img = product.images?.[0] || product.image || 'https://via.placeholder.com/150';
      return `
        <div class="rv-card-new" style="animation-delay:${i * 60}ms">
          <div class="rv-viewed-dot"></div>
          <img src="${img}" alt="${product.title || ''}" loading="lazy">
          <div class="rv-card-body">
            <div class="rv-card-title">${product.title || ''}</div>
            <div>
              <span class="rv-price">Rs. ${finalPrice}</span>
              ${basePrice && discount > 0 ? `<span class="rv-old-price">Rs. ${basePrice}</span>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    // Safe click events
    recentlyViewedContainer.querySelectorAll('.rv-card-new').forEach((card, idx) => {
      card.addEventListener('click', () => {
        const product = list[idx];
        if (!product) return;
        addToRecentlyViewed(product);
        localStorage.setItem("selectedItem", JSON.stringify(product));
        window.location.href = "Stores itemDetails.html";
      });
    });

    // Clear button
    const rvClearBtn = document.getElementById("rvClearBtn");
    if (rvClearBtn) {
      rvClearBtn.onclick = () => {
        localStorage.removeItem("recentlyViewed_store");
        recentlyViewedBox.style.display = "none";
      };
    }
  }

  window.openProduct = function(jsonStr) {
    try {
      const product = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      addToRecentlyViewed(product);
      localStorage.setItem("selectedItem", JSON.stringify(product));
      window.location.href = "Stores itemDetails.html";
    } catch(e) { console.error(e); }
  };

  // ─── SEARCH ENGINE ─────────────────────────────────────────────
  const CATEGORY_MAP = {
    "Men Fashion": ["T-Shirts","Jeans","Shoes","Watches","Caps"],
    "Women Fashion": ["Dresses","Handbags","Jewelry Sets","Sandals","Makeup Kits"],
    "Mobiles": ["Smartphones","Keypad Phones","Mobile Covers","Chargers","Earbuds"],
    "Mobile Accessories": ["Power Banks","Smart Watches","Data Cables","Earphones","Stands & Holders"],
    "Electronics": ["LED TV","Bluetooth Speakers","Headphones","Cameras","Smart Gadgets"],
    "Beauty Products": ["Perfumes","Lipsticks","Face Creams","Hair Oils","Makeup Brushes"],
    "Home & Living": ["Home Gadgets","Cleaning Tools","Kitchen Accessories","Room Decor","Small Appliances"],
    "Watches": ["Smart Watches","Digital Watches","Analog Watches","Couple Watches","Fitness Bands"],
    "Shoes": ["Sneakers","Sandals","Joggers","Slippers","Formal Shoes"],
    "Bags": ["School Bags","Laptop Bags","Hand Bags","Travel Bags","Wallets"],
    "Jewelry": ["Rings","Necklaces","Earrings","Bracelets","Anklets"],
    "Baby Products": ["Baby Toys","Baby Clothes"],
    "Sports Items": ["Gym Gloves","Water Bottles","Dumbbells","Football","Yoga Mats"],
    "Gaming": ["Gamepads","Gaming Headsets","PS5 / Xbox Accessories","Mouse Pads","Gaming Keyboards"],
    "Computer Accessories": ["Keyboards","Mouse","USB Drives","Headsets","Laptop Stands"],
    "Other": ["Other Things"]
  };

  const PLURAL_RULES = {
    'watches':'watch','clothes':'cloth','shoes':'shoe','glasses':'glass','jeans':'jean','pants':'pant',
    'shorts':'short','sneakers':'sneaker','sandals':'sandal','slippers':'slipper','joggers':'jogger',
    'caps':'cap','dresses':'dress','handbags':'handbag','rings':'ring','necklaces':'necklace',
    'earrings':'earring','bracelets':'bracelet','anklets':'anklet','wallets':'wallet','toys':'toy',
    'bottles':'bottle','mats':'mat','gloves':'glove','speakers':'speaker','headphones':'headphone',
    'earphones':'earphone','earbuds':'earbud','chargers':'charger','cables':'cable','covers':'cover',
    'banks':'bank','keyboards':'keyboard','pads':'pad','drives':'drive','stands':'stand',
    'gadgets':'gadget','tools':'tool','accessories':'accessory','appliances':'appliance',
    'products':'product','items':'item','things':'thing',
    'watch':'watches','shoe':'shoes','ring':'rings','bag':'bags','stand':'stands',
    'keyboard':'keyboards','speaker':'speakers','headphone':'headphones'
  };

  function normalizeWord(word) {
    const lower = word.toLowerCase().trim();
    if (PLURAL_RULES[lower]) return PLURAL_RULES[lower];
    if (lower.endsWith('ies') && lower.length > 4) return lower.slice(0, -3) + 'y';
    if (lower.endsWith('es') && /ches|shes|xes|zes|oes/.test(lower)) return lower.slice(0, -2);
    if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 2) return lower.slice(0, -1);
    return lower;
  }

  function getWordVariations(word) {
    const norm = normalizeWord(word);
    const vars = new Set([norm, word.toLowerCase().trim()]);
    if (PLURAL_RULES[norm]) vars.add(PLURAL_RULES[norm]);
    return Array.from(vars);
  }

  function calculateRelevance(product, terms, variations) {
    let score = 0;
    const title = (product.title || '').toLowerCase();
    const cat   = (product.category || '').toLowerCase();
    const sub   = (product.subcategory || '').toLowerCase();
    const desc  = (product.description || '').toLowerCase();
    terms.forEach((term, idx) => {
      variations[idx].forEach(v => {
        if (title === v) score += 100;
        else if (title.startsWith(v + ' ')) score += 80;
        else if (new RegExp(`\\b${v}\\b`, 'i').test(title)) score += 60;
        else if (title.includes(v)) score += 40;
        if (sub === v) score += 70;
        else if (sub.includes(v)) score += 50;
        if (cat === v) score += 60;
        else if (cat.includes(v)) score += 40;
        if (desc.includes(v)) score += 20;
        if (idx === 0) score *= 1.5;
      });
    });
    const allInTitle = terms.every((t, i) => variations[i].some(v => title.includes(v)));
    if (allInTitle) score += 50;
    return score;
  }

  function findRelatedCategories(term) {
    const related = new Set();
    const norm = normalizeWord(term);
    Object.entries(CATEGORY_MAP).forEach(([cat, subs]) => {
      const cl = cat.toLowerCase();
      if (cl.includes(norm) || norm.includes(cl)) { related.add(cat); subs.forEach(s => related.add(s)); }
      subs.forEach(sub => {
        const sl = sub.toLowerCase();
        if (sl.includes(norm) || norm.includes(sl)) { related.add(cat); related.add(sub); }
      });
    });
    return Array.from(related);
  }

  function levenshtein(a, b) {
    const m = [];
    for (let i = 0; i <= b.length; i++) m[i] = [i];
    for (let j = 0; j <= a.length; j++) m[0][j] = j;
    for (let i = 1; i <= b.length; i++)
      for (let j = 1; j <= a.length; j++)
        m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
    return m[b.length][a.length];
  }

  function fuzzySearch(products, terms) {
    return products.filter(p => {
      const text = `${p.title||''} ${p.category||''} ${p.subcategory||''}`.toLowerCase();
      return terms.some(t => t.length > 4
        ? text.split(/\s+/).some(w => levenshtein(w, t) <= 2)
        : text.includes(t));
    });
  }

  function getSuggestions(term) {
    const norm = normalizeWord(term);
    const res = [];
    Object.entries(CATEGORY_MAP).forEach(([cat, subs]) => {
      if (cat.toLowerCase().includes(norm)) res.push(cat);
      subs.forEach(s => { if (s.toLowerCase().includes(norm)) res.push(s); });
    });
    return res.slice(0, 5);
  }

  // ─── LIVE AUTOCOMPLETE ─────────────────────────────────────────
  function buildSuggestions(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    const results = [];
    const seen = new Set();

    allProducts.forEach(p => {
      const title = (p.title || '').toLowerCase();
      if (title.includes(q) && !seen.has(title)) {
        seen.add(title);
        results.push({ text: p.title, category: p.category || '', type: 'product' });
      }
    });

    Object.entries(CATEGORY_MAP).forEach(([cat, subs]) => {
      if (cat.toLowerCase().includes(q) && !seen.has(cat.toLowerCase())) {
        seen.add(cat.toLowerCase());
        results.push({ text: cat, category: 'Category', type: 'category' });
      }
      subs.forEach(sub => {
        if (sub.toLowerCase().includes(q) && !seen.has(sub.toLowerCase())) {
          seen.add(sub.toLowerCase());
          results.push({ text: sub, category: cat, type: 'subcategory' });
        }
      });
    });

    return results.slice(0, 8);
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + `<em>${text.slice(idx, idx + query.length)}</em>` + text.slice(idx + query.length);
  }

  function showSuggestions(query) {
    if (!suggestionsDropdown) return;
    const items = buildSuggestions(query);
    if (!items.length) { suggestionsDropdown.style.display = 'none'; return; }
    suggestionsDropdown.innerHTML = items.map(item => `
      <div class="suggestion-item" onclick="fillAndSearch('${item.text.replace(/'/g, "\\'")}')">
        <i class="sug-icon fas ${item.type === 'product' ? 'fa-box' : item.type === 'category' ? 'fa-th-large' : 'fa-tag'}"></i>
        <span>${highlightMatch(item.text, query)}</span>
        <span class="sug-category">${item.category}</span>
      </div>`).join('');
    suggestionsDropdown.style.display = 'block';
    if (searchPanel) searchPanel.classList.remove('active');
  }

  function hideSuggestions() {
    if (suggestionsDropdown) suggestionsDropdown.style.display = 'none';
  }

  // ─── SEARCH PANEL ──────────────────────────────────────────────
  function renderRecentSearches() {
    if (!recentSearchesList) return;
    const recent = JSON.parse(localStorage.getItem("recentSearches_store") || "[]");
    recentSearchesList.innerHTML = recent.length
      ? recent.map(t => `<li onclick="fillAndSearch('${t.replace(/'/g,"\\'")}')"> ${t}</li>`).join('')
      : '<li style="color:#bbb;font-size:13px;">No recent searches</li>';
  }

  function toggleSearchPanel(show) {
    if (!searchPanel) return;
    if (show) {
      searchPanel.classList.add('active');
      renderRecentSearches();
      hideSuggestions();
    } else {
      searchPanel.classList.remove('active');
    }
  }

  window.fillAndSearch = function(term) {
    if (searchInput) searchInput.value = term;
    hideSuggestions();
    toggleSearchPanel(false);
    searchItems();
  };

  // ─── RENDER ITEMS ──────────────────────────────────────────────
  // Layout: First 6 cards → Recently Viewed → Rest of products
  function renderItems(itemsToRender, hideExtras = false) {
    if (adSlider) adSlider.style.display = hideExtras ? "none" : "block";
    if (adsSkeleton) adsSkeleton.style.display = "none";
    if (flashSaleBox) flashSaleBox.style.display = hideExtras ? "none" : (flashSaleBox.dataset.hasItems === "1" ? "block" : "none");
    if (allProductsHeader) allProductsHeader.style.display = hideExtras ? "none" : "flex";

    hideProductsSkeleton();
    if (container) { container.innerHTML = ""; container.style.display = "grid"; }
    if (containerRest) { containerRest.innerHTML = ""; containerRest.style.display = "grid"; }

    // Hide recently viewed during search
    if (hideExtras && recentlyViewedBox) {
      recentlyViewedBox.style.display = "none";
    }

    if (!itemsToRender.length) {
      const searchTerm = searchInput ? searchInput.value.trim() : '';
      const suggestions = searchTerm ? getSuggestions(searchTerm) : [];
      if (container) container.innerHTML = `
        <div class="not-found">
          <img src="Store icons/not-found.png" alt="No Results">
          <h3>Oops! Item Not Found</h3>
          <p>Try searching with a different keyword.</p>
          ${suggestions.length ? `<div class="try-tags">${suggestions.map(s => `<span class="try-tag" onclick="fillAndSearch('${s}')">${s}</span>`).join('')}</div>` : ''}
        </div>`;
      return;
    }

    function makeCard(item, index) {
      const basePrice  = parseInt(item.price?.toString().replace(/[^\d]/g, "")) || 0;
      const discount   = parseInt(item.discount?.toString().replace(/[^\d]/g, "")) || 0;
      const finalPrice = basePrice - discount;
      const card = document.createElement("div");
      card.className = "item-card";
      card.style.animationDelay = `${(index % 10) * 45}ms`;
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${item.images?.[0] || item.image || 'https://via.placeholder.com/150'}" alt="${item.title}" loading="lazy">
        </div>
        <div class="card-body">
          <h3>${item.title}</h3>
          <p class="price-wrapper">
            <span class="new-price"><span class="rs">Rs.</span><strong>${finalPrice}</strong></span>
            ${discount > 0 ? `<span class="old-price-inline">Rs. ${basePrice}</span>` : ''}
          </p>
        </div>`;
      card.addEventListener("click", () => {
        incrementView(item.id);
        const productData = { ...item, finalPrice, originalPrice: basePrice };
        addToRecentlyViewed(productData);
        localStorage.setItem("selectedItem", JSON.stringify(productData));
        window.location.href = "Stores itemDetails.html";
      });
      return card;
    }

    // First 6 cards → main container (3 rows × 2 cols)
    const first6 = itemsToRender.slice(0, 6);
    const rest    = itemsToRender.slice(6);

    first6.forEach((item, i) => {
      if (container) container.appendChild(makeCard(item, i));
    });

    // Show Recently Viewed in between (only on main listing, not search)
    if (!hideExtras) {
      renderRecentlyViewed();
    }

    // Remaining products below recently viewed
    rest.forEach((item, i) => {
      if (containerRest) containerRest.appendChild(makeCard(item, i + 6));
    });

    setupScrollReveal();
  }

  // ─── SCROLL REVEAL ─────────────────────────────────────────────
  function setupScrollReveal() {
    const cards = document.querySelectorAll('.item-card');
    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    cards.forEach(c => observer.observe(c));
  }

  // ─── SEARCH ────────────────────────────────────────────────────
  window.searchItems = function() {
    const term = searchInput ? searchInput.value.trim() : '';
    if (!term) { renderItems(allProducts); return; }

    const rawTerms = term.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);
    if (!rawTerms.length) { renderItems(allProducts); return; }

    const searchVariations = rawTerms.map(t => getWordVariations(t));
    const relatedCategories = rawTerms.flatMap(t => findRelatedCategories(t));

    const scored = allProducts.map(item => {
      let score = calculateRelevance(item, rawTerms, searchVariations);
      relatedCategories.forEach(rel => {
        const rl = rel.toLowerCase();
        if ((item.category || '').toLowerCase().includes(rl)) score += 30;
        if ((item.subcategory || '').toLowerCase().includes(rl)) score += 40;
        if ((item.title || '').toLowerCase().includes(rl)) score += 25;
      });
      return { item, score };
    });

    let matched = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.item);
    if (!matched.length) matched = fuzzySearch(allProducts, rawTerms);

    renderItems(matched, true);

    let recent = JSON.parse(localStorage.getItem("recentSearches_store") || "[]");
    const tl = term.toLowerCase().trim();
    if (!recent.includes(tl)) {
      recent.unshift(tl); if (recent.length > 10) recent.pop();
      localStorage.setItem("recentSearches_store", JSON.stringify(recent));
    }
    hideSuggestions();
    toggleSearchPanel(false);
  };

  // ─── ANIMATED PLACEHOLDER (Daraz style) ───────────────────────
  const placeholderEl = document.getElementById("searchPlaceholderAnim");
  const header        = document.querySelector("header");
  const searchBackBtn = document.getElementById("searchBackBtn");

  const PLACEHOLDER_TEXTS = [
    "Search products...",
    "Dresses & Fashion 👗",
    "Watches & Jewelry ⌚",
    "Kitchen Accessories🍳",
    "Beauty Products 💄",
    "Toys & Baby Items 🧸",
    "Men's Collection 👔",
    "Shoes & Bags 👟"
  ];

  let phIndex = 0;
  let phTimer = null;
  let phActive = true; // show animated placeholder when input empty & not focused

  function typePlaceholder(text, cb) {
    if (!placeholderEl) return;
    let i = 0;
    placeholderEl.textContent = "";
    placeholderEl.style.opacity = "1";
    const interval = setInterval(() => {
      if (!phActive) { clearInterval(interval); return; }
      placeholderEl.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => {
          // Fade out
          placeholderEl.style.transition = "opacity 0.3s ease";
          placeholderEl.style.opacity = "0";
          setTimeout(() => { if (cb) cb(); }, 350);
        }, 1800);
      }
    }, 55);
  }

  function rotatePlaceholder() {
    if (!phActive || !placeholderEl) return;
    placeholderEl.style.transition = "none";
    typePlaceholder(PLACEHOLDER_TEXTS[phIndex], () => {
      phIndex = (phIndex + 1) % PLACEHOLDER_TEXTS.length;
      phTimer = setTimeout(rotatePlaceholder, 200);
    });
  }

  function startPlaceholderAnim() {
    phActive = true;
    if (placeholderEl) placeholderEl.style.display = "block";
    rotatePlaceholder();
  }

  function stopPlaceholderAnim() {
    phActive = false;
    clearTimeout(phTimer);
    if (placeholderEl) {
      placeholderEl.style.opacity = "0";
      setTimeout(() => { if (placeholderEl) placeholderEl.style.display = "none"; }, 300);
    }
  }

  // Start animated placeholder on load
  setTimeout(startPlaceholderAnim, 600);

  // ─── SEARCH EXPAND (header collapse left, search full width) ───
  function activateSearch() {
    if (header) header.classList.add("search-active");
    stopPlaceholderAnim();
  }

  function deactivateSearch() {
    if (header) header.classList.remove("search-active");
    if (!searchInput.value.trim()) startPlaceholderAnim();
  }

  // ─── SEARCH INPUT EVENTS ───────────────────────────────────────
  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      activateSearch();
      const val = searchInput.value.trim();
      if (val.length >= 1) showSuggestions(val);
      else toggleSearchPanel(true);
    });

    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim();
      if (searchClearBtn) searchClearBtn.style.display = val ? 'block' : 'none';
      // Hide animated placeholder when typing
      if (placeholderEl) placeholderEl.style.display = val ? 'none' : 'block';
      if (val.length >= 1) {
        showSuggestions(val);
        toggleSearchPanel(false);
      } else {
        hideSuggestions();
        toggleSearchPanel(true);
      }
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { searchItems(); searchInput.blur(); }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (!document.activeElement?.closest('.search-input-box')) {
          if (!searchInput.value.trim()) deactivateSearch();
        }
      }, 150);
    });
  }

  // Back arrow button
  if (searchBackBtn) {
    searchBackBtn.addEventListener('click', () => {
      searchInput.value = '';
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      hideSuggestions();
      toggleSearchPanel(false);
      deactivateSearch();
      searchInput.blur();
      renderItems(allProducts);
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      if (placeholderEl) placeholderEl.style.display = 'block';
      hideSuggestions();
      renderItems(allProducts);
      searchInput.focus();
    });
  }

  document.addEventListener('click', e => {
    const inside = searchInput?.contains(e.target)
      || suggestionsDropdown?.contains(e.target)
      || searchPanel?.contains(e.target)
      || searchBackBtn?.contains(e.target);
    if (!inside) {
      hideSuggestions();
      toggleSearchPanel(false);
      if (!searchInput?.value.trim()) deactivateSearch();
    }
  });

  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem("recentSearches_store");
    renderRecentSearches();
  });

  // ─── ADS ───────────────────────────────────────────────────────
  function getAdName(ad) {
    const fields = ['name','title','text','label','caption','heading','description','adName','adTitle','storeName','store'];
    for (const f of fields) if (ad[f] && typeof ad[f] === 'string') return ad[f].trim();
    for (const k in ad) if (typeof ad[k] === 'string' && ad[k].length < 100) return ad[k].trim();
    return '';
  }

  function adMatchesStore(ad, storeName) {
    const adName = getAdName(ad).toLowerCase();
    const sn = storeName.toLowerCase();
    if (adName === sn) return true;
    if (adName.includes(sn) || sn.includes(adName) && adName.length > 3) return true;
    const storeWords = sn.split(/\s+/);
    const adWords = adName.split(/\s+/);
    for (let word of storeWords) {
      if (word.length > 2 && adWords.some(aw => aw.includes(word) || word.includes(aw))) return true;
    }
    return false;
  }

  function sortAdsByOrder(ads, adNames) {
    const sorted = [];
    const adMap = new Map();
    ads.forEach(ad => adMap.set(getAdName(ad).toLowerCase(), ad));
    adNames.forEach(name => {
      const key = name.toLowerCase();
      if (adMap.has(key)) { sorted.push(adMap.get(key)); adMap.delete(key); }
    });
    adMap.forEach(ad => sorted.push(ad));
    return sorted;
  }

  async function loadSliderImages() {
    showAdsSkeleton();
    try {
      const res  = await fetch(`${API_BASE}/admin/ads`);
      const ads  = await res.json();
      const matchedAds = ads.filter(ad => adMatchesStore(ad, STORE_CONFIG.name));
      const sortedAds  = sortAdsByOrder(matchedAds, AD_NAMES);

      if (sortedAds.length > 0) {
        swiperWrapper.innerHTML = sortedAds.map(ad =>
          `<div class="swiper-slide"><img src="${ad.image}" alt="${getAdName(ad)||'Ad'}" loading="lazy"></div>`
        ).join('');
        hideAdsSkeleton();
        adSlider.style.display = "block";
        if (swiperInstance) swiperInstance.destroy(true, true);
        swiperInstance = new Swiper(".mySwiper", {
          loop: sortedAds.length > 1,
          autoplay: { delay: 3000, disableOnInteraction: false },
          pagination: { el: ".swiper-pagination", clickable: true, dynamicBullets: sortedAds.length > 5 }
        });
      } else {
        hideAdsSkeleton();
        adSlider.style.display = "none";
      }
    } catch(e) {
      hideAdsSkeleton();
      adSlider.style.display = "none";
    }
  }

  // ─── FLASH SALE ────────────────────────────────────────────────
  async function loadFlashSale() {
    if (!flashSaleContainer || !flashSaleBox) return;
    try {
      const res = await fetch(`${API_BASE}/products`);
      let products = await res.json();

      products = products.filter(p => p.sellerPhone === STORE_CONFIG.phone);
      products = products.map(p => {
        const price = parseInt(p.price?.toString().replace(/[^\d]/g, "")) || 0;
        const discount = parseInt(p.discount?.toString().replace(/[^\d]/g, "")) || 0;
        const pct = price > 0 ? Math.round((discount / price) * 100) : 0;
        return { ...p, discountPercentage: pct, finalPrice: price - discount };
      }).filter(p => p.discountPercentage >= 40);

      products = shuffleArray(products);
      flashSaleContainer.innerHTML = "";

      if (!products.length) { flashSaleBox.style.display = "none"; return; }

      flashSaleBox.dataset.hasItems = "1";
      flashSaleBox.style.display = "block";

      products.forEach(product => {
        const card = document.createElement("div");
        card.className = "flash-sale-card";
        card.innerHTML = `
          ${product.discountPercentage > 0 ? `<div class="discount-badge">SAVE ${product.discountPercentage}%</div>` : ""}
          <img src="${product.images?.[0] || product.image || 'https://via.placeholder.com/150'}" alt="${product.title}" loading="lazy">
          <div class="card-info">
            <div class="card-title">${product.title}</div>
            <div class="price-block">
              <span class="final-price">Rs. ${product.finalPrice}</span>
              ${product.price ? `<span class="old-price">Rs. ${product.price}</span>` : ""}
            </div>
            <div class="stock-badge">Limited Stock</div>
          </div>`;
        card.addEventListener("click", () => {
          addToRecentlyViewed({ ...product });
          localStorage.setItem("selectedItem", JSON.stringify(product));
          window.location.href = "Stores itemDetails.html";
        });
        flashSaleContainer.appendChild(card);
      });
    } catch(e) {
      console.error("Flash sale error:", e);
      flashSaleBox.style.display = "none";
    }
  }

  // ─── LOAD PRODUCTS ─────────────────────────────────────────────
  async function loadProducts() {
    showProductsSkeleton();
    try {
      const res  = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      allProducts = shuffleArray(data.filter(item => item.sellerPhone === STORE_CONFIG.phone));
      renderItems(allProducts);
      renderRecentSearches();
    } catch(e) {
      hideProductsSkeleton();
      container.innerHTML = "<p style='padding:20px;text-align:center;color:#777;'>⚠️ Keep Internet Connection</p>";
    }
  }

  // ─── CACHE HELPERS ────────────────────────────────────────────
  const CACHE_TTL = 5 * 60 * 1000;

  function saveCache(key, data) {
    try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch(e) {}
  }

  function loadCache(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) return null;
      return data;
    } catch(e) { return null; }
  }

  function initSwiper(adsArr) {
    swiperWrapper.innerHTML = adsArr.map(ad =>
      `<div class="swiper-slide"><img src="${ad.image}" alt="${getAdName(ad)||'Ad'}" loading="lazy"></div>`
    ).join('');
    hideAdsSkeleton();
    adSlider.style.display = "block";
    if (swiperInstance) { try { swiperInstance.destroy(true,true); } catch(e){} }
    swiperInstance = new Swiper(".mySwiper", {
      loop: adsArr.length > 1,
      autoplay: { delay: 3000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true, dynamicBullets: adsArr.length > 5 }
    });
  }

  async function loadSliderWithCache() {
    const cached = loadCache("cucu_ads");
    if (cached && cached.length > 0) {
      initSwiper(cached);
    } else {
      showAdsSkeleton();
      try {
        const res = await fetch(`${API_BASE}/admin/ads`);
        const ads = await res.json();
        const matchedAds = ads.filter(ad => adMatchesStore(ad, STORE_CONFIG.name));
        const sortedAds  = sortAdsByOrder(matchedAds, AD_NAMES);
        if (sortedAds.length > 0) {
          saveCache("cucu_ads", sortedAds);
          initSwiper(sortedAds);
        } else {
          hideAdsSkeleton();
          adSlider.style.display = "none";
        }
      } catch(e) { hideAdsSkeleton(); adSlider.style.display = "none"; }
    }
  }

  async function loadFlashSaleWithCache() {
    if (!flashSaleContainer || !flashSaleBox) return;
    const cached = loadCache("cucu_flash");
    const products = cached || await (async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        let data = await res.json();
        data = data.filter(p => p.sellerPhone === STORE_CONFIG.phone);
        data = data.map(p => {
          const price    = parseInt((p.price||"0").toString().replace(/[^\d]/g,"")) || 0;
          const discount = parseInt((p.discount||"0").toString().replace(/[^\d]/g,"")) || 0;
          const pct      = price > 0 ? Math.round((discount/price)*100) : 0;
          return { ...p, discountPercentage: pct, finalPrice: price - discount };
        }).filter(p => p.discountPercentage >= 40);
        data = shuffleArray(data);
        if (data.length) saveCache("cucu_flash", data);
        return data;
      } catch(e) { return []; }
    })();

    flashSaleContainer.innerHTML = "";
    if (!products.length) { flashSaleBox.style.display = "none"; return; }

    flashSaleBox.dataset.hasItems = "1";
    flashSaleBox.style.display = "block";
    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "flash-sale-card";
      card.innerHTML = `
        ${product.discountPercentage > 0 ? `<div class="discount-badge">SAVE ${product.discountPercentage}%</div>` : ""}
        <img src="${product.images?.[0] || product.image || ''}" alt="${product.title}" loading="lazy">
        <div class="card-info">
          <div class="card-title">${product.title}</div>
          <div class="price-block">
            <span class="final-price">Rs. ${product.finalPrice}</span>
            ${product.price ? `<span class="old-price">Rs. ${product.price}</span>` : ""}
          </div>
          <div class="stock-badge">Limited Stock</div>
        </div>`;
      card.addEventListener("click", () => {
        addToRecentlyViewed({ ...product });
        localStorage.setItem("selectedItem", JSON.stringify(product));
        window.location.href = "Stores itemDetails.html";
      });
      flashSaleContainer.appendChild(card);
    });
  }

  async function loadProductsWithCache() {
    const cached = loadCache("cucu_products");
    if (cached) {
      allProducts = cached;
      renderItems(allProducts);
      renderRecentSearches();
    } else {
      showProductsSkeleton();
      try {
        const res  = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        allProducts = shuffleArray(data.filter(item => item.sellerPhone === STORE_CONFIG.phone));
        saveCache("cucu_products", allProducts);
        renderItems(allProducts);
        renderRecentSearches();
      } catch(e) {
        hideProductsSkeleton();
        if (container) container.innerHTML = "<p style='padding:20px;text-align:center;color:#777;'>⚠️ Keep Internet Connection</p>";
      }
    }
  }

  // ─── INIT ──────────────────────────────────────────────────────
  if (sellerNameEl) { const n = STORE_CONFIG.name; sellerNameEl.innerHTML = `<span class="store-marquee">${n}&nbsp;&nbsp;•&nbsp;&nbsp;${n}&nbsp;&nbsp;•&nbsp;&nbsp;</span>`; }
  if (sellerLogoEl) sellerLogoEl.src = STORE_CONFIG.logo;

  const savedScroll = sessionStorage.getItem("cucu_scroll");

  await loadSliderWithCache();
  await loadFlashSaleWithCache();
  await loadProductsWithCache();
  // Note: renderRecentlyViewed() is called inside renderItems() after first 6 cards

  if (savedScroll) {
    sessionStorage.removeItem("cucu_scroll");
    requestAnimationFrame(() => window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" }));
  }
});

// ─── SCROLL SAVE ON LEAVE ─────────────────────────────────────
window.addEventListener("pagehide", () => {
  sessionStorage.setItem("cucu_scroll", String(window.scrollY));
});

// ─── WHATSAPP BUTTON ──────────────────────────────────────────
(function() {
  const waBtn = document.getElementById("waFloatBtn");
  if (!waBtn) return;

  // Start hidden
  waBtn.style.opacity = "0";
  waBtn.style.transform = "scale(0) rotate(-90deg)";
  waBtn.style.transition = "opacity 0.45s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";

  let waVisible = false;
  let hideTimer = null;

  function showWa() {
    if (waVisible) return;
    waVisible = true;
    waBtn.style.opacity = "1";
    waBtn.style.transform = "scale(1) rotate(0deg)";
    waBtn.style.pointerEvents = "auto";

    // Hide after 60 seconds
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideWa, 60000);
  }

  function hideWa() {
    waVisible = false;
    waBtn.style.opacity = "0";
    waBtn.style.transform = "scale(0) rotate(90deg)";
    waBtn.style.pointerEvents = "none";
  }

  // Show on scroll past 200px
  window.addEventListener("scroll", function() {
    if (window.scrollY > 200) showWa();
  }, { passive: true });

  // Show after 3s on mobile even without scroll
  setTimeout(showWa, 3000);
})();