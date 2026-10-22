/* UNIQUE Production — scroll dinamika i interakcije (polish 2026) */
document.documentElement.classList.add('js-reveal');

/* Nova stranica se uvek otvara od vrha (Back/Forward zadrzava poziciju) */
(function () {
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    var type = nav ? nav.type : 'navigate';
    if (!location.hash && type !== 'back_forward') {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        var html = document.documentElement;
        var prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        window.addEventListener('load', function () {
            window.scrollTo(0, 0);
            html.style.scrollBehavior = prev;
        });
    }
})();

document.addEventListener('DOMContentLoaded', function () {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- Scroll reveal sa blagim staggerom --- */
    var selectors = [
        'main .section', '.services-grid', '.testimonials-section', '.testimonial-card',
        '.partnership-section', '.custom-container', '.contact-container', '.image-container',
        '.gallery-header', '.gallery-filters', '.gallery-grid .gallery-item',
        '.gallery-preview .gallery-item', '.service-item',
        '.section-2', '.section-3', '.section-4', '.services-card', '.cta-section'
    ];
    var els = Array.prototype.slice.call(document.querySelectorAll(selectors.join(',')));
    // ne sakrivaj ugnjezdene (npr. karticu unutar vec otkrivene sekcije duplo)
    els.forEach(function (el) { el.classList.add('reveal'); });
    // kartice usluga ulaze naizmenicno: 1. sleva, 2. zdesna, 3. sleva, 4. zdesna
    document.querySelectorAll('.services-grid-container .service-item').forEach(function (el, i) {
        el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
    });

    function revealCallback(entries, obs) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            // stagger: redni broj medju "reveal" bracom unutar istog roditelja
            var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
                return c.classList && c.classList.contains('reveal');
            });
            var idx = siblings.indexOf(el);
            el.style.transitionDelay = Math.min(idx > 0 ? idx * 60 : 0, 240) + 'ms';
            el.classList.add('reveal-in');
            obs.unobserve(el);
        });
    }
    var sideEls = Array.prototype.slice.call(document.querySelectorAll('.services-grid-container .service-item'));
    if ('IntersectionObserver' in window && !reduced) {
        // sve ostalo: okida unapred, da nema kasnjenja pri brzom skrolu
        var io = new IntersectionObserver(revealCallback, { threshold: 0.01, rootMargin: '250px 0px 200px 0px' });
        els.forEach(function (el) { if (sideEls.indexOf(el) === -1) io.observe(el); });
        // kartice usluga: okidaju tek kad su zaista vidljive, da se klizanje sa strana vidi
        var ioSide = new IntersectionObserver(revealCallback, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
        sideEls.forEach(function (el) { ioSide.observe(el); });
    } else {
        els.forEach(function (el) { el.classList.add('reveal-in'); });
    }

    /* --- Navbar se skuplja pri skrolu --- */
    var navbar = document.querySelector('.navbar');
    var hero = document.querySelector('.hero');
    var heroContent = document.querySelector('.hero-content');
    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var y = window.scrollY || window.pageYOffset;
            if (navbar) navbar.classList.toggle('scrolled', y > 40);
            /* --- Blagi parallax hero sadrzaja --- */
            if (hero && heroContent && !reduced) {
                var h = hero.offsetHeight || 1;
                if (y <= h) {
                    heroContent.style.transform = 'translateY(' + (y * 0.28).toFixed(1) + 'px)';
                    heroContent.style.opacity = Math.max(0, 1 - (y / h) * 1.25).toFixed(3);
                }
            }
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* --- Dropdown "Usluge": desktop hover, mobilni klik --- */
    var mobileNav = window.matchMedia('(max-width: 1100px)');
    document.querySelectorAll('.dropdown > a').forEach(function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault(); // bez skoka na #usluge
            if (mobileNav.matches) a.parentElement.classList.toggle('open');
            else a.blur(); // desktop: hover upravlja menijem, klik ga ne drzi otvorenim
        });
    });
    // klik/dodir van menija zatvara podmeni
    document.addEventListener('click', function (e) {
        document.querySelectorAll('.dropdown.open').forEach(function (dd) {
            if (!dd.contains(e.target)) dd.classList.remove('open');
        });
    });
    // zatvaranje hamburgera resetuje podmeni
    var hbNav = document.querySelector('.hamburger');
    var navUl = document.querySelector('.nav-links');
    if (hbNav && navUl) hbNav.addEventListener('click', function () {
        if (!navUl.classList.contains('active')) {
            document.querySelectorAll('.dropdown.open').forEach(function (dd) { dd.classList.remove('open'); });
        }
    });

    /* --- Hero video: u HTML-u je laka mobilna verzija; desktop dobija punu --- */
    var v = document.querySelector('.hero video[data-src-full]');
    if (v) {
        v.muted = true;
        var touchPhone = window.matchMedia('(hover: none) and (pointer: coarse)').matches
            && window.matchMedia('(max-width: 820px)').matches;
        if (!touchPhone) {
            v.src = v.getAttribute('data-src-full');
            v.load();
        }
        var tryPlay = function () {
            v.muted = true;
            var q = v.play();
            if (q && q.catch) q.catch(function () {});
        };
        tryPlay();
        var kick = function () { if (v.paused) tryPlay(); document.removeEventListener('touchstart', kick); };
        document.addEventListener('touchstart', kick, { passive: true });
        // stednja: pauziraj video kada hero izadje iz ekrana, nastavi kada se vrati
        if ('IntersectionObserver' in window) {
            var vio = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) tryPlay();
                    else v.pause();
                });
            }, { threshold: 0.05 });
            vio.observe(v);
        }
    }
});

/* Lebdece iskre i note u logo sekciji na pocetnoj */
document.addEventListener('DOMContentLoaded', function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var host = document.querySelector('.custom-container');
    if (!host) return;
    var glyphs = ['✦', '♪', '𝄞', '♡', '✧', '♫'];
    for (var i = 0; i < 18; i++) {
        var s = document.createElement('span');
        s.className = 'float-spark';
        // samo bocna ljubicasta polja — nikad preko loga u sredini
        s.style.left = (i % 2 === 0)
            ? (2 + Math.random() * 18) + '%'
            : (78 + Math.random() * 17) + '%';
        s.style.fontSize = (12 + Math.random() * 16) + 'px';
        s.style.animationDuration = (7 + Math.random() * 8) + 's';
        s.style.animationDelay = (Math.random() * 9) + 's';
        var inner = document.createElement('span');
        inner.className = 'sway';
        inner.textContent = glyphs[i % glyphs.length];
        inner.style.animationDuration = (2.2 + Math.random() * 2.2) + 's';
        s.appendChild(inner);
        host.appendChild(s);
    }
});

/* aria-expanded prati stanje hamburger menija */
document.addEventListener('DOMContentLoaded', function () {
    var hb = document.querySelector('.hamburger');
    if (hb) hb.addEventListener('click', function () {
        hb.setAttribute('aria-expanded', hb.classList.contains('active') ? 'true' : 'false');
    });
});
