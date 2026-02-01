// ===== ACADEMIA METABOLIX - JAVASCRIPT PRINCIPAL =====

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== NAVEGACIÓN =====
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarNav = document.getElementById('navbar-nav');
    
    // Efecto de scroll en navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Toggle del menú móvil
    if (navbarToggle && navbarNav) {
        navbarToggle.addEventListener('click', function() {
            navbarNav.classList.toggle('active');
            
            // Cambiar icono del hamburger
            const spans = navbarToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
        
        // Cerrar menú al hacer click en un enlace
        const navLinks = navbarNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarNav.classList.remove('active');
                const spans = navbarToggle.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            });
        });
    }
    
    // ===== FAQ ACCORDION =====
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Cerrar todas las otras preguntas
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherQuestion.nextElementSibling.classList.remove('active');
                }
            });
            
            // Toggle de la pregunta actual
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

            // En entornos locales o sin HTTPS, detener el envío por seguridad
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                const statusEl = document.getElementById('newsletter-status');
                if (statusEl) {
                    statusEl.textContent = 'Por razones de seguridad, el formulario solo funciona bajo HTTPS.';
                    statusEl.style.color = '#DC2626';
                }
                return;
            }

            // Obtener valores de los campos
            const name = this.querySelector('input[name="name"]').value.trim();
            const email = this.querySelector('input[name="email"]').value.trim();
            const hpField = this.querySelector('input[name="hp_field"]').value.trim();

            // Seleccionar el contenedor de estado
            const statusEl = document.getElementById('newsletter-status');
            if (statusEl) {
                statusEl.textContent = '';
            }

            // Validaciones básicas
            if (!name || !email) {
                if (statusEl) {
                    statusEl.textContent = 'Por favor completa todos los campos';
                    statusEl.style.color = '#DC2626';
                }
                return;
            }
            if (!isValidEmail(email)) {
                if (statusEl) {
                    statusEl.textContent = 'Por favor ingresa un email válido';
                    statusEl.style.color = '#DC2626';
                }
                return;
            }
            // Preparar envío
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            const params = new URLSearchParams();
            params.append('name', name);
            params.append('email', email);
            params.append('phone', '');
            params.append('message', '');
            params.append('source_url', window.location.href);
            params.append('hp_field', hpField);

            try {
                const response = await fetch('/api/subscribe.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params.toString()
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    if (statusEl) {
                        statusEl.textContent = 'Listo, te escribo pronto ✉️';
                        statusEl.style.color = '#16A34A';
                    }
                    this.reset();
                } else {
                    if (statusEl) {
                        statusEl.textContent = 'Ups, inténtalo de nuevo.';
                        statusEl.style.color = '#DC2626';
                    }
                }
            } catch (error) {
                if (statusEl) {
                    statusEl.textContent = 'Ups, inténtalo de nuevo.';
                    statusEl.style.color = '#DC2626';
                }
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // ===== SCROLL SUAVE PARA ANCLAS =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 90; // Ajustar por navbar fijo (80px) + margen (10px)
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== ANIMACIONES AL SCROLL =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    const animateElements = document.querySelectorAll('.card, .problem-item, .step-item, .benefit-item');
    animateElements.forEach(el => observer.observe(el));
    
    // ===== CONTADOR ANIMADO PARA ESTADÍSTICAS =====
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => statsObserver.observe(stat));
    
    // ===== FUNCIONES AUXILIARES =====
    
    // Validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Mostrar mensajes
    function showMessage(message, type = 'info') {
        // Remover mensaje anterior si existe
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `message-toast ${type}`;
        messageEl.textContent = message;
        
        // Estilos del toast
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '400px'
        });
        
        // Colores según tipo
        const colors = {
            success: '#16A34A',
            error: '#DC2626',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        
        messageEl.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(messageEl);
        
        // Animar entrada
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 300);
        }, 5000);
    }
    
    // Animar contador
    function animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        const prefix = element.textContent.match(/^\+/) ? '+' : '';
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = prefix + target;
                clearInterval(timer);
            } else {
                element.textContent = prefix + Math.floor(current);
            }
        }, stepTime);
    }
    
    // ===== LAZY LOADING DE IMÁGENES =====
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }
    
    // ===== MANEJO DE ERRORES DE IMÁGENES =====
    const allImages = document.querySelectorAll('img');
    
    allImages.forEach(img => {
        img.addEventListener('error', function() {
            // Placeholder en caso de error
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
            this.alt = 'Imagen no disponible';
        });
    });
    
    // ===== PERFORMANCE MONITORING =====
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Tiempo de carga:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
            }, 0);
        });
    }
    
    // ===== ACCESIBILIDAD =====
    
    // Manejo de teclado para elementos interactivos
    document.addEventListener('keydown', function(e) {
        // Escape para cerrar menú móvil
        if (e.key === 'Escape' && navbarNav && navbarNav.classList.contains('active')) {
            navbarNav.classList.remove('active');
            navbarToggle.focus();
        }
        
        // Enter y Space para botones FAQ
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('faq-question')) {
            e.preventDefault();
            e.target.click();
        }
    });
    
    // Focus visible para navegación por teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // ===== INICIALIZACIÓN COMPLETA =====
    console.log('Academia Metabolix - Sitio web cargado correctamente');
    
    // Disparar evento personalizado cuando todo esté listo
    const readyEvent = new CustomEvent('academiaMetabolixReady', {
        detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(readyEvent);
});

// ===== FUNCIONES GLOBALES =====

// Función para mostrar/ocultar loading
window.showLoading = function(show = true) {
    let loader = document.getElementById('global-loader');
    
    if (show && !loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'loading';
        loader.innerHTML = '<div class="spinner"></div><span class="loading-text">Cargando...</span>';
        
        Object.assign(loader.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(255, 255, 255, 0.9)',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        
        document.body.appendChild(loader);
    } else if (!show && loader) {
        loader.remove();
    }
};

// Función para scroll to top
window.scrollToTop = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Función para copiar al portapapeles
window.copyToClipboard = function(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('Copiado al portapapeles', 'success');
        });
    } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('Copiado al portapapeles', 'success');
    }
};

// Función para compartir (Web Share API)
window.shareContent = function(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copiar URL
        copyToClipboard(url);
    }
};



// ===== NEWSLETTER FORM =====
(function() {
    const form = document.getElementById('newsletter-form');
    const status = document.getElementById('newsletter-status');
    
    if (form && status) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            status.textContent = 'Enviando…';
            status.style.color = '#64748B';
            
            const formData = new FormData(form);
            formData.append('source_url', location.href);
            
            try {
                const response = await fetch('/api/subscribe.php', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                
                const result = await response.json();
                
                if (result.success) {
                    status.textContent = '¡Gracias! Te contactaremos pronto.';
                    status.style.color = '#10B981';
                    form.reset();
                } else {
                    throw new Error(result.error || 'Error desconocido');
                }
            } catch (error) {
                status.textContent = 'Hubo un problema al enviar. Inténtalo de nuevo.';
                status.style.color = '#EF4444';
                console.error('Error:', error);
            }
        });
    }
})();

