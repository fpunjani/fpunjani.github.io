document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = 'Farish<br>Punjani';
        heroTitle.setAttribute('aria-label', 'Farish Punjani');
    }

    // Bawa visual experiments. Stamp is the default; ?bawa=portal keeps the alternate available.
    const bawaParam = new URLSearchParams(window.location.search).get('bawa');
    document.documentElement.dataset.bawa = bawaParam === 'portal' ? 'portal' : 'stamp';

    const fab = document.getElementById('circular-reveal');

    if (fab) {
        const orbit = fab.querySelector('.portal-orbit');
        if (orbit) orbit.setAttribute('aria-hidden', 'true');

        const oldLabel = fab.querySelector('.portal-label');
        if (oldLabel) oldLabel.remove();

        fab.setAttribute('aria-label', 'Enter Bawa ki Duniya — a strange corner of the internet');

        // Native button keyboard semantics; stop the legacy anonymous handler from firing twice.
        fab.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.stopImmediatePropagation();
            }
        }, true);

        const syncState = () => {
            fab.removeAttribute('aria-pressed');
            if (fab.dataset.state && fab.dataset.state !== 'idle') {
                fab.setAttribute('aria-busy', 'true');
            } else {
                fab.removeAttribute('aria-busy');
            }
        };

        syncState();

        const observer = new MutationObserver(syncState);
        observer.observe(fab, {
            attributes: true,
            attributeFilter: ['data-state', 'aria-pressed']
        });
    }

    // Preserve the existing email contact without storing the full address in the page markup.
    const contactLinks = document.querySelector('.contact-links');
    if (contactLinks && !contactLinks.querySelector('[data-email-link]')) {
        const localPart = 'farishpunjani';
        const domain = 'gmail.com';
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${localPart}@${domain}`;
        emailLink.className = 'contact-link';
        emailLink.dataset.emailLink = '';
        emailLink.innerHTML = 'Send a pigeon <span aria-hidden="true">↗</span>';
        contactLinks.prepend(emailLink);
    }
});