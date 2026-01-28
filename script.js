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
// This prevents Grad Projects (which are separate) from disappearing when you click filters.
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
  modelling: {
    title: "Usage Evidence for Statistical Modelling:",
    items: [
      { label: "Health Engagement via the Internet", href: "#proj-health", meta: "Driver analysis through modelling with interpretable recommendations" },
      { label: "Teaching Assistant (Econometrics)", href: "#exp-ta", meta: "Econometrics + modelling concepts taught and applied in practice" },
      { label: "Graduate Project: Advanced Statistical Modelling", href: "#grad-projects", meta: "GLM and multivariate analysis on complex datasets" }
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
// ==========================================
// Education Section Data & Animation Logic
// ==========================================

const educationData = [
  {
    school: "Nanyang Technological University (NTU), Singapore",
    period: "Aug 2025 – Jun 2026 (Expected)",
    degree: "MSc in Analytics",
    // 左侧数据：label=标签, value=滚动数字, suffix=后缀(如 / 5.00)
    metrics: [
      { label: "CGPA", value: 4.60, suffix: " / 5.00" },
      { label: "Grade", text: "A+/A" } // 纯文本用 text
    ],
    // 右侧标签区域
    tagsLabel: "Focus & Output:",
    tags: ["3 Major Projects", "RecSys Algorithms", "RAG Pipelines", "Data Mining"]
  },
  {
    school: "Guangdong University of Foreign Studies (GDUFS), China",
    period: "Sep 2021 – Jun 2025",
    degree: "BSc in Statistics",
    metrics: [
      { label: "CGPA", value: 3.90, suffix: " / 4.00" },
      { label: "Ranking", text: "Top 4%" }
    ],
    tagsLabel: "Achievements:",
    tags: ["3x Competition Lead", "Econometrics", "Regression Analysis", "Statistical Inference"]
  }
];

// 1. 渲染 HTML 函数
function renderEducation() {
  const container = document.getElementById("edu-container");
  if (!container) return;

  container.innerHTML = educationData.map(item => `
    <div class="timeline-item card reveal">
      <div class="timeline-top">
        <h3>${item.school}</h3>
        <span class="tag">${item.period}</span>
      </div>

      <div class="edu-rows">
        <div class="edu-left">
          <p><strong>${item.degree}</strong></p>
          <div class="edu-kpis">
            ${item.metrics.map(m => {
              // 如果有 value 属性，就渲染成可滚动的数字，否则渲染纯文本
              if (m.value !== undefined) {
                return `
                  <span class="kpi">
                    ${m.label}: 
                    <span class="highlight-num count-up" data-target="${m.value}">0</span>
                    ${m.suffix || ''}
                  </span>`;
              } else {
                return `
                  <span class="kpi">
                    ${m.label ? m.label + ': ' : ''}
                    <span class="highlight-num">${m.text}</span>
                  </span>`;
              }
            }).join('')}
          </div>
        </div>
        
        <div class="edu-right">
          <div style="font-size:13px; color:#64748b; margin-bottom:8px;">${item.tagsLabel}</div>
          <div class="edu-kpis" style="margin-top:0">
            ${item.tags.map(tag => `<span class="kpi">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// 2. 数字滚动动画函数
function runCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const duration = 1500; // 动画时长 1.5秒
  const frameRate = 16;
  const totalFrames = duration / frameRate;
  const increment = target / totalFrames;
  
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target.toFixed(2); // 保持两位小数
      clearInterval(timer);
    } else {
      el.textContent = current.toFixed(2);
    }
  }, frameRate);
}

// 3. 初始化与监听滚动
document.addEventListener("DOMContentLoaded", () => {
  renderEducation(); // 先生成 HTML

  // 设置观察器，当 Education 区域进入屏幕时触发动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 找到所有的数字元素并开始滚动
        const counters = entry.target.querySelectorAll(".count-up");
        counters.forEach(c => runCounter(c));
        observer.unobserve(entry.target); // 动画只播放一次
      }
    });
  }, { threshold: 0.2 });

  // 观察刚才生成的卡片
  const cards = document.querySelectorAll("#edu-container .timeline-item");
  cards.forEach(card => observer.observe(card));
});
