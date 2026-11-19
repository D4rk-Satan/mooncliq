/**
 * MoonCliq Analytics & Conversion Event Engine (GA4)
 * Loads GA4 asynchronously if mc_no_track is not active.
 */
(function () {
  // Check user privacy / opt-out
  try {
    if (localStorage.getItem('mc_no_track') === 'true') {
      return;
    }
  } catch (e) {}

  // TODO: Replace 'G-XXXXXXXXXX' with your real Google Analytics 4 Measurement ID
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    // Measurement ID placeholder is present. GA script will load and log safely.
  }

  // Load gtag.js script
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true
  });

  // Helper to determine active service context based on URL pathname
  function getCurrentService() {
    var path = window.location.pathname.replace(/^\/|\.html$/g, '');
    if (!path || path === 'index') return 'general';
    return path;
  }

  // Event dispatch helper
  function trackEvent(eventName, params) {
    params = params || {};
    params.page_path = window.location.pathname;
    params.service = params.service || getCurrentService();
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  }

  // Delegate clicks for conversion tracking
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href') || '';

    // 1. WhatsApp Click Tracking
    if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
      trackEvent('click_whatsapp', {
        link_url: href,
        link_text: (link.textContent || '').trim().substring(0, 50)
      });
      return;
    }

    // 2. Call Click Tracking
    if (href.indexOf('tel:') === 0) {
      trackEvent('click_call', {
        phone_number: href.replace('tel:', ''),
        link_text: (link.textContent || '').trim().substring(0, 50)
      });
      return;
    }

    // 3. Email Click Tracking
    if (href.indexOf('mailto:') === 0) {
      trackEvent('click_email', {
        email_address: href.replace('mailto:', ''),
        link_text: (link.textContent || '').trim().substring(0, 50)
      });
      return;
    }

    // 4. CTA to Contact Form Click Tracking
    if (href === '#contact' || href.indexOf('/#contact') !== -1 || href.indexOf('index.html#contact') !== -1) {
      trackEvent('cta_click', {
        cta_target: '#contact',
        cta_text: (link.textContent || '').trim().substring(0, 50)
      });
      return;
    }
  });

  // 5. Contact Form Lead Generation Tracking
  window.addEventListener('DOMContentLoaded', function () {
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function () {
        // Track generate_lead event on valid submission
        trackEvent('generate_lead', {
          form_id: 'contactForm',
          service_selected: (document.getElementById('service') ? document.getElementById('service').value : 'general')
        });
      });
    }
  });
})();
