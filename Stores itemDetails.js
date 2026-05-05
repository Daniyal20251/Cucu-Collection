// Final itemDetails.js — robust & backend-friendly (SINGLE STORE HARDCODED)
document.addEventListener("DOMContentLoaded", async () => {
  // 🔹 HARDCODED STORE CONFIG - Sirf yeh change karo
  const STORE_CONFIG = {
    phone: "03352166725",         // Apna store phone / WhatsApp
    name: "Cucu Collection",           // Apna store name
    logo: "Store icons/Cucu.png"                // Apna logo
  };

  // 🔥 STEP 1: Check URL for product parameter
  const urlParams = new URLSearchParams(window.location.search);
  const productFromUrl = urlParams.get('product');

  let item = null;

  if (productFromUrl) {
    // 🔥 URL se product name mila → Backend se fetch karo
    try {
      const res = await fetch(`https://delight-backend--araindaniyalo2.replit.app/products`);
      if (res.ok) {
        const allProducts = await res.json();
        // Product name se match karo (case-insensitive)
        item = allProducts.find(p => 
          (p.title || "").toLowerCase() === decodeURIComponent(productFromUrl).toLowerCase()
        );
      }
    } catch (err) {
      console.warn("Backend fetch failed:", err);
    }
  }

  // 🔥 Agar URL se nahi mila, toh localStorage check karo
  if (!item) {
    item = JSON.parse(localStorage.getItem("selectedItem"));
  }

  // 🔥 Agar phir bhi nahi mila → Error show karo
  if (!item) {
    document.querySelector(".item-details").innerHTML = "<p>No item selected.</p>";
    return;
  }

  // ✅ FIX: Index.js jaisa price calculation — discount = amount (rupees mein)
  function getPriceData(product) {
    // Agar pehle se finalPrice aur originalPrice hain (localStorage se), toh wohi use karo
    if (product.finalPrice && product.originalPrice) {
      const discountAmount = product.originalPrice - product.finalPrice;
      const discountPercentage = product.originalPrice > 0 
        ? Math.round((discountAmount / product.originalPrice) * 100) 
        : 0;
      return { 
        originalPrice: product.originalPrice, 
        finalPrice: product.finalPrice, 
        discountAmount,
        discountPercentage
      };
    }

    // 🔥 Index.js jaisa calculation — discount is AMOUNT not percentage
    const basePrice = parseInt(product.price?.toString().replace(/[^\d]/g, "")) || 0;
    const discountAmount = parseInt(product.discount?.toString().replace(/[^\d]/g, "")) || 0;
    const originalPrice = basePrice; // backend price = original
    const finalPrice = basePrice - discountAmount; // final = original - discount amount
    const discountPercentage = basePrice > 0 
      ? Math.round((discountAmount / basePrice) * 100) 
      : 0;

    return { originalPrice, finalPrice, discountAmount, discountPercentage };
  }

  // ✅ FIX: Agar item URL se aaya hai, toh uski price calculate karo aur inject karo
  if (productFromUrl && item) {
    const { originalPrice, finalPrice, discountAmount, discountPercentage } = getPriceData(item);
    item.originalPrice = originalPrice;
    item.finalPrice = finalPrice;
    item.discountAmount = discountAmount;
    item.discountPercentage = discountPercentage;
  }

  // 🔥 IMPORTANT: Save fetched item to localStorage for future use
  localStorage.setItem("selectedItem", JSON.stringify(item));

  // State
  let currentIndex = 0;
  let startX = 0;
  let selectedColor = "";
  let selectedSize = "";

  // Elements
  const slider = document.getElementById("imageSlider");
  const dotsContainer = document.getElementById("dotsContainer");
  const titleEl = document.getElementById("title");
  const priceEl = document.getElementById("price");
  const descEl = document.getElementById("description");
  const supplierContainer = document.getElementById("supplier-container");
  const container = document.getElementById("itemContainer");
  const cartCountEl = document.getElementById("cartCount");

  // 🔥 SHARE FUNCTIONS - Current page URL use karta hai
  window.openShareModal = function() {
    const modal = document.getElementById("shareModal");
    const shareLink = document.getElementById("shareLink");
    
    // 🔥 CURRENT PAGE URL use karo - domain ki zaroorat nahi
    const currentUrl = window.location.href.split('?')[0]; // Remove existing params
    const shareUrl = `${currentUrl}?product=${encodeURIComponent(item.title)}`;
    
    shareLink.value = shareUrl;
    modal.classList.add("active");
  };

  window.closeShareModal = function(e) {
    if (e.target.id === "shareModal" || e.target.classList.contains("close-share")) {
      document.getElementById("shareModal").classList.remove("active");
    }
  };

  window.shareVia = function(platform) {
    // 🔥 CURRENT PAGE URL
    const currentUrl = window.location.href.split('?')[0];
    const shareUrl = `${currentUrl}?product=${encodeURIComponent(item.title)}`;
    
    const text = `🔥 Check out this amazing deal!\n\n${item.title}\nPrice: Rs. ${item.finalPrice || item.price}\n\n${shareUrl}`;
    
    let url = "";
    switch(platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(text)}`;
        break;
    }
    
    if (url) window.open(url, '_blank');
    document.getElementById("shareModal").classList.remove("active");
  };

  window.copyLink = function() {
    const shareLink = document.getElementById("shareLink");
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLink.value);
    } else {
      document.execCommand("copy");
    }
    
    // Show feedback
    const btn = document.querySelector(".copy-btn");
    const originalText = btn.textContent;
    btn.textContent = "Copied!";
    btn.style.background = "#5cb85c";
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "#ef6c00";
    }, 2000);
    
    document.getElementById("shareModal").classList.remove("active");
  };

  // Render title, price, description
  if (!item.id) item.id = item.title.replace(/\s+/g, "_") + "_" + (item.finalPrice || item.price);
  titleEl.textContent = item.title || "";
  
  // ✅ FIX: Index.js jaisa price render
  const { originalPrice, finalPrice, discountAmount, discountPercentage } = getPriceData(item);
  priceEl.innerHTML = `
    <div class="price-wrapper">
      <span class="new-price"><span class="rs">Rs.</span><strong>${finalPrice}</strong></span>
      ${discountAmount > 0 ? `<span class="old-price"><span class="rs">Rs.</span>${originalPrice}</span>` : ""}
      ${discountPercentage > 0 ? `<span style="font-size:12px;color:#ef6c00;">(${discountPercentage}% OFF)</span>` : ""}
    </div>
  `;
  
  // Function: description ko paragraph + bullets me convert kare
  function formatDescription(desc) {
    if (!desc) return "";
    desc = desc.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

    const clean = s => s
      .replace(/^[\s\-\*\u2022•]+/, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (desc.includes("•") || desc.includes("\u2022")) {
      const parts = desc.split(/•|\u2022/)
        .map(p => clean(p))
        .filter(Boolean);
      if (!parts.length) return "";
      if (parts.length > 1 && parts[0].length < 60 && !parts[0].includes(":")) {
        const intro = parts.shift();
        return `<p>${intro}</p><ul>${parts.map(p => `<li>${p}</li>`).join("")}</ul>`;
      }
      return `<ul>${parts.map(p => `<li>${p}</li>`).join("")}</ul>`;
    }

    const lines = desc.split("\n").map(l => clean(l)).filter(Boolean);
    if (!lines.length) return "";
    if (lines.length === 1) return `<p>${lines[0]}</p>`;

    const first = lines[0];
    const rest = lines.slice(1);
    if (rest.length && first.length < 200 && !first.includes(":")) {
      return `<p>${first}</p><ul>${rest.map(l => `<li>${l}</li>`).join("")}</ul>`;
    }

    return `<ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>`;
  }

  descEl.innerHTML = formatDescription(item.description);

  // Media slider (images + videos)
  const mediaList = [...(item.images || []), ...(item.videos || [])];
  function renderMedia() {
    slider.innerHTML = "";
    dotsContainer.innerHTML = "";
    if (mediaList.length === 0) {
      const img = document.createElement("img");
      img.src = "noimg.png";
      slider.appendChild(img);
      return;
    }
    mediaList.forEach((media, index) => {
      let el;
      if (typeof media === "string" && media.toLowerCase().endsWith(".mp4")) {
        el = document.createElement("video");
        el.src = media;
        el.controls = true;
        el.style.borderRadius = "10px";
      } else {
        el = document.createElement("img");
        el.src = media;
      }
      el.classList.add("slide");
      if (index === 0) el.classList.add("active");
      slider.appendChild(el);

      const dot = document.createElement("span");
      dot.className = "dot" + (index === 0 ? " active" : "");
      dot.addEventListener("click", () => showSlide(index));
      dotsContainer.appendChild(dot);
    });
  }
  
  function showSlide(index) {
    const slides = slider.querySelectorAll(".slide");
    const dots = dotsContainer.querySelectorAll(".dot");
    if (!slides.length) return;
    index = (index + slides.length) % slides.length;
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));
    slides[index].classList.add("active");
    dots[index].classList.add("active");
    currentIndex = index;
    updateCounter();
  }
  
  // Mobile swipe
  slider.addEventListener("touchstart", e => startX = e.touches[0].clientX);
  slider.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if (diff > 50) showSlide(currentIndex - 1);
    else if (diff < -50) showSlide(currentIndex + 1);
  });
  
  renderMedia();

  // Add counter (1/11)
  const counter = document.createElement("div");
  counter.classList.add("image-counter");
  slider.appendChild(counter);

  function updateCounter() {
    counter.textContent = `${currentIndex + 1} / ${mediaList.length}`;
  }
  updateCounter();

  // Variant container
  const variantContainer = document.createElement("div");
  variantContainer.classList.add("variant-container");
  const firstSection = document.querySelector(".section");
  if (firstSection) document.querySelector(".item-details").insertBefore(variantContainer, firstSection);
  else document.querySelector(".item-details").appendChild(variantContainer);

  // Colors
  const colors = Array.isArray(item.color)
    ? item.color
    : (item.color || item.colors ? (item.color || item.colors).toString().split(",").map(c => c.trim()).filter(Boolean) : []);
  if (colors.length) {
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color-options");
    const label = document.createElement("h5"); label.textContent = "Select Color:";
    colorDiv.appendChild(label);
    colors.forEach(color => {
      const btn = document.createElement("button");
      btn.textContent = color;
      btn.classList.add("color-btn");
      btn.addEventListener("click", () => {
        colorDiv.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedColor = color;
      });
      colorDiv.appendChild(btn);
    });
    variantContainer.appendChild(colorDiv);
  }

  // Sizes
  const sizes = Array.isArray(item.size)
    ? item.size
    : (item.size || item.sizes ? (item.size || item.sizes).toString().split(",").map(s => s.trim()).filter(Boolean) : []);
  if (sizes.length) {
    const sizeDiv = document.createElement("div");
    sizeDiv.classList.add("size-options");
    const label = document.createElement("h5"); label.textContent = "Select Size:";
    sizeDiv.appendChild(label);
    sizes.forEach(size => {
      const btn = document.createElement("button");
      btn.textContent = size;
      btn.classList.add("size-btn");
      btn.addEventListener("click", () => {
        sizeDiv.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedSize = size;
      });
      sizeDiv.appendChild(btn);
    });
    variantContainer.appendChild(sizeDiv);
  }

  // 🔥 HARDCODED Supplier Info - No API call
  function loadSupplierInfo() {
    supplierContainer.innerHTML = `
      <div class="supplier-info" style="
        background:#fff;border:1px solid #ff9800;border-radius:10px;
        padding:10px;display:flex;align-items:center;justify-content:space-between;margin:10px 0;
      ">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${STORE_CONFIG.logo}" alt="${STORE_CONFIG.name}" class="supplier-logo" style="width:45px;height:45px;border-radius:50%;object-fit:cover;">
          <span class="supplier-name" style="font-weight:600;">${STORE_CONFIG.name}</span>
        </div>
        <div>
          <button id="viewSupplierBtn" class="view-supplier-btn" style="background:linear-gradient(to right,#c45500,#ff7d29e4);color:#fff;border:none;padding:6px 10px;border-radius:6px;">View Shop</button>
        </div>
      </div>
    `;
    
    const btn = supplierContainer.querySelector("#viewSupplierBtn");
    if (btn) btn.addEventListener("click", () => {
      window.location.href = "Store.html";
    });
  }

  // WhatsApp button - Hardcoded
  function setupWhatsAppButton() {
    const chatAnchor = document.getElementById("whatsappLink");
    if (!chatAnchor) return;
    
    // Apna store WhatsApp number
    const waPhone = STORE_CONFIG.phone.replace(/^0/, '92'); // 0300... → 92300...
    chatAnchor.href = `https://wa.me/${waPhone}`;
  }

  // ✅ FIX: Similar items — SAME STORE ONLY (hardcoded phone) + Index.js jaisa calculation
  async function loadSimilarItems(currentItem) {
    const container = document.getElementById("itemContainer");
    container.innerHTML = "Loading similar items...";
    
    const targetPhone = STORE_CONFIG.phone;
    const normTarget = targetPhone.toString().replace(/\D/g, "");
    
    let backendItems = [];
    let localItems = window.items || [];
    try {
      const res = await fetch("https://delight-backend--araindaniyalo2.replit.app/products");
      if (res.ok) backendItems = await res.json();
    } catch (err) {
      console.warn("Backend products not loaded:", err);
    }

    const merged = [...localItems];
    backendItems.forEach(b => {
      const exists = merged.find(m => (m.title || "").toLowerCase() === (b.title || "").toLowerCase());
      if (!exists) merged.push(b);
    });

    // Sirf SAME STORE ke items filter karo
    const norm = p => p?.toString().replace(/\D/g, "");
    let sameStoreItems = merged.filter(i => {
      const itemPhone = norm(i.sellerPhone);
      if (!itemPhone || !normTarget) return false;
      return itemPhone === normTarget || 
             itemPhone.endsWith(normTarget) || 
             normTarget.endsWith(itemPhone);
    });

    // Seed word se title match karo
    const seed = (currentItem.title || "").split(" ")[0]?.toLowerCase() || "";
    let related = sameStoreItems.filter(i => {
      if (!i.title) return false;
      if (i.title === currentItem.title) return false;
      const t = i.title.toLowerCase();
      return t.includes(seed);
    });

    if (!related.length) related = sameStoreItems.slice(0, 10);
    if (!related.length) {
      related = merged.filter(i => i.title !== currentItem.title).slice(0, 10);
    }
    
    related = related.sort(() => 0.5 - Math.random()).slice(0, 10);

    container.innerHTML = "";
    related.forEach(i => {
      // ✅ FIX: Index.js jaisa calculation similar items mein bhi
      const basePrice = parseInt(i.price?.toString().replace(/[^\d]/g, "")) || 0;
      const discountAmount = parseInt(i.discount?.toString().replace(/[^\d]/g, "")) || 0;
      const finalPrice = basePrice - discountAmount;
      const imgSrc = i.images?.[0] || i.image || "noimg.png";

      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <img src="${imgSrc}" alt="${i.title}">
        <h3>${i.title}</h3>
        <p class="price-wrapper">
          <span class="new-price">
            <span class="rs">Rs.</span><strong>${finalPrice}</strong>
          </span>
          ${discountAmount > 0 ? `
            <span class="old-price">
              <span class="rs">Rs.</span>${basePrice}
            </span>` : ""}
        </p>
        <p class="view-text" style="color:#ff6600;font-size:13px;font-weight:600;margin-top:6px;display:none;"></p>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("selectedItem", JSON.stringify({
          ...i,
          finalPrice,
          originalPrice: basePrice,
          discountAmount,
          discountPercentage: basePrice > 0 ? Math.round((discountAmount / basePrice) * 100) : 0
        }));
        window.location.href = "Stores itemDetails.html";
      });

      container.appendChild(card);
    });
  }

  // Cart count
  function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = cart.reduce((sum, it) => sum + (it.quantity || 0), 0);
    cartCountEl.textContent = total;
    cartCountEl.style.display = total > 0 ? "inline" : "none";
  }
  updateCartCount();

  // Add to cart
  window.addToCart = function(event) {
    if (!item) return;
    if (!item.id) item.id = item.title.replace(/\s+/g, "_") + "_" + (item.finalPrice || item.price);
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const { finalPrice: fp } = getPriceData(item);
    const existing = cart.find(p => p.id === item.id);
    if (existing) existing.quantity += 1;
    else cart.push({
      id: item.id,
      title: item.title,
      price: fp,
      image: item.images ? item.images[0] : item.image,
      quantity: 1,
      description: item.description || "",
      sellerPhone: STORE_CONFIG.phone, // 🔥 HARDCODED
      delivery: item.delivery || 0,
      selectedColor,
      selectedSize
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    animateFlyToCart(event);
  };

  // 🔥 SIMPLE: Go to order page - No phone parameter
  window.goToOrderPage = function() {
    const { finalPrice: fp, originalPrice: op, discountPercentage } = getPriceData(item);
    localStorage.setItem("orderProduct", JSON.stringify({
      title: item.title,
      image: item.images ? item.images[0] : item.image,
      selectedColor,
      selectedSize,
      originalPrice: op,
      finalPrice: fp,
      discountPercentage,
      profit: item.profit || null,
      description: item.description || "",
      sellerPhone: STORE_CONFIG.phone, // 🔥 HARDCODED
      delivery: item.delivery || 0,
      productId: item.id || item.productId || Date.now()
    }));
    
    // 🔥 SIMPLE - No phone parameter
    window.location.href = "Stores Orders.html";
  };

  // Fly to cart animation
  function animateFlyToCart(e) {
    try {
      const imgSrc = item.images ? item.images[0] : item.image || "noimg.png";
      const flyImg = document.createElement("img");
      flyImg.src = imgSrc;
      flyImg.className = "fly-image";
      flyImg.style.position = "fixed";
      flyImg.style.zIndex = 9999;
      flyImg.style.width = "60px";
      flyImg.style.height = "60px";
      flyImg.style.objectFit = "cover";
      flyImg.style.borderRadius = "50%";
      flyImg.style.pointerEvents = "none";
      document.body.appendChild(flyImg);
      
      const start = e.target.getBoundingClientRect();
      flyImg.style.left = (start.left + start.width/2 - 30) + "px";
      flyImg.style.top = (start.top + start.height/2 - 30) + "px";
      
      const cartIcon = document.querySelector(".cart-bag").getBoundingClientRect();
      
      requestAnimationFrame(() => {
        flyImg.style.transition = "transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.7s ease";
        flyImg.style.transform = `translate(${cartIcon.left - start.left + cartIcon.width/2 - 30}px, ${cartIcon.top - start.top + cartIcon.height/2 - 30}px) scale(0.1)`;
        flyImg.style.opacity = "0";
      });
      
      setTimeout(() => flyImg.remove(), 750);
    } catch (err) {
      console.warn("Fly animation failed:", err);
    }
  }

  // Section toggle
  window.toggleSection = function(element) {
    const section = element.parentElement;
    section.classList.toggle("open");
  };

  // Initialize
  loadSupplierInfo();
  setupWhatsAppButton();
  loadSimilarItems(item);
});
