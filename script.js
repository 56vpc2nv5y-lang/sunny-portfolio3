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
            
            // Close others
            accordions.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.accordion-body').style.maxHeight = null;
            });

            // Toggle current
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
});
