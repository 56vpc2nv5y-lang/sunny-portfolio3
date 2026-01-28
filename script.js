// ===== Scroll Reveal =====
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("visible");
  }
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ===== Year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Project filters =====
const chips = document.querySelectorAll(".chip");
const projects = document.querySelectorAll(".project");

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;

    projects.forEach(p => {
      const tags = (p.dataset.tags || "").split(",").map(s => s.trim());
      const show = (f === "all") || tags.includes(f);
      p.style.display = show ? "" : "none";
    });
  });
});

// ===== Collapsible projects (accordion-like) =====
const toggles = document.querySelectorAll(".proj-toggle");

toggles.forEach(btn => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    const bodyId = btn.getAttribute("aria-controls");
    const body = document.getElementById(bodyId);
    if (!body) return;

    // Toggle current
    btn.setAttribute("aria-expanded", String(!expanded));
    btn.querySelector(".plus").textContent = expanded ? "+" : "−";
    body.hidden = expanded;
  });
});

// ===== Skills evidence (tabs style) =====
const evidenceData = {
  sql: {
    title: "Usage Evidence for SQL:",
    items: [
      { label: "DataStory Internship — Monthly KPI reporting & validation", href: "#exp-datastory", meta: "SQL extraction, cleaning, and metric checks for management reports" },
      { label: "DataStory Internship — Dashboard metric pipeline", href: "#exp-datastory", meta: "KPI monitoring supporting performance tracking" }
    ]
  },
  tableau: {
    title: "Usage Evidence for Tableau:",
    items: [
      { label: "DataStory Internship — 10+ dashboards for leadership review", href: "#exp-datastory", meta: "BI dashboards for performance tracking and reporting" }
    ]
  },
  python_nlp: {
    title: "Usage Evidence for Python (NLP):",
    items: [
      { label: "Government Social Media Comment Analysis (NLP)", href: "#proj-gov-nlp", meta: "Pipeline on 20,000 comments: preprocessing → categorization → metrics" },
      { label: "DataStory Internship — Sentiment analysis", href: "#exp-datastory", meta: "50K+ brand comments sentiment insights for marketing support" }
    ]
  },
  modelling: {
    title: "Usage Evidence for Statistical Modelling:",
    items: [
      { label: "Health Engagement via the Internet", href: "#proj-health", meta: "Driver analysis through modelling with interpretable recommendations" },
      { label: "Teaching Assistant (Econometrics) — applied modelling methods", href: "#exp-ta", meta: "Econometrics + modelling concepts taught and applied in practice" }
    ]
  },
  market_research: {
    title: "Usage Evidence for Market Research:",
    items: [
      { label: "Haitong Securities — daily/weekly market reports", href: "#exp-securities", meta: "Market trend analysis based on price/volume and industry data" },
      { label: "DataStory Internship — social listening insights", href: "#exp-datastory", meta: "Consumer sentiment & engagement analysis supporting strategy" }
    ]
  }
};

const tabs = document.querySelectorAll(".skill-tab");
const evidenceTitle = document.getElementById("evidence-title");
const evidenceList = document.getElementById("evidence-list");

function renderEvidence(key){
  const data = evidenceData[key];
  if (!data) return;

  evidenceTitle.textContent = data.title;
  evidenceList.innerHTML = "";

  data.items.forEach(it => {
    const row = document.createElement("div");
    row.className = "evidence-item";
    row.innerHTML = `
      <div class="evidence-bullet">→</div>
      <div>
        <div><a href="${it.href}">${it.label}</a></div>
        <div class="evidence-meta">${it.meta}</div>
      </div>
    `;
    evidenceList.appendChild(row);
  });
}

// tab click
tabs.forEach(t => {
  t.addEventListener("click", () => {
    tabs.forEach(x => {
      x.classList.remove("active");
      x.setAttribute("aria-selected", "false");
    });
    t.classList.add("active");
    t.setAttribute("aria-selected", "true");
    renderEvidence(t.dataset.skill);
  });
});

// default select
const defaultTab = document.querySelector('.skill-tab[data-skill="python_nlp"]') || document.querySelector('.skill-tab[data-skill="sql"]');
if (defaultTab) defaultTab.click();
