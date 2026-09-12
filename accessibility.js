document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = 'Farish<br>Punjani';
        heroTitle.setAttribute('aria-label', 'Farish Punjani');
    }

    const fab = document.getElementById('circular-reveal');

    if (fab) {
        // Replace the tiny circular instruction with a readable attached portal label.
        const orbit = fab.querySelector('.portal-orbit');
        if (orbit) orbit.setAttribute('aria-hidden', 'true');

        if (!fab.querySelector('.portal-label')) {
            const label = document.createElement('span');
            label.className = 'portal-label';
            label.setAttribute('aria-hidden', 'true');
            label.innerHTML = '<span class="portal-label-kicker">Bawa ki duniya</span><span class="portal-label-copy">open a strange corner of the internet <span class="portal-label-arrow">↗</span></span>';
            fab.appendChild(label);
        }

        // The control is now a native button. Stop the legacy anonymous key handler
        // and let the browser generate the standard click for Enter/Space.
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