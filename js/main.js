
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);
  // In case DOMContentLoaded already fired (script placed after body loads)
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    init();
  }

  function init() {
    initSlider();
    initFadeIn();
    initNavScroll();
    initMiniCalendar();
  }

  // ===== SLIDING BANNER =====
  function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.querySelector('.slider-btn.next');
    const prevBtn = document.querySelector('.slider-btn.prev');

    if (!slides.length) return; // no slider on this page — stop here

    let current = 0;
    let timer = null;

    function show(n) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (n + slides.length) % slides.length; // wraps both ways
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(next, 4000);
    }
    function stopAutoplay() {
      if (timer) clearInterval(timer);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        next();
        startAutoplay(); // reset the timer so it doesn't jump right after a manual click
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prev();
        startAutoplay();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        startAutoplay();
      });
    });

    // Pause on hover so people can actually read a slide
    const sliderEl = document.querySelector('.slider');
    if (sliderEl) {
      sliderEl.addEventListener('mouseenter', stopAutoplay);
      sliderEl.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
  }

  // ===== FADE IN ON SCROLL =====
  function initFadeIn() {
    const targets = document.querySelectorAll('.fade-in');
    if (!targets.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once, then leave it alone
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  // ===== NAV CHANGES ON SCROLL =====
  function initNavScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ===== MINI CALENDAR =====
  function initMiniCalendar() {
    const container = document.getElementById('mini-calendar');
    if (!container) return;

    // Add your real event dates here
    const events = {
      '2026-06-12': 'Summer Dig Orientation',
      '2026-06-20': 'Guest Lecture: Iron Age Britain',
      '2026-07-04': 'Field Trip — Sutton Hoo',
    };

    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const dayNames = ['M','T','W','T','F','S','S'];
    const today = new Date();
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();

    function render() {
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const startOffset = (firstDay + 6) % 7; // Monday start
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      let html = `
        <div class="cal-header">
          <button class="cal-nav" id="cal-prev" aria-label="Previous month">&#8249;</button>
          <h3>${monthNames[viewMonth]} ${viewYear}</h3>
          <button class="cal-nav" id="cal-next" aria-label="Next month">&#8250;</button>
        </div>
        <div class="cal-grid">
          <div class="cal-days-header">${dayNames.map(d => `<span>${d}</span>`).join('')}</div>
          <div class="cal-cells">`;

      for (let i = 0; i < startOffset; i++) html += `<div class="cal-cell empty"></div>`;

      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
        let cls = 'cal-cell';
        if (isToday) cls += ' today';
        if (events[key]) cls += ' has-event';
        html += `<div class="${cls}"${events[key] ? ` title="${events[key]}"` : ''}>${d}</div>`;
      }

      html += `</div></div>`;
      container.innerHTML = html;

      document.getElementById('cal-prev').addEventListener('click', function () {
        viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render();
      });
      document.getElementById('cal-next').addEventListener('click', function () {
        viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render();
      });
    }

    render();
  }

})();