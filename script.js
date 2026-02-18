// --- Theme Configuration ---
const themes = [
  { bg1: "#0f172a", bg2: "#1e293b", bg3: "#334155", accent: "#ffffff", rgb: "255, 255, 255" }, // Midnight
  { bg1: "#1a1c2c", bg2: "#5d275d", bg3: "#b13e53", accent: "#ef7d57", rgb: "239, 125, 87" }, // Sunset
  { bg1: "#071821", bg2: "#304c5a", bg3: "#86a69d", accent: "#f3e7e2", rgb: "243, 231, 226" }, // Ocean
  { bg1: "#1d1135", bg2: "#0c0b13", bg3: "#321d5a", accent: "#764ba2", rgb: "118, 75, 162" }, // Deep Purple
  { bg1: "#1b2a1a", bg2: "#2a422a", bg3: "#4a6d4a", accent: "#a6e22e", rgb: "166, 226, 46" }  // Matrix
];

const patterns = ['pattern-dots', 'pattern-lines', 'pattern-mesh', ''];

function shiftTheme() {
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const root = document.querySelector(':root');
  const card = document.getElementById('quoteCard');
  
  root.style.setProperty('--bg-1', theme.bg1);
  root.style.setProperty('--bg-2', theme.bg2);
  root.style.setProperty('--bg-3', theme.bg3);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-rgb', theme.rgb);

  // Apply unique background pattern to card
  card.className = "quote-card"; // Reset
  if (pattern) card.classList.add(pattern);
  
  // Randomize card gradient opacity slightly for uniqueness
  const opacity = (Math.random() * 0.05 + 0.05).toFixed(2);
  root.style.setProperty('--card-bg-gradient', `rgba(${theme.rgb}, ${opacity})`);
}

// --- Particle Background System ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    this.color = `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb')}, ${Math.random() * 0.5 + 0.2})`;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    // Drifting motion
    this.x += this.vx;
    this.y += this.vy;

    // Boundary check
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Mouse interactivity
    if (mouse.x !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = 150;
      let force = (maxDistance - distance) / maxDistance;
      
      if (distance < maxDistance) {
        // Repulsion
        this.x -= forceDirectionX * force * 5;
        this.y -= forceDirectionY * force * 5;
      }
    }
  }
}

function initParticles() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = [];
  for (let i = 0; i < 150; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

// Interactivity Listeners
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mousedown', () => {
  // Burst effect
  particles.forEach(p => {
    let dx = mouse.x - p.x;
    let dy = mouse.y - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 300) {
      p.vx = (p.x - mouse.x) / 10;
      p.vy = (p.y - mouse.y) / 10;
    }
  });
});

window.addEventListener('resize', initParticles);

// --- Quote Logic ---
async function generateQuote() {
  const quoteText = document.getElementById("quoteText");
  const authorText = document.getElementById("author");
  const loader = document.getElementById("loader");
  const btn = document.getElementById("newQuoteBtn");

  shiftTheme(); // Randomize theme per generation

  loader.style.display = "flex";
  btn.disabled = true;
  quoteText.classList.add("fade-out");
  authorText.classList.add("fade-out");

  try {
    const response = await fetch("https://motivational-spark-api.vercel.app/api/quotes/random");
    const data = await response.json();

    setTimeout(() => {
      quoteText.innerText = `“${data.quote}”`;
      authorText.innerText = `— ${data.author || 'Unknown'}`;
      quoteText.classList.remove("fade-out");
      authorText.classList.remove("fade-out");
    }, 400);
  } catch (error) {
    console.error("API Error:", error);
    handleError(quoteText, authorText);
  } finally {
    setTimeout(() => {
      loader.style.display = "none";
      btn.disabled = false;
    }, 600);
  }
}

async function searchByAuthor() {
  const query = document.getElementById("authorSearch").value.trim().toLowerCase();
  const quoteText = document.getElementById("quoteText");
  const authorText = document.getElementById("author");
  const loader = document.getElementById("loader");
  const btn = document.getElementById("newQuoteBtn");

  if (!query) return;

  shiftTheme();

  loader.style.display = "flex";
  btn.disabled = true;
  quoteText.classList.add("fade-out");
  authorText.classList.add("fade-out");

  try {
    const response = await fetch("https://motivational-spark-api.vercel.app/api/quotes");
    const quotes = await response.json();
    const results = quotes.filter(q => q.author && q.author.toLowerCase().includes(query));

    setTimeout(() => {
      if (results.length > 0) {
        const randomQuote = results[Math.floor(Math.random() * results.length)];
        quoteText.innerText = `“${randomQuote.quote}”`;
        authorText.innerText = `— ${randomQuote.author}`;
      } else {
        quoteText.innerText = "“Sorry, we couldn't find quotes for this personality in our data.”";
        authorText.innerText = "Try another name or click Random!";
      }
      quoteText.classList.remove("fade-out");
      authorText.classList.remove("fade-out");
    }, 400);
  } catch (error) {
    handleError(quoteText, authorText);
  } finally {
    setTimeout(() => {
      loader.style.display = "none";
      btn.disabled = false;
    }, 600);
  }
}

function handleError(quoteEl, authorEl) {
  setTimeout(() => {
    quoteEl.innerText = "“The connection is weak, but your heart remains strong.”";
    authorEl.innerText = "— System Offline";
    quoteEl.classList.remove("fade-out");
    authorEl.classList.remove("fade-out");
  }, 400);
}

// --- User Feedback (Toast) ---
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

async function getQuoteImage() {
  const quoteCard = document.getElementById("quoteCard");
  const canvas = await html2canvas(quoteCard, {
    scale: 3,
    backgroundColor: null,
    logging: false,
    useCORS: true
  });
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(blob);
    }, 'image/png');
  });
}

async function downloadQuote() {
  const quoteCard = document.getElementById("quoteCard");
  html2canvas(quoteCard, {
    scale: 3,
    backgroundColor: null,
    logging: false,
    useCORS: true
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `quote-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Premium card downloaded!");
  });
}

function toggleShareMenu() {
  const menu = document.getElementById("shareMenu");
  menu.classList.toggle("active");
  
  const closeMenu = (e) => {
    if (!e.target.closest('.share-container')) {
      menu.classList.remove("active");
      document.removeEventListener('click', closeMenu);
    }
  };
  
  if (menu.classList.contains("active")) {
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
  }
}

async function shareTo(platform) {
  const text = document.getElementById("quoteText").innerText;
  const author = document.getElementById("author").innerText;
  const fullText = `${text} ${author}`;
  const url = window.location.href;
  
  document.getElementById("shareMenu").classList.remove("active");

  try {
    const blob = await getQuoteImage();
    const file = new File([blob], "quote.png", { type: "image/png" });

    // 1. Mobile Sharing (Navigator.share)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Aesthetic Quote',
        text: fullText,
      });
      return;
    }

    // 2. Desktop Sharing (Clipboard Image + Platform Link)
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        showToast("Card copied! Press Ctrl+V to paste in your post.");
      } catch (err) {
        console.warn("Clipboard image failed:", err);
      }
    }
  } catch (err) {
    console.error("Image generation failed:", err);
  }

  // 3. Open Platform Hubs (Fallbacks)
  const encodedText = encodeURIComponent(fullText);
  const encodedUrl = encodeURIComponent(url);
  let shareUrl = "";

  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
      break;
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case 'instagram':
      window.open('https://www.instagram.com/', '_blank');
      return;
  }

  if (shareUrl) {
    window.open(shareUrl, "_blank", "width=600,height=400");
  }
}

// Initialization
window.onload = () => {
  initParticles();
  animate();
  generateQuote();
};
