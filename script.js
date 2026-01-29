// ===== Scroll Reveal =====
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("visible");
  }
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// 简单的数字滚动函数
const runCounter = (el) => {
  const target = parseFloat(el.getAttribute('data-target'));
  const duration = 1500; // 动画持续 1.5秒
  const step = target / (duration / 16); // 60fps
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target.toFixed(2); // 保留两位小数
      clearInterval(timer);
    } else {
      el.textContent = current.toFixed(2);
    }
  }, 16);
};

// 结合 IntersectionObserver (当元素进入屏幕时触发)
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.counter');
      counters.forEach(c => runCounter(c));
      counterObserver.unobserve(entry.target); // 只运行一次
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.timeline-item').forEach(item => {
  counterObserver.observe(item);
});
// ===== Year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Project filters =====
const chips = document.querySelectorAll(".chip");
// FIX: Only target projects inside the "Undergraduate/Experience" section for filtering
const projects = document.querySelectorAll("#projects .project");

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
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Safe practice to prevent bubbling
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
      { label: "DataStory Internship — Dashboard metric pipeline", href: "#exp-datastory", meta: "KPI monitoring supporting performance tracking" },
      { label: "Happiness Index Project", href: "#proj-happiness", meta: "Joined multi-year public datasets for index construction" }
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
      { label: "RAG-based QA System", href: "#grad-projects", meta: "Vector embeddings and semantic search pipeline" }
    ]
  },
  // NEW: R Language
  r_stats: {
    title: "Usage Evidence for R Language:",
    items: [
      { label: "Health Engagement Survey Analysis", href: "#proj-health", meta: "Used R for Ordinal Logistic Regression and structural equation modeling" },
      { label: "Statistical Modelling Grad Project", href: "#gp-stat", meta: "Multivariate analysis and GLM implementation" }
    ]
  },
  modelling: {
    title: "Usage Evidence for Statistical Modelling:",
    items: [
      { label: "Health Engagement via the Internet", href: "#proj-health", meta: "Driver analysis through modelling with interpretable recommendations" },
      { label: "Teaching Assistant (Econometrics)", href: "#exp-ta", meta: "Econometrics + modelling concepts taught and applied in practice" },
      { label: "Graduate Project: Advanced Statistical Modelling", href: "#grad-projects", meta: "GLM and multivariate analysis on complex datasets" }
    ]
  },
  // NEW: Microsoft Suite (linked to everything)
  ms_suite: {
    title: "Usage Evidence for Microsoft Suite (Excel/PPT):",
    items: [
      { label: "Audit Intern @ Huaxing CPA", href: "#exp-audit", meta: "Advanced Excel for financial variance analysis and risk checking" },
      { label: "Investment Intern @ Haitong Securities", href: "#exp-securities", meta: "Created market insight decks (PPT) and volume analysis reports" },
      { label: "Data Analysis Studio Lead", href: "#proj-studio", meta: "Managed 30+ project deliverables and client presentations" },
      { label: "DataStory Internship", href: "#exp-datastory", meta: "Excel for preliminary data validation before SQL ingestion" },
      { label: "Competitions (Challenge Cup & Market Research)", href: "#projects", meta: "Structured reporting (Word) and final defense presentations (PPT)" }
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
