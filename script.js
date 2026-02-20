// ── Custom cursor ──────────────────────────────────────
const cursor = document.getElementById('cursor');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

document.querySelectorAll('a, button, .skill-tag, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1.8)';
    ring.style.width = '60px';
    ring.style.height = '60px';
    ring.style.borderColor = 'rgba(13,13,13,0.7)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.width = '40px';
    ring.style.height = '40px';
    ring.style.borderColor = 'rgba(13,13,13,0.5)';
  });
});

// ── Navbar scroll ──────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Neural network canvas ──────────────────────────────
const canvas = document.getElementById('net');
const ctx = canvas.getContext('2d');
let W, H, nodes = [], mouse = { x: -9999, y: -9999 };

function resize() {
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

document.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// Build nodes on a sphere-like distribution
function buildNodes(count) {
  nodes = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radialDist = 0.15 + Math.random() * 0.38;
    const r = Math.min(W, H) * radialDist;
    const cx = W / 2, cy = H / 2;
    // Bias toward ring shape
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * 0.9;
    const ringR = Math.min(W, H) * 0.30;
    const x = cx + Math.cos(theta) * ringR * (1 + Math.cos(phi) * 0.4) + (Math.random() - 0.5) * 180;
    const y = cy + Math.sin(theta) * ringR * 0.55 + Math.sin(phi) * ringR * 0.35 + (Math.random() - 0.5) * 120;
    nodes.push({
      x, y,
      ox: x, oy: y,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 2.2 + 0.6,
    });
  }
}
buildNodes(120);

const CONNECT_DIST = 120;
const MOUSE_REPEL = 90;

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Update nodes
  nodes.forEach(n => {
    n.x += n.vx;
    n.y += n.vy;
    // Soft return to origin
    n.vx += (n.ox - n.x) * 0.0006;
    n.vy += (n.oy - n.y) * 0.0006;
    // Damping
    n.vx *= 0.995;
    n.vy *= 0.995;
    // Mouse interaction
    const dx = n.x - mouse.x;
    const dy = n.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_REPEL) {
      const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * 0.4;
      n.vx += (dx / dist) * force;
      n.vy += (dy / dist) * force;
    }
  });

  // Draw connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECT_DIST) {
        const alpha = (1 - d / CONNECT_DIST) * 0.22;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(13,13,13,${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(13,13,13,0.5)';
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
draw();

// ── Intersection Observer for subtle entrance animations ──
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.stat-item, .project-card, .skill-tag').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  obs.observe(el);
});

// stagger stat items
document.querySelectorAll('.stat-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.08}s`;
});