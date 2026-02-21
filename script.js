// ── Custom cursor ──────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

document.querySelectorAll('a, button, .skill-tag, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1.8)';
    if(ring) {
      ring.style.width = '60px';
      ring.style.height = '60px';
      ring.style.borderColor = 'rgba(13,13,13,0.7)';
    }
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    if(ring) {
      ring.style.width = '40px';
      ring.style.height = '40px';
      ring.style.borderColor = 'rgba(13,13,13,0.5)';
    }
  });
});

// ── Navbar scroll ──────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
});

// ── Deep Learning Lifecycle Animation (Hero Background) ────────────────
const canvas = document.getElementById('net');
const ctx = canvas.getContext('2d');
let W, H;
let nodes = [];
let mouse = { x: -9999, y: -9999 };

// Bolder architecture to make the process highly visible: [Input, Hidden1, Hidden2, Hidden3, Output]
const architecture = [4, 8, 12, 8, 3];
let startX, endX;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildNetwork();
}

function buildNetwork() {
  nodes = [];
  const numLayers = architecture.length;
  const layerSpacing = W / (numLayers + 1);
  
  startX = layerSpacing;
  endX = layerSpacing * numLayers;

  for (let i = 0; i < numLayers; i++) {
    const numNeurons = architecture[i];
    // Expanded to 80% of screen height for a bigger, bolder look
    const layerHeight = H * 0.75; 
    const startY = (H - layerHeight) / 2;
    const neuronSpacing = numNeurons > 1 ? layerHeight / (numNeurons - 1) : 0;

    for (let j = 0; j < numNeurons; j++) {
      const x = layerSpacing * (i + 1);
      const y = numNeurons === 1 ? H / 2 : startY + (j * neuronSpacing);

      nodes.push({
        layer: i,
        x: x,
        y: y,
        ox: x, 
        oy: y, 
        vx: (Math.random() - 0.5) * 2.0,
        vy: (Math.random() - 0.5) * 2.0,
        // Increased base radius for a heavier look
        baseR: Math.random() * 2 + 2,
        r: 0 
      });
    }
  }
}

// Canvas Listeners
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => {
  if(!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
window.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

// Initialize network dimensions
resize();
const MOUSE_REPEL = 150;

function draw(timestamp) {
  if(!ctx) return;
  ctx.clearRect(0, 0, W, H);

  // Define the 8-second ML lifecycle loop
  const cycleDuration = 10000; 
  const progress = (timestamp % cycleDuration) / cycleDuration;
  
  let phase = "";
  let signalX = -999;
  let isBackprop = false;

  // State Machine for the ML Process
  if (progress < 0.1) {
    phase = "INPUT";
  } else if (progress < 0.45) {
    phase = "FORWARD";
    let p = (progress - 0.1) / 0.35;
    signalX = startX + p * (endX - startX);
  } else if (progress < 0.55) {
    phase = "OUTPUT";
  } else if (progress < 0.9) {
    phase = "BACKPROP";
    isBackprop = true;
    let p = (progress - 0.55) / 0.35;
    signalX = endX - p * (endX - startX);
  } else {
    phase = "IDLE";
  }

  // 1. Update & Draw Synapses (Weights)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];

      // Strict rule: only connect adjacent layers
      if (Math.abs(n1.layer - n2.layer) === 1) {
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);

        let alpha = 0.04; // Base faint visibility
        let lineWidth = 1.0;

        const midX = (n1.x + n2.x) / 2;
        const distToSignal = Math.abs(midX - signalX);

        if (phase === "FORWARD" && distToSignal < 100) {
          // Highlight passing signal
          alpha += (1 - distToSignal / 100) * 0.4;
          lineWidth = 2.0;
        } else if (phase === "BACKPROP" && distToSignal < 120) {
          // Backprop: Simulate weights updating by making lines jitter/flash
          alpha += (1 - distToSignal / 120) * (0.2 + Math.random() * 0.3);
          lineWidth = 1.5 + Math.random(); 
        }

        ctx.strokeStyle = `rgba(13, 13, 13, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    }
  }

  // 2. Update & Draw Neurons
  nodes.forEach(n => {
    n.x += n.vx;
    n.y += n.vy;

    // Spring physics pulling back to anchor
    n.vx += (n.ox - n.x) * 0.003;
    n.vy += (n.oy - n.y) * 0.003;
    n.vx *= 0.92;
    n.vy *= 0.92;

    // Mouse Interaction
    const dx = n.x - mouse.x;
    const dy = n.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_REPEL) {
      const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * 0.5;
      n.vx += (dx / dist) * force;
      n.vy += (dy / dist) * force;
    }

    // Determine Neuron Visual State
    let nodeAlpha = 0.4;
    n.r = n.baseR;

    if (phase === "INPUT" && n.layer === 0) {
      // Input nodes pulse
      n.r = n.baseR * 2.5;
      nodeAlpha = 0.9;
    } else if (phase === "OUTPUT" && n.layer === architecture.length - 1) {
      // Output nodes pulse
      n.r = n.baseR * 3.0;
      nodeAlpha = 1.0;
    } else if (phase === "FORWARD" || phase === "BACKPROP") {
      // Nodes light up as signal passes through
      const distToSignal = Math.abs(n.x - signalX);
      if (distToSignal < 60) {
        nodeAlpha += (1 - distToSignal / 60) * 0.5;
        n.r = n.baseR * 1.5;
      }
    }

    // Draw solid inner core
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(13, 13, 13, ${nodeAlpha})`;
    ctx.fill();
    
    // Draw outer stroke for active nodes
    if (nodeAlpha > 0.6) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(13, 13, 13, ${(nodeAlpha - 0.6) * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  requestAnimationFrame(draw);
}

// Start animation loop using performance.now() for accurate timing
requestAnimationFrame(draw);


// ── Intersection Observer for subtle entrance animations ──
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

// ── Smooth Scrolling for Navbar Links ──
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(!target) return; // Safety check if section doesn't exist
    
    const offset = 80; // adjust based on navbar height
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = target.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  });
});

// ── Stagger stat items ──
document.querySelectorAll('.stat-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.08}s`;
});


// ── GitHub Activity Calendar ──────────────────────────────
class GitHubCalendar {
  constructor({ username, container, onDataLoaded }) {
    this.username = username;
    this.container = container;
    this.onDataLoaded = onDataLoaded;
    this.weeks = [];
  }

  async init() {
    if (!this.username || !this.container) return;
    this.renderLoading();
    await this.fetchData();
  }

  renderLoading() {
    this.container.innerHTML = `
      <div style="height:120px; display:flex; align-items:center; justify-content:center; font-family:'DM Mono', monospace; font-size:12px; color:var(--ink-muted); text-transform:uppercase; letter-spacing:0.1em;">
        Fetching activity data...
      </div>
    `;
  }

  renderError() {
    this.container.innerHTML = `
      <div style="height:120px; display:flex; align-items:center; justify-content:center; font-family:'DM Mono', monospace; font-size:12px; color:var(--ink-muted); text-transform:uppercase; letter-spacing:0.1em;">
        Unable to load activity feed.
      </div>
    `;
  }

  async fetchData() {
    try {
      // Using an alternative reliable GitHub proxy API
      const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${this.username}?y=last`);
      
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      
      // Calculate total for the loaded year
      let total = 0;
      for (const year of Object.keys(data.contributions)) {
          total += data.total[year] || 0;
      }

      if (this.onDataLoaded) this.onDataLoaded(total);

      // The API returns an array of days, we need to process them into weeks
      this.processWeeks(data.contributions);
      this.render();
    } catch (err) {
      console.error("GitHub Calendar Error:", err);
      this.renderError();
    }
  }

  processWeeks(contributionsArray) {
    const processedWeeks = [];
    let currentWeek = Array(7).fill(null);

    contributionsArray.forEach((day, index) => {
      const dateObj = new Date(day.date);
      // getDay() returns 0 for Sunday, 6 for Saturday.
      const dayOfWeek = dateObj.getUTCDay();

      currentWeek[dayOfWeek] = day;

      // If it's Saturday or the very last day in the array, push the week
      if (dayOfWeek === 6 || index === contributionsArray.length - 1) {
        processedWeeks.push([...currentWeek]);
        currentWeek = Array(7).fill(null);
      }
    });

    this.weeks = processedWeeks;
  }

  getLevelColor(level) {
    // Styling matched to your high-contrast monochrome theme
    const colors = [
      "rgba(13, 13, 13, 0.04)", // Level 0 (Empty)
      "rgba(13, 13, 13, 0.25)", // Level 1 (Light)
      "rgba(13, 13, 13, 0.50)", // Level 2 (Medium)
      "rgba(13, 13, 13, 0.75)", // Level 3 (Dark)
      "rgba(13, 13, 13, 1.00)"  // Level 4 (Max)
    ];
    return colors[level] || colors[0];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", timeZone: 'UTC'
    });
  }

  render() {
    this.container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.overflowX = "auto"; // Allows horizontal scroll
    wrapper.style.paddingBottom = "12px";
    wrapper.style.display = "flex";
    wrapper.style.gap = "4px";

    this.weeks.forEach((week) => {
      const weekColumn = document.createElement("div");
      weekColumn.style.display = "flex";
      weekColumn.style.flexDirection = "column";
      weekColumn.style.gap = "4px";

      week.forEach((day) => {
        const cell = document.createElement("div");
        cell.style.width = "14px";
        cell.style.height = "14px";
        cell.style.borderRadius = "2px";
        cell.style.transition = "transform 0.1s";

        if (!day) {
          cell.style.background = "transparent";
        } else {
          cell.style.background = this.getLevelColor(day.level);
          cell.style.cursor = "pointer";

          cell.addEventListener("mouseenter", (e) => {
            cell.style.transform = "scale(1.15)"; // Pop effect on hover
            this.showTooltip(e, day);
          });
          cell.addEventListener("mouseleave", () => {
            cell.style.transform = "scale(1)";
            this.hideTooltip();
          });
        }
        weekColumn.appendChild(cell);
      });
      wrapper.appendChild(weekColumn);
    });

    this.container.appendChild(wrapper);

    // Auto scroll to latest date (far right)
    setTimeout(() => {
      wrapper.scrollLeft = wrapper.scrollWidth;
    }, 100);
  }

  showTooltip(e, day) {
    this.hideTooltip();

    const tooltip = document.createElement("div");
    tooltip.id = "gh-tooltip";
    tooltip.style.position = "fixed";
    tooltip.style.background = "var(--ink)";
    tooltip.style.color = "var(--bg)";
    tooltip.style.fontFamily = "'DM Mono', monospace";
    tooltip.style.fontSize = "10px";
    tooltip.style.padding = "8px 12px";
    tooltip.style.borderRadius = "0px"; // Sharp edges to match theme
    tooltip.style.pointerEvents = "none";
    tooltip.style.whiteSpace = "nowrap";
    tooltip.style.zIndex = "9999";
    tooltip.style.letterSpacing = "0.05em";

    const dateStr = this.formatDate(day.date);
    tooltip.innerHTML = `
      <div style="font-weight:bold; margin-bottom:4px;">${day.count} contributions</div>
      <div style="opacity:0.6; text-transform:uppercase;">${dateStr}</div>
    `;

    document.body.appendChild(tooltip);

    // Calculate positioning to float perfectly above the cell
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) + "px";
    tooltip.style.top = rect.top - 8 + "px";
    tooltip.style.transform = "translate(-50%, -100%)";
  }

  hideTooltip() {
    const existing = document.getElementById("gh-tooltip");
    if (existing) existing.remove();
  }
}

// ── Initialize the Calendar ──
// Make sure to replace "YOUR_GITHUB_USERNAME" with your actual username!
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('github-calendar-container');
  if (container) {
    const ghCalendar = new GitHubCalendar({
      username: 'haricharnbytes', // <-- CHANGE THIS TO YOUR USERNAME
      container: container,
      onDataLoaded: (total) => {
        // Updates the header text with your total contribution count
        const totalEl = document.getElementById('gh-total-contributions');
        if (totalEl) totalEl.textContent = total;
      }
    });
    ghCalendar.init();
  }
});