'use strict';
/* ================================================================
   COMIC BOOK READER — Spider-Verse Immersive Transition
   ================================================================
   Architecture:
   ┌───────────────┬───────────────┐
   │   LEFT SIDE   │  RIGHT SIDE   │
   │  (static bg)  │  (pages flip) │
   │               │               │
   │  left-pg-0    │  right-pg-0   │ ← State 0: Cover
   │  left-pg-1    │  right-pg-1   │ ← State 1: Spread
   │  left-pg-2    │  right-pg-2   │ ← State 2: Thanks
   └───────────────┴───────────────┘

   Page flip: right pages use rotateY(0→-180) around left edge
   FLIP zoom: getBoundingClientRect → GSAP from billboard to full
   ================================================================ */

;(function () {

  /* ── Extra images per project (indices match PROJECTS array) ─── */
  const EXTRA_IMAGES = [
    ['images/portfolio.png',    'images/media.jpg',         'images/backgroud_guide.JPG'],
    ['images/AthinaWebsite.png','images/athina1.png',        'images/athina2.png'],
    ['images/klooigeld.png',    'images/klooigeld.png',      'images/klooigeld.png'],
    ['images/nfcgame.png',      'images/nfc.png',            'images/kotlin.png'],
    ['images/Figma_website.png','images/WireFrame.png',      'images/prototype1.png'],
    ['images/prototype1.png',   'images/prototype2.png',     'images/prototype3.png'],
    ['images/Website.png',      'images/navigationnew.png',  'images/navigationold.png'],
    ['images/git.jpg',          'images/ci.jpg',             'images/git.jpg'],
  ];

  /* ── Panel captions ─────────────────────────────────────────── */
  const PANEL_CAPTIONS = [
    ['THE MAIN STAGE', 'BEHIND THE SCENES', 'THE BLUEPRINT'],
    ['LIVE SITE', 'THE DETAIL WORK', 'REFINED FINISH'],
    ['DASHBOARD', 'TRACKING VIEW', 'COMPONENT DEEP DIVE'],
    ['THE GAME', 'NFC HARDWARE', 'KOTLIN CODE'],
    ['HIGH-FIDELITY', 'THE WIREFRAME', 'FIRST PROTOTYPE'],
    ['PROTOTYPE ONE', 'PROTOTYPE TWO', 'PROTOTYPE THREE'],
    ['THE BUILD', 'NEW NAVIGATION', 'OLD NAVIGATION'],
    ['GIT HISTORY', 'CI PIPELINE', 'COMMIT GRAPH'],
  ];

  /* ── Action words per project ─────────────────────────────── */
  const ACTION_WORDS = [
    'BUILT FROM SCRATCH!', 'BRAND DELIVERED!', 'SHIPPED!', 'THWIP!',
    'DESIGNED!', 'PROTOTYPED!', 'RESPONSIVE!', 'PUSHED!'
  ];

  /* ── State ──────────────────────────────────────────────────── */
  let _currentPage = 0;   // 0 = Cover, 1 = Spread, 2 = Thanks
  let _isFlipping  = false;
  let _originEl    = null; // billboard that was clicked
  let _isMobile    = false;

  /* ── DOM refs (populated on first open) ──────────────────────── */
  let portal, bookWrap, book, closeBtn, navPrev, navNext, flipShadow;
  let rightPages  = [];  // 3 elements: cover, info, thanks
  let leftPages   = [];  // 3 elements

  /* ================================================================
     BUILD DOM STRUCTURE
     ================================================================ */
  function _buildDOM() {
    if (document.getElementById('comic-portal')) return; // already built

    const html = `
<div id="comic-portal">
  <div class="cb-backdrop"></div>

  <!-- ═ X CLOSE ══════════════════════════════════════════════ -->
  <button class="cb-close-btn" id="cbCloseBtn" aria-label="Close comic book">✕</button>

  <!-- ═ BOOK WRAP ═════════════════════════════════════════════ -->
  <div class="cb-book-wrap" id="cbBookWrap">

    <!-- Page-flip drop shadow during transition -->
    <div class="cb-flip-shadow" id="cbFlipShadow"></div>

    <div class="cb-book" id="cbBook">

      <!-- ══ LEFT SIDE ═════════════════════════════════════ -->
      <div class="cb-left-side">

        <!-- LEFT PAGE 0: decorative back cover -->
        <div class="cb-left-pg cb-left-pg-0 active">
          <div class="cb-backcover-logo" id="cbBackcoverLogo">SPIDER-VERSE</div>
          <div class="cb-backcover-divider"></div>
          <div class="cb-backcover-tagline">INTO THE PORTFOLIO</div>
          <div class="cb-backcover-divider"></div>
          <div class="cb-backcover-number" id="cbIssueNum">ISSUE #001 · 2026</div>
        </div>

        <!-- LEFT PAGE 1: image panels -->
        <div class="cb-left-pg cb-left-pg-1" id="cbPanelsPage">
          <div class="cb-panel cb-panel-a" id="cbPanel0">
            <img src="" alt="" id="cbPanelImg0" />
            <div class="cb-panel-caption" id="cbCaption0"></div>
          </div>
          <div class="cb-panel cb-panel-b" id="cbPanel1">
            <img src="" alt="" id="cbPanelImg1" />
            <div class="cb-panel-caption" id="cbCaption1"></div>
          </div>
          <div class="cb-panel cb-panel-c" id="cbPanel2">
            <img src="" alt="" id="cbPanelImg2" />
            <div class="cb-panel-caption" id="cbCaption2"></div>
          </div>
          <span class="cb-panels-label" id="cbPanelsLabel">PAGE 01</span>
        </div>

        <!-- LEFT PAGE 2: thanks left decoration -->
        <div class="cb-left-pg cb-left-pg-2">
          <div class="cb-thanks-spider-icon">🕷️</div>
          <div class="cb-thanks-issue-done">ISSUE COMPLETE</div>
          <div class="cb-thanks-dividers">
            <span></span><span></span><span></span>
          </div>
          <div class="cb-backcover-number">END · 2026</div>
        </div>

      </div><!-- /left-side -->

      <!-- ══ RIGHT SIDE ════════════════════════════════════ -->
      <div class="cb-right-side" id="cbRightSide">

        <!-- RIGHT PAGE 0: Cover (flips first) -->
        <div class="cb-right-pg cb-rp-cover" data-page="0" id="cbRightPg0">
          <div class="cb-cover-halftone"></div>
          <div class="cb-cover-banner" id="cbCoverBanner">ALEKSANDAR NIKOLOV — PORTFOLIO 2026</div>
          <div class="cb-cover-issue" id="cbCoverIssue">ISSUE #001</div>
          <img class="cb-cover-img" id="cbCoverImg" src="" alt="" />
          <div class="cb-cover-title" id="cbCoverTitle">PROJECT TITLE</div>
          <div class="cb-cover-action" id="cbCoverAction">THWIP!</div>
          <div class="cb-cover-hint">▶ CLICK TO OPEN ◀</div>
        </div>

        <!-- RIGHT PAGE 1: Info (flips second) -->
        <div class="cb-right-pg cb-rp-info" data-page="1" id="cbRightPg1">
          <div class="cb-info-page-num" id="cbInfoPageNum">PAGE 02 / 03</div>
          <div class="cb-info-issue-label" id="cbInfoIssueLabel">ISSUE #001</div>
          <h2 class="cb-proj-title"  id="cbInfoTitle">Project</h2>
          <div class="cb-proj-divider"></div>
          <p   class="cb-proj-desc"    id="cbInfoDesc">Description here.</p>
          <p   class="cb-proj-details" id="cbInfoDetails">Details here.</p>
          <div class="cb-tech-label">TECH STACK</div>
          <div class="cb-tech-stack"   id="cbInfoTech"></div>
          <div class="cb-info-btns">
            <a  class="cb-visit-btn"  id="cbVisitBtn"  href="#" target="_blank" rel="noopener">▶ VIEW PROJECT</a>
            <a  class="cb-github-btn" id="cbGithubBtn" href="#" target="_blank" rel="noopener">&#128279; GITHUB</a>
          </div>
          <div class="cb-next-hint" id="cbNextHint">NEXT PAGE ▶</div>
        </div>

        <!-- RIGHT PAGE 2: Thanks -->
        <div class="cb-right-pg cb-rp-thanks" data-page="2" id="cbRightPg2">
          <div class="cb-thanks-exclaim">POW!</div>
          <div class="cb-thanks-title">Thanks for<br>Reading!</div>
          <div class="cb-thanks-sub">THERE'S ALWAYS ANOTHER SPIDER</div>
          <div class="cb-thanks-logo" id="cbThanksLogo">PORTFOLIO 2026</div>
          <button class="cb-back-btn" id="cbBackBtn">◀ BACK TO PROJECTS</button>
        </div>

      </div><!-- /right-side -->
    </div><!-- /book -->

    <!-- ═ NAV ARROWS ════════════════════════════════════════ -->
    <button class="cb-arrow-btn cb-arrow-prev" id="cbNavPrev" disabled aria-label="Previous page">&#10094;</button>
    <button class="cb-arrow-btn cb-arrow-next" id="cbNavNext" aria-label="Next page">&#10095;</button>

  </div><!-- /book-wrap -->
</div><!-- /portal -->
`;

    document.body.insertAdjacentHTML('beforeend', html);
    _cacheRefs();
    _bindEvents();
  }

  /* ── Cache DOM refs ─────────────────────────────────────────── */
  function _cacheRefs() {
    portal    = document.getElementById('comic-portal');
    bookWrap  = document.getElementById('cbBookWrap');
    book      = document.getElementById('cbBook');
    closeBtn  = document.getElementById('cbCloseBtn');
    navPrev   = document.getElementById('cbNavPrev');
    navNext   = document.getElementById('cbNavNext');
    flipShadow= document.getElementById('cbFlipShadow');
    rightPages= [
      document.getElementById('cbRightPg0'),
      document.getElementById('cbRightPg1'),
      document.getElementById('cbRightPg2'),
    ];
    leftPages = Array.from(document.querySelectorAll('.cb-left-pg'));
  }

  /* ── Bind UI events ─────────────────────────────────────────── */
  function _bindEvents() {
    /* Close button */
    closeBtn.addEventListener('click', _closeComic);

    /* Backdrop click */
    document.querySelector('.cb-backdrop').addEventListener('click', _closeComic);

    /* Keyboard */
    document.addEventListener('keydown', _onKey);

    /* Cover click → first flip */
    document.getElementById('cbRightPg0').addEventListener('click', () => {
      if (_currentPage === 0 && !_isFlipping) _flipTo(1);
    });

    /* Next hint on info page */
    document.getElementById('cbNextHint').addEventListener('click', () => {
      if (_currentPage === 1 && !_isFlipping) _flipTo(2);
    });

    /* Thanks back button */
    document.getElementById('cbBackBtn').addEventListener('click', _closeComic);

    /* Nav buttons */
    navPrev.addEventListener('click', () => { if (!_isFlipping) _flipTo(_currentPage - 1); });
    navNext.addEventListener('click', () => { if (!_isFlipping) _flipTo(_currentPage + 1); });
  }

  function _onKey(e) {
    if (!portal || !portal.classList.contains('cb-active')) return;
    if (e.key === 'Escape') { _closeComic(); return; }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !_isFlipping) _flipTo(_currentPage + 1);
    if ((e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   && !_isFlipping) _flipTo(_currentPage - 1);
  }

  /* ================================================================
     POPULATE project data
     ================================================================ */
  function _populate(project, index) {
    _isMobile = window.innerWidth < 769;
    const issueStr = `ISSUE #${String(index + 1).padStart(3, '0')}`;

    /* Cover */
    document.getElementById('cbCoverImg').src    = project.image;
    document.getElementById('cbCoverImg').alt    = project.title;
    document.getElementById('cbCoverTitle').textContent  = project.title.toUpperCase();
    document.getElementById('cbCoverIssue').textContent  = issueStr;
    document.getElementById('cbCoverAction').textContent = ACTION_WORDS[index] || 'KAPOW!';

    /* Back cover */
    document.getElementById('cbIssueNum').textContent = `${issueStr} · 2026`;

    /* Info page */
    document.getElementById('cbInfoIssueLabel').textContent = issueStr;
    document.getElementById('cbInfoTitle').textContent      = project.title;
    document.getElementById('cbInfoDesc').textContent       = project.desc;
    document.getElementById('cbInfoDetails').textContent    = project.details || '';
    document.getElementById('cbInfoPageNum').textContent    = `PAGE 02 / 03 · ${issueStr}`;

    /* Tech tags */
    const techEl = document.getElementById('cbInfoTech');
    techEl.innerHTML = (project.tech || [])
      .map(t => `<span class="cb-tech-tag">${t}</span>`).join('');

    /* Buttons */
    const visitBtn = document.getElementById('cbVisitBtn');
    const ghBtn    = document.getElementById('cbGithubBtn');
    visitBtn.href = project.url || '#';
    if (project.github && project.github !== '#') {
      ghBtn.href = project.github;
      ghBtn.style.display = 'inline-flex';
    } else {
      ghBtn.style.display = 'none';
    }

    /* Thanks logo */
    document.getElementById('cbThanksLogo').textContent = project.title.toUpperCase();

    /* Panels — left page */
    const imgs     = EXTRA_IMAGES[index]    || [project.image, project.image, project.image];
    const captions = PANEL_CAPTIONS[index]  || ['PANEL 1', 'PANEL 2', 'PANEL 3'];
    [0, 1, 2].forEach(i => {
      const img = document.getElementById(`cbPanelImg${i}`);
      const cap = document.getElementById(`cbCaption${i}`);
      if (img) { img.src = imgs[i] || project.image; img.alt = captions[i]; }
      if (cap) cap.textContent = captions[i];
    });
    document.getElementById('cbPanelsLabel').textContent =
      `ISSUE ${String(index + 1).padStart(3, '0')} · GALLERY`;
  }

  /* ================================================================
     OPEN — FLIP zoom from billboard
     ================================================================ */
  function _openComic(project, index, originEl) {
    if (!portal) _buildDOM();

    _originEl    = originEl || null;
    _currentPage = 0;

    /* Reset all page states before opening */
    _resetPages();
    _populate(project, index);
    _updateNav();

    /* Show portal */
    portal.classList.add('cb-active');
    document.body.style.overflow = 'hidden';

    /* FLIP animation: from billboard rect → full screen */
    _animateOpen(originEl);
  }

  function _animateOpen(originEl) {
    const wrap = bookWrap;

    if (originEl && window.gsap) {
      const rect   = originEl.getBoundingClientRect();
      const wrapR  = wrap.getBoundingClientRect();

      /* Midpoint of billboard, relative to book-wrap final center */
      const fromX  = (rect.left + rect.width  / 2) - (wrapR.left + wrapR.width  / 2);
      const fromY  = (rect.top  + rect.height / 2) - (wrapR.top  + wrapR.height / 2);
      const scaleX = rect.width  / wrapR.width;
      const scaleY = rect.height / wrapR.height;

      /* Start instant from billboard position */
      gsap.set(wrap, {
        x: fromX, y: fromY,
        scaleX, scaleY,
        opacity: 0,
        transformOrigin: '50% 50%',
      });

      /* Zoom + slam into place */
      gsap.timeline()
        .to(wrap, {
          opacity: 1,
          duration: 0.12, ease: 'power2.in',
        })
        .to(wrap, {
          x: 0, y: 0, scaleX: 1, scaleY: 1,
          duration: 0.55, ease: 'expo.out',
        }, '-=0.05')
        /* Comic impact: slight overshoot */
        .to(wrap, {
          scaleX: 1.03, scaleY: 0.98,
          duration: 0.08, ease: 'power2.out',
        })
        .to(wrap, {
          scaleX: 1, scaleY: 1,
          duration: 0.2, ease: 'elastic.out(1.2, 0.4)',
        })
        /* Clear GSAP inline transforms — keep layout clean for 3D page-flip */
        .call(() => {
          gsap.set(wrap, { clearProps: 'x,y,scaleX,scaleY,transformOrigin' });
        })
        /* Flash ring around book */
        .fromTo(book, {
          boxShadow: '0 0 0 0px rgba(247,201,72,0)',
        }, {
          boxShadow: '0 0 0 8px rgba(247,201,72,0.9)',
          duration: 0.06, ease: 'power2.out',
          yoyo: true, repeat: 1,
        }, '<');

    } else {
      /* Fallback: simple fade in */
      gsap.set(wrap, { opacity: 0, scale: 0.85 });
      gsap.to(wrap, { opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out' });
    }

    /* Animate cover elements in */
    gsap.timeline({ delay: 0.35 })
      .from('#cbCoverBanner',  { y: -30, opacity: 0, duration: 0.3, ease: 'back.out(2)' })
      .from('#cbCoverTitle',   { y: 20,  opacity: 0, duration: 0.35,ease: 'back.out(2)' }, '-=0.15')
      .from('#cbCoverAction',  { scale: 0, rotation: 20, opacity: 0, duration: 0.25, ease: 'back.out(3)' }, '-=0.1')
      .from('#cbCoverImg',     { scale: 1.15, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.35');
  }

  /* ================================================================
     PAGE FLIP STATE MACHINE
     ================================================================ */
  function _resetPages() {
    /* Reset all right pages — only page 0 is visible; others are opacity:0 */
    rightPages.forEach((pg, i) => {
      gsap.set(pg, {
        rotateY : 0,
        zIndex  : [30, 20, 10][i],
        opacity : i === 0 ? 1 : 0,   // explicit visibility — no relying on backface-visibility
      });
    });

    /* Left pages: show page 0 (back-cover decoration) */
    leftPages.forEach((lp, i) => {
      lp.classList.toggle('active', i === 0);
    });

    _currentPage = 0;
  }

  function _flipTo(targetPage) {
    if (targetPage < 0 || targetPage > 2) return;
    if (targetPage === _currentPage) return;
    if (_isFlipping) return;

    _isFlipping = true;
    const direction = targetPage > _currentPage ? 'forward' : 'backward';
    const steps = Math.abs(targetPage - _currentPage);

    /* Chain each page flip step */
    let promise = Promise.resolve();
    for (let s = 0; s < steps; s++) {
      const fromPg = _currentPage + (direction === 'forward' ? s : -s);
      const toPg   = fromPg + (direction === 'forward' ? 1 : -1);
      promise = promise.then(() => _flipOneStep(fromPg, toPg, direction));
    }

    promise.then(() => {
      _currentPage = targetPage;
      _isFlipping  = false;
      _updateNav();
    });
  }

  function _flipOneStep(fromPage, toPage, direction) {
    return new Promise(resolve => {
      const tl = gsap.timeline({ onComplete: resolve });

      if (direction === 'forward') {
        /* The page at fromPage index flips away */
        const flippingPg  = rightPages[fromPage];
        const revealedPg  = rightPages[toPage];

        /* Shadow effect */
        tl.to(flipShadow, { opacity: 1, duration: 0.18, ease: 'power2.out' });

        /* Flip first half: pivot at left edge (transform-origin: 0% 50%) */
        tl.to(flippingPg, {
          rotateY: -90,
          duration: 0.22, ease: 'power2.in',
        }, 0);

        /* At midpoint: reveal next page + switch left content */
        tl.call(() => {
          _setLeftPage(toPage);
          if (revealedPg) gsap.set(revealedPg, { opacity: 1, zIndex: [30, 20, 10][toPage] });
        }, null, 0.22);

        /* Flip second half — page continues to -180 */
        tl.to(flippingPg, {
          rotateY: -180,
          duration: 0.22, ease: 'power2.out',
        });

        /* Fully hide the flipped page (belt-and-suspenders, works in all browsers) */
        tl.set(flippingPg, { opacity: 0 });

        /* Shadow fades out */
        tl.to(flipShadow, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.2');

        /* Tiny elastic settle on the revealed page */
        if (revealedPg) {
          tl.from(revealedPg, {
            x: 8, duration: 0.25, ease: 'elastic.out(1.3, 0.4)',
          }, '-=0.15');
        }

      } else {
        /* Backward: the page at toPage index flips back from -180 → 0 */
        const flippingPg = rightPages[toPage];   // the page returning forward
        const hidingPg   = rightPages[fromPage]; // the currently visible page

        /* Boost z-index so the returning page appears above everything */
        gsap.set(flippingPg, { zIndex: 35, opacity: 0 });

        tl.to(flipShadow, { opacity: 0.6, duration: 0.18, ease: 'power2.out' });

        /* Flip first half: -180 → -90 (page still invisible) */
        tl.to(flippingPg, {
          rotateY: -90,
          duration: 0.22, ease: 'power2.in',
        }, 0);

        /* At midpoint: show returning page, hide active page, switch left content */
        tl.call(() => {
          _setLeftPage(toPage);
          gsap.set(flippingPg, { opacity: 1 });
          if (hidingPg) gsap.set(hidingPg, { opacity: 0 });
        }, null, 0.22);

        /* Flip second half: -90 → 0 */
        tl.to(flippingPg, {
          rotateY: 0,
          duration: 0.22, ease: 'power2.out',
        });

        /* Restore original z-index */
        tl.call(() => {
          gsap.set(flippingPg, { zIndex: [30, 20, 10][toPage] });
        });

        tl.to(flipShadow, { opacity: 0, duration: 0.2 }, '-=0.2');
      }
    });
  }

  function _setLeftPage(pageIndex) {
    leftPages.forEach((lp, i) => {
      if (i === pageIndex) {
        lp.classList.add('active');
      } else {
        lp.classList.remove('active');
      }
    });
  }

  /* ── Nav state ──────────────────────────────────────────────── */
  function _updateNav() {
    navPrev.disabled = _currentPage <= 0;
    navNext.disabled = _currentPage >= 2;
  }

  /* ================================================================
     CLOSE — FLIP zoom back to billboard
     ================================================================ */
  function _closeComic() {
    if (!portal || !portal.classList.contains('cb-active')) return;

    const wrap = bookWrap;

    if (_originEl && window.gsap) {
      const rect   = _originEl.getBoundingClientRect();
      const wrapR  = wrap.getBoundingClientRect();
      const toX    = (rect.left + rect.width  / 2) - (wrapR.left + wrapR.width  / 2);
      const toY    = (rect.top  + rect.height / 2) - (wrapR.top  + wrapR.height / 2);
      const scaleX = rect.width  / wrapR.width;
      const scaleY = rect.height / wrapR.height;

      gsap.timeline({
        onComplete: () => {
          portal.classList.remove('cb-active');
          document.body.style.overflow = '';
          gsap.set(wrap, { clearProps: 'all' });
          _resetPages();
        }
      })
        /* Quick squash before shrink */
        .to(wrap, { scaleX: 1.04, scaleY: 0.97, duration: 0.07, ease: 'power1.out' })
        /* Fly back to origin */
        .to(wrap, {
          x: toX, y: toY, scaleX, scaleY,
          duration: 0.48, ease: 'expo.in',
        })
        .to(wrap, { opacity: 0, duration: 0.14, ease: 'power2.in' }, '-=0.15');

    } else {
      gsap.to(wrap, {
        opacity: 0, scale: 0.85, duration: 0.3, ease: 'expo.in',
        onComplete: () => {
          portal.classList.remove('cb-active');
          document.body.style.overflow = '';
          gsap.set(wrap, { clearProps: 'all' });
          _resetPages();
        }
      });
    }
  }

  /* ================================================================
     PUBLIC API
     ================================================================ */
  window._ComicBook = {
    open: function (project, index, originEl) {
      _openComic(project, index, originEl);
    },
    close: _closeComic,
  };

})();
