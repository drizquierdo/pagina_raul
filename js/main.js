// ===== ACADEMIA METABOLIX - JAVASCRIPT PRINCIPAL =====

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== NAVEGACIÓN NAVBAR =====
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarNav = document.getElementById('navbar-nav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    if (navbarToggle && navbarNav) {
        navbarToggle.addEventListener('click', function() {
            navbarNav.classList.toggle('active');
            const spans = navbarToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
        
        const navLinks = navbarNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarNav.classList.remove('active');
                const spans = navbarToggle.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            });
        });
    }
    
    // ===== SCROLL SUAVE (SIMPLIFICADO) =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 90; // Ajuste para el navbar fijo
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetElement.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== FAQ ACCORDION =====
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherQuestion.nextElementSibling.classList.remove('active');
                }
            });
            
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                answer.classList.remove('active');
            } else {
                this.setAttribute('aria-expanded', 'true');
                answer.classList.add('active');
            }
        });
    });
    
    // ===== FORMULARIO NEWSLETTER =====
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = this.querySelector('input[name="name"]').value.trim();
            const email = this.querySelector('input[name="email"]').value.trim();
            const statusEl = document.getElementById('newsletter-status');
            
            if (!name || !email) {
                if (statusEl) { statusEl.textContent = 'Completa todos los campos'; statusEl.style.color = '#DC2626'; }
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            if (statusEl) { statusEl.textContent = 'Enviando...'; statusEl.style.color = '#885CFD'; }

            try {
                // Simulación de éxito
                setTimeout(() => {
                    if (statusEl) { statusEl.textContent = '¡Listo! Te escribo pronto ✉️'; statusEl.style.color = '#16A34A'; }
                    this.reset();
                    submitBtn.disabled = false;
                }, 1000);
            } catch (error) {
                if (statusEl) { statusEl.textContent = 'Error, intenta de nuevo.'; statusEl.style.color = '#DC2626'; }
                submitBtn.disabled = false;
            }
        });
    }
    
    // ===== ANIMACIONES AL SCROLL =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.card, .benefit-item, .stat-item').forEach(el => observer.observe(el));
});
