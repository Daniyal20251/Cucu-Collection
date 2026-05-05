let allProducts = [];
let swiperInstance = null;

const API_BASE = "https://delight-backend--araindaniyalo2.replit.app";

// 🔥 HARDCODED STORE CONFIG
const STORE_CONFIG = {
  phone: "03352166725",
  name: "Cucu Collection",
  logo: "Store icons/Cucu.png"
};

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

function getAdName(ad) {
  const possibleFields = ['name', 'title', 'text', 'label', 'caption', 'heading', 'description', 'adName', 'adTitle'];
  for (let field of possibleFields) {
    if (ad[field] && typeof ad[field] === 'string') {
      return ad[field].trim();
    }
  }
  for (let key in ad) {
    if (typeof ad[key] === 'string' && ad[key].length < 100) {
      return ad[key].trim();
    }
  }
  return "";
}

async function incrementView(productId) {
  try {
    await fetch(`${API_BASE}/products/${productId}/view`, { method: "POST" });
  } catch (err) {
    console.error("View count error:", err);
  }
}

// Load store + products
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("itemContainer");
  const sellerNameEl = document.getElementById("sellerName");
  const sellerLogoEl = document.getElementById("sellerLogo");
  const swiperWrapper = document.getElementById("swiperWrapper");
  const adSlider = document.getElementById("adSlider");

  showSkeleton();
  container.innerHTML = "";

  const storeName = STORE_CONFIG.name;
  const sellerPhone = STORE_CONFIG.phone;

  sellerNameEl.textContent = storeName;
  sellerLogoEl.src = STORE_CONFIG.logo;

  try {
    // Load Slider Ads
    try {
      const adsRes = await fetch(`${API_BASE}/admin/ads`);
      const ads = await adsRes.json();
      
      const matchedAds = ads.filter(ad => {
        const adName = getAdName(ad).toLowerCase();
        return adName === storeName.toLowerCase();
      });

      if (matchedAds.length > 0) {
        swiperWrapper.innerHTML = matchedAds
          .map(ad => `<div class="swiper-slide"><img src="${ad.image}" alt="${getAdName(ad) || 'Ad'}" loading="lazy"></div>`)
          .join("");
        
        if (swiperInstance) swiperInstance.destroy(true, true);
        
        swiperInstance = new Swiper(".mySwiper", {
          loop: matchedAds.length > 1,
          autoplay: { 
            delay: 3000, 
            disableOnInteraction: false 
          },
          pagination: { 
            el: ".swiper-pagination", 
            clickable: true,
            dynamicBullets: matchedAds.length > 5
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

    // Load products
    const res = await fetch(`${API_BASE}/products`);
    let data = await res.json();

    allProducts = data.filter(item => item.sellerPhone === sellerPhone);
    allProducts = shuffleArray(allProducts);

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

// 🔥 LOAD FLASH SALE - SIRF STORE KE PRODUCTS
async function loadFlashSale() {
  if (!flashSaleContainer || !flashSaleBox) return;
  
  try {
    const res = await fetch(`${API_BASE}/products`);
    let products = await res.json();

    // SIRF APNE STORE KE PRODUCTS
    products = products.filter(p => p.sellerPhone === STORE_CONFIG.phone);

    products = products.map(p => {
      const price = parseInt(p.price?.toString().replace(/[^\d]/g, "")) || 0;
      const discount = parseInt(p.discount?.toString().replace(/[^\d]/g, "")) || 0;
      const discountPercentage = price > 0 ? Math.round((discount / price) * 100) : 0;
      return { ...p, discountPercentage, finalPrice: price - discount };
    });

    products = products.filter(p => p.discountPercentage >= 50);
    products = shuffleArray(products);
    flashSaleContainer.innerHTML = "";

    if (!products.length) {
      // 🔥 AGAR PRODUCTS NAHO TO BOX HIDE KARO
      flashSaleBox.style.display = "none";
      return;
    }

    // 🔥 PRODUCTS HAIN TO BOX SHOW KARO
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
        window.location.href = "itemDetails.html";
      });
      flashSaleContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading flash sale:", err);
    flashSaleBox.style.display = "none";
  }
}


// Recent Searches
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

searchInput.addEventListener("focus", () => {
  renderRecentSearches();
  searchPanel.classList.add("active");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-panel") && !e.target.closest("#searchInput")) {
    searchPanel.classList.remove("active");
  }
});

function searchItems() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return;

  if (!recentSearches.includes(term)) {
    recentSearches.unshift(term);
    if (recentSearches.length > 6) recentSearches.pop();
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }

  renderRecentSearches();
  filterProducts(term);
  searchPanel.classList.remove("active");
  
  document.getElementById("adSlider").style.display = "none";
}

function filterProducts(term) {
  const matched = allProducts.filter(p =>
    p.title.toLowerCase().includes(term)
  );

  if (matched.length === 0) {
    itemContainer.innerHTML = `
      <div class="not-found" style="margin:140px 0 0 40px;">
        <img src="Stores icons/not-found.png" alt="No Results">
        <h3 style="color:#fe7004;">Oops! Item Not Found.</h3>
        <p>Try searching with a different keyword.</p>
      </div>`;
    return;
  }

  renderProducts(matched);
}

function fillAndSearch(term) {
  searchInput.value = term;
  searchItems();
}

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("recentSearches");
  recentSearches = [];
  renderRecentSearches();
  
  searchInput.value = "";
  document.getElementById("adSlider").style.display = "block";
  renderProducts(allProducts);
});

searchInput.addEventListener("input", () => {
  if (searchInput.value.trim() === "") {
    document.getElementById("adSlider").style.display = "block";
    renderProducts(allProducts);
  }
});
