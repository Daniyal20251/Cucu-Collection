/**
 * DELIGHT THEME ENGINE v2.1
 * - Flash nahi hogi: cached theme INSTANTLY apply hoti hai <body> visible hone se pehle
 * - Bottom nav (.bar) properly themed hoti hai
 * - Har page pe kaam karta hai
 * - Seller ka phone localStorage se auto-detect karta hai
 * - FIXED: Black theme mein flashSaleBox, skeleton, search history, suggestions properly themed
 */

// ── INSTANT FLASH FIX: body ko hide karo jab tak theme load na ho ──
(function() {
  const s = document.createElement('style');
  s.id = '__theme_hide__';
  s.textContent = 'body { opacity: 0 !important; transition: opacity 0.18s ease !important; }';
  document.head.appendChild(s);
})();

const DelightTheme = (() => {

  const API = "https://delight-backend--araindaniyalo2.replit.app";

  // ── Seller phone: Store.js se milta hai, ya localStorage se ──
  let SELLER_PHONE = null;

  // ============================================================
  // ALL 22 THEMES
  // ============================================================
  const THEMES = {
    default:  { name:"Delight Orange",    headerGrad:"linear-gradient(135deg,#ff5500,#ff7b00,#ff9500)",   accent:"#ff6b00", accentDark:"#e05a00", accentLight:"#fff3e8", accentGlow:"rgba(255,107,0,0.18)",    accentShadow:"rgba(255,107,0,0.4)",    bg:"#f2f2f7",  cardBg:"#ffffff", text:"#1a1a2e", textMid:"#555577", textLight:"#999",    border:"#e8e8f0", barGrad:"linear-gradient(135deg,#ff5500,#ff7b00,#ff9500)",   barShadow:"rgba(255,107,0,0.4)",    barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a1a2e", searchBorder:"#e8e8f0", skeletonBase:"#f0f0f0", skeletonShine:"#e4e4e4", suggestionBg:"#ffffff", suggestionText:"#1a1a2e", suggestionHover:"#fff3e8", flashBg:"#ffffff", flashBorder:"#e8e8f0", rvBg:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#a78bfa", placeholderColor:"#aaa", inputText:"#1a1a2e" },
    midnight: { name:"Midnight Blue",     headerGrad:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",   accent:"#818cf8", accentDark:"#6366f1", accentLight:"#1e1b4b", accentGlow:"rgba(129,140,248,0.2)",   accentShadow:"rgba(99,102,241,0.4)",   bg:"#0f0f1a",  cardBg:"#1a1a2e",  text:"#e8e8f5", textMid:"#9090b8", textLight:"#5f5f8a", border:"#2a2a44", barGrad:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",   barShadow:"rgba(99,102,241,0.5)",   barText:"rgba(255,255,255,0.85)", searchBg:"#1a1a2e", searchText:"#e8e8f5", searchBorder:"#2a2a44", skeletonBase:"#1e1e32", skeletonShine:"#2a2a44", suggestionBg:"#1a1a2e", suggestionText:"#e8e8f5", suggestionHover:"#1e1b4b", flashBg:"#1a1a2e", flashBorder:"#2a2a44", rvBg:"linear-gradient(135deg, #0a0a1a 0%, #12122e 50%, #0f0f25 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#818cf8", placeholderColor:"#5f5f8a", inputText:"#e8e8f5" },
    rose:     { name:"Rose Gold",         headerGrad:"linear-gradient(135deg,#c94b4b,#e57373,#f48fb1)",   accent:"#e57373", accentDark:"#c62828", accentLight:"#fce4ec", accentGlow:"rgba(229,115,115,0.18)",  accentShadow:"rgba(229,115,115,0.4)",  bg:"#fff0f3",  cardBg:"#ffffff", text:"#1a1a2e", textMid:"#666",    textLight:"#aaa",    border:"#fce4ec", barGrad:"linear-gradient(135deg,#c94b4b,#e57373,#f48fb1)",   barShadow:"rgba(229,115,115,0.4)", barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a1a2e", searchBorder:"#fce4ec", skeletonBase:"#f5e8ec", skeletonShine:"#ebd5dc", suggestionBg:"#ffffff", suggestionText:"#1a1a2e", suggestionHover:"#fce4ec", flashBg:"#ffffff", flashBorder:"#fce4ec", rvBg:"linear-gradient(135deg, #2e1a1a 0%, #3d1f2e 50%, #2a1520 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#f48fb1", placeholderColor:"#aaa", inputText:"#1a1a2e" },
    forest:   { name:"Forest Green",      headerGrad:"linear-gradient(135deg,#1b5e20,#2e7d32,#43a047)",   accent:"#43a047", accentDark:"#1b5e20", accentLight:"#e8f5e9", accentGlow:"rgba(67,160,71,0.18)",    accentShadow:"rgba(46,125,50,0.4)",    bg:"#f1f8f1",  cardBg:"#ffffff", text:"#1a2e1a", textMid:"#557755", textLight:"#99aa99", border:"#c8e6c9", barGrad:"linear-gradient(135deg,#1b5e20,#2e7d32,#43a047)",   barShadow:"rgba(46,125,50,0.4)",   barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a2e1a", searchBorder:"#c8e6c9", skeletonBase:"#e8f0e8", skeletonShine:"#d8e8d8", suggestionBg:"#ffffff", suggestionText:"#1a2e1a", suggestionHover:"#e8f5e9", flashBg:"#ffffff", flashBorder:"#c8e6c9", rvBg:"linear-gradient(135deg, #0a1a0a 0%, #122212 50%, #0f1a0f 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#81c784", placeholderColor:"#99aa99", inputText:"#1a2e1a" },
    ocean:    { name:"Ocean Blue",        headerGrad:"linear-gradient(135deg,#0277bd,#0288d1,#29b6f6)",   accent:"#0288d1", accentDark:"#0277bd", accentLight:"#e1f5fe", accentGlow:"rgba(2,136,209,0.18)",    accentShadow:"rgba(2,136,209,0.4)",    bg:"#e8f4fd",  cardBg:"#ffffff", text:"#0a1929", textMid:"#4a6fa5", textLight:"#90a4ae", border:"#b3e5fc", barGrad:"linear-gradient(135deg,#0277bd,#0288d1,#29b6f6)",   barShadow:"rgba(2,136,209,0.4)",   barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#0a1929", searchBorder:"#b3e5fc", skeletonBase:"#e0ecf5", skeletonShine:"#d0e0f0", suggestionBg:"#ffffff", suggestionText:"#0a1929", suggestionHover:"#e1f5fe", flashBg:"#ffffff", flashBorder:"#b3e5fc", rvBg:"linear-gradient(135deg, #0a1525 0%, #0f1f35 50%, #0a1528 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#4fc3f7", placeholderColor:"#90a4ae", inputText:"#0a1929" },
    purple:   { name:"Royal Purple",      headerGrad:"linear-gradient(135deg,#4a148c,#7b1fa2,#ab47bc)",   accent:"#7b1fa2", accentDark:"#4a148c", accentLight:"#f3e5f5", accentGlow:"rgba(123,31,162,0.18)",   accentShadow:"rgba(123,31,162,0.4)",   bg:"#f5f0ff",  cardBg:"#ffffff", text:"#1a1a2e", textMid:"#7a3b8f", textLight:"#b39ddb", border:"#e1bee7", barGrad:"linear-gradient(135deg,#4a148c,#7b1fa2,#ab47bc)",   barShadow:"rgba(123,31,162,0.4)", barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a1a2e", searchBorder:"#e1bee7", skeletonBase:"#f0e8f5", skeletonShine:"#e0d5ec", suggestionBg:"#ffffff", suggestionText:"#1a1a2e", suggestionHover:"#f3e5f5", flashBg:"#ffffff", flashBorder:"#e1bee7", rvBg:"linear-gradient(135deg, #1a0a2e 0%, #251040 50%, #1a0a30 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#ce93d8", placeholderColor:"#b39ddb", inputText:"#1a1a2e" },
    golden:   { name:"Golden Luxury",     headerGrad:"linear-gradient(135deg,#b8860b,#daa520,#ffd700)",   accent:"#b8860b", accentDark:"#7d5a00", accentLight:"#fff9e0", accentGlow:"rgba(184,134,11,0.18)",   accentShadow:"rgba(184,134,11,0.4)",   bg:"#fffef0",  cardBg:"#ffffff", text:"#2e1f00", textMid:"#806b2a", textLight:"#c8a951", border:"#ffe082", barGrad:"linear-gradient(135deg,#b8860b,#daa520,#ffd700)",   barShadow:"rgba(184,134,11,0.45)", barText:"rgba(0,0,0,0.8)", searchBg:"#ffffff", searchText:"#2e1f00", searchBorder:"#ffe082", skeletonBase:"#f5f0e0", skeletonShine:"#e8e0cc", suggestionBg:"#ffffff", suggestionText:"#2e1f00", suggestionHover:"#fff9e0", flashBg:"#ffffff", flashBorder:"#ffe082", rvBg:"linear-gradient(135deg, #2e2000 0%, #3d2a00 50%, #2a1c00 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#ffd54f", placeholderColor:"#c8a951", inputText:"#2e1f00" },
    teal:     { name:"Teal Breeze",       headerGrad:"linear-gradient(135deg,#00695c,#00897b,#26a69a)",   accent:"#00897b", accentDark:"#00695c", accentLight:"#e0f2f1", accentGlow:"rgba(0,137,123,0.18)",    accentShadow:"rgba(0,105,92,0.4)",     bg:"#e8f5f3",  cardBg:"#ffffff", text:"#002b27", textMid:"#356b63", textLight:"#80cbc4", border:"#b2dfdb", barGrad:"linear-gradient(135deg,#00695c,#00897b,#26a69a)",   barShadow:"rgba(0,105,92,0.4)",   barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#002b27", searchBorder:"#b2dfdb", skeletonBase:"#e0f0ee", skeletonShine:"#d0e8e4", suggestionBg:"#ffffff", suggestionText:"#002b27", suggestionHover:"#e0f2f1", flashBg:"#ffffff", flashBorder:"#b2dfdb", rvBg:"linear-gradient(135deg, #001a15 0%, #002520 50%, #001a18 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#4db6ac", placeholderColor:"#80cbc4", inputText:"#002b27" },
    sunset:   { name:"Sunset Vibes",      headerGrad:"linear-gradient(135deg,#f7971e,#ffd200,#f7971e)",   accent:"#f7971e", accentDark:"#e07b00", accentLight:"#fffde7", accentGlow:"rgba(247,151,30,0.18)",   accentShadow:"rgba(247,151,30,0.4)",   bg:"#fffbf0",  cardBg:"#ffffff", text:"#2e1a00", textMid:"#8a6200", textLight:"#cca84c", border:"#ffe0b2", barGrad:"linear-gradient(135deg,#f7971e,#ffd200,#f7971e)",   barShadow:"rgba(247,151,30,0.45)", barText:"rgba(0,0,0,0.8)", searchBg:"#ffffff", searchText:"#2e1a00", searchBorder:"#ffe0b2", skeletonBase:"#f5f0e0", skeletonShine:"#e8e0cc", suggestionBg:"#ffffff", suggestionText:"#2e1a00", suggestionHover:"#fffde7", flashBg:"#ffffff", flashBorder:"#ffe0b2", rvBg:"linear-gradient(135deg, #2e1a00 0%, #3d2500 50%, #2a1800 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#ffd54f", placeholderColor:"#cca84c", inputText:"#2e1a00" },
    cherry:   { name:"Cherry Blossom",    headerGrad:"linear-gradient(135deg,#e91e8c,#ff5caa,#ff8fc1)",   accent:"#e91e8c", accentDark:"#ad1457", accentLight:"#fce4ec", accentGlow:"rgba(233,30,140,0.18)",   accentShadow:"rgba(233,30,140,0.4)",   bg:"#fff5f9",  cardBg:"#ffffff", text:"#1a0012", textMid:"#a0527a", textLight:"#f48fb1", border:"#fce4ec", barGrad:"linear-gradient(135deg,#e91e8c,#ff5caa,#ff8fc1)",   barShadow:"rgba(233,30,140,0.4)", barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a0012", searchBorder:"#fce4ec", skeletonBase:"#f5e8ee", skeletonShine:"#ebd5e0", suggestionBg:"#ffffff", suggestionText:"#1a0012", suggestionHover:"#fce4ec", flashBg:"#ffffff", flashBorder:"#fce4ec", rvBg:"linear-gradient(135deg, #1a0010 0%, #2a0018 50%, #1a0012 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#f48fb1", placeholderColor:"#f48fb1", inputText:"#1a0012" },
    slate:    { name:"Slate Dark",        headerGrad:"linear-gradient(135deg,#1c1c2e,#2d2d44,#3f3f60)",   accent:"#6c8ebf", accentDark:"#4a6fa5", accentLight:"#1c2540", accentGlow:"rgba(108,142,191,0.2)",   accentShadow:"rgba(108,142,191,0.3)",  bg:"#1c1c2e",  cardBg:"#2d2d44",  text:"#e0e0f0", textMid:"#9090b0", textLight:"#606080", border:"#3f3f60", barGrad:"linear-gradient(135deg,#1c1c2e,#2d2d44,#3f3f60)",   barShadow:"rgba(108,142,191,0.3)", barText:"rgba(255,255,255,0.85)", searchBg:"#2d2d44", searchText:"#e0e0f0", searchBorder:"#3f3f60", skeletonBase:"#252540", skeletonShine:"#353560", suggestionBg:"#2d2d44", suggestionText:"#e0e0f0", suggestionHover:"#1c2540", flashBg:"#2d2d44", flashBorder:"#3f3f60", rvBg:"linear-gradient(135deg, #0a0a1a 0%, #12122e 50%, #0f0f25 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#90a4ae", placeholderColor:"#606080", inputText:"#e0e0f0" },
    coral:    { name:"Coral Reef",        headerGrad:"linear-gradient(135deg,#ff6b6b,#ff8e53,#ff6b35)",   accent:"#ff6b35", accentDark:"#e55a00", accentLight:"#fff0eb", accentGlow:"rgba(255,107,53,0.18)",   accentShadow:"rgba(255,107,53,0.4)",   bg:"#fff5f0",  cardBg:"#ffffff", text:"#2e1000", textMid:"#a05030", textLight:"#ffb89a", border:"#ffd5c0", barGrad:"linear-gradient(135deg,#ff6b6b,#ff8e53,#ff6b35)",   barShadow:"rgba(255,107,53,0.4)", barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#2e1000", searchBorder:"#ffd5c0", skeletonBase:"#f5ebe5", skeletonShine:"#e8ddd5", suggestionBg:"#ffffff", suggestionText:"#2e1000", suggestionHover:"#fff0eb", flashBg:"#ffffff", flashBorder:"#ffd5c0", rvBg:"linear-gradient(135deg, #2e1000 0%, #3d1800 50%, #2a0f00 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#ffab91", placeholderColor:"#ffb89a", inputText:"#2e1000" },
    indigo:   { name:"Indigo Night",      headerGrad:"linear-gradient(135deg,#1a237e,#283593,#3949ab)",   accent:"#3949ab", accentDark:"#1a237e", accentLight:"#e8eaf6", accentGlow:"rgba(57,73,171,0.18)",    accentShadow:"rgba(26,35,126,0.4)",    bg:"#eef0ff",  cardBg:"#ffffff", text:"#0d0f3a", textMid:"#4555a0", textLight:"#9fa8da", border:"#c5cae9", barGrad:"linear-gradient(135deg,#1a237e,#283593,#3949ab)",   barShadow:"rgba(26,35,126,0.4)",  barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#0d0f3a", searchBorder:"#c5cae9", skeletonBase:"#e8eaf5", skeletonShine:"#d8dce8", suggestionBg:"#ffffff", suggestionText:"#0d0f3a", suggestionHover:"#e8eaf6", flashBg:"#ffffff", flashBorder:"#c5cae9", rvBg:"linear-gradient(135deg, #0a0a2e 0%, #0f0f40 50%, #0a0a30 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#9fa8da", placeholderColor:"#9fa8da", inputText:"#0d0f3a" },
    mint:     { name:"Mint Fresh",        headerGrad:"linear-gradient(135deg,#00b09b,#96c93d,#00b09b)",   accent:"#00b09b", accentDark:"#00897b", accentLight:"#e0fff8", accentGlow:"rgba(0,176,155,0.18)",    accentShadow:"rgba(0,176,155,0.4)",    bg:"#f0fff9",  cardBg:"#ffffff", text:"#00251a", textMid:"#2a7a6a", textLight:"#80cbc4", border:"#b2ece6", barGrad:"linear-gradient(135deg,#00b09b,#96c93d,#00b09b)",   barShadow:"rgba(0,176,155,0.4)",  barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#00251a", searchBorder:"#b2ece6", skeletonBase:"#e0f5f0", skeletonShine:"#d0ece4", suggestionBg:"#ffffff", suggestionText:"#00251a", suggestionHover:"#e0fff8", flashBg:"#ffffff", flashBorder:"#b2ece6", rvBg:"linear-gradient(135deg, #001a10 0%, #002520 50%, #001a18 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#80cbc4", placeholderColor:"#80cbc4", inputText:"#00251a" },
    crimson:  { name:"Crimson Power",     headerGrad:"linear-gradient(135deg,#b71c1c,#c62828,#ef5350)",   accent:"#c62828", accentDark:"#b71c1c", accentLight:"#ffebee", accentGlow:"rgba(198,40,40,0.18)",    accentShadow:"rgba(183,28,28,0.4)",    bg:"#fff5f5",  cardBg:"#ffffff", text:"#1a0000", textMid:"#a02020", textLight:"#ef9a9a", border:"#ffcdd2", barGrad:"linear-gradient(135deg,#b71c1c,#c62828,#ef5350)",   barShadow:"rgba(183,28,28,0.4)",  barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a0000", searchBorder:"#ffcdd2", skeletonBase:"#f5e8e8", skeletonShine:"#ebd5d5", suggestionBg:"#ffffff", suggestionText:"#1a0000", suggestionHover:"#ffebee", flashBg:"#ffffff", flashBorder:"#ffcdd2", rvBg:"linear-gradient(135deg, #1a0000 0%, #2a0000 50%, #1a0000 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#ef9a9a", placeholderColor:"#ef9a9a", inputText:"#1a0000" },
    cyber:    { name:"Cyber Neon",        headerGrad:"linear-gradient(135deg,#000,#0a0a0a,#1a1a1a)",      accent:"#00ffaa", accentDark:"#00cc88", accentLight:"#001a0f", accentGlow:"rgba(0,255,170,0.25)",    accentShadow:"rgba(0,255,170,0.4)",    bg:"#080808",  cardBg:"#111111",  text:"#e0ffe0", textMid:"#55aa88", textLight:"#338866", border:"#002211", barGrad:"linear-gradient(135deg,#000,#001a0a,#002211)",      barShadow:"rgba(0,255,170,0.35)", barText:"#00ffaa", searchBg:"#111111", searchText:"#e0ffe0", searchBorder:"#002211", skeletonBase:"#0a0a0a", skeletonShine:"#1a1a1a", suggestionBg:"#111111", suggestionText:"#e0ffe0", suggestionHover:"#001a0f", flashBg:"#111111", flashBorder:"#002211", rvBg:"linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #050505 100%)", rvCardBg:"rgba(0,255,170,0.06)", rvText:"#e0ffe0", rvPrice:"#00ffaa", placeholderColor:"#338866", inputText:"#e0ffe0" },
    lavender: { name:"Lavender Dream",    headerGrad:"linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)",   accent:"#7c3aed", accentDark:"#5b21b6", accentLight:"#f5f3ff", accentGlow:"rgba(124,58,237,0.18)",   accentShadow:"rgba(124,58,237,0.4)",   bg:"#f5f3ff",  cardBg:"#ffffff", text:"#1e1b4b", textMid:"#6d4ac7", textLight:"#c4b5fd", border:"#ddd6fe", barGrad:"linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)",   barShadow:"rgba(124,58,237,0.4)", barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1e1b4b", searchBorder:"#ddd6fe", skeletonBase:"#f0ecff", skeletonShine:"#e0d8f5", suggestionBg:"#ffffff", suggestionText:"#1e1b4b", suggestionHover:"#f5f3ff", flashBg:"#ffffff", flashBorder:"#ddd6fe", rvBg:"linear-gradient(135deg, #1a0a3e 0%, #251050 50%, #1a0a40 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#b39ddb", placeholderColor:"#c4b5fd", inputText:"#1e1b4b" },
    earth:    { name:"Earthy Brown",      headerGrad:"linear-gradient(135deg,#5d4037,#795548,#a1887f)",   accent:"#795548", accentDark:"#5d4037", accentLight:"#fbe9e7", accentGlow:"rgba(121,85,72,0.18)",    accentShadow:"rgba(93,64,55,0.4)",     bg:"#fdf8f3",  cardBg:"#ffffff", text:"#1a0e00", textMid:"#7a5f50", textLight:"#bcaaa4", border:"#d7ccc8", barGrad:"linear-gradient(135deg,#5d4037,#795548,#a1887f)",   barShadow:"rgba(93,64,55,0.4)",   barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a0e00", searchBorder:"#d7ccc8", skeletonBase:"#f5f0ec", skeletonShine:"#e8e0d8", suggestionBg:"#ffffff", suggestionText:"#1a0e00", suggestionHover:"#fbe9e7", flashBg:"#ffffff", flashBorder:"#d7ccc8", rvBg:"linear-gradient(135deg, #1a0e00 0%, #2a1800 50%, #1a0f00 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#bcaaa4", placeholderColor:"#bcaaa4", inputText:"#1a0e00" },
    sky:      { name:"Sky White",         headerGrad:"linear-gradient(135deg,#4facfe,#00f2fe,#4facfe)",   accent:"#4facfe", accentDark:"#0288d1", accentLight:"#e3f4ff", accentGlow:"rgba(79,172,254,0.18)",   accentShadow:"rgba(79,172,254,0.4)",   bg:"#f7fbff",  cardBg:"#ffffff", text:"#0a2540", textMid:"#4a80a0", textLight:"#90c8e0", border:"#b3d8f5", barGrad:"linear-gradient(135deg,#4facfe,#00f2fe,#4facfe)",   barShadow:"rgba(79,172,254,0.4)", barText:"rgba(0,0,0,0.75)", searchBg:"#ffffff", searchText:"#0a2540", searchBorder:"#b3d8f5", skeletonBase:"#e8f4ff", skeletonShine:"#d8ecff", suggestionBg:"#ffffff", suggestionText:"#0a2540", suggestionHover:"#e3f4ff", flashBg:"#ffffff", flashBorder:"#b3d8f5", rvBg:"linear-gradient(135deg, #0a1525 0%, #0f1f35 50%, #0a1528 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#81d4fa", placeholderColor:"#90c8e0", inputText:"#0a2540" },
    aurora:   { name:"Aurora Borealis",   headerGrad:"linear-gradient(135deg,#f953c6,#b91d73,#4776e6)",   accent:"#f953c6", accentDark:"#b91d73", accentLight:"#1a0030", accentGlow:"rgba(249,83,198,0.25)",   accentShadow:"rgba(249,83,198,0.4)",   bg:"#0d0020",  cardBg:"#1a0035",  text:"#f0e0ff", textMid:"#b070d0", textLight:"#704090", border:"#3a0060", barGrad:"linear-gradient(135deg,#f953c6,#b91d73,#4776e6)",   barShadow:"rgba(249,83,198,0.4)", barText:"rgba(255,255,255,0.9)", searchBg:"#1a0035", searchText:"#f0e0ff", searchBorder:"#3a0060", skeletonBase:"#120020", skeletonShine:"#1a0035", suggestionBg:"#1a0035", suggestionText:"#f0e0ff", suggestionHover:"#1a0030", flashBg:"#1a0035", flashBorder:"#3a0060", rvBg:"linear-gradient(135deg, #050010 0%, #0a0020 50%, #050015 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"#f0e0ff", rvPrice:"#ce93d8", placeholderColor:"#704090", inputText:"#f0e0ff" },
    olive:    { name:"Olive & Cream",     headerGrad:"linear-gradient(135deg,#556b2f,#6b8e23,#808000)",   accent:"#6b8e23", accentDark:"#556b2f", accentLight:"#f5f5e0", accentGlow:"rgba(107,142,35,0.18)",   accentShadow:"rgba(85,107,47,0.4)",    bg:"#f8f7f0",  cardBg:"#ffffff", text:"#1a1a00", textMid:"#6a7040", textLight:"#a8b070", border:"#d8d8b0", barGrad:"linear-gradient(135deg,#556b2f,#6b8e23,#808000)",   barShadow:"rgba(85,107,47,0.4)",  barText:"rgba(255,255,255,0.85)", searchBg:"#ffffff", searchText:"#1a1a00", searchBorder:"#d8d8b0", skeletonBase:"#f0f0e0", skeletonShine:"#e0e0d0", suggestionBg:"#ffffff", suggestionText:"#1a1a00", suggestionHover:"#f5f5e0", flashBg:"#ffffff", flashBorder:"#d8d8b0", rvBg:"linear-gradient(135deg, #1a1a00 0%, #2a2a00 50%, #1a1a00 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"rgba(255,255,255,0.88)", rvPrice:"#c5e1a5", placeholderColor:"#a8b070", inputText:"#1a1a00" },
    black:    { name:"Pure Black",        headerGrad:"linear-gradient(135deg,#000000,#111111,#1a1a1a)",          accent:"#7c6af0", accentDark:"#5b4ed4", accentLight:"#1a1a2e", accentGlow:"rgba(124,106,240,0.22)",  accentShadow:"rgba(124,106,240,0.3)",  bg:"#000000",  cardBg:"#111111",  text:"#e0e0e0", textMid:"#888888", textLight:"#555555", border:"#2a2040", barGrad:"linear-gradient(135deg,#111111,#1a1a1a,#222222)",          barShadow:"rgba(255,255,255,0.08)", barText:"rgba(255,255,255,0.85)", searchBg:"#111111", searchText:"#e0e0e0", searchBorder:"#222222", skeletonBase:"#0a0a0a", skeletonShine:"#1a1a1a", suggestionBg:"#111111", suggestionText:"#e0e0e0", suggestionHover:"#1a1a1a", flashBg:"#111111", flashBorder:"#222222", rvBg:"linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #050505 100%)", rvCardBg:"rgba(255,255,255,0.06)", rvText:"#e0e0e0", rvPrice:"#ffffff", placeholderColor:"#555555", inputText:"#e0e0e0" },
  };

  // ============================================================
  // INJECT CSS — body, header, .bar, cards, buttons, etc.
  // ============================================================
  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  function injectCSS(t) {
    let style = document.getElementById("__delight_theme__");
    if (!style) {
      style = document.createElement("style");
      style.id = "__delight_theme__";
      document.head.appendChild(style);
    }

    // Calculate RGB values for glass-morphism
    const cardBgRgb = hexToRgb(t.cardBg);
    const bgRgb = hexToRgb(t.bg);

    style.textContent = `
      :root {
        --card-bg-rgb: ${cardBgRgb};
        --bg-rgb: ${bgRgb};
        --primary: ${t.accent} !important;
        --primary-dark: ${t.accentDark} !important;
        --primary-light: ${t.accentLight} !important;
        --primary-glow: ${t.accentGlow} !important;
        --bg: ${t.bg} !important;
        --card-bg: ${t.cardBg} !important;
        --text-dark: ${t.text} !important;
        --text-mid: ${t.textMid} !important;
        --text-light: ${t.textLight} !important;
        --border: ${t.border} !important;
        --accent: ${t.accent} !important;
        --accent-orange: ${t.accent} !important;
        --accent-orange-light: ${t.accentLight} !important;
        --accent-orange-dark: ${t.accentDark} !important;
        --border-color: ${t.border} !important;
      }

      /* ── BODY ── */
      body { background: ${t.bg} !important; color: ${t.text} !important; }

      /* ── HEADER ── */
      header, .store-header {
        background: ${t.headerGrad} !important;
        box-shadow: 0 3px 20px ${t.accentShadow} !important;
      }

      /* ── BOTTOM NAV (.bar) — Main Store Nav ── */
      nav.bar, .store-nav.bar, body > nav.bar {
        background: ${t.barGrad} !important;
        box-shadow: 0 8px 28px ${t.barShadow}, 0 2px 8px rgba(0,0,0,0.15) !important;
      }
      nav.bar a, .store-nav.bar a, body > nav.bar a {
        color: ${t.barText} !important;
      }
      nav.bar a.active, nav.bar a:hover,
      .store-nav.bar a.active, .store-nav.bar a:hover {
        color: white !important;
        background: rgba(255,255,255,0.22) !important;
      }
      nav.bar a.active img, nav.bar a:hover img,
      .store-nav.bar a.active img, .store-nav.bar a:hover img {
        opacity: 1 !important;
        filter: brightness(0) invert(1) !important;
      }
      nav.bar a.active::after, .store-nav.bar a.active::after {
        background: white !important;
      }
      nav.bar a img, .store-nav.bar a img {
        filter: brightness(0) invert(1) !important;
        opacity: 0.85 !important;
      }

      /* ── FAB BUTTONS (Home bar, Cart bag, Share btn) ── */
      div.bar.fab-btn, .cart-bag.fab-btn, .share-btn.fab-btn {
        background: ${t.cardBg} !important;
        border: 1.5px solid ${t.accent} !important;
        box-shadow: 0 2px 12px rgba(0,0,0,0.10), 0 0 0 1px ${t.accentGlow} !important;
      }
      div.bar.fab-btn .fab-icon,
      .cart-bag.fab-btn .fab-icon,
      .share-btn.fab-btn .fab-icon {
        fill: ${t.text} !important;
      }
      div.bar.fab-btn:hover .fab-icon,
      .cart-bag.fab-btn:hover .fab-icon,
      .share-btn.fab-btn:hover .fab-icon {
        fill: ${t.accent} !important;
      }
      div.bar.fab-btn:hover, .cart-bag.fab-btn:hover, .share-btn.fab-btn:hover {
        border-color: ${t.accent} !important;
        box-shadow: 0 4px 18px ${t.accentGlow}, 0 0 0 3px ${t.accentGlow} !important;
      }
      .cart-count {
        background: ${t.accent} !important;
        border-color: ${t.cardBg} !important;
      }

      /* ── CARDS ── */
      .item-card, .product-card, .card, .store-card,
      .rv-card, .flash-card, .order-card, .cart-item {
        background: ${t.cardBg} !important;
        border-color: ${t.border} !important;
      }

      /* ── PRICES ── */
      .new-price, .price, .item-price, .product-price, .flash-price {
        color: ${t.accent} !important;
      }

      /* ── BUTTONS ── */
      .btn-primary, .add-to-cart, .buy-btn, .order-btn,
      .checkout-btn, .place-order-btn, .submit-btn,
      .btn-order, .action-btn {
        background: ${t.headerGrad} !important;
        box-shadow: 0 3px 12px ${t.accentShadow} !important;
        color: #fff !important;
        border: none !important;
      }

      /* ── SEARCH BAR ── */
      .search-bar, .search-wrapper, .search-box {
        border-color: ${t.border} !important;
      }
      .search-bar:focus-within, .search-wrapper:focus-within {
        border-color: ${t.accent} !important;
        box-shadow: 0 0 0 3px ${t.accentGlow} !important;
      }

      /* ── CATEGORY PILLS / SIDEBAR ── */
      .cat-pill.active, .sidebar-item.active, .filter-active, .category-active {
        background: ${t.accent} !important;
        color: #fff !important;
      }
      .cat-pill.active img, .sidebar-item.active img {
        filter: brightness(0) invert(1) !important;
      }
      .sidebar-item.active { border-left-color: ${t.accent} !important; }

      /* ── INPUT FOCUS ── */
      input:focus, textarea:focus, select:focus {
        border-color: ${t.accent} !important;
        box-shadow: 0 0 0 3px ${t.accentGlow} !important;
        outline: none !important;
      }

      /* ── CART BADGE ── */
      .cart-badge, .badge-count, .nav-badge {
        background: ${t.accent} !important;
        color: #fff !important;
      }

      /* ── LINKS / ACCENT TEXT ── */
      .accent-color, .text-accent, .see-all-btn, .view-all-link {
        color: ${t.accent} !important;
      }

      /* ── FLASH SALE HEADER ── */
      .flash-sale-header, .section-header-grad {
        background: ${t.headerGrad} !important;
      }

      /* ── PROFILE PAGE ── */
      .profile-header, .profile-top {
        background: ${t.headerGrad} !important;
      }

      /* ── ORDER STATUS BADGE ── */
      .status-pending, .status-badge {
        background: ${t.accentLight} !important;
        color: ${t.accentDark} !important;
      }

      /* ── DIVIDERS / BORDERS ── */
      hr, .divider { border-color: ${t.border} !important; }

      /* ── SKELETON SHIMMER override ── */
      .skeleton { background: ${t.border} !important; }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Flash Sale Section (.section-block)
         ═══════════════════════════════════════════════════════════ */
      .section-block, .flash-sale-section {
        background: ${t.flashBg} !important;
        border: 1.5px solid ${t.flashBorder} !important;
      }
      .section-block .section-title,
      .flash-sale-section .flash-sale-heading,
      .section-block .see-all-btn {
        color: ${t.text} !important;
      }
      .section-block .see-all-btn {
        background: ${t.accentLight} !important;
        color: ${t.accent} !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Skeleton Loading Cards — Full Theme-Aware
         ═══════════════════════════════════════════════════════════ */
      .skeleton-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 12px 12px 0;
      }
      .skeleton-card {
        background: ${t.cardBg} !important;
        border: 1.5px solid ${t.border} !important;
        border-radius: var(--radius-sm, 10px) !important;
        overflow: hidden !important;
        height: 230px !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .skeleton-card .skeleton-img {
        width: 100% !important;
        height: 145px !important;
        background: linear-gradient(90deg, ${t.skeletonBase} 25%, ${t.skeletonShine} 50%, ${t.skeletonBase} 75%) !important;
        background-size: 300% 100% !important;
        animation: shimmer 1.4s ease-in-out infinite !important;
      }
      .skeleton-card .skeleton-title {
        width: 80% !important;
        height: 13px !important;
        border-radius: 6px !important;
        margin: 10px 10px 0 !important;
        background: linear-gradient(90deg, ${t.skeletonBase} 25%, ${t.skeletonShine} 50%, ${t.skeletonBase} 75%) !important;
        background-size: 300% 100% !important;
        animation: shimmer 1.4s ease-in-out infinite !important;
      }
      .skeleton-card .skeleton-price {
        width: 45% !important;
        height: 16px !important;
        border-radius: 6px !important;
        margin: 8px 10px 0 !important;
        background: linear-gradient(90deg, ${t.skeletonBase} 25%, ${t.skeletonShine} 50%, ${t.skeletonBase} 75%) !important;
        background-size: 300% 100% !important;
        animation: shimmer 1.4s ease-in-out infinite !important;
      }
      .skeleton-ad {
        width: 100% !important;
        height: 175px !important;
        border-radius: var(--radius-md, 16px) !important;
        background: linear-gradient(90deg, ${t.skeletonBase} 25%, ${t.skeletonShine} 50%, ${t.skeletonBase} 75%) !important;
        background-size: 300% 100% !important;
        animation: shimmer 1.4s ease-in-out infinite !important;
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .skeleton-container.hidden { display: none !important; }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Search Panel (Recent Searches + Popular)
         ═══════════════════════════════════════════════════════════ */
      .search-panel {
        background: ${t.searchBg} !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
      }
      .search-panel .recent-title,
      .search-panel .popular-label {
        color: ${t.textMid} !important;
      }
      .search-panel .clear-btn {
        color: ${t.accent} !important;
        border-color: ${t.accent}40 !important;
        background: ${t.accentLight} !important;
      }
      .search-panel .clear-btn:hover {
        background: ${t.accent} !important;
        color: #fff !important;
      }
      #recentSearches li {
        color: ${t.searchText} !important;
        border-bottom-color: ${t.border} !important;
      }
      #recentSearches li::before {
        color: ${t.textLight} !important;
      }
      #recentSearches li:hover {
        background: ${t.suggestionHover} !important;
      }
      .popular-chips span {
        background: ${t.bg} !important;
        color: ${t.searchText} !important;
        border-color: ${t.border} !important;
      }
      .popular-chips span:hover {
        background: ${t.accent} !important;
        color: #fff !important;
        border-color: ${t.accent} !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Search Suggestions Dropdown
         ═══════════════════════════════════════════════════════════ */
      .suggestions-dropdown {
        background: ${t.suggestionBg} !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
      }
      .suggestion-item {
        color: ${t.suggestionText} !important;
      }
      .suggestion-item:hover {
        background: ${t.suggestionHover} !important;
      }
      .suggestion-item .sug-icon {
        color: ${t.accent} !important;
      }
      .suggestion-item em {
        color: ${t.accent} !important;
      }
      .suggestion-item .sug-category {
        color: ${t.textLight} !important;
        background: ${t.bg} !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Search Input Box & Placeholder
         ═══════════════════════════════════════════════════════════ */
      .search-input-box {
        background: ${t.searchBg} !important;
        border: 1px solid ${t.searchBorder} !important;
      }
      .search-input-box:focus-within {
        background: ${t.cardBg} !important;
        border-color: ${t.accent} !important;
        box-shadow: 0 0 0 3px ${t.accentGlow} !important;
      }
      .search {
        color: ${t.inputText} !important;
      }
      .search::placeholder {
        color: ${t.placeholderColor} !important;
      }
      .search-placeholder-anim {
        color: ${t.placeholderColor} !important;
      }
      .search-placeholder-anim::after {
        color: ${t.accent} !important;
      }
      .search-clear-btn {
        color: ${t.textLight} !important;
      }
      .search-back-btn {
        color: ${t.accent} !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Recently Viewed Section
         ═══════════════════════════════════════════════════════════ */
      .rv-section-block {
        background: ${t.rvBg} !important;
        border-color: ${t.border} !important;
      }
      .rv-section-block::before {
        color: ${t.textLight}20 !important;
      }
      .rv-title-text {
        background: linear-gradient(90deg, ${t.accent}, ${t.textMid}, ${t.accent}) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
      }
      .rv-count-badge {
        background: ${t.headerGrad} !important;
        color: #fff !important;
      }
      .rv-clear-btn {
        background: ${t.textLight}15 !important;
        border-color: ${t.textLight}30 !important;
        color: ${t.textLight} !important;
      }
      .rv-clear-btn:hover {
        background: ${t.accent}30 !important;
        border-color: ${t.accent}60 !important;
        color: ${t.accent} !important;
      }
      .rv-card-new {
        background: ${t.rvCardBg} !important;
        border-color: ${t.textLight}20 !important;
      }
      .rv-card-new:hover {
        border-color: ${t.accent}60 !important;
        box-shadow: 0 12px 32px ${t.accentShadow} !important;
      }
      .rv-card-title {
        color: ${t.rvText} !important;
      }
      .rv-price {
        background: linear-gradient(90deg, ${t.accent}, ${t.textMid}) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
      }
      .rv-old-price {
        color: ${t.textLight}60 !important;
        -webkit-text-fill-color: ${t.textLight}60 !important;
      }
      .rv-viewed-dot {
        background: ${t.accent} !important;
        box-shadow: 0 0 6px 2px ${t.accentGlow} !important;
      }
      @keyframes dotGlow {
        0%,100% { box-shadow: 0 0 6px 2px ${t.accentGlow}; }
        50%     { box-shadow: 0 0 12px 4px ${t.accent}; }
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: All Products Header
         ═══════════════════════════════════════════════════════════ */
      .products-section-header .section-title {
        color: ${t.text} !important;
      }
      .products-section-header .all-word {
        color: ${t.accent} !important;
      }
      .products-section-header .section-title::after {
        background: linear-gradient(90deg, ${t.accent}, ${t.textMid}, ${t.accent}) !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Not Found / Empty States
         ═══════════════════════════════════════════════════════════ */
      .not-found h3 {
        color: ${t.accent} !important;
      }
      .not-found p {
        color: ${t.textMid} !important;
      }
      .not-found .try-tag {
        background: ${t.accentLight} !important;
        color: ${t.accent} !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Flash Sale Cards
         ═══════════════════════════════════════════════════════════ */
      .flash-sale-card {
        background: ${t.cardBg} !important;
        border-color: ${t.border} !important;
      }
      .flash-sale-card .card-title {
        color: ${t.text} !important;
      }
      .flash-sale-card .final-price {
        color: ${t.accent} !important;
      }
      .flash-sale-card .old-price {
        color: ${t.textLight} !important;
      }
      .flash-sale-card .stock-badge {
        background: ${t.headerGrad} !important;
        color: #fff !important;
      }
      .flash-sale-card .discount-badge {
        background: ${t.headerGrad} !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Product Card Details
         ═══════════════════════════════════════════════════════════ */
      .item-card h3 {
        color: ${t.text} !important;
      }
      .item-card .old-price-inline {
        color: ${t.textLight} !important;
      }
      .item-card:hover {
        border-color: ${t.accent}60 !important;
        box-shadow: 0 8px 28px ${t.accentShadow} !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Live Badge in Flash Sale
         ═══════════════════════════════════════════════════════════ */
      .live-badge {
        background: ${t.headerGrad} !important;
        color: #fff !important;
        -webkit-text-fill-color: #fff !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: Fire Icon Glow
         ═══════════════════════════════════════════════════════════ */
      .fire-glow {
        background: radial-gradient(ellipse, ${t.accentShadow} 0%, transparent 70%) !important;
      }

      /* ═══════════════════════════════════════════════════════════
         FIXED: WhatsApp Button (keep green, just ensure visibility)
         ═══════════════════════════════════════════════════════════ */
      .wa-float-btn {
        background: linear-gradient(135deg, #25d366 0%, #128c5e 100%) !important;
      }
      .wa-tooltip {
        background: rgba(18,140,94,0.95) !important;
        color: white !important;
      }
      .wa-tooltip::after {
        border-left-color: rgba(18,140,94,0.95) !important;
      }

      /* ═══════════════════════════════════════════════════════════
         DELIGHT CHAT PAGE — Full dark-safe theming
         ═══════════════════════════════════════════════════════════ */

      /* Chat header uses same gradient as main header */
      .chat-header {
        background: ${t.headerGrad} !important;
        box-shadow: 0 2px 8px ${t.accentShadow} !important;
      }
      .chat-seller-name  { color: #fff !important; }
      .chat-seller-status { color: rgba(255,255,255,0.8) !important; }

      /* Chat background */
      .chat-messages {
        background-color: ${t.bg} !important;
      }
      .chat-welcome h3 { color: ${t.text} !important; }
      .chat-welcome p  { color: ${t.textMid} !important; }

      /* Product bar */
      .chat-product-bar {
        background: ${t.cardBg} !important;
        border-bottom: 1px solid ${t.border} !important;
      }
      .chat-product-title { color: ${t.text} !important; }
      .chat-product-price { color: ${t.accent} !important; }
      .chat-product-img   { border-color: ${t.border} !important; }
      .chat-view-product-btn {
        background: ${t.headerGrad} !important;
        color: #fff !important;
      }

      /* Buyer bubble */
      .chat-message.buyer {
        background: ${t.accentLight} !important;
        color: ${t.text} !important;
      }
      .chat-message.buyer::after {
        border-color: transparent transparent transparent ${t.accentLight} !important;
      }
      .chat-message.buyer .chat-message-time { color: ${t.accentDark} !important; opacity: 0.85; }

      /* Seller bubble */
      .chat-message.seller {
        background: ${t.cardBg} !important;
        color: ${t.text} !important;
      }
      .chat-message.seller::after {
        border-color: transparent ${t.cardBg} transparent transparent !important;
      }
      .chat-message.seller .chat-message-time { color: ${t.textLight} !important; }

      /* System message */
      .chat-message.system {
        background: rgba(128,128,128,0.12) !important;
        color: ${t.textMid} !important;
        border-color: ${t.border} !important;
      }

      /* Read tick */
      .chat-read-status { color: ${t.accent} !important; }

      /* Typing indicator */
      .chat-typing { background: ${t.bg} !important; color: ${t.textMid} !important; }
      .typing-dots span { background: ${t.accent} !important; }

      /* Input area */
      .chat-input-area {
        background: ${t.bg} !important;
        border-top: 1px solid ${t.border} !important;
      }
      .chat-input-wrapper {
        background: ${t.cardBg} !important;
        border: 1px solid ${t.border} !important;
      }
      .chat-input-wrapper input {
        background: transparent !important;
        color: ${t.text} !important;
      }
      .chat-input-wrapper input::placeholder { color: ${t.placeholderColor} !important; }
      .chat-attach-btn { color: ${t.accent} !important; }
      .chat-send-btn {
        background: ${t.headerGrad} !important;
        color: #fff !important;
      }
      .chat-send-btn:disabled {
        background: ${t.border} !important;
        opacity: 0.5;
      }

      /* Attach menu */
      .chat-attach-menu {
        background: ${t.cardBg} !important;
        border: 1px solid ${t.border} !important;
        box-shadow: 0 4px 24px rgba(0,0,0,0.25) !important;
      }
      .attach-option span:last-child { color: ${t.textMid} !important; }
      .attach-option:active { background: ${t.accentLight} !important; }

      /* Product card in chat bubble */
      .chat-product-card {
        background: ${t.cardBg} !important;
        border-color: ${t.border} !important;
      }
      .chat-product-card-info { background: ${t.cardBg} !important; }
      .chat-product-card-title { color: ${t.text} !important; }
      .chat-product-card-price { color: ${t.accent} !important; }

      /* Login modal */
      .chat-login-sheet {
        background: ${t.cardBg} !important;
        border-top: 1px solid ${t.border} !important;
      }
      .chat-login-sheet h3 { color: ${t.text} !important; }
      .chat-login-sheet p  { color: ${t.textMid} !important; }
      .chat-login-btn {
        background: ${t.headerGrad} !important;
        color: #fff !important;
      }
      .chat-login-cancel { color: ${t.textMid} !important; }

      /* Message images border */
      .chat-message-images img { border-color: ${t.border} !important; }

      /* Scrollbar accent */
      .chat-messages::-webkit-scrollbar-thumb { background: ${t.accent} !important; }

      /* CSS vars for chat page (used in :after pseudo-elements) */
      :root {
        --chat-header-bg: ${t.headerGrad};
        --accent-orange-light: ${t.accentLight};
        --accent-orange-dark: ${t.accentDark};
      }
    `;

    // Body ko visible karo
    revealBody();
  }

  // ── Show body after theme applied ──
  function revealBody() {
    const hide = document.getElementById("__theme_hide__");
    if (hide) hide.remove();
    document.body.style.opacity = "1";
  }

  // ============================================================
  // APPLY — Instant cached + fresh from API
  // ============================================================
  async function apply(sellerPhone) {
    if (!sellerPhone) { revealBody(); return; }
    SELLER_PHONE = sellerPhone;

    // STEP 1: Cached theme turant lagao (zero flash)
    const cacheKey = "dlTheme_" + sellerPhone;
    const cached = localStorage.getItem(cacheKey);
    if (cached && THEMES[cached]) {
      injectCSS(THEMES[cached]);
    } else {
      // default lagao taake body visible ho
      injectCSS(THEMES["default"]);
    }

    // STEP 2: API se fresh fetch (background mein)
    try {
      const res = await fetch(`${API}/seller-theme/${sellerPhone}`);
      const data = await res.json();
      const themeId = (data.success && data.theme) ? data.theme : "default";

      // Sirf update karo agar change hua ho
      if (themeId !== (cached || "default")) {
        injectCSS(THEMES[themeId] || THEMES["default"]);
      }
      localStorage.setItem(cacheKey, themeId);

    } catch (e) {
      // Offline: cached chal raha hai already
    }
  }

  function getTheme(id) { return THEMES[id] || THEMES["default"]; }

  return { apply, getTheme, THEMES };

})();