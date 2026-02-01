// ===== ACADEMIA METABOLIX - SISTEMA DE PAGOS =====

// Configuración de Stripe (reemplazar con claves reales en producción)
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_51234567890abcdef', // Reemplazar con clave real
    apiVersion: '2023-10-16'
};

// Configuración de PayPal (reemplazar con client ID real en producción)
const PAYPAL_CONFIG = {
    clientId: 'YOUR_PAYPAL_CLIENT_ID', // Reemplazar con client ID real
    currency: 'MXN',
    intent: 'capture'
};

// Productos disponibles
const PRODUCTS = {
    'curso-resistencia-insulina': {
        id: 'curso-resistencia-insulina',
        name: 'Curso: Resistencia a la Insulina',
        price: 650,
        currency: 'MXN',
        description: '8 módulos completos + sesiones grupales + acceso de por vida',
        successUrl: './gracias-curso-resistencia-insulina.html',
        type: 'course'
    },
    'asesoria-online': {
        id: 'asesoria-online',
        name: 'Asesoría Online de Nutrición',
        price: 1000,
        currency: 'MXN',
        description: 'Sesión única de 90 minutos + plan personalizado',
        successUrl: './gracias-asesoria.html',
        type: 'consultation'
    }
};

// Estado global del pago
let paymentState = {
    stripe: null,
    elements: null,
    cardElement: null,
    currentProduct: null,
    isProcessing: false
};

// ===== INICIALIZACIÓN =====

function initializePaymentSystem(productId) {
    if (!PRODUCTS[productId]) {
        console.error('Producto no encontrado:', productId);
        return;
    }
    
    paymentState.currentProduct = PRODUCTS[productId];
    
    // Inicializar Stripe
    initializeStripe();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar validación de formulario
    setupFormValidation();
    
    console.log('Sistema de pagos inicializado para:', productId);
}

function initializeStripe() {
    try {
        paymentState.stripe = Stripe(STRIPE_CONFIG.publishableKey);
        paymentState.elements = paymentState.stripe.elements();
        
        // Crear elemento de tarjeta
        paymentState.cardElement = paymentState.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#0F172A',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    '::placeholder': {
                        color: '#64748B',
                    },
                },
                invalid: {
                    color: '#DC2626',
                    iconColor: '#DC2626'
                }
            },
            hidePostalCode: true
        });
        
        // Montar elemento de tarjeta
        const cardElementContainer = document.getElementById('card-element');
        if (cardElementContainer) {
            paymentState.cardElement.mount('#card-element');
        }
        
        // Manejar cambios en el elemento de tarjeta
        paymentState.cardElement.on('change', handleCardChange);
        
    } catch (error) {
        console.error('Error inicializando Stripe:', error);
        showPaymentError('Error al cargar el sistema de pagos. Por favor recarga la página.');
    }
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Cambio de método de pago
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', handlePaymentMethodChange);
    });
    
    // Checkbox de términos
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', updatePayButtonState);
    }
    
    // Botón de pago
    const payButton = document.getElementById('pay-button');
    if (payButton) {
        payButton.addEventListener('click', handlePayButtonClick);
    }
    
    // Validación de formulario en tiempo real
    const form = document.getElementById('checkout-form');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', updatePayButtonState);
            input.addEventListener('blur', validateField);
        });
    }
}

function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    // Validación personalizada para email
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                showFieldError(this, 'Por favor ingresa un email válido');
            } else {
                clearFieldError(this);
            }
        });
    }
    
    // Validación para teléfono (si existe)
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Permitir solo números, espacios, guiones y paréntesis
            this.value = this.value.replace(/[^0-9\s\-\(\)\+]/g, '');
        });
    }
}

// ===== MANEJADORES DE EVENTOS =====

function handlePaymentMethodChange(event) {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => method.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    
    const selectedMethod = event.currentTarget.dataset.method;
    const stripeForm = document.getElementById('stripe-form');
    const paypalForm = document.getElementById('paypal-form');
    
    if (selectedMethod === 'stripe') {
        if (stripeForm) stripeForm.style.display = 'block';
        if (paypalForm) paypalForm.style.display = 'none';
    } else if (selectedMethod === 'paypal') {
        if (stripeForm) stripeForm.style.display = 'none';
        if (paypalForm) paypalForm.style.display = 'block';
        initializePayPalButtons();
    }
    
    updatePayButtonState();
}

function handleCardChange(event) {
    const displayError = document.getElementById('card-errors');
    
    if (event.error) {
        if (displayError) {
            displayError.textContent = event.error.message;
            displayError.style.display = 'block';
        }
    } else {
        if (displayError) {
            displayError.style.display = 'none';
        }
    }
    
    updatePayButtonState();
}

function handlePayButtonClick(event) {
    event.preventDefault();
    
    if (paymentState.isProcessing) return;
    
    const activeMethod = document.querySelector('.payment-method.active');
    if (!activeMethod) return;
    
    const method = activeMethod.dataset.method;
    
    if (method === 'stripe') {
        processStripePayment();
    }
    // PayPal se maneja con sus propios botones
}

// ===== PROCESAMIENTO DE PAGOS =====

async function processStripePayment() {
    if (!paymentState.stripe || !paymentState.cardElement || !paymentState.currentProduct) {
        showPaymentError('Error en la configuración del pago');
        return;
    }
    
    // Validar formulario
    const form = document.getElementById('checkout-form');
    if (!form || !form.checkValidity()) {
        showPaymentError('Por favor completa todos los campos requeridos');
        return;
    }
    
    // Validar términos
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox || !termsCheckbox.checked) {
        showPaymentError('Debes aceptar los términos y condiciones');
        return;
    }
    
    setPaymentLoading(true);
    
    try {
        // Obtener datos del formulario
        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData.entries());
        
        // En producción, aquí se haría una llamada al backend para crear el PaymentIntent
        // Por ahora simulamos el proceso
        
        const { error, paymentMethod } = await paymentState.stripe.createPaymentMethod({
            type: 'card',
            card: paymentState.cardElement,
            billing_details: {
                name: `${customerData.firstName} ${customerData.lastName}`,
                email: customerData.email,
                phone: customerData.phone || null,
                address: {
                    country: customerData.country || null
                }
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        // Simular procesamiento del pago
        await simulatePaymentProcessing(paymentMethod, customerData);
        
        // Redirigir a página de éxito
        window.location.href = paymentState.currentProduct.successUrl + '?payment=success&method=stripe';
        
    } catch (error) {
        console.error('Error procesando pago:', error);
        showPaymentError(error.message || 'Error procesando el pago. Por favor intenta de nuevo.');
        setPaymentLoading(false);
    }
}

function initializePayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container || !window.paypal || !paymentState.currentProduct) return;
    
    // Limpiar botones existentes
    container.innerHTML = '';
    
    window.paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
        },
        
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: paymentState.currentProduct.price.toString(),
                        currency_code: paymentState.currentProduct.currency
                    },
                    description: paymentState.currentProduct.description
                }]
            });
        },
        
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Obtener datos del formulario
                const form = document.getElementById('checkout-form');
                const formData = new FormData(form);
                const customerData = Object.fromEntries(formData.entries());
                
                // Procesar datos del cliente
                processCustomerData(customerData, 'paypal', details);
                
                // Redirigir a página de éxito
                window.location.href = paymentState.currentProduct.successUrl + '?payment=success&method=paypal';
            });
        },
        
        onError: function(err) {
            console.error('Error en PayPal:', err);
            showPaymentError('Error procesando el pago con PayPal. Por favor intenta de nuevo.');
        },
        
        onCancel: function(data) {
            console.log('Pago cancelado por el usuario');
            showMessage('Pago cancelado', 'info');
        }
        
    }).render('#paypal-button-container');
}

// ===== FUNCIONES AUXILIARES =====

function updatePayButtonState() {
    const form = document.getElementById('checkout-form');
    const termsCheckbox = document.getElementById('terms');
    const payButton = document.getElementById('pay-button');
    const activeMethod = document.querySelector('.payment-method.active');
    
    if (!form || !termsCheckbox || !payButton || !activeMethod) return;
    
    const formValid = form.checkValidity();
    const termsAccepted = termsCheckbox.checked;
    const method = activeMethod.dataset.method;
    
    if (method === 'stripe') {
        payButton.disabled = !(formValid && termsAccepted);
        payButton.style.display = 'block';
    } else {
        payButton.style.display = 'none';
    }
}

function setPaymentLoading(loading) {
    paymentState.isProcessing = loading;
    
    const payButton = document.getElementById('pay-button');
    const payButtonText = document.getElementById('pay-button-text');
    const payButtonLoading = document.getElementById('pay-button-loading');
    
    if (!payButton || !payButtonText || !payButtonLoading) return;
    
    if (loading) {
        payButtonText.style.display = 'none';
        payButtonLoading.style.display = 'flex';
        payButton.disabled = true;
    } else {
        payButtonText.style.display = 'block';
        payButtonLoading.style.display = 'none';
        payButton.disabled = false;
    }
}

function showPaymentError(message) {
    // Usar la función global showMessage si está disponible
    if (typeof showMessage === 'function') {
        showMessage(message, 'error');
    } else {
        alert(message);
    }
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function validateField(event) {
    const field = event.target;
    
    if (field.type === 'email' && field.value) {
        if (!isValidEmail(field.value)) {
            showFieldError(field, 'Email inválido');
        } else {
            clearFieldError(field);
        }
    }
    
    if (field.required && !field.value.trim()) {
        showFieldError(field, 'Este campo es requerido');
    } else if (!field.type === 'email') {
        clearFieldError(field);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function simulatePaymentProcessing(paymentMethod, customerData) {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // En producción, aquí se enviarían los datos al backend
    console.log('Procesando pago:', {
        paymentMethod: paymentMethod.id,
        customer: customerData,
        product: paymentState.currentProduct
    });
    
    // Simular éxito (en producción manejar errores reales)
    return { success: true };
}

function processCustomerData(customerData, paymentMethod, paymentDetails) {
    // En producción, enviar datos al backend para:
    // - Crear cuenta de usuario
    // - Enviar emails de confirmación
    // - Activar acceso al contenido
    // - Registrar en CRM
    
    console.log('Procesando datos del cliente:', {
        customer: customerData,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
        product: paymentState.currentProduct
    });
}

// ===== FUNCIONES PÚBLICAS =====

// Función para inicializar pagos del curso
window.initializeCoursePayments = function() {
    initializePaymentSystem('curso-resistencia-insulina');
};

// Función para inicializar pagos de asesorías
window.initializeConsultationPayments = function() {
    initializePaymentSystem('asesoria-online');
};

// Función para obtener estado del pago
window.getPaymentState = function() {
    return paymentState;
};

// ===== ESTILOS CSS ADICIONALES PARA ERRORES =====

// Agregar estilos dinámicamente
const style = document.createElement('style');
style.textContent = `
    .input.error {
        border-color: #DC2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
    }
    
    .field-error {
        color: #DC2626;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    }
    
    .payment-method {
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }
    
    .payment-method:hover {
        border-color: #E2E8F0;
        background-color: #F8FAFC;
    }
    
    .payment-method.active {
        border-color: #3B82F6;
        background-color: #EFF6FF;
    }
    
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

document.head.appendChild(style);

console.log('Sistema de pagos Academia Metabolix cargado correctamente');

