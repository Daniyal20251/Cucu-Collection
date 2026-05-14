let allProducts = [];
let swiperInstance = null;

const API_BASE = "https://delight-backend--araindaniyalo2.replit.app";

// 🔥 HARDCODED STORE CONFIG
const STORE_CONFIG = {
  phone: "03352166725",
  name: "Cucu Collection",
  logo: "Store icons/Cucu.png"
};

// 🔥 AD NAMES ORDER ARRAY - Ads will be sorted in this exact order
const AD_NAMES = [
  "Cucu Collection",
  "Cucu Collection1",
  "Cucu Collection2", 
  "Cucu Collection3",
  "Cucu Collection4",
  "Cucu Collection5",
  "Cucu Collection6"
];

const searchInput = document.getElementById("searchInput");
const searchPanel = document.getElementById("searchPanel");
const recentList = document.getElementById("recentSearches");
const clearBtn = document.getElementById("clearHistoryBtn");
const itemContainer = document.getElementById("itemContainer");
const skeletonContainer = document.getElementById("skeletonContainer");
const flashSaleContainer = document.getElementById("flashSaleContainer");
const flashSaleBox = document.getElementById("flashSaleBox");

let recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showSkeleton() {
  if (skeletonContainer) skeletonContainer.style.display = "flex";
  if (itemContainer) itemContainer.style.display = "none";
}

function hideSkeleton() {
  if (skeletonContainer) skeletonContainer.style.display = "none";
  if (itemContainer) itemContainer.style.display = "flex";
}

// 🔥 IMPROVED: Better ad name extraction with multiple fallback strategies
function getAdName(ad) {
  // Priority fields to check
  const possibleFields = ['name', 'title', 'text', 'label', 'caption', 'heading', 'description', 'adName', 'adTitle', 'storeName', 'store'];

  for (let field of possibleFields) {
    if (ad[field] && typeof ad[field] === 'string' && ad[field].trim()) {
      return ad[field].trim();
    }
  }

  // If no standard field found, check all string fields
  for (let key in ad) {
    if (typeof ad[key] === 'string' && ad[key].length < 100 && ad[key].trim()) {
      return ad[key].trim();
    }
  }
  return "";
}

// 🔥 NEW: Flexible matching function that handles variations
function adMatchesStore(ad, storeName) {
  const adName = getAdName(ad).toLowerCase();
  const storeNameLower = storeName.toLowerCase();

  // Exact match
  if (adName === storeNameLower) return true;

  // Contains match (e.g., "Cucu Collection Store" matches "Cucu Collection")
  if (adName.includes(storeNameLower)) return true;
  if (storeNameLower.includes(adName) && adName.length > 3) return true;

  // Word-by-word match (e.g., "Cucu" matches "Cucu Collection")
  const storeWords = storeNameLower.split(/\s+/);
  const adWords = adName.split(/\s+/);

  for (let word of storeWords) {
    if (word.length > 2 && adWords.some(aw => aw.includes(word) || word.includes(aw))) {
      return true;
    }
  }

  return false;
}

// 🔥 NEW: Sort ads according to AD_NAMES order
function sortAdsByOrder(ads, adNames) {
  const sorted = [];

  // Create a map for quick lookup (case-insensitive)
  const adMap = new Map();
  ads.forEach(ad => {
    const name = getAdName(ad);
    adMap.set(name.toLowerCase(), ad);
  });

  // Add ads in the order specified by AD_NAMES
  adNames.forEach(name => {
    const lowerName = name.toLowerCase();
    if (adMap.has(lowerName)) {
      sorted.push(adMap.get(lowerName));
      adMap.delete(lowerName); // Remove to avoid duplicates
    }
  });

  // Add any remaining ads that weren't in AD_NAMES (at the end)
  adMap.forEach(ad => sorted.push(ad));

  return sorted;
}

async function incrementView(productId) {
  try {
    await fetch(`${API_BASE}/products/${productId}/view`, { method: "POST" });
  } catch (err) {
    console.error("View count error:", err);
  }
}

// ============================================================
// 🔥 POWERFUL SEARCH ENGINE - Singular/Plural + Category Aware
// ============================================================

const CATEGORY_MAP = {
  "Men Fashion": ["T-Shirts", "Jeans", "Shoes", "Watches", "Caps"],
  "Women Fashion": ["Dresses", "Handbags", "Jewelry Sets", "Sandals", "Makeup Kits"],
  "Mobiles": ["Smartphones", "Keypad Phones", "Mobile Covers", "Chargers", "Earbuds"],
  "Mobile Accessories": ["Power Banks", "Smart Watches", "Data Cables", "Earphones", "Stands & Holders"],
  "Electronics": ["LED TV", "Bluetooth Speakers", "Headphones", "Cameras", "Smart Gadgets"],
  "Beauty Products": ["Perfumes", "Lipsticks", "Face Creams", "Hair Oils", "Makeup Brushes"],
  "Home & Living": ["Home Gadgets", "Cleaning Tools", "Kitchen Accessories", "Room Decor", "Small Appliances"],
  "Watches": ["Smart Watches", "Digital Watches", "Analog Watches", "Couple Watches", "Fitness Bands"],
  "Shoes": ["Sneakers", "Sandals", "Joggers", "Slippers", "Formal Shoes"],
  "Bags": ["School Bags", "Laptop Bags", "Hand Bags", "Travel Bags", "Wallets"],
  "Jewelry": ["Rings", "Necklaces", "Earrings", "Bracelets", "Anklets"],
  "Baby Products": ["Baby Toys", "Baby Clothes"],
  "Sports Items": ["Gym Gloves", "Water Bottles", "Dumbbells", "Football", "Yoga Mats"],
  "Gaming": ["Gamepads", "Gaming Headsets", "PS5 / Xbox Accessories", "Mouse Pads", "Gaming Keyboards"],
  "Computer Accessories": ["Keyboards", "Mouse", "USB Drives", "Headsets", "Laptop Stands"],
  "Other": ["Other Things"]
};

const PLURAL_RULES = {
  'watches': 'watch', 'clothes': 'cloth', 'shoes': 'shoe', 'glasses': 'glass',
  'jeans': 'jean', 'pants': 'pant', 'shorts': 'short', 'sneakers': 'sneaker',
  'sandals': 'sandal', 'slippers': 'slipper', 'joggers': 'jogger', 'caps': 'cap',
  'dresses': 'dress', 'handbags': 'handbag', 'rings': 'ring', 'necklaces': 'necklace',
  'earrings': 'earring', 'bracelets': 'bracelet', 'anklets': 'anklet', 'wallets': 'wallet',
  'toys': 'toy', 'bottles': 'bottle', 'mats': 'mat', 'gloves': 'glove',
  'speakers': 'speaker', 'headphones': 'headphone', 'earphones': 'earphone', 'earbuds': 'earbud',
  'chargers': 'charger', 'cables': 'cable', 'covers': 'cover', 'banks': 'bank',
  'keyboards': 'keyboard', 'pads': 'pad', 'drives': 'drive', 'stands': 'stand',
  'gadgets': 'gadget', 'tools': 'tool', 'accessories': 'accessory', 'appliances': 'appliance',
  'products': 'product', 'items': 'item', 'things': 'thing',
  'watch': 'watches', 'cloth': 'clothes', 'shoe': 'shoes', 'glass': 'glasses',
  'jean': 'jeans', 'pant': 'pants', 'short': 'shorts', 'sneaker': 'sneakers',
  'sandal': 'sandals', 'slipper': 'slippers', 'jogger': 'joggers', 'cap': 'caps',
  'dress': 'dresses', 'handbag': 'handbags', 'ring': 'rings', 'necklace': 'necklaces',
  'earring': 'earrings', 'bracelet': 'bracelets', 'anklet': 'anklets', 'wallet': 'wallets',
  'toy': 'toys', 'bottle': 'bottles', 'mat': 'mats', 'glove': 'gloves',
  'speaker': 'speakers', 'headphone': 'headphones', 'earphone': 'earphones', 'earbud': 'earbuds',
  'charger': 'chargers', 'cable': 'cables', 'cover': 'covers', 'bank': 'banks',
  'keyboard': 'keyboards', 'pad': 'pads', 'drive': 'drives', 'stand': 'stands',
  'gadget': 'gadgets', 'tool': 'tools', 'accessory': 'accessories', 'appliance': 'appliances',
  'product': 'products', 'item': 'items', 'thing': 'things'
};

function normalizeWord(word) {
  const lower = word.toLowerCase().trim();
  if (PLURAL_RULES[lower]) return PLURAL_RULES[lower];
  if (lower.endsWith('ies') && lower.length > 4) return lower.slice(0, -3) + 'y';
  if (lower.endsWith('es') && (lower.endsWith('ches') || lower.endsWith('shes') || lower.endsWith('xes') || lower.endsWith('zes') || lower.endsWith('oes'))) return lower.slice(0, -2);
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 2) return lower.slice(0, -1);
  return lower;
}

function getWordVariations(word) {
  const normalized = normalizeWord(word);
  const variations = new Set([normalized, word.toLowerCase().trim()]);
  if (PLURAL_RULES[normalized] && PLURAL_RULES[normalized] !== normalized) variations.add(PLURAL_RULES[normalized]);
  variations.add(normalized);
  return Array.from(variations);
}

function buildSearchIndex(products) {
  return products.map(product => {
    const searchFields = [];
    if (product.title) searchFields.push(...product.title.toLowerCase().split(/\s+/));
    if (product.category) {
      searchFields.push(product.category.toLowerCase());
      searchFields.push(product.category.toLowerCase().replace(/[&\s]/g, ''));
    }
    if (product.subcategory) searchFields.push(product.subcategory.toLowerCase());
    if (product.description) searchFields.push(...product.description.toLowerCase().split(/\s+/));
    if (product.price) searchFields.push(String(product.price).replace(/[^\d]/g, ''));
    return { product, tokens: [...new Set(searchFields.filter(w => w.length > 1))] };
  });
}

function calculateRelevance(product, searchTerms, searchVariations) {
  let score = 0;
  const title = (product.title || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const subcategory = (product.subcategory || '').toLowerCase();
  const description = (product.description || '').toLowerCase();

  searchTerms.forEach((term, idx) => {
    const variations = searchVariations[idx];
    const isFirstTerm = idx === 0;

    variations.forEach(variation => {
      if (title === variation) score += 100;
      if (title.startsWith(variation + ' ')) score += 80;
      if (new RegExp(`\\b${variation}\\b`, 'i').test(title)) score += 60;
      if (title.includes(variation)) score += 40;
      if (subcategory === variation) score += 70;
      if (subcategory.includes(variation)) score += 50;
      if (category === variation) score += 60;
      if (category.includes(variation)) score += 40;
      if (description.includes(variation)) score += 20;
      if (isFirstTerm) score *= 1.5;
    });
  });

  const allInTitle = searchTerms.every((term, i) => 
    searchVariations[i].some(v => title.includes(v))
  );
  if (allInTitle) score += 50;

  return score;
}

function findRelatedCategories(term) {
  const related = new Set();
  const normalizedTerm = normalizeWord(term);

  Object.entries(CATEGORY_MAP).forEach(([cat, subs]) => {
    const catNorm = cat.toLowerCase().replace(/[&\s]/g, '');
    const catLower = cat.toLowerCase();

    if (catLower.includes(normalizedTerm) || normalizedTerm.includes(catLower) || 
        catNorm.includes(normalizedTerm) || normalizedTerm.includes(catNorm)) {
      related.add(cat);
      subs.forEach(sub => related.add(sub));
    }

    subs.forEach(sub => {
      const subNorm = sub.toLowerCase().replace(/[&\s]/g, '');
      const subLower = sub.toLowerCase();
      if (subLower.includes(normalizedTerm) || normalizedTerm.includes(subLower) ||
          subNorm.includes(normalizedTerm) || normalizedTerm.includes(subNorm)) {
        related.add(cat);
        related.add(sub);
      }
    });
  });

  return Array.from(related);
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i-1] === a[j-1] 
        ? matrix[i-1][j-1] 
        : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function fuzzySearch(products, terms) {
  return products.filter(product => {
    const text = `${product.title || ''} ${product.category || ''} ${product.subcategory || ''}`.toLowerCase();
    return terms.some(term => {
      if (term.length > 4) {
        return text.split(/\s+/).some(word => levenshteinDistance(word, term) <= 2);
      }
      return text.includes(term);
    });
  });
}

function getSuggestions(term) {
  const suggestions = [];
  const normalized = normalizeWord(term);

  Object.entries(CATEGORY_MAP).forEach(([cat, subs]) => {
    if (cat.toLowerCase().includes(normalized) || normalized.includes(cat.toLowerCase())) {
      suggestions.push(cat);
    }
    subs.forEach(sub => {
      if (sub.toLowerCase().includes(normalized) || normalized.includes(sub.toLowerCase())) {
        suggestions.push(sub);
      }
    });
  });

  return suggestions.slice(0, 5);
}

let searchIndex = [];

function initSearchIndex() {
  searchIndex = buildSearchIndex(allProducts);
}

// ============================================================
// 🔥 HIDE/SHOW ADS & FLASH SALE HELPERS
// ============================================================

function hideAdsAndFlashSale() {
  const adSlider = document.getElementById("adSlider");
  const flashSaleBox = document.getElementById("flashSaleBox");
  if (adSlider) adSlider.style.display = "none";
  if (flashSaleBox) flashSaleBox.style.display = "none";
}

function showAdsAndFlashSale() {
  const adSlider = document.getElementById("adSlider");
  const flashSaleBox = document.getElementById("flashSaleBox");
  if (adSlider) adSlider.style.display = "block";
  if (flashSaleBox) flashSaleBox.style.display = "block";
}

// ============================================================
// MAIN SEARCH FUNCTIONS
// ============================================================

function filterProducts(term) {
  // 🔥 HIDE ADS & FLASH SALE ON SEARCH
  hideAdsAndFlashSale();

  if (!term || term.trim() === '') {
    // 🔥 SHOW ADS & FLASH SALE BACK WHEN CLEAR
    showAdsAndFlashSale();
    renderProducts(allProducts);
    return;
  }

  const rawTerms = term.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);
  if (rawTerms.length === 0) {
    showAdsAndFlashSale();
    renderProducts(allProducts);
    return;
  }

  const searchVariations = rawTerms.map(t => getWordVariations(t));
  const relatedCategories = rawTerms.flatMap(t => findRelatedCategories(t));

  console.log('Search:', rawTerms, 'Variations:', searchVariations, 'Related:', relatedCategories);

  const scored = allProducts.map(product => {
    let score = calculateRelevance(product, rawTerms, searchVariations);

    relatedCategories.forEach(rel => {
      const relLower = rel.toLowerCase();
      if ((product.category || '').toLowerCase().includes(relLower)) score += 30;
      if ((product.subcategory || '').toLowerCase().includes(relLower)) score += 40;
      if ((product.title || '').toLowerCase().includes(relLower)) score += 25;
    });

    return { product, score };
  });

  const matched = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);

  if (matched.length === 0) {
    const fuzzyMatched = fuzzySearch(allProducts, rawTerms);
    if (fuzzyMatched.length > 0) {
      renderProducts(fuzzyMatched);
      return;
    }

    itemContainer.innerHTML = `
      <div class="not-found" style="margin:140px 0 0 40px;">
        <img src="Store icons/not-found.png" alt="No Results">
        <h3 style="color:#fe7004;">Oops! Item Not Found.</h3>
        <p>Try searching with a different keyword.</p>
        <p style="color:#999;font-size:12px;margin-top:10px;">
          Searched for: "${term}"<br>
          Try: ${getSuggestions(term).join(', ')}
        </p>
      </div>`;
    return;
  }

  renderProducts(matched);
}

function searchItems() {
  const term = searchInput.value.trim();
  if (!term) return;

  const termLower = term.toLowerCase().trim();
  if (!recentSearches.includes(termLower)) {
    recentSearches.unshift(termLower);
    if (recentSearches.length > 6) recentSearches.pop();
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }

  renderRecentSearches();
  filterProducts(term);
  searchPanel.classList.remove("active");
}

// ============================================================
// RENDER & UI FUNCTIONS
// ============================================================

function renderProducts(list) {
  itemContainer.innerHTML = "";

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const basePrice = parseInt(String(item.price).replace(/[^\d]/g, "")) || 0;
    const discount = parseInt(String(item.discount).replace(/[^\d]/g, "")) || 0;
    const finalPrice = basePrice - discount;
    const views = item.views || 0;

    card.innerHTML = `
      <img src="${item.images?.[0] || 'default.jpg'}" alt="${item.title}" loading="lazy">
      <h3>${item.title}</h3>
      <p class="price-wrapper">
        ${discount > 0 
          ? `<span class="new-price">Rs. <strong>${finalPrice}</strong></span><br>
             <span class="old-price" style="text-decoration: line-through; color: gray;">Rs. ${basePrice}</span>`
          : `<span class="new-price">Rs. <strong>${basePrice}</strong></span>`
        }
      </p>
      <p style="margin:2px 8px 6px;font-size:11px;color:#888; display:none;">
        <i class="fas fa-eye" style="color:#bbb;"></i> ${views} views
      </p>
    `;

    card.addEventListener("click", () => {
      incrementView(item.id);
      const updatedItem = { ...item, finalPrice, basePrice };
      localStorage.setItem("selectedItem", JSON.stringify(updatedItem));
      window.location.href = "Stores itemDetails.html";
    });

    itemContainer.appendChild(card);
  });
}

function renderRecentSearches() {
  recentList.innerHTML = "";

  if (recentSearches.length === 0) {
    recentList.innerHTML = "<li style='color:#999;'>No recent searches</li>";
    return;
  }

  recentSearches.forEach(term => {
    const li = document.createElement("li");
    li.textContent = term;
    li.onclick = () => fillAndSearch(term);
    recentList.appendChild(li);
  });
}

function fillAndSearch(term) {
  searchInput.value = term;
  searchItems();
}

// ============================================================
// FLASH SALE
// ============================================================

async function loadFlashSale() {
  if (!flashSaleContainer || !flashSaleBox) return;

  try {
    const res = await fetch(`${API_BASE}/products`);
    let products = await res.json();

    products = products.filter(p => p.sellerPhone === STORE_CONFIG.phone);

    products = products.map(p => {
      const price = parseInt(p.price?.toString().replace(/[^\d]/g, "")) || 0;
      const discount = parseInt(p.discount?.toString().replace(/[^\d]/g, "")) || 0;
      const discountPercentage = price > 0 ? Math.round((discount / price) * 100) : 0;
      return { ...p, discountPercentage, finalPrice: price - discount };
    });

    products = products.filter(p => p.discountPercentage >= 40);
    products = shuffleArray(products);
    flashSaleContainer.innerHTML = "";

    if (!products.length) {
      flashSaleBox.style.display = "none";
      return;
    }

    flashSaleBox.style.display = "block";

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "flash-sale-card";
      card.innerHTML = `
        ${product.discountPercentage > 0 ? `<div class="discount-badge">SAVE ${product.discountPercentage}%</div>` : ""}
        <img src="${product.images?.[0] || product.image || 'https://via.placeholder.com/150'}" alt="${product.title}">
        <div class="price-block">
          <span class="final-price" style="color:#fe7004; font-weight:bold;">Rs. ${product.finalPrice}</span>
          ${product.price ? `<span class="old-price">Rs. ${product.price}</span>` : ""}
        </div>
        <div class="stock-badge">Limited Stock</div>
      `;
      card.addEventListener("click", () => {
        localStorage.setItem("selectedItem", JSON.stringify(product));
        window.location.href = "Stores itemDetails.html";
      });
      flashSaleContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading flash sale:", err);
    flashSaleBox.style.display = "none";
  }
}

// ============================================================
// 🔥 ADS LOADING WITH PROPER ORDERING
// ============================================================

async function loadAds() {
  const swiperWrapper = document.getElementById("swiperWrapper");
  const adSlider = document.getElementById("adSlider");

  if (!swiperWrapper || !adSlider) return;

  try {
    const adsRes = await fetch(`${API_BASE}/admin/ads`);
    const ads = await adsRes.json();

    console.log("📢 All ads from API:", ads);
    console.log("🏪 Store name:", STORE_CONFIG.name);

    // Filter ads for this store
    const matchedAds = ads.filter(ad => adMatchesStore(ad, STORE_CONFIG.name));

    console.log("✅ Matched ads before sorting:", matchedAds);

    // 🔥 SORT ADS according to AD_NAMES order
    const sortedAds = sortAdsByOrder(matchedAds, AD_NAMES);

    console.log("📊 Sorted ads:", sortedAds);

    if (sortedAds.length > 0) {
      swiperWrapper.innerHTML = sortedAds
        .map(ad => `<div class="swiper-slide"><img src="${ad.image}" alt="${getAdName(ad) || 'Ad'}" loading="lazy"></div>`)
        .join("");

      if (swiperInstance) swiperInstance.destroy(true, true);

      swiperInstance = new Swiper(".mySwiper", {
        loop: sortedAds.length > 1,
        autoplay: { 
          delay: 3000, 
          disableOnInteraction: false 
        },
        pagination: { 
          el: ".swiper-pagination", 
          clickable: true,
          dynamicBullets: sortedAds.length > 5
        },
        lazy: {
          loadPrevNext: true,
        }
      });

      adSlider.style.display = "block";
    } else {
      adSlider.style.display = "none";
    }
  } catch (err) {
    console.error("Failed to load ads:", err);
    adSlider.style.display = "none";
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

searchInput.addEventListener("focus", () => {
  renderRecentSearches();
  searchPanel.classList.add("active");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-panel") && !e.target.closest("#searchInput")) {
    searchPanel.classList.remove("active");
  }
});

searchInput.addEventListener("input", () => {
  if (searchInput.value.trim() === "") {
    // 🔥 SHOW ADS & FLASH SALE BACK WHEN INPUT CLEAR
    showAdsAndFlashSale();
    renderProducts(allProducts);
  }
});

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("recentSearches");
  recentSearches = [];
  renderRecentSearches();

  searchInput.value = "";
  // 🔥 SHOW ADS & FLASH SALE BACK WHEN CLEAR HISTORY
  showAdsAndFlashSale();
  renderProducts(allProducts);
});

// ============================================================
// DOMContentLoaded - MAIN LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("itemContainer");
  const sellerNameEl = document.getElementById("sellerName");
  const sellerLogoEl = document.getElementById("sellerLogo");

  showSkeleton();
  container.innerHTML = "";

  const storeName = STORE_CONFIG.name;
  const sellerPhone = STORE_CONFIG.phone;

  sellerNameEl.textContent = storeName;
  sellerLogoEl.src = STORE_CONFIG.logo;

  try {
    // 🔥 Load Slider Ads with proper ordering
    await loadAds();

    // Load products
    const res = await fetch(`${API_BASE}/products`);
    let data = await res.json();

    allProducts = data.filter(item => item.sellerPhone === sellerPhone);
    allProducts = shuffleArray(allProducts);

    // 🔥 INIT SEARCH INDEX
    initSearchIndex();

    hideSkeleton();

    if (!allProducts.length) {
      container.innerHTML = "<p style='text-align:center;color:#777;'>No items found for this store.</p>";
      return;
    }

    renderProducts(allProducts);
    renderRecentSearches();

    // 🔥 FLASH SALE LOAD KARO
    loadFlashSale();

  } catch (err) {
    console.error("⚠️ Error fetching store products:", err);
    hideSkeleton();
    container.innerHTML = "<p style='text-align:center;color:#777;'>⚠️ Error loading products!</p>";
  }
});
