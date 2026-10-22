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

    if ('IntersectionObserver' in window && !reduced) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                // stagger: redni broj medju "reveal" bracom unutar istog roditelja
                var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
                    return c.classList && c.classList.contains('reveal');
                });
                var idx = siblings.indexOf(el);
                el.style.transitionDelay = Math.min(idx > 0 ? idx * 90 : 0, 360) + 'ms';
                el.classList.add('reveal-in');
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        els.forEach(function (el) { io.observe(el); });
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

    /* --- Dropdown "Usluge": otvaranje i na klik/dodir --- */
    document.querySelectorAll('.dropdown > a').forEach(function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            a.parentElement.classList.toggle('open');
        });
    });

    /* --- Hero video: preskace se samo na pravim telefonima (oni dobijaju poster) --- */
    var v = document.querySelector('.hero video[data-src]');
    var touchPhone = window.matchMedia('(hover: none) and (pointer: coarse)').matches
        && window.matchMedia('(max-width: 820px)').matches;
    if (v && !touchPhone) {
        v.src = v.getAttribute('data-src');
        v.load();
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
    }
});
