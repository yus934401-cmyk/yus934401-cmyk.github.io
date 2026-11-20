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

      // Defer video loading: the poster image paints the hero instantly,
      // the 10MB mp4 only starts fetching after the page finished loading.
      let heroLoaded = false;
      let heroVisible = true; // hero sits at the top, so it starts on screen

      const playHero = () => {
        if (!heroLoaded || !heroVisible) return;
        const promise = heroVideo.play();
        if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      };

      const armHero = () => {
        heroLoaded = true;
        playHero();
      };

      if (document.readyState === 'complete') armHero();
      else window.addEventListener('load', armHero, { once: true });

      // Robustness net: a stalled resource can hold back the load event for
      // a long time on slow links; never delay the video more than 4s.
      setTimeout(armHero, 4000);

      if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              heroVisible = entry.isIntersecting;
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

    const setExplorationsOpen = (expanded) => {
      projectsMore.classList.toggle('is-open', expanded);
      projectsMore.inert = !expanded;
      projectsMore.setAttribute('aria-hidden', String(!expanded));
      projectsToggle.setAttribute('aria-expanded', String(expanded));

      if (projectsToggleText) {
        projectsToggleText.textContent = expanded ? '收起设计探索' : '查看更多设计';
      }
    };
    // HTML stays expanded without JavaScript; enhanced browsing starts folded.
    setExplorationsOpen(['#explorations', '#exploration-3d', '#haohanjuan'].includes(location.hash));
    projectsToggle.addEventListener('click', () => {
      setExplorationsOpen(projectsToggle.getAttribute('aria-expanded') !== 'true');
    });

    document.querySelectorAll('.case-card__link').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = document.getElementById(link.hash.slice(1));
        if (!target) return;
        event.preventDefault();
        const wasClosed = projectsToggle.getAttribute('aria-expanded') !== 'true';
        if (wasClosed) projectsToggle.click();
        window.setTimeout(() => {
          target.focus({ preventScroll: true });
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }, wasClosed && !reduceMotion ? 650 : 0);
      });
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

  const feedback = document.querySelector('.newsletter-content');
  feedback?.querySelector('.newsletter-send')?.addEventListener('click', () => {
    feedback.querySelector('.newsletter-status').textContent =
      '留言功能暂未开通，你填写的内容尚未发送或保存。';
  });
});
