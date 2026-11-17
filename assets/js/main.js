/* ============================================================
   Layout interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const staticView = new URLSearchParams(window.location.search).get('static') === '1';

  if (staticView) {
    const style = document.createElement('style');
    style.textContent = [
      '*,*::before,*::after{animation:none!important;transition:none!important}',
      '.js .reveal{opacity:1!important;transform:none!important}',
      '.hero-copy>*,.profile-card,.award-dock{opacity:1!important;transform:none!important}',
      '.award-dock{transform:translateX(-50%)!important}',
    ].join('');
    document.head.appendChild(style);
    root.classList.remove('js');
  }

  const reduceMotion =
    staticView || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  if (!reduceMotion) {
    const revealTargets = [
      ...document.querySelectorAll(
        '.section-head, .about-wrap, .cta-panel, .services-cta, .community-copy, .community-collage, .newsletter, .footer-grid'
      ),
    ];
    const cards = [...document.querySelectorAll('.feature-card, .service-card')];

    revealTargets.forEach((el) => el.classList.add('reveal'));
    cards.forEach((el, index) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${(index % 3) * 80}ms`);
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
      );

      [...revealTargets, ...cards].forEach((el) => observer.observe(el));
    } else {
      [...revealTargets, ...cards].forEach((el) => el.classList.add('is-visible'));
    }

    // Safety net: never let content stay hidden because of an
    // interrupted observer or an unusual embed context.
    window.setTimeout(() => {
      document
        .querySelectorAll('.reveal:not(.is-visible)')
        .forEach((el) => el.classList.add('is-visible'));
    }, 2400);
  } else {
    root.classList.remove('js');
  }

  /* ---------- Full-bleed hero video ---------- */
  const heroVideo = document.querySelector('.hero-media-video');
  if (heroVideo) {
    if (reduceMotion) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    } else {
      heroVideo.playbackRate = 0.7;

      const playHero = () => {
        const promise = heroVideo.play();
        if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      };

      playHero();

      if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) playHero();
              else heroVideo.pause();
            });
          },
          { threshold: 0.04 }
        );
        videoObserver.observe(heroVideo);
      }
    }
  }

  /* ---------- Skills marquee ---------- */
  const skillsTrack = document.querySelector('.skills-track');
  const skillsSet = skillsTrack?.querySelector('.skills-set');
  if (skillsTrack && skillsSet) {
    const clone = skillsSet.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.add('skills-set--clone');
    skillsTrack.appendChild(clone);
    skillsTrack.classList.add('is-marquee');
  }

  /* ---------- Expand all content ---------- */
  const projectsMore = document.getElementById('projects-more');
  const projectsToggle = document.querySelector('.projects-toggle');
  if (projectsMore && projectsToggle) {
    const projectsToggleText = projectsToggle.querySelector('.projects-toggle-text');

    projectsToggle.addEventListener('click', () => {
      const expanded = projectsToggle.getAttribute('aria-expanded') !== 'true';

      projectsMore.classList.toggle('is-open', expanded);
      projectsMore.inert = !expanded;
      projectsMore.setAttribute('aria-hidden', String(!expanded));
      projectsToggle.setAttribute('aria-expanded', String(expanded));

      if (projectsToggleText) {
        projectsToggleText.textContent = expanded ? '收起全部' : '展开全部';
      }
    });

    document.querySelectorAll('a[href="#experience"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (projectsToggle.getAttribute('aria-expanded') === 'true') return;
        event.preventDefault();
        projectsToggle.click();
        const about = document.querySelector('.about-wrap');
        if (about) {
          window.setTimeout(() => {
            about.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 650);
        }
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const mobilePanel = document.querySelector('.mobile-panel');
  const menuIconUse = menuBtn?.querySelector('use');
  const mobileLinks = [...document.querySelectorAll('.mobile-panel a')];

  const setMenu = (open) => {
    if (!menuBtn || !mobilePanel) return;
    document.body.classList.toggle('menu-open', open);
    mobilePanel.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (menuIconUse) {
      menuIconUse.setAttribute('href', open ? '#i-close' : '#i-menu');
    }
  };

  menuBtn?.addEventListener('click', () => {
    setMenu(!mobilePanel.classList.contains('is-open'));
  });

  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 940) setMenu(false);
  });

  /* ---------- Newsletter input state ---------- */
  const field = document.querySelector('.field');
  const emailInput = field?.querySelector('input');

  const syncField = () => {
    if (!field || !emailInput) return;
    field.classList.toggle('has-value', emailInput.value.trim().length > 0);
  };

  emailInput?.addEventListener('input', syncField);
  emailInput?.addEventListener('change', syncField);

  /* Prevent the mock form from doing a page reload */
  document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const btn = event.currentTarget.querySelector('.subscribe-btn');
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = 'Subscribed';
    btn.disabled = true;
    window.setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1800);
  });
});
