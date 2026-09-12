document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = 'Farish<br>Punjani';
        heroTitle.setAttribute('aria-label', 'Farish Punjani');
    }

    const fab = document.getElementById('circular-reveal');

    if (fab) {
        const orbit = fab.querySelector('.portal-orbit');
        if (orbit) orbit.setAttribute('aria-hidden', 'true');

        const oldLabel = fab.querySelector('.portal-label');
        if (oldLabel) oldLabel.remove();

        fab.classList.add('bawa-concept', 'bawa-firecracker-label');
        fab.setAttribute('aria-label', 'Light the fuse — Bawa ki Duniya');

        // Show both trigger concepts together while preserving the existing
        // firecracker animation and its original trigger wiring.
        const cluster = document.createElement('div');
        cluster.className = 'bawa-compare-cluster';
        cluster.setAttribute('aria-label', 'Bawa ki Duniya trigger concepts');
        fab.parentNode.insertBefore(cluster, fab);
        cluster.appendChild(fab);

        const launchTag = document.createElement('button');
        launchTag.type = 'button';
        launchTag.className = 'bawa-concept bawa-launch-tag';
        launchTag.setAttribute('aria-label', 'Launch Bawa ki Duniya');
        launchTag.innerHTML = `
            <span class="launch-tag-eyelet" aria-hidden="true"></span>
            <span class="launch-tag-kicker" aria-hidden="true">BAWA LAUNCH PASS</span>
            <span class="launch-tag-title">बावा की<br>दुनिया</span>
            <span class="launch-tag-action" aria-hidden="true">LAUNCH ↗</span>
        `;
        cluster.appendChild(launchTag);

        // The alternate concept calls the exact same existing launcher.
        // playRocketAnimation() and the firecracker sequence remain untouched.
        launchTag.addEventListener('click', () => {
            if (typeof triggerRandomSite === 'function') triggerRandomSite();
        });

        // Native button keyboard semantics; stop the legacy anonymous handler
        // on the original control from firing twice.
        fab.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.stopImmediatePropagation();
            }
        }, true);

        const syncState = () => {
            fab.removeAttribute('aria-pressed');
            const state = fab.dataset.state || 'idle';
            launchTag.dataset.state = state;

            if (state !== 'idle') {
                fab.setAttribute('aria-busy', 'true');
                launchTag.setAttribute('aria-busy', 'true');
                launchTag.setAttribute('aria-disabled', 'true');
            } else {
                fab.removeAttribute('aria-busy');
                launchTag.removeAttribute('aria-busy');
                launchTag.removeAttribute('aria-disabled');
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