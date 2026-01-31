// ===== 1. 页面滚动显示动画 (Scroll Reveal) =====
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("visible");
  }
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ===== 2. 自动更新页脚年份 =====
const yearEl = document.getElementById("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

// ===== 3. 项目折叠卡片逻辑 (Accordion) =====
const toggles = document.querySelectorAll(".proj-toggle");
toggles.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    const expanded = btn.getAttribute("aria-expanded") === "true";
    const bodyId = btn.getAttribute("aria-controls");
    const body = document.getElementById(bodyId);
    if (!body) return;

    btn.setAttribute("aria-expanded", String(!expanded));
    btn.querySelector(".plus").textContent = expanded ? "+" : "−";
    body.hidden = expanded;
  });
});

// ===== 4. 技能证据库 (Skills Evidence) =====
// 注意：这里的 key (如 r_stat) 必须和 HTML 里的 data-skill="r_stat" 完全一致
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
      { label: "RAG-based QA System", href: "#gp-rag", meta: "Vector embeddings and semantic search pipeline" }
    ]
  },
  modelling: {
    title: "Usage Evidence for Statistical Modelling:",
    items: [
      { label: "Health Engagement via the Internet", href: "#proj-health", meta: "Driver analysis through modelling with interpretable recommendations" },
      { label: "Teaching Assistant (Econometrics)", href: "#exp-ta", meta: "Econometrics + modelling concepts taught and applied in practice" },
      { label: "Graduate Project: Advanced Statistical Modelling", href: "#gp-stat", meta: "GLM and multivariate analysis on complex datasets" }
    ]
  },
  // 修正：添加 R Language 的对应数据
  r_stat: {
    title: "Usage Evidence for R Language:",
    items: [
      { label: "Statistical Modelling (MSc Course)", href: "#gp-stat", meta: "Derived causal relationships using GLM and rigorous hypothesis testing in R" },
      { label: "Econometrics TA Support", href: "#exp-ta", meta: "Led workshops applying regression and diagnostic tests using R scripts" }
    ]
  },
  // 修正：添加 Microsoft Suite 的对应数据
  office: {
    title: "Usage Evidence for Microsoft Suite:",
    items: [
      { label: "Audit Intern @ Huaxing CPA", href: "#exp-audit", meta: "Advanced Excel (VLOOKUP, Pivot Tables) for financial variance analysis" },
      { label: "Investment Assistant @ Haitong", href: "#exp-securities", meta: "Professional reporting and market presentations using PowerPoint and Excel" }
    ]
  }
};

const tabs = document.querySelectorAll(".skill-tab");
const evidenceTitle = document.getElementById("evidence-title");
const evidenceList = document.getElementById("evidence-list");

// 渲染内容的函数
function renderEvidence(key) {
  const data = evidenceData[key];
  if (!data) return;

  evidenceTitle.textContent = data.title;
  evidenceList.innerHTML = ""; // 清空当前列表

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

// 绑定 Tab 点击事件
tabs.forEach(t => {
  t.addEventListener("click", () => {
    // 切换激活状态样式
    tabs.forEach(x => {
      x.classList.remove("active");
      x.setAttribute("aria-selected", "false");
    });
    t.classList.add("active");
    t.setAttribute("aria-selected", "true");
    
    // 执行渲染
    renderEvidence(t.dataset.skill);
  });
});

// ===== 5. 页面加载后的默认行为 =====
document.addEventListener("DOMContentLoaded", () => {
  // 默认选中 Python (你截图里的效果)
  const defaultTab = document.querySelector('.skill-tab[data-skill="python_nlp"]');
  if (defaultTab) {
    defaultTab.click();
  }
});
