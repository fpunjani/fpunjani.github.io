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

        fab.classList.add('bawa-firecracker-object');
        fab.setAttribute('aria-label', 'Light the fuse — Bawa ki Duniya');

        // Give the control its own floating stage. The shell handles the idle
        // drift and moving shadow; the button itself remains the original
        // launcher wired to the existing firecracker animation.
        let shell = fab.parentElement && fab.parentElement.classList.contains('bawa-float-shell')
            ? fab.parentElement
            : null;

        if (!shell) {
            shell = document.createElement('div');
            shell.className = 'bawa-float-shell';
            fab.parentNode.insertBefore(shell, fab);
            shell.appendChild(fab);
        }

        // Remove any comparison trigger left from the previous experiment.
        document.querySelectorAll('.bawa-launch-tag').forEach((node) => node.remove());
        const oldCluster = document.querySelector('.bawa-compare-cluster');
        if (oldCluster && oldCluster !== shell) {
            while (oldCluster.firstChild) oldCluster.parentNode.insertBefore(oldCluster.firstChild, oldCluster);
            oldCluster.remove();
        }

        // Native button keyboard semantics; stop the legacy anonymous handler
        // from firing twice for Enter/Space.
        fab.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.stopImmediatePropagation();
            }
        }, true);

        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (finePointer.matches && !reducedMotion.matches) {
            fab.addEventListener('pointermove', (event) => {
                const rect = fab.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                fab.style.setProperty('--bawa-ry', `${(x * 7).toFixed(2)}deg`);
                fab.style.setProperty('--bawa-rx', `${(-y * 6).toFixed(2)}deg`);
                shell.style.setProperty('--shadow-x', `${(x * -7).toFixed(1)}px`);
            });

            fab.addEventListener('pointerleave', () => {
                fab.style.removeProperty('--bawa-rx');
                fab.style.removeProperty('--bawa-ry');
                shell.style.removeProperty('--shadow-x');
            });
        }

        const syncState = () => {
            fab.removeAttribute('aria-pressed');
            const state = fab.dataset.state || 'idle';
            shell.dataset.state = state;

            if (state !== 'idle') {
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