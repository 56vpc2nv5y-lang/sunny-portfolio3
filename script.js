document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Reveal Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 2. Project Accordion Logic
    const accordions = document.querySelectorAll('.project-accordion');

    accordions.forEach(acc => {
        const header = acc.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const isOpen = acc.classList.contains('active');
            accordions.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.accordion-body').style.maxHeight = null;
            });
            if (!isOpen) {
                acc.classList.add('active');
                const body = acc.querySelector('.accordion-body');
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });

    // 3. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 4. Skills Evidence Logic (NEW: Restored from your request)
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
          { label: "Government Social Media Comment Analysis (NLP)", href: "#ug-projects", meta: "Pipeline on 20,000 comments: preprocessing → categorization → metrics" },
          { label: "Retail Churn Prediction", href: "#grad-projects", meta: "Feature engineering and data processing in Python" }
        ]
      },
      modelling: {
        title: "Usage Evidence for Statistical Modelling:",
        items: [
          { label: "Retail Customer Churn Prediction", href: "#grad-projects", meta: "XGBoost & Logistic Regression comparison" },
          { label: "Teaching Assistant (Econometrics)", href: "#exp-ta", meta: "Econometrics + modelling concepts taught and applied in practice" }
        ]
      },
      market_research: {
        title: "Usage Evidence for Market Research:",
        items: [
          { label: "Haitong Securities — daily/weekly market reports", href: "#exp-securities", meta: "Market trend analysis based on price/volume and industry data" }
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

    // Tab click event
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

    // Default select
    const defaultTab = document.querySelector('.skill-tab[data-skill="sql"]');
    if (defaultTab) {
        defaultTab.click(); // Trigger default click to load content
    }
});
