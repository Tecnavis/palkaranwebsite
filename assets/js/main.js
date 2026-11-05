/* Palkkaran — interactions & animations (no dependencies) */
(() => {
  const WA_NUMBER = "917994753798";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Header: shrink on scroll, hide on scroll-down, show on scroll-up */
  const header = $(".header");
  const bar = $(".scroll-bar");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 20);
    if (!document.body.classList.contains("menu-open")) {
      header?.classList.toggle("hidden", y > 400 && y > lastY + 4);
      if (y < lastY - 4) header?.classList.remove("hidden");
    }
    lastY = y;
    if (bar) {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    }
    updateTimeline();
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const burger = $(".burger");
  burger?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".mobile-menu a").forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
  }));

  /* Reveal on scroll */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: .15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* Count-up numbers */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; countIO.unobserve(el);
      const end = parseFloat(el.dataset.count); const suffix = el.dataset.suffix || "";
      if (reduce) { el.textContent = end + suffix; return; }
      const t0 = performance.now(), dur = 1600;
      const tick = t => {
        const p = Math.min((t - t0) / dur, 1), k = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * k) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .6 });
  $$("[data-count]").forEach(el => countIO.observe(el));

  /* Timeline progress line that fills as you scroll */
  const tl = $(".timeline"), prog = $(".timeline .progress"), steps = $$(".timeline .step");
  function updateTimeline() {
    if (!tl || !prog) return;
    const r = tl.getBoundingClientRect(), mid = innerHeight * .55;
    const h = Math.max(0, Math.min(r.height, mid - r.top));
    prog.style.height = h + "px";
    steps.forEach(s => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle("on", sr.top + sr.height / 2 < mid);
    });
  }

  /* Live status: what Palkkaran is doing right now (IST) */
  const live = $("[data-live]");
  if (live) {
    const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const m = ist.getHours() * 60 + ist.getMinutes();
    const stages = [
      [180, 270, "Cows are being bathed & milked", "Started at 3:00 AM"],
      [270, 285, "Quality check in progress", "Every batch, every day"],
      [285, 345, "Hygienic packing underway", "Bottles & eco pouches"],
      [345, 510, "Out for delivery now", "Arriving before 8:30 AM"],
    ];
    const s = stages.find(([a, b]) => m >= a && m < b);
    const [title, sub] = s ? [s[2], s[3]] : (m >= 510 && m < 1320)
      ? ["Today's milk delivered", "Order now for tomorrow morning"]
      : ["Preparing tomorrow's fresh milk", "Milking starts at 3:00 AM"];
    live.innerHTML = `${title} <span class="muted">· ${sub}</span>`;
  }

  /* Milk bubbles in hero */
  const bubbles = $(".bubbles");
  if (bubbles && !reduce) {
    for (let i = 0; i < 16; i++) {
      const b = document.createElement("span");
      const size = 8 + Math.random() * 34;
      b.className = "bubble";
      b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${9 + Math.random() * 12}s;animation-delay:${-Math.random() * 18}s;--drift:${(Math.random() - .5) * 120}px`;
      bubbles.appendChild(b);
    }
  }

  /* Hero phones: 3D tilt following the pointer */
  const visual = $(".hero-visual"), phones = $(".hero-phones");
  if (visual && phones && !reduce && matchMedia("(pointer:fine)").matches) {
    visual.addEventListener("pointermove", e => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      phones.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`;
    });
    visual.addEventListener("pointerleave", () => { phones.style.transform = ""; });
  }

  /* Spotlight following cursor on feature cards */
  $$(".feature").forEach(card => card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  /* Magnetic buttons */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    $$(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        btn.style.translate = `${(e.clientX - r.left - r.width / 2) * .2}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.translate = ""; });
    });
  }

  /* FAQ: smooth open/close + only one open at a time */
  $$(".faq").forEach(d => {
    const body = $(".faq-body", d), sum = $("summary", d);
    sum.addEventListener("click", e => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        const a = body.animate([{ height: body.scrollHeight + "px" }, { height: "0px" }], { duration: 350, easing: "ease" });
        a.onfinish = () => d.open = false;
      } else {
        $$(".faq[open]").forEach(o => o !== d && $("summary", o).click());
        d.open = true;
        body.animate([{ height: "0px", opacity: 0 }, { height: body.scrollHeight + "px", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" });
      }
    });
  });

  /* Contact form → opens WhatsApp with a prefilled message */
  const form = $("#enquiry-form");
  form?.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form);
    const lines = [
      `Hi Palkkaran! I'd like to enquire.`,
      `Name: ${f.get("name")}`,
      `Phone: ${f.get("phone")}`,
      f.get("area") && `Area: ${f.get("area")}`,
      `Interested in: ${f.get("topic")}`,
      f.get("message") && `Message: ${f.get("message")}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  });

  /* Footer year */
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  onScroll();
})();
