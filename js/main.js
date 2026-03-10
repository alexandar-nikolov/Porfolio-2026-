
const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top  = `${e.clientY}px`;
});


const BURST_COLORS = [
  '#FF006E', 
  '#FFBE0B', 
  '#00F5FF', 
  '#8AFF2A', 
  '#FB5607', 
  '#6A00FF', 
];

const BURST_DURATION = 600;

document.querySelectorAll('.word').forEach((word) => {
  word.addEventListener('click', () => {
    const color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];

    word.style.color             = color;
    word.style.webkitTextStroke  = 'none';
    word.style.transform         = 'scale(1.4) skewX(-8deg)';
    word.style.filter            = `brightness(2) drop-shadow(0 0 30px ${color})`;

    setTimeout(() => {
      word.style.color            = '';
      word.style.webkitTextStroke = '';
      word.style.transform        = '';
      word.style.filter           = '';
    }, BURST_DURATION);
  });
});

/* ── Page Transition (→ game after 10 s) ─────────────────── */
const TRANSITION_DELAY = 10_000;

setTimeout(() => {
  const SLIDE_DUR = 1400;
  const BALL_TIME = 2400;

  /* Snapshot the full page into a split panel showing top or bottom half */
  function makePanel(isTop) {
    const panel = document.createElement('div');
    panel.className = `split-panel ${isTop ? 'top' : 'bottom'}`;

    /* Container represents the full viewport, clipped to the panel's half */
    const snapshot = document.createElement('div');
    Object.assign(snapshot.style, {
      position:      'absolute',
      top:           isTop ? '0' : '-50vh',
      left:          '0',
      width:         '100vw',
      height:        '100vh',
      overflow:      'hidden',
      pointerEvents: 'none',
    });

    /* Clone every visual layer in z-order */
    ['.bg', '.grid', '.scanline', '.diag-text', '.corner', '.side-run', '.stage']
      .forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          const clone = el.cloneNode(true);
          const cs    = window.getComputedStyle(el);

          
          if (cs.position === 'fixed') {
            clone.style.position = 'absolute';
            clone.style.top      = cs.top;
            clone.style.left     = cs.left;
            clone.style.right    = cs.right;
            clone.style.bottom   = cs.bottom;
            clone.style.width    = cs.width;
            clone.style.height   = cs.height;
          }

          /* Freeze all animations — clean snapshot of the page */
          clone.style.animationPlayState = 'paused';
          clone.querySelectorAll('*').forEach(
            child => (child.style.animationPlayState = 'paused')
          );

          snapshot.appendChild(clone);
        });
      });

    panel.appendChild(snapshot);
    return panel;
  }

 
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.innerHTML = '<div class="load-text">ENTERING PORTFOLIO</div>';

  const topPanel    = makePanel(true);
  const bottomPanel = makePanel(false);

  document.body.append(loader, topPanel, bottomPanel);

  
  requestAnimationFrame(() => requestAnimationFrame(() => {
    topPanel.classList.add('open');
    bottomPanel.classList.add('open');
  }));

  
  setTimeout(() => loader.classList.add('visible'), SLIDE_DUR + 80);


  setTimeout(() => {
    window.location.replace('mainpage.html');
  }, SLIDE_DUR + 80 + BALL_TIME);

}, TRANSITION_DELAY);
//code responsible for the smooth transition between the home section of the portfolio
document.addEventListener("DOMContentLoaded", function() {
    const nav = document.querySelector(".nav");
    const navlist = nav ? nav.querySelectorAll("li") : [];
    const totalNavlist = navlist.length;
    const allSection = document.querySelectorAll(".section");
    const totalSection = allSection.length;
//makes sure certain section that are hidden, become visable due to the active class
    for(let i = 0; i < totalNavlist; i++){
        const a = navlist[i].querySelector("a");
        a.addEventListener("click", function(){
            for(let i = 0; i < totalSection; i++){
                allSection[i].classList.remove("back-section");
            }
            for(let j = 0; j < totalNavlist; j++){
                if(navlist[j].querySelector("a").classList.contains("active")){
                    allSection[j].classList.add("back-section");
                }
                navlist[j].querySelector("a").classList.remove("active");
            }
            this.classList.add("active");
            showSection(this);
            if(window.innerWidth < 1200){
                asideSectionToggleBtn();
            }
        });
    }

    function showSection(element){
        for(let i = 0; i < totalSection; i++){
            allSection[i].classList.remove("active");
        }
        const target = element.getAttribute("href").split("#")[1];
        document.querySelector("#" + target).classList.add("active");
    }
//make sure the navigation bar can open/close on smaller screen sizes
    const navTogglerBtn = document.querySelector(".toggle");
    const aside = document.querySelector("aside");
    const allSections = document.querySelectorAll(".section");
    const homeImgContainer = document.querySelector(".home-img-container");
    const totalSections = allSections.length;

    navTogglerBtn.addEventListener("click", () => {
        asideSectionToggleBtn();
        toggleHomeImage();
    });

    function asideSectionToggleBtn() {
        aside.classList.toggle("open");
        navTogglerBtn.classList.toggle("open");
        for (let i = 0; i < totalSections; i++) {
            allSections[i].classList.toggle("open");
        }
    }

    function toggleHomeImage() {
        if (homeImgContainer) {
            homeImgContainer.classList.toggle("open");
        }
    }

    // Add event listeners for the special buttons
    const specialButtons = document.querySelectorAll(".btn.contact-me, .btn.contact-me2");
    specialButtons.forEach(button => {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            const target = this.getAttribute("href");
            showSection(this);
            window.location.hash = target; // Update the URL hash
        });
    });

    // Add event listener for the logo
    const logo = document.querySelector(".logo a");
    logo.addEventListener("click", function(event) {
        event.preventDefault();
        // Make only the home section active
        for(let i = 0; i < totalSection; i++){
            allSection[i].classList.remove("active");
        }
        document.querySelector("#home").classList.add("active");

        // Remove active class from all nav links
        for(let i = 0; i < totalNavlist; i++){
            navlist[i].querySelector("a").classList.remove("active");
        }

        // Make the home button active
        const homeNavLink = document.querySelector('.nav a[href="#home"]');
        if (homeNavLink) {
            homeNavLink.classList.add("active");
        }

        // Close the dropdown menu if it's open
        if(window.innerWidth < 1200){
            asideSectionToggleBtn();
        }

        // Update the URL hash to the home section
        window.location.hash = "#home";
    });

    // Ensure correct section is shown if hash is present in URL
    const hash = window.location.hash;
    if (hash) {
        const targetSection = document.querySelector(hash);
        if (targetSection) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            targetSection.classList.add('active');
            document.querySelectorAll('.nav a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(hash)) {
                    link.classList.add('active');
                }
            });
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    var type = new Typed('.typing', {
        strings: ['Frontend Developer', 'ICT student', 'Web Designer'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 100,
        loop: true
    });
});