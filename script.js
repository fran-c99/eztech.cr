// Year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// Dark mode toggle: initialize, persist, and stay Firefox-safe
(() => {
  const themeToggle = document.getElementById('themeToggle');
  const themeKnob = themeToggle ? themeToggle.querySelector('.theme-knob') : null;

  const safeStorage = (() => {
    try {
      return window.localStorage;
    } catch (e) {
      return null;
    }
  })();

  const sunSVG = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M4.93 19.07l1.41-1.41" />
        <path d="M17.66 6.34l1.41-1.41" />
      </g>
    </svg>`;

  const moonSVG = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>
    </svg>`;

  const renderKnob = (isDark) => {
    if (!themeKnob) return;
    themeKnob.innerHTML = isDark ? moonSVG : sunSVG;
    themeKnob.setAttribute('aria-hidden', 'true');
  };

  const applyTheme = (isDark) => {
    document.body.classList.toggle('dark', isDark);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(isDark));
    renderKnob(isDark);
  };

  const preferred = safeStorage ? safeStorage.getItem('eztech-theme') : null;
  if (preferred === 'dark') applyTheme(true);
  else if (preferred === 'light') applyTheme(false);
  else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
  }

  if (themeToggle) {
    const toggleTheme = () => {
      const isDark = !document.body.classList.contains('dark');
      applyTheme(isDark);
      if (safeStorage) {
        try { safeStorage.setItem('eztech-theme', isDark ? 'dark' : 'light'); } catch (e) {}
      }
    };

    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }
})();

// Mobile nav toggle (with ARIA state)
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

if (toggle && links) {
  const setNavState = (isOpen) => {
    links.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  toggle.addEventListener('click', () => {
    const isOpen = !links.classList.contains('open');
    setNavState(isOpen);
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setNavState(false));
  });
}

// FAQ accordion (single-open + ARIA)
const faqList = document.getElementById('faqList');
if (faqList) {
  const faqItems = Array.from(faqList.querySelectorAll('.faq-item'));
  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    const answerId = `faq-answer-${index + 1}`;
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answerId);
    answer.id = answerId;
    answer.hidden = true;
  });

  faqList.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;

    const item = btn.closest('.faq-item');
    if (!item) return;

    const isOpen = item.classList.contains('open');

    faqItems.forEach((faqItem) => {
      const question = faqItem.querySelector('.faq-question');
      const answer = faqItem.querySelector('.faq-answer');
      faqItem.classList.remove('open');
      if (question) question.setAttribute('aria-expanded', 'false');
      if (answer) answer.hidden = true;
    });

    if (!isOpen) {
      const answer = item.querySelector('.faq-answer');
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      if (answer) answer.hidden = false;
    }
  });
}

// Service categories toggles (Soporte Técnico, Soluciones para Empresas, Formación)
(() => {
  const categories = Array.from(document.querySelectorAll('.service-category'));
  if (!categories.length) return;

  const closeAll = () => {
    categories.forEach((cat) => {
      cat.classList.remove('open');
      const btn = cat.querySelector('.category-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  };

  categories.forEach((cat) => {
    const btn = cat.querySelector('.category-toggle');
    const list = cat.querySelector('.category-list');
    if (!btn || !list) return;

    btn.addEventListener('click', () => {
      const isOpen = cat.classList.contains('open');
      if (isOpen) {
        cat.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        closeAll();
        cat.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        // NOTE: we intentionally do NOT scroll or prefill here — only expand the category.
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
      if (e.key === 'Escape') {
        closeAll();
        btn.focus();
      }
    });
  });

  // Close all on Escape globally
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
})();

// Agendar buttons: when clicked, prefill the contact form service and scroll to contact
(function wireAgendarButtons() {
  const buttons = Array.from(document.querySelectorAll('.agendar-btn'));
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service');
      const serviceSelect = document.getElementById('service');
      if (serviceSelect && serviceName) {
        const opt = Array.from(serviceSelect.options).find(o => o.text === serviceName || o.value === serviceName);
        if (opt) serviceSelect.value = opt.value || opt.text;
        else {
          // If no matching option, try to add a temporary one then select it
          try {
            const tmp = document.createElement('option');
            tmp.text = serviceName;
            tmp.value = serviceName;
            serviceSelect.appendChild(tmp);
            serviceSelect.value = serviceName;
          } catch (err) {
            // ignore
          }
        }
      }

      const contactEl = document.getElementById('contact');
      const nameField = document.getElementById('name');
      if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (nameField) nameField.focus({ preventScroll: false });
    });
  });
})();


// Contact form validation and optional endpoint submission
const form = document.getElementById('contactForm');
if (form instanceof HTMLFormElement) {
  const success = document.getElementById('formSuccess');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  const setStatus = (message, kind) => {
    if (!status) return;
    status.textContent = message;
    status.classList.remove('error', 'success');
    if (kind) status.classList.add(kind);
  };

  const clearFieldError = (field) => {
    field.classList.remove('field-error');
  };

  const markFieldError = (field) => {
    field.classList.add('field-error');
  };

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPhoneValid = (value) => /^[+()\-\d\s]{7,25}$/.test(value);

  form.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', null);

    const companyField = form.querySelector('#company');
    if (companyField instanceof HTMLInputElement && companyField.value.trim()) {
      // Honeypot hit: quietly ignore without signaling bot checks.
      return;
    }

    let valid = true;

    const nameField = form.querySelector('#name');
    const emailField = form.querySelector('#email');
    const phoneField = form.querySelector('#phone');
    const messageField = form.querySelector('#message');

    if (nameField instanceof HTMLInputElement) {
      const value = nameField.value.trim();
      if (!value || value.length < 2) {
        markFieldError(nameField);
        valid = false;
      }
    }

    if (emailField instanceof HTMLInputElement) {
      const value = emailField.value.trim();
      if (!value || !isEmailValid(value)) {
        markFieldError(emailField);
        valid = false;
      }
    }

    if (phoneField instanceof HTMLInputElement && phoneField.value.trim()) {
      if (!isPhoneValid(phoneField.value.trim())) {
        markFieldError(phoneField);
        valid = false;
      }
    }

    if (messageField instanceof HTMLTextAreaElement) {
      const value = messageField.value.trim();
      if (!value || value.length < 20) {
        markFieldError(messageField);
        valid = false;
      }
    }

    if (!valid) {
      setStatus('Corrige los campos resaltados e inténtalo de nuevo.', 'error');
      return;
    }

    const endpoint = (form.getAttribute('action') || '').trim();

    if (!endpoint || endpoint === '#') {
      setStatus('El formulario es válido, pero no hay un endpoint configurado. Agrega la URL en el atributo action.', 'error');
      return;
    }

    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }

    try {
      const response = await fetch(endpoint, {
        method: (form.getAttribute('method') || 'POST').toUpperCase(),
        body: new FormData(form),
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        setStatus('No es posible enviar ahora. Intenta nuevamente más tarde.', 'error');
        return;
      }

      form.style.display = 'none';
      if (success) {
        success.style.display = 'block';
      }
      setStatus('Mensaje enviado correctamente.', 'success');
    } catch (error) {
      setStatus('No es posible enviar ahora. Intenta nuevamente más tarde.', 'error');
    } finally {
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
      }
    }
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}


