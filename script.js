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
const evidenceData = {
  viz: {
    title: "Usage Evidence for Visualization:",
    items: [
      { label: "DataStory Internship — Monthly KPI reporting & validation", href: "#exp-datastory", meta: "Tableau dashboards for performance tracking" },
      { label: "Data Analysis Studio", href: "#proj-studio", meta: "Led studio generating revenue & creating sales dashboards" },
      { label: "Airflight Analysis", href: "javascript:void(0)", meta: "(PDF in organization) Flight data visualization" }
    ]
  },
  r_stat: {
    title: "Usage Evidence for R Language:",
    items: [
      { label: "Gold Price Prediction", href: "#gp-gold", meta: "Comparative study and forecasting using R" },
      { label: "Econometrics TA Support", href: "#exp-ta", meta: "Led workshops applying regression and diagnostic tests using R scripts" },
      { label: "Health Engagement Analysis", href: "#proj-health", meta: "Ordinal logistic regression and SEM implementation in R" }
    ]
  },
  python: {
    title: "Usage Evidence for Python:",
    items: [
      { label: "Gov Social Media Comment Analysis (NLP)", href: "#proj-gov-nlp", meta: "Pipeline on 20,000 comments: preprocessing → categorization → metrics" },
      { label: "Bank Subscription Prediction", href: "#gp-bank", meta: "XGBoost optimization and prediction modelling using Python" },
      { label: "Health Engagement Analysis", href: "#proj-health", meta: "Data processing and modeling support" },
      { label: "Teaching Assistant (Econometrics)", href: "#exp-ta", meta: "Python for supplementary analysis and student demos" },
      { label: "Investment Assistant Intern @ Haitong", href: "#exp-securities", meta: "Data automation and analysis for market reports" },
      { label: "Happiness Index Project", href: "#proj-happiness", meta: "XGBoost modeling and data consolidation" }
    ]
  },
  sql: {
    title: "Usage Evidence for SQL:",
    items: [
      { label: "DataStory Internship — Monthly KPI reporting & validation", href: "#exp-datastory", meta: "SQL extraction, cleaning, and metric checks for management reports" },
      { label: "Duifenyi Learning Management System", href: "#gp-duifenyi", meta: "Database design and ER modeling for learning system" }
    ]
  },
  ml: {
    title: "Usage Evidence for Machine Learning:",
    items: [
      { label: "Bank Subscription Prediction", href: "#gp-bank", meta: "XGBoost classifier with feature engineering" },
      { label: "Health Engagement Analysis", href: "#proj-health", meta: "Driver analysis using statistical learning methods" },
      { label: "Random Forest — Credit & Breast Cancer Data", href: "javascript:void(0)", meta: 'Files: <a href="ML3_random forest.pdf" target="_blank">Report (PDF)</a> | <a href="ML3_random forest.R" download>Code (R)</a>' },
      { label: "Online Public Opinion Defocusing (Hierarchical Clustering)", href: "ML5_Hierarchical Clustering–Based Classification and Prediction of Online Public Opinion Defocusing.pdf", meta: '(Chinese) <a href="ML5_Hierarchical Clustering–Based Classification and Prediction of Online Public Opinion Defocusing.pdf" target="_blank">report.pdf</a>' }
    ]
  },
  ts: {
    title: "Usage Evidence for Time Series Analysis:",
    items: [
      { label: "Gold Price Prediction", href: "#gp-gold", meta: "ARIMA vs Grey Model (GM) forecasting" },
      { label: "Short-Term Restaurant Customer Flow (ARIMA)", href: "javascript:void(0)", meta: 'Files: <a href="TIME2_restaurant.png" target="_blank">Graph (PNG)</a> | <a href="TIME2_Short-Term Restaurant Customer Flow Forecasting with ARIMA.pdf" target="_blank">Paper (PDF)</a>' },
      { label: "Global Temperature Change Forecasting (ARIMA)", href: "TIME3_An ARIMA-Based Study on Global Temperature Change Forecasting.pdf", meta: '(Chinese) <a href="TIME3_An ARIMA-Based Study on Global Temperature Change Forecasting.pdf" target="_blank">View Paper (PDF)</a>' }
    ]
  },
  causal: {
    title: "Usage Evidence for Causal Inference:",
    items: [
      { label: "Electric Vehicles: Green or Trade-Off?", href: "#gp-ev", meta: "Life cycle assessment and conditional causal analysis" },
      { label: "Happiness Index", href: "#proj-happiness", meta: "Policy impact analysis using observational data" }
    ]
  },
  nlp: {
    title: "Usage Evidence for Natural Language Processing (NLP):",
    items: [
      { label: "Gov Social Media NLP", href: "#proj-gov-nlp", meta: "Sentiment analysis on government social media interactions" },
      { label: "Sentiment Analysis on IMDB Dataset", href: "NLP1_Sentiment Analysis on the IMDB Dataset.pdf", meta: '<a href="NLP1_Sentiment Analysis on the IMDB Dataset.pdf" target="_blank">View Analysis (PDF)</a>' },
      { label: "Aspect-Based Sentiment Analysis (Restaurant Reviews)", href: "javascript:void(0)", meta: "<span class='tag'>In Progress</span> SVM and TF-IDF implementation" }
    ]
  },
  genai: {
    title: "Usage Evidence for Gen AI:",
    items: [
      { label: "RAG in medical and research", href: "AI1_RAG in medical and research.pdf", meta: '<a href="AI1_RAG in medical and research.pdf" target="_blank">View PDF</a>' }
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
        <div><a href="${it.href}" ${it.href.startsWith('#') || it.href.startsWith('javascript') ? '' : 'target="_blank"'}>${it.label}</a></div>
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
  // 默认选中 Visualization
  const defaultTab = document.querySelector('.skill-tab[data-skill="viz"]');
  if (defaultTab) {
    defaultTab.click();
  }
});
